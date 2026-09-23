import { useTexture } from '@react-three/drei';

export default function HeroImage() {
  const colorTex = useTexture('/foto.png');

  return (
    <mesh position={[0, 0, 0.04]}>
      <planeGeometry args={[2.42, 2.95]} />
      <meshBasicMaterial map={colorTex} color="#f1ede6" toneMapped={false} />
    </mesh>
  );
}