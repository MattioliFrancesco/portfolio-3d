import { useMemo } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/Meshy_AI_Grays_Hockey_Stick_0925122305_texture.glb';

export default function HockeyStick({ autoRotate, enableRotate = true }) {
  const { scene } = useGLTF(MODEL_PATH);
  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((node) => {
      if (!node.isMesh) return;

      node.geometry = node.geometry.clone();
      const positions = node.geometry.attributes.position;
      const orangeSectionY = -0.5;
      const bladeTipY = -0.95;
      const transitionEndY = orangeSectionY + (orangeSectionY - bladeTipY);

      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const t = THREE.MathUtils.clamp((transitionEndY - y) / (transitionEndY - orangeSectionY), 0, 1);
        const bladeInfluence = t * t * (3 - 2 * t);
        const z = positions.getZ(i);

        positions.setZ(i, z * (1 - bladeInfluence * 0.5));
      }

      positions.needsUpdate = true;
      node.geometry.computeVertexNormals();
      node.geometry.computeBoundingBox();
      node.geometry.computeBoundingSphere();
    });

    return clone;
  }, [scene]);
  const { position, scale } = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const fitScale = 2.8 / Math.max(size.x, size.y, size.z);

    return {
      position: center.multiplyScalar(-fitScale).toArray(),
      scale: fitScale,
    };
  }, [model]);

  return (
    <>
      <group rotation={[0, 0, -0.16]}>
        <primitive object={model} position={position} scale={scale} />
      </group>
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        enableDamping
        enablePan={false}
        enableRotate={enableRotate}
        enableZoom={false}
        maxPolarAngle={2.75}
        minPolarAngle={0.4}
        rotateSpeed={0.7}
      />
    </>
  );
}
