import { useRef, useMemo, useLayoutEffect, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, Lightformer, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getScrollProgress } from './scroll';
import Portrait3D from './Portrait3D';
import MorphingHockeyStickWithFrame from './MorphingHockeyStick';
import StickShowcase from './StickShowcase';
import { ACTS } from './acts';

gsap.registerPlugin(ScrollTrigger);
const tmpColor = new THREE.Color();

// Per-act target layouts for the shard cloud (built for exactly 48 shards).
function buildLayouts(n) {
  const flower = [];
  const abstract = [];
  const arch = [];
  const vortex = [];

  for (let i = 0; i < n; i++) {
    // 1. THE FLOWER — 4 offset rings forming a cup
    let ring, fCount, fIndex, fRadius, fRotX, fScaleY;
    if (i < 6) {
      ring = 1; fCount = 6; fIndex = i; fRadius = 0.3; fRotX = 1.3; fScaleY = 0.5;
    } else if (i < 16) {
      ring = 2; fCount = 10; fIndex = i - 6; fRadius = 0.7; fRotX = 0.9; fScaleY = 0.7;
    } else if (i < 30) {
      ring = 3; fCount = 14; fIndex = i - 16; fRadius = 1.2; fRotX = 0.5; fScaleY = 0.9;
    } else {
      ring = 4; fCount = 18; fIndex = i - 30; fRadius = 1.7; fRotX = 0.15; fScaleY = 1.1;
    }
    const fAngle = (fIndex / fCount) * Math.PI * 2 + ring * 0.25;
    flower.push({
      x: Math.cos(fAngle) * fRadius,
      y: Math.sin(fAngle) * fRadius,
      z: (4 - ring) * 0.25,
      rotX: fRotX, rotY: 0.1, rotZ: fAngle - Math.PI / 2,
      scaleY: fScaleY, scaleX: 0.25 + ring * 0.05,
    });

    // 2. THE NETWORK — orbital logic cloud
    if (i < 12) {
      const oAngle = (i / 12) * Math.PI * 2;
      abstract.push({
        x: Math.cos(oAngle) * 0.8, y: Math.sin(oAngle) * 0.8, z: i % 2 === 0 ? 0.3 : -0.3,
        rotX: 0.5, rotY: oAngle, rotZ: 0, scaleY: 0.6, scaleX: 0.2,
      });
    } else {
      const oAngle = ((i - 12) / 36) * Math.PI * 2;
      abstract.push({
        x: Math.cos(oAngle) * 2.5, y: Math.sin(oAngle * 3) * 1.2, z: Math.sin(oAngle) * 1.5,
        rotX: 0.2, rotY: -oAngle, rotZ: 0.5, scaleY: 1.0, scaleX: 0.3,
      });
    }

    // 3. THE MONUMENT — double-layered arch
    const isBack = i >= 24;
    const aIndex = isBack ? i - 24 : i;
    const aAngle = (aIndex / 23) * Math.PI;
    arch.push({
      x: Math.cos(aAngle) * (isBack ? 3.5 : 3.2),
      y: Math.sin(aAngle) * (isBack ? 3.5 : 3.2) - 1.8,
      z: isBack ? -1.2 : -0.8,
      rotX: isBack ? 0.1 : -0.1, rotY: 0, rotZ: aAngle - Math.PI / 2,
      scaleY: 1.2, scaleX: 0.3,
    });

    // 4. THE VORTEX — tall helix
    const vAngle = i * 0.3;
    vortex.push({
      x: Math.cos(vAngle) * 1.5,
      y: (i - 24) * 0.2,
      z: Math.sin(vAngle) * 1.5,
      rotX: Math.PI / 3, rotY: vAngle, rotZ: 0,
      scaleY: 1.0, scaleX: 0.3,
    });
  }
  return { flower, abstract, arch, vortex };
}

