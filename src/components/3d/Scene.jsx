import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Scene() {
  const shardsRef = useRef([]); 
  const meshesRef = useRef([]); 
  const mainGroupRef = useRef();
  
  const numShards = 48; 

  const layouts = useMemo(() => {
    const iris = [];
    const microchip = [];
    const shield = [];
    const gear = [];

    for (let i = 0; i < numShards; i++) {
      
      // 1. HERO: L'Iris / Obiettivo Fotografico
      const isInner = i < 16;
      const irisRingSteps = isInner ? 16 : 32;
      const iAngle = (i % irisRingSteps) / irisRingSteps * Math.PI * 2;
      const iRadius = isInner ? 1.2 : 2.4;
      iris.push({
        x: Math.cos(iAngle) * iRadius,
        y: Math.sin(iAngle) * iRadius,
        z: isInner ? 0.5 : 0,
        rotX: 0,
        rotY: 0,
        rotZ: iAngle - Math.PI / 4,
        scaleX: 0.15,
        scaleY: isInner ? 0.6 : 1.2
      });

      // 2. CODICE: Il Microchip (CPU centrale e piste dati)
      if (i < 16) {
        // Core 4x4
        const col = i % 4;
        const row = Math.floor(i / 4);
        microchip.push({
          x: (col - 1.5) * 0.4,
          y: (row - 1.5) * 0.4,
          z: 0.2,
          rotX: 0, rotY: 0, rotZ: 0,
          scaleX: 0.3, scaleY: 0.3
        });
      } else {
        // Piste dati
        const traceIndex = i - 16;
        const dir = Math.floor(traceIndex / 8);
        const step = traceIndex % 8;
        let tX = 0, tY = 0, tRotZ = 0;
        
        if (dir === 0) { tX = -1.2 - step * 0.3; tY = (step % 2 === 0 ? 0.2 : -0.2); tRotZ = Math.PI / 2; }
        if (dir === 1) { tX = 1.2 + step * 0.3; tY = (step % 2 === 0 ? 0.2 : -0.2); tRotZ = Math.PI / 2; }
        if (dir === 2) { tY = 1.2 + step * 0.3; tX = (step % 2 === 0 ? 0.2 : -0.2); tRotZ = 0; }
        if (dir === 3) { tY = -1.2 - step * 0.3; tX = (step % 2 === 0 ? 0.2 : -0.2); tRotZ = 0; }

        microchip.push({
          x: tX, y: tY, z: -0.2,
          rotX: 0, rotY: 0, rotZ: tRotZ,
          scaleX: 0.1, scaleY: 0.5
        });
      }

      // 3. ESTETICA: Lo Scudo (Simmetrico, forma a V)
      const isRightSide = i % 2 === 0;
      const shieldIndex = Math.floor(i / 2); // da 0 a 23
      const t = shieldIndex / 23; // da 0 a 1
      const sX = (isRightSide ? 1 : -1) * (0.2 + t * 2.2);
      const sY = 1.8 - (t * 2.5) - (t * t * 1.5);
      shield.push({
        x: sX,
        y: sY,
        z: Math.sin(t * Math.PI) * 0.5,
        rotX: 0.2,
        rotY: isRightSide ? -0.2 : 0.2,
        rotZ: isRightSide ? Math.PI / 6 : -Math.PI / 6,
        scaleX: 0.2,
        scaleY: 0.8
      });

      // 4. DINAMICHE: L'Ingranaggio Meccanico
      const isTooth = i % 2 === 0;
      const gearPair = Math.floor(i / 2); 
      const gAngle = (gearPair / 24) * Math.PI * 2;
      const gRadius = isTooth ? 2.6 : 2.0;
      gear.push({
        x: Math.cos(gAngle) * gRadius,
        y: Math.sin(gAngle) * gRadius,
        z: isTooth ? 0 : 0.2,
        rotX: 0,
        rotY: 0,
        rotZ: gAngle,
        scaleX: isTooth ? 0.2 : 0.4,
        scaleY: isTooth ? 0.6 : 0.2
      });
    }
    return { iris, microchip, shield, gear };
  }, [numShards]);

  useLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5, 
      }
    });

    shardsRef.current.forEach((shard, i) => {
      if (!shard) return;
      
      tl.to(shard.position, { x: layouts.microchip[i].x, y: layouts.microchip[i].y, z: layouts.microchip[i].z, ease: "power2.inOut", duration: 15 }, 10);
      tl.to(shard.rotation, { x: layouts.microchip[i].rotX, y: layouts.microchip[i].rotY, z: layouts.microchip[i].rotZ, ease: "power2.inOut", duration: 15 }, 10);

      tl.to(shard.position, { x: layouts.shield[i].x, y: layouts.shield[i].y, z: layouts.shield[i].z, ease: "power2.inOut", duration: 15 }, 35);
      tl.to(shard.rotation, { x: layouts.shield[i].rotX, y: layouts.shield[i].rotY, z: layouts.shield[i].rotZ, ease: "power2.inOut", duration: 15 }, 35);

      tl.to(shard.position, { x: layouts.gear[i].x, y: layouts.gear[i].y, z: layouts.gear[i].z, ease: "power2.inOut", duration: 15 }, 60);
      tl.to(shard.rotation, { x: layouts.gear[i].rotX, y: layouts.gear[i].rotY, z: layouts.gear[i].rotZ, ease: "power2.inOut", duration: 15 }, 60);

      tl.to(shard.position, { x: layouts.iris[i].x, y: layouts.iris[i].y, z: layouts.iris[i].z, ease: "power2.inOut", duration: 15 }, 85);
      tl.to(shard.rotation, { x: layouts.iris[i].rotX, y: layouts.iris[i].rotY, z: layouts.iris[i].rotZ, ease: "power2.inOut", duration: 15 }, 85);
    });

    return () => tl.kill();
  }, [layouts]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y = THREE.MathUtils.lerp(mainGroupRef.current.rotation.y, mouseX * 0.4, 0.05);
      mainGroupRef.current.rotation.x = THREE.MathUtils.lerp(mainGroupRef.current.rotation.x, -mouseY * 0.4, 0.05);
    }

    meshesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.z += Math.sin(time * 2.0 + i * 0.2) * 0.002;
    });
  });

  return (
    <>
      <Environment preset="night" />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <spotLight position={[-10, 0, 10]} intensity={25} color="#38b6ff" penumbra={0.2} angle={0.8} />
      <spotLight position={[10, -5, -5]} intensity={10} color="#0055ff" penumbra={1} />

      <group ref={mainGroupRef}>
        {layouts.iris.map((props, i) => (
          <group 
            key={i} 
            ref={(el) => (shardsRef.current[i] = el)}
            position={[props.x, props.y, props.z]}
            rotation={[props.rotX, props.rotY, props.rotZ]}
          >
            <mesh
              ref={(el) => (meshesRef.current[i] = el)}
              scale={[props.scaleX, props.scaleY, 0.1]}
            >
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color="#0a0a0a"
                metalness={1}
                roughness={0.1}
                emissive="#38b6ff"
                emissiveIntensity={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={1.5} 
        />
      </EffectComposer>
    </>
  );
}