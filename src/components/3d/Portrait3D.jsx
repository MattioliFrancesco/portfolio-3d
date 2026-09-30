import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ACTS } from './acts';

/**
 * Portrait3D — the real photo turned into a 3D object.
 * foto.png (color) + foto-depth.png (grayscale depth) drive a
 * displacement-mapped plane, giving the face real relief that
 * reacts to the environment lighting like a sculpted panel.
 *
 * Scroll behaviour:
 *   act 0 (hero)    → fully visible, centered
 *   acts 1..3       → slides off, fades out
 *   act 4 (contact) → returns from the right as a dimmed backdrop
 */
export default function Portrait3D({ actColor, scrollRef }) {
  const groupRef = useRef();
  const matRef = useRef();
  const ringRef = useRef();
  const SEG = 140;

  const map = useTexture('/foto.png');
  const depth = useTexture('/foto-depth.png');

  useMemo(() => {
    depth.colorSpace = THREE.NoColorSpace;
    depth.minFilter = THREE.LinearFilter;
    depth.magFilter = THREE.LinearFilter;
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map, depth]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(2.9, 2.9, SEG, SEG), []);

  const act = useRef(0);
  const vis = useRef(0);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    const p = scrollRef.current;
    const a = THREE.MathUtils.clamp(p * 5 - 0.3, 0, 4);
    act.current = THREE.MathUtils.damp(act.current, a, 4, d);

    // Soft visibility windows: hero (act 0) and contact (act 4).
    const inHero = 1 - THREE.MathUtils.smoothstep(act.current, 0.35, 0.85);
    const inContact = THREE.MathUtils.smoothstep(act.current, 3.1, 3.8);
    const target = Math.max(inHero, inContact);
    vis.current = THREE.MathUtils.damp(vis.current, target, 3.5, d);

    const contact = inContact;
    const targetX = THREE.MathUtils.lerp(0, 3.0, contact);
    const targetZ = THREE.MathUtils.lerp(0.4, -2.4, contact);
    const targetRotY = THREE.MathUtils.lerp(-0.08, 0.35, contact) + Math.sin(act.current * 2) * 0.03;

    if (groupRef.current) {
      const g = groupRef.current;
      g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 3, d);
      g.position.z = THREE.MathUtils.damp(g.position.z, targetZ, 3, d);
      g.position.y = Math.sin(act.current * 1.5) * 0.08;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 3, d);
      g.visible = vis.current > 0.015;
    }
    if (matRef.current) {
      matRef.current.opacity = vis.current * (contact > 0.5 ? 0.5 : 0.92);
      matRef.current.displacementScale = 0.45 + Math.sin(act.current * Math.PI) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.material.color.lerp(actColor.current, 0.06);
      ringRef.current.material.opacity = 0.4 * vis.current;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0.4]} visible={false}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          ref={matRef}
          map={map}
          displacementMap={depth}
          displacementScale={0.45}
          displacementBias={-0.22}
          roughness={0.28}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.25}
          envMapIntensity={1.1}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      {/* Slim act-colored ring framing the portrait */}
      <mesh ref={ringRef} position={[0, 0, -0.02]}>
        <ringGeometry args={[2.02, 2.06, 96]} />
        <meshBasicMaterial color={ACTS[0].color} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
