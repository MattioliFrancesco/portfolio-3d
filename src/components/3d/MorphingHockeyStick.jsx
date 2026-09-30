import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

export const MorphingHockeyStick = ({ currentSection }) => {
  // 1. Carica il modello dalla cartella public
  const { nodes } = useGLTF('/nome_del_tuo_file.gltf'); 
  const meshRef = useRef();

  const particlesCount = 3000; // Regola la densità
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 2. Prepara gli array per le posizioni iniziali (caos) e finali (geometria)
  const { initialPositions, targetPositions } = useMemo(() => {
    const start = new Float32Array(particlesCount * 3);
    const target = new Float32Array(particlesCount * 3);

    // Ispeziona il tuo GLTF per trovare il nome esatto della Mesh (es. nodes.Object_2)
    const stickGeometry = nodes[Object.keys(nodes).find(n => nodes[n].type === 'Mesh')].geometry;
    const stickVertices = stickGeometry.attributes.position.array;

    for (let i = 0; i < particlesCount; i++) {
      // Distribuzione casuale iniziale per la forma destrutturata
      start[i * 3] = (Math.random() - 0.5) * 15;
      start[i * 3 + 1] = (Math.random() - 0.5) * 15;
      start[i * 3 + 2] = (Math.random() - 0.5) * 15;

      // Mappatura ciclica sui vertici della mazza da hockey
      const vertexIndex = (i % (stickVertices.length / 3)) * 3;
      target[i * 3] = stickVertices[vertexIndex];
      target[i * 3 + 1] = stickVertices[vertexIndex + 1];
      target[i * 3 + 2] = stickVertices[vertexIndex + 2];
    }
    return { initialPositions: start, targetPositions: target };
  }, [nodes]);

  // 3. Applica l'animazione GSAP in base alla sezione attiva
  useEffect(() => {
    if (!meshRef.current) return;

    const animState = { progress: currentSection === 'passioni' ? 0 : 1 };
    const targetProgress = currentSection === 'passioni' ? 1 : 0;

    gsap.to(animState, {
      progress: targetProgress,
      duration: 2.5,
      ease: "power3.inOut",
      onUpdate: () => {
        for (let i = 0; i < particlesCount; i++) {
          // Interpola tra la posizione sparsa e quella sulla mazza
          const x = THREE.MathUtils.lerp(initialPositions[i * 3], targetPositions[i * 3], animState.progress);
          const y = THREE.MathUtils.lerp(initialPositions[i * 3 + 1], targetPositions[i * 3 + 1], animState.progress);
          const z = THREE.MathUtils.lerp(initialPositions[i * 3 + 2], targetPositions[i * 3 + 2], animState.progress);

          dummy.position.set(x, y, z);
          
          // Puoi anche animare rotazione o scala qui
          dummy.scale.setScalar(animState.progress > 0.1 ? 1 : 0.2); 
          dummy.updateMatrix();
          
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    });
  }, [currentSection, initialPositions, targetPositions, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, particlesCount]}>
      <boxGeometry args={[0.02, 0.02, 0.02]} />
      {/* Tinta personalizzata per richiamare lo stile del progetto */}
      <meshStandardMaterial color="#38b6ff" roughness={0.4} metalness={0.6} />
    </instancedMesh>
  );
};