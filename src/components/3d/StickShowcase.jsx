import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const STICK_URL = '/Meshy_AI_Grays_Hockey_Stick_0925122305_texture.glb';
useGLTF.preload(STICK_URL);

/**
 * StickShowcase — the real textured Grays stick as a museum showpiece.
 * Visible during act 3 (Dynamics — Élite hockey), slowly rotating;
 * the global drag-to-orbit camera lets the visitor inspect it.
 */
export default function StickShowcase({ actColor, scrollRef }) {
  const groupRef = useRef();
  const innerRef = useRef();
  const glowRef = useRef();
  const vis = useRef(0);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const gltf = useGLTF(STICK_URL);

  // Normalize once: center pivot, scale to a consistent size
  const normalized = useMemo(() => {
    const model = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3().subVectors(box.max, box.min);
    const center = new THREE.Vector3().addVectors(box.max, box.min).multiplyScalar(0.5);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const inner = new THREE.Group();
    model.position.sub(center);
    inner.add(model);
    inner.scale.setScalar(3.6 / maxDim);
    return inner;
  }, [gltf]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const act = THREE.MathUtils.clamp(scrollRef.current * 5 - 0.5, 0, 4);
    const target = THREE.MathUtils.smoothstep(act, 2.4, 3.0) * (1 - THREE.MathUtils.smoothstep(act, 3.7, 4.0));
    vis.current = THREE.MathUtils.damp(vis.current, target, 3.5, d);

    if (groupRef.current) {
      groupRef.current.visible = vis.current > 0.015;
      groupRef.current.position.set(-2.3, Math.sin(state.clock.elapsedTime * 0.7) * 0.1, 0.6);
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = state.clock.elapsedTime * 0.45;
      innerRef.current.rotation.z = 0.35 + Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    }
    if (glowRef.current && actColor.current) {
      tmpColor.copy(actColor.current);
      glowRef.current.material.color.lerp(tmpColor, 0.06);
      glowRef.current.material.opacity = 0.16 * vis.current;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <group ref={innerRef}>
        <primitive object={normalized} />
      </group>
      {/* Soft act-colored halo behind the model */}
      <mesh ref={glowRef} position={[0, 0, -0.6]}>
        <circleGeometry args={[2.4, 48]} />
        <meshBasicMaterial color="#38b6ff" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