export default function Scene() {
  const shardsRef = useRef([]);
  const meshesRef = useRef([]);
  const groupRef = useRef();
  const ringInnerRef = useRef();
  const ringOuterRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();
  const fillLightRef = useRef();
  const coreRef = useRef();
  const { camera } = useThree();

  const NUM = 48;
  const layouts = useMemo(() => buildLayouts(NUM), []);
  const layoutsArray = useMemo(
    () => [layouts.flower, layouts.abstract, layouts.arch, layouts.vortex],
    [layouts],
  );

  // First paint: shards assemble the initial (flower) formation.
  useLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
      },
    });
    shardsRef.current.forEach((shard, i) => {
      if (!shard) return;
      [layouts.abstract, layouts.arch, layouts.vortex, layouts.flower].forEach((layout, l) => {
        const at = 10 + l * 25;
        tl.to(shard.position, { x: layout[i].x, y: layout[i].y, z: layout[i].z, ease: 'power1.inOut', duration: 15 }, at);
        tl.to(shard.rotation, { x: layout[i].rotX, y: layout[i].rotY, z: layout[i].rotZ, ease: 'power1.inOut', duration: 15 }, at);
      });
    });
    return () => tl.kill();
  }, [layouts]);

  // Pointer state for parallax + drag-to-orbit with inertia.
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef({ dragging: false, lastX: 0, lastY: 0, velX: 0, velY: 0, yaw: 0, pitch: 0 });
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      const dr = drag.current;
      if (!dr.dragging) return;
      const dx = e.clientX - dr.lastX;
      const dy = e.clientY - dr.lastY;
      dr.lastX = e.clientX;
      dr.lastY = e.clientY;
      dr.velX = dx * 0.005;
      dr.velY = dy * 0.005;
      dr.yaw += dr.velX;
      dr.pitch = THREE.MathUtils.clamp(dr.pitch + dr.velY, -0.6, 0.6);
    };
    const onDown = (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      drag.current.dragging = true;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
      document.body.classList.add('is-dragging');
    };
    const onUp = () => {
      drag.current.dragging = false;
      document.body.classList.remove('is-dragging');
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const scroll = useRef(0);
  const actColor = useRef(new THREE.Color(ACTS[0].color));
  const camTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.1);
    const p = (scroll.current = damp(scroll.current, getScrollProgress(), 4, d));

    // ---- Act color: mix between neighbouring act tints, applied everywhere ----
    const actF = THREE.MathUtils.clamp(p * 5 - 0.5, 0, 4);
    const i0 = Math.floor(actF);
    const i1 = Math.min(i0 + 1, ACTS.length - 1);
    const f = actF - i0;
    tmpColor.set(ACTS[i0].color).lerp(tmpColor.clone().set(ACTS[i1].color), f);
    actColor.current.copy(tmpColor);

    const col = actColor.current;
    if (keyLightRef.current) keyLightRef.current.color.lerp(col, 0.08);
    if (fillLightRef.current) fillLightRef.current.color.lerp(col, 0.05);
    if (rimLightRef.current?.material?.color) rimLightRef.current.material.color.lerp(col, 0.06);
    if (coreRef.current) coreRef.current.material.color.lerp(col, 0.08);
    if (ringInnerRef.current) ringInnerRef.current.material.color.lerp(col, 0.08);
    if (ringOuterRef.current) ringOuterRef.current.material.color.lerp(col, 0.06);

    // ---- Camera: scroll dolly + drag-to-orbit with inertia + parallax ----
    const dr = drag.current;
    if (!dr.dragging) {
      dr.yaw += dr.velX;
      dr.pitch = THREE.MathUtils.clamp(dr.pitch + dr.velY, -0.6, 0.6);
      dr.velX *= 0.93;
      dr.velY *= 0.93;
      dr.yaw = damp(dr.yaw, 0, 0.35, d); // gentle spring back
      dr.pitch = damp(dr.pitch, 0, 0.35, d);
    }
    const orbit = p * Math.PI * 1.4;
    const radius = 7.4 + Math.sin(p * Math.PI) * 0.9;
    camTarget.set(
      Math.sin(orbit) * radius * 0.35 + pointer.current.x * 0.45,
      Math.sin(p * Math.PI * 2) * 0.8 + pointer.current.y * 0.3,
      radius,
    );
    camTarget.applyAxisAngle(yAxis, dr.yaw);
    camTarget.y += dr.pitch * 2.2;
    camera.position.x = damp(camera.position.x, camTarget.x, 3, d);
    camera.position.y = damp(camera.position.y, camTarget.y, 3, d);
    camera.position.z = damp(camera.position.z, camTarget.z, 3, d);
    camera.lookAt(0, 0, 0);

    // ---- Group: gentle drift + parallax tilt ----
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05 + pointer.current.x * 0.12 + dr.yaw * 0.25;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -0.18 + pointer.current.y * 0.08 + p * 0.35 + dr.pitch * 0.2,
        0.05,
      );
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.15 - p * 0.6;
    }

    // ---- Per-shard micro-breathing (kept subtle so GSAP owns the big moves) ----
    meshesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.z = Math.sin(t * 1.5 + i * 0.3) * 0.04;
      mesh.rotation.y = Math.sin(t * 1.2 + i * 0.3) * 0.12;
      mesh.rotation.x = Math.sin(t * 1.4 + i * 0.3) * 0.08;
    });

    // ---- Orbit rings ----
    if (ringInnerRef.current) {
      ringInnerRef.current.rotation.z = t * 0.12;
      ringInnerRef.current.rotation.x = 1.1 + Math.sin(t * 0.3) * 0.08;
    }
    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.z = -t * 0.07;
      ringOuterRef.current.rotation.x = -1.2 + Math.cos(t * 0.25) * 0.06;
    }

    // ---- Core pulse ----
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 2.2) * 0.08;
      coreRef.current.scale.setScalar(s);
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.rotation.x = t * 0.23;
    }
  });

  return (
    <>
      <Environment resolution={256}>
        {/* Custom light rig: act-colored rim + neutral studio strips */}
        <Lightformer ref={rimLightRef} form="rect" intensity={4} position={[0, 5, -6]} scale={[8, 3, 1]} color={ACTS[0].color} />
        <Lightformer form="rect" intensity={2.2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[5, 3, 1]} color="#dfe9ff" />
        <Lightformer form="circle" intensity={1.6} position={[0, -5, 2]} scale={4} color={ACTS[2].color} />
      </Environment>

      <ambientLight intensity={0.35} />
      <directionalLight ref={keyLightRef} position={[0, 0, 10]} intensity={4} color={ACTS[0].color} />
      <spotLight position={[-8, 10, 8]} intensity={5} color="#ffffff" penumbra={1} angle={0.5} />
      <pointLight ref={fillLightRef} position={[0, 0, 0]} intensity={3} color={ACTS[0].color} distance={9} />

      {/* Dust field */}
      <Sparkles count={110} scale={[14, 10, 8]} size={2.2} speed={0.35} opacity={0.5} color="#9fb8d0" />

      {/* Orbit rings */}
      <mesh ref={ringInnerRef} rotation={[1.1, 0, 0]}>
        <torusGeometry args={[3.4, 0.012, 8, 128]} />
        <meshBasicMaterial color={ACTS[0].color} transparent opacity={0.35} />
      </mesh>
      <mesh ref={ringOuterRef} rotation={[-1.2, 0, 0]}>
        <torusGeometry args={[4.3, 0.008, 8, 128]} />
        <meshBasicMaterial color={ACTS[0].color} transparent opacity={0.18} />
      </mesh>

      {/* Glowing core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshBasicMaterial color={ACTS[0].color} />
      </mesh>

      {/* The Grays stick, twice: 3000 assembling particles (act 2)
          and the textured showpiece (act 3). */}
      <Suspense fallback={null}>
        <MorphingHockeyStickWithFrame actColor={actColor} scrollRef={scroll} />
        <StickShowcase actColor={actColor} scrollRef={scroll} />
      </Suspense>

      {/* Depth-mapped portrait riding slightly in front of the shard cloud.
          Suspense is scoped here so the shard cloud renders instantly
          while the portrait textures stream in. */}
      <Suspense fallback={null}>
        <Portrait3D actColor={actColor} scrollRef={scroll} />
      </Suspense>

      <Float speed={1} rotationIntensity={0} floatIntensity={0.5}>
        <group ref={groupRef} rotation={[-0.5, 0.5, 0]}>
          {layouts.flower.map((props, i) => (
            <group
              key={i}
              ref={(el) => (shardsRef.current[i] = el)}
              position={[props.x, props.y, props.z]}
              rotation={[props.rotX, props.rotY, props.rotZ]}
            >
              <mesh ref={(el) => (meshesRef.current[i] = el)} scale={[props.scaleX, props.scaleY, 0.04]}>
                <octahedronGeometry args={[1, 0]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transmission={1}
                  opacity={1}
                  transparent
                  roughness={0.05}
                  ior={1.45}
                  thickness={0.5}
                  envMapIntensity={2.5}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  iridescence={0.8}
                  iridescenceIOR={1.2}
                  iridescenceThicknessRange={[100, 400]}
                />
              </mesh>
            </group>
          ))}
        </group>
      </Float>
    </>
  );
}
