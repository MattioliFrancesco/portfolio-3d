import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// The actual Grays stick model committed to /public
const STICK_URL = '/Meshy_AI_Grays_Hockey_Stick_0925122305_texture.glb';
useGLTF.preload(STICK_URL);

/**
 * MorphingHockeyStick — 3000 particles that assemble the Grays stick.
 * Act 0-1: scattered dust drifting around the scene.
 * Act 2  : particles snap onto the stick's vertices (HCPT design act).
 * Act 3-4: the formed stick dissolves back into orbit.
 * Keeps the original concept: cyclic vertex mapping + GSAP tween on a
 * morph progress value, driven by scroll acts.
 */
export const MorphingHockeyStick = ({ actColor, scrollRef }) => {
  const meshRef = useRef();
  const matRef = useRef();
  const morph = useRef({ p: 0 });
  const applyRef = useRef(null);
  const lastTarget = useRef(null);

  const gltf = useGLTF(STICK_URL);
  const stickGeometry = useMemo(() => {
    let found = null;
    gltf.scene.traverse((obj) => {
      if (!found && obj.isMesh && obj.geometry) found = obj.geometry;
    });
    return found;
  }, [gltf]);

  const COUNT = 3000;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const { scatterPositions, targetPositions, scales } = useMemo(() => {
    const scatter = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    const scaleArr = new Float32Array(COUNT);

    if (stickGeometry) {
      const pos = stickGeometry.attributes.position;
      stickGeometry.computeBoundingBox();
      const bb = stickGeometry.boundingBox;
      const size = new THREE.Vector3().subVectors(bb.max, bb.min);
      const center = new THREE.Vector3().addVectors(bb.max, bb.min).multiplyScalar(0.5);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const SCALE = 3.4 / maxDim;

      const v = new THREE.Vector3();
      for (let i = 0; i < COUNT; i++) {
        // Cyclic vertex mapping (original idea) with a touch of jitter
        const vi = (i % pos.count) * 3;
        v.set(pos.array[vi], pos.array[vi + 1], pos.array[vi + 2])
          .sub(center)
          .multiplyScalar(SCALE);
        v.x += (Math.random() - 0.5) * 0.03;
        v.y += (Math.random() - 0.5) * 0.03;
        v.z += (Math.random() - 0.5) * 0.03;
        target[i * 3] = v.x;
        target[i * 3 + 1] = v.y;
        target[i * 3 + 2] = v.z;

        // Scatter: a wide shell around the whole scene
        const r = 6 + Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        scatter[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        scatter[i * 3 + 1] = r * Math.cos(phi);
        scatter[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 2;

        scaleArr[i] = 0.5 + Math.random() * 1.2;
      }
    }
    return { scatterPositions: scatter, targetPositions: target, scales: scaleArr };
  }, [stickGeometry]);

  // Instance-matrix writer used by the GSAP tween
  useEffect(() => {
    const apply = (progress) => {
      const mesh = meshRef.current;
      if (!mesh || !stickGeometry) return;
      for (let i = 0; i < COUNT; i++) {
        const x = THREE.MathUtils.lerp(scatterPositions[i * 3], targetPositions[i * 3], progress);
        const y = THREE.MathUtils.lerp(scatterPositions[i * 3 + 1], targetPositions[i * 3 + 1], progress);
        const z = THREE.MathUtils.lerp(scatterPositions[i * 3 + 2], targetPositions[i * 3 + 2], progress);
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(scales[i] * (0.2 + 0.8 * progress));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(0);
    applyRef.current = apply;
    return () => {
      applyRef.current = null;
    };
  }, [scatterPositions, targetPositions, scales, dummy, stickGeometry]);

  // rAF loop: scroll acts trigger GSAP morphs + emissive tint drift
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const act = THREE.MathUtils.clamp(scrollRef.current * 5 - 0.5, 0, 4);
      // Formed during act 2 (design), partial hint in acts 1 and 3
      const target = act < 1.5 ? 0 : act < 2.5 ? 1 : act < 3.2 ? 0.55 : 0;
      if (lastTarget.current !== target) {
        lastTarget.current = target;
        gsap.to(morph.current, {
          p: target,
          duration: 2.4,
          ease: 'power3.inOut',
          overwrite: true,
          onUpdate: () => applyRef.current && applyRef.current(morph.current.p),
        });
      }
      if (matRef.current && actColor.current) {
        tmpColor.copy(actColor.current);
        matRef.current.emissive.lerp(tmpColor, 0.05);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollRef, actColor, tmpColor]);

  if (!stickGeometry) return null;
  return (
    <group position={[2.2, 0.2, 0.5]} rotation={[0.1, -0.55, 0.12]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.022, 0.022, 0.022]} />
        <meshStandardMaterial ref={matRef} color="#38b6ff" emissive="#38b6ff" emissiveIntensity={0.55} roughness={0.35} metalness={0.55} />
      </instancedMesh>
    </group>
  );
};

/**
 * Wraps the morphing particles with idle floating motion (R3F useFrame)
 * and passes through the original component.
 */
export function MorphingHockeyStickWithFrame(props) {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = 0.12 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });
  return (
    <group ref={groupRef}>
      <MorphingHockeyStick {...props} />
    </group>
  );
}
export default MorphingHockeyStickWithFrame;
