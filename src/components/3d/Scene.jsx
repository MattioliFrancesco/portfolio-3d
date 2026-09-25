import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Scene() {
  const shardsRef = useRef([]); 
  const meshesRef = useRef([]); 
  
  // Triplicati i prismi per la ninfea e le altre forme
  const numShards = 48; 

  const layouts = useMemo(() => {
    const flower = [];
    const abstract = [];
    const arch = [];
    const vortex = [];

    for (let i = 0; i < numShards; i++) {
      
      // 1. LA NINFEA (4 anelli sfalsati per creare la coppa)
      let ring, fCount, fIndex, fRadius, fRotX, fScaleY;
      
      if (i < 6) {
        // Cuore chiuso
        ring = 1; fCount = 6; fIndex = i; fRadius = 0.3; fRotX = 1.3; fScaleY = 0.5;
      } else if (i < 16) {
        // Secondo anello
        ring = 2; fCount = 10; fIndex = i - 6; fRadius = 0.7; fRotX = 0.9; fScaleY = 0.7;
      } else if (i < 30) {
        // Terzo anello
        ring = 3; fCount = 14; fIndex = i - 16; fRadius = 1.2; fRotX = 0.5; fScaleY = 0.9;
      } else {
        // Anello esterno disteso
        ring = 4; fCount = 18; fIndex = i - 30; fRadius = 1.7; fRotX = 0.15; fScaleY = 1.1;
      }

      const fAngle = (fIndex / fCount) * Math.PI * 2 + (ring * 0.25);
      
      flower.push({
        x: Math.cos(fAngle) * fRadius, 
        y: Math.sin(fAngle) * fRadius, 
        z: (4 - ring) * 0.25, // Il centro è più alto rispetto ai bordi
        rotX: fRotX, 
        rotY: 0.1, 
        rotZ: fAngle - Math.PI / 2, 
        scaleY: fScaleY,
        scaleX: 0.25 + (ring * 0.05) // Petali stretti che si allargano un po' fuori
      });

      // 2. RETE LOGICA / ASTRATTA (Codice) - Orbitale complessa
      if (i < 12) {
        const oAngle = (i / 12) * Math.PI * 2;
        abstract.push({
          x: Math.cos(oAngle) * 0.8, y: Math.sin(oAngle) * 0.8, z: (i % 2 === 0) ? 0.3 : -0.3,
          rotX: 0.5, rotY: oAngle, rotZ: 0, scaleY: 0.6, scaleX: 0.2
        });
      } else {
        const oAngle = ((i - 12) / 36) * Math.PI * 2;
        abstract.push({
          x: Math.cos(oAngle) * 2.5, y: Math.sin(oAngle * 3) * 1.2, z: Math.sin(oAngle) * 1.5,
          rotX: 0.2, rotY: -oAngle, rotZ: 0.5, scaleY: 1.0, scaleX: 0.3
        });
      }

      // 3. ARCO MONUMENTALE (Estetica) - Doppio strato sfalsato
      const isArchBack = i >= 24;
      const aIndex = isArchBack ? i - 24 : i;
      const aAngle = (aIndex / 23) * Math.PI; 
      arch.push({
        x: Math.cos(aAngle) * (isArchBack ? 3.5 : 3.2), 
        y: Math.sin(aAngle) * (isArchBack ? 3.5 : 3.2) - 1.8, 
        z: isArchBack ? -1.2 : -0.8,
        rotX: isArchBack ? 0.1 : -0.1, rotY: 0, rotZ: aAngle - Math.PI / 2, 
        scaleY: 1.2, scaleX: 0.3
      });

      // 4. VORTICE DNA (Dinamiche) - Spirale altissima
      const vAngle = i * 0.3;
      vortex.push({
        x: Math.cos(vAngle) * 1.5, 
        y: (i - 24) * 0.2, // Più stretto verticalmente per accogliere i 48 pezzi
        z: Math.sin(vAngle) * 1.5,
        rotX: Math.PI / 3, rotY: vAngle, rotZ: 0, 
        scaleY: 1.0, scaleX: 0.3
      });
    }
    return { flower, abstract, arch, vortex };
  }, [numShards]);

  useLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 2, 
      }
    });

    shardsRef.current.forEach((shard, i) => {
      if (!shard) return;
      
      tl.to(shard.position, { x: layouts.abstract[i].x, y: layouts.abstract[i].y, z: layouts.abstract[i].z, ease: "power1.inOut", duration: 15 }, 10);
      tl.to(shard.rotation, { x: layouts.abstract[i].rotX, y: layouts.abstract[i].rotY, z: layouts.abstract[i].rotZ, ease: "power1.inOut", duration: 15 }, 10);

      tl.to(shard.position, { x: layouts.arch[i].x, y: layouts.arch[i].y, z: layouts.arch[i].z, ease: "power1.inOut", duration: 15 }, 35);
      tl.to(shard.rotation, { x: layouts.arch[i].rotX, y: layouts.arch[i].rotY, z: layouts.arch[i].rotZ, ease: "power1.inOut", duration: 15 }, 35);

      tl.to(shard.position, { x: layouts.vortex[i].x, y: layouts.vortex[i].y, z: layouts.vortex[i].z, ease: "power1.inOut", duration: 15 }, 60);
      tl.to(shard.rotation, { x: layouts.vortex[i].rotX, y: layouts.vortex[i].rotY, z: layouts.vortex[i].rotZ, ease: "power1.inOut", duration: 15 }, 60);

      tl.to(shard.position, { x: layouts.flower[i].x, y: layouts.flower[i].y, z: layouts.flower[i].z, ease: "power1.inOut", duration: 15 }, 85);
      tl.to(shard.rotation, { x: layouts.flower[i].rotX, y: layouts.flower[i].rotY, z: layouts.flower[i].rotZ, ease: "power1.inOut", duration: 15 }, 85);
    });

    return () => tl.kill();
  }, [layouts]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    meshesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.z = Math.sin(time * 1.5 + i * 0.3) * 0.03;
      mesh.rotation.y = Math.sin(time * 1.2 + i * 0.3) * 0.15;
      mesh.rotation.x = Math.sin(time * 1.4 + i * 0.3) * 0.1;
    });
  });

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      
      <directionalLight position={[0, 0, 10]} intensity={5} color="#ffffff" />
      <spotLight position={[-8, 10, 8]} intensity={6} color="#ffffff" penumbra={1} angle={0.5} />
      <spotLight position={[8, -10, -5]} intensity={4} color="#38b6ff" penumbra={1} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" distance={8} />

      <Float speed={1} rotationIntensity={0} floatIntensity={0.5}>
        {/* Gruppo inclinato all'indietro (-0.5 X) e verso destra (0.5 Y) */}
        <group rotation={[-0.5, 0.5, 0]}>
          {layouts.flower.map((props, i) => (
            <group 
              key={i} 
              ref={(el) => (shardsRef.current[i] = el)}
              position={[props.x, props.y, props.z]}
              rotation={[props.rotX, props.rotY, props.rotZ]}
            >
              <mesh
                ref={(el) => (meshesRef.current[i] = el)}
                scale={[props.scaleX, props.scaleY, 0.04]}
              >
                <octahedronGeometry args={[1, 0]} />
                
                {/* Il VERO VETRO ANTI-GLITCH con Iridescenza */}
                <meshPhysicalMaterial
                  color="#ffffff"
                  transmission={1}
                  opacity={1}
                  transparent={true}
                  roughness={0.05}
                  ior={1.45}
                  thickness={0.5}
                  envMapIntensity={2.5}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  // L'iridescenza crea il prisma cromatico sui bordi 
                  // senza calcolare le doppie rifrazioni che rompono il WebGL
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