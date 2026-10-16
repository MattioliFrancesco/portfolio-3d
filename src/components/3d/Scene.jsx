import { useRef, useMemo, useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Scene({ quality = 'high', reducedMotion = false, onReady }) {
  const shardsRef = useRef([]); 
  const meshesRef = useRef([]); 
  const readyRef = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  const isCompact = useThree((state) => state.size.width < 700);
  
  const ringSizes = useMemo(
    () => quality === 'low' ? [4, 6, 8, 10] : quality === 'balanced' ? [4, 7, 9, 12] : [6, 10, 14, 18],
    [quality],
  );
  const numShards = ringSizes.reduce((total, count) => total + count, 0);

  const layouts = useMemo(() => {
    const flower = [];
    const abstract = [];
    const arch = [];
    const vortex = [];

    for (let i = 0; i < numShards; i++) {
      
      // 1. LA NINFEA (4 anelli sfalsati per creare la coppa)
      let ring, fCount, fIndex, fRadius, fRotX, fScaleY;
      
      if (i < ringSizes[0]) {
        // Cuore chiuso
        ring = 1; fCount = ringSizes[0]; fIndex = i; fRadius = 0.3; fRotX = 1.3; fScaleY = 0.5;
      } else if (i < ringSizes[0] + ringSizes[1]) {
        // Secondo anello
        ring = 2; fCount = ringSizes[1]; fIndex = i - ringSizes[0]; fRadius = 0.7; fRotX = 0.9; fScaleY = 0.7;
      } else if (i < ringSizes[0] + ringSizes[1] + ringSizes[2]) {
        // Terzo anello
        ring = 3; fCount = ringSizes[2]; fIndex = i - ringSizes[0] - ringSizes[1]; fRadius = 1.2; fRotX = 0.5; fScaleY = 0.9;
      } else {
        // Anello esterno disteso
        ring = 4; fCount = ringSizes[3]; fIndex = i - ringSizes[0] - ringSizes[1] - ringSizes[2]; fRadius = 1.7; fRotX = 0.15; fScaleY = 1.1;
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
      const innerOrbitCount = Math.round(numShards * 0.25);
      if (i < innerOrbitCount) {
        const oAngle = (i / innerOrbitCount) * Math.PI * 2;
        abstract.push({
          x: Math.cos(oAngle) * 0.8, y: Math.sin(oAngle) * 0.8, z: (i % 2 === 0) ? 0.3 : -0.3,
          rotX: 0.5, rotY: oAngle, rotZ: 0, scaleY: 0.6, scaleX: 0.2
        });
      } else {
        const oAngle = ((i - innerOrbitCount) / (numShards - innerOrbitCount)) * Math.PI * 2;
        abstract.push({
          x: Math.cos(oAngle) * 2.5, y: Math.sin(oAngle * 3) * 1.2, z: Math.sin(oAngle) * 1.5,
          rotX: 0.2, rotY: -oAngle, rotZ: 0.5, scaleY: 1.0, scaleX: 0.3
        });
      }

      // 3. ARCO MONUMENTALE (Estetica) - Doppio strato sfalsato
      const archHalf = Math.ceil(numShards / 2);
      const isArchBack = i >= archHalf;
      const aIndex = isArchBack ? i - archHalf : i;
      const aAngle = (aIndex / (archHalf - 1)) * Math.PI;
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
        y: (i - (numShards - 1) / 2) * 0.2,
        z: Math.sin(vAngle) * 1.5,
        rotX: Math.PI / 3, rotY: vAngle, rotZ: 0, 
        scaleY: 1.0, scaleX: 0.3
      });
    }
    return { flower, abstract, arch, vortex };
  }, [numShards, ringSizes]);

  useLayoutEffect(() => {
    if (reducedMotion) return undefined;

    const stages = [
      { title: '#lavoro .chapter-heading h2', layout: layouts.abstract },
      { title: '#percorso .chapter-heading h2', layout: layouts.arch },
      { title: '#chi-sono .identity-heading h2', layout: layouts.vortex },
      { title: '#contatti .closing-main h2', layout: layouts.flower, finishAtPageEnd: true },
    ];
    const context = gsap.context(() => {
      stages.forEach(({ title, layout, finishAtPageEnd = false }) => {
        const heading = document.querySelector(title);
        if (!heading) return;
        const getEndPosition = () => {
          const headerHeight = Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
          ) || 76;
          const headingPosition = heading.getBoundingClientRect().top + window.scrollY - headerHeight;
          const pageEnd = document.documentElement.scrollHeight - window.innerHeight;

          return finishAtPageEnd ? Math.max(0, Math.min(headingPosition, pageEnd)) : headingPosition;
        };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: heading,
            start: () => getEndPosition() - window.innerHeight * 0.9,
            end: getEndPosition,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        shardsRef.current.forEach((shard, i) => {
          if (!shard) return;
          timeline.to(shard.position, {
            x: layout[i].x,
            y: layout[i].y,
            z: layout[i].z,
            ease: 'power1.inOut',
            duration: 1,
            onUpdate: invalidate,
          }, 0);
          timeline.to(shard.rotation, {
            x: layout[i].rotX,
            y: layout[i].rotY,
            z: layout[i].rotZ,
            ease: 'power1.inOut',
            duration: 1,
            onUpdate: invalidate,
          }, 0);
        });
      });
    });

    return () => context.revert();
  }, [invalidate, layouts, reducedMotion]);

  useFrame((state) => {
    if (reducedMotion || quality === 'low') return;
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
      {quality !== 'low' && <Environment preset="city" />}
      <ambientLight intensity={0.5} />
      
      <directionalLight position={[0, 0, 10]} intensity={quality === 'low' ? 3 : 5} color="#ffffff" />
      {quality !== 'low' && (
        <>
          <spotLight position={[-8, 10, 8]} intensity={6} color="#ffffff" penumbra={1} angle={0.5} />
          <spotLight position={[8, -10, -5]} intensity={4} color="#38b6ff" penumbra={1} />
          <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" distance={8} />
        </>
      )}

      <Float
        speed={reducedMotion || quality === 'low' ? 0 : 0.65}
        rotationIntensity={0}
        floatIntensity={reducedMotion || quality === 'low' ? 0 : 0.28}
      >
        {/* Gruppo inclinato all'indietro (-0.5 X) e verso destra (0.5 Y) */}
        <group
          position={isCompact ? [0.55, 0, 0] : [1.05, 0, 0]}
          rotation={[-0.5, 0.5, 0]}
          scale={isCompact ? 0.52 : 0.78}
        >
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
                onAfterRender={() => {
                  if (readyRef.current) return;
                  readyRef.current = true;
                  onReady?.();
                }}
              >
                <octahedronGeometry args={[1, 0]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transmission={1}
                  opacity={0.72}
                  transparent
                  roughness={0.08}
                  ior={1.45}
                  thickness={0.5}
                  envMapIntensity={quality === 'low' ? 1 : 2.5}
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