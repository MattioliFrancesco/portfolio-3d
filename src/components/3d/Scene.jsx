import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const orange = '#ff5a1f';
const cream = '#f1ede6';
const deep = '#05080b';
const words = {
  it: { hero: 'FRANCESCO\nMATTIOLI', heroSub: 'ingegneria informatica · web · materia digitale', work: 'COSE MESSE\nIN MOTO', workSub: 'Shelfly · TAPP · freelance', shelfly: 'Shelfly\nprodotto + software', tapp: 'TAPP\nfull stack', freelance: 'WEB\nfreelance', profile: 'TECNICA,\nMA VIVA', profileSub: 'UNIFI · NASA/JPL · hockey su prato', profileBody: 'logica con una direzione', studies: 'STRATI\nSOLIDI', studiesSub: 'UNIFI · ITTS Fedi-Fermi · Cambridge B2', studiesBody: 'lingue · codice · metodo', contact: 'CI VEDIAMO\nALLA FINE', contactSub: 'un\'idea senza forma · scrivimi' },
  en: { hero: 'FRANCESCO\nMATTIOLI', heroSub: 'computer engineering · web · digital matter', work: 'THINGS SET\nIN MOTION', workSub: 'Shelfly · TAPP · freelance', shelfly: 'Shelfly\nproduct + software', tapp: 'TAPP\nfull stack', freelance: 'WEB\nfreelance', profile: 'TECHNICAL,\nBUT ALIVE', profileSub: 'UNIFI · NASA/JPL · field hockey', profileBody: 'logic with a direction', studies: 'SOLID\nLAYERS', studiesSub: 'UNIFI · Fedi-Fermi · Cambridge B2', studiesBody: 'languages · code · method', contact: 'SEE YOU\nAT THE END', contactSub: 'an idea without a shape · write me' },
};

function Sign({ children, position, size = 0.28, color = cream, rotation = [0, 0, 0] }) {
  return <Text position={position} rotation={rotation} fontSize={size} color={color} anchorX="center" anchorY="middle" textAlign="center" lineHeight={0.86} font="/MattiolisHand-Regular.ttf" maxWidth={5}>{children}</Text>;
}

function Island({ position, scale = [1, 1, 1], color = '#17110e' }) {
  return <group position={position} scale={scale}><mesh><cylinderGeometry args={[2.1, 2.8, 0.65, 8]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh><mesh position={[0, 0.36, 0]}><cylinderGeometry args={[1.75, 2.1, 0.16, 8]} /><meshStandardMaterial color={orange} emissive="#561300" emissiveIntensity={0.35} roughness={0.65} /></mesh></group>;
}

function Beacon({ position, height = 2.6 }) {
  return <group position={position}><mesh position={[0, height / 2, 0]}><cylinderGeometry args={[0.025, 0.04, height, 8]} /><meshStandardMaterial color="#4b3933" metalness={0.8} /></mesh><mesh position={[0, height, 0]}><sphereGeometry args={[0.08, 12, 8]} /><meshBasicMaterial color={orange} /></mesh><pointLight position={[0, height, 0]} color={orange} intensity={1.1} distance={5} /></group>;
}

function IslandText({ position, title, subtitle }) {
  return <group position={position}><Sign position={[0, 0.48, 0]} size={0.3} color={cream}>{title}</Sign><Sign position={[0, -0.48, 0]} size={0.125} color={orange}>{subtitle}</Sign></group>;
}

function ProjectRock({ position, label, rotation = [0, 0, 0] }) {
  return <group position={position} rotation={rotation}><mesh><dodecahedronGeometry args={[0.72, 1]} /><meshStandardMaterial color={orange} emissive="#6b1700" emissiveIntensity={0.55} flatShading roughness={0.75} /></mesh><mesh position={[0, -0.8, 0]}><torusGeometry args={[0.74, 0.025, 8, 48]} /><meshBasicMaterial color={orange} transparent opacity={0.6} /></mesh><Sign position={[0, 1.05, 0]} size={0.16}>{label}</Sign></group>;
}

export default function Scene({ language }) {
  const { camera } = useThree();
  const cameraTarget = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const smooth = useRef(0);
  const copy = words[language];

  useFrame((_, delta) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = window.scrollY / max;
    smooth.current = THREE.MathUtils.damp(smooth.current, progress, 3.2, delta);
    const p = smooth.current;
    const x = Math.sin(p * Math.PI * 3.1) * 3.2 + Math.sin(p * Math.PI * 7) * 0.5;
    const y = 2.55 + Math.sin(p * Math.PI * 4) * 1.25 + Math.sin(p * Math.PI * 9) * 0.35;
    const z = 14 - p * 68;
    const nextX = Math.sin(Math.min(1, p + 0.06) * Math.PI * 3.1) * 3.2;
    const nextY = 2.55 + Math.sin(Math.min(1, p + 0.06) * Math.PI * 4) * 1.25;
    cameraTarget.current.set(x, y, z);
    lookTarget.current.set(nextX * 0.7, nextY, z - 9);
    camera.position.lerp(cameraTarget.current, 1 - Math.pow(0.0005, delta));
    camera.lookAt(lookTarget.current);
  });

  return <>
    <color attach="background" args={[deep]} /><fog attach="fog" args={[deep, 8, 34]} />
    <ambientLight intensity={0.42} /><directionalLight position={[2, 8, 5]} intensity={1.35} color="#fff0e5" /><pointLight position={[-5, 4, 2]} intensity={4} distance={12} color={orange} /><pointLight position={[4, 1, -22]} intensity={3} distance={10} color="#ff9d62" />
    <group>
      <mesh position={[0, -1.2, -28]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[32, 78, 1, 28]} /><meshStandardMaterial color="#071014" roughness={0.8} metalness={0.18} /></mesh>
      {[-5, -2.4, 2.4, 5].map((x) => <mesh key={x} position={[x, -1.03, -28]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.018, 78]} /><meshBasicMaterial color={orange} transparent opacity={0.18} /></mesh>)}

      <group position={[0, 1.3, 4]}><Island position={[0, 0, 0]} scale={[1.05, 0.9, 0.85]} /><mesh position={[0, 1.35, 0]}><boxGeometry args={[1.8, 2.3, 0.18]} /><meshBasicMaterial map={undefined} color={deep} /></mesh><mesh position={[0, 1.35, 0.12]}><planeGeometry args={[1.7, 2.18]} /><meshBasicMaterial color="#211510" /></mesh><Sign position={[0, 1.6, 0.2]} size={0.31}>{copy.hero}</Sign><Sign position={[0, 0.95, 0.2]} size={0.12} color={orange}>{copy.heroSub}</Sign><Beacon position={[-1.65, 0.35, 0]} height={2.3} /><Beacon position={[1.65, 0.35, 0]} height={1.8} /></group>

      <group position={[-2.9, 0.65, -12]}><Island scale={[1.1, 1, 0.9]} /><ProjectRock position={[-1.1, 1.55, 0.1]} label={copy.shelfly} rotation={[0.2, 0.4, 0.1]} /><ProjectRock position={[1.1, 1.65, 0]} label={copy.tapp} rotation={[-0.15, 0.2, -0.2]} /><IslandText position={[0, 2.35, 0]} title={copy.work} subtitle={copy.workSub} /><Beacon position={[1.85, 0.35, 0]} height={2.5} /></group>
      <group position={[3.1, 1.75, -18]}><Island scale={[0.72, 0.8, 0.68]} color="#21120e" /><ProjectRock position={[0, 1.25, 0]} label={copy.freelance} rotation={[0.1, -0.3, 0.2]} /><Sign position={[0, 2.25, 0]} size={0.14} color={orange}>{language === 'it' ? 'front-end · back-end · deployment' : 'front-end · back-end · deployment'}</Sign></group>

      <group position={[0.5, 2.8, -27]}><Island scale={[1.2, 1.1, 1]} color="#1d110d" /><mesh position={[0, 2.1, 0]}><dodecahedronGeometry args={[1.55, 1]} /><meshStandardMaterial color={orange} emissive="#701900" emissiveIntensity={0.8} roughness={0.82} flatShading /></mesh><IslandText position={[0, 4.1, 0]} title={copy.profile} subtitle={copy.profileSub} /><Sign position={[0, 0.8, 0]} size={0.14} color={cream}>{copy.profileBody}</Sign><Beacon position={[-1.9, 0.4, 0]} height={2.8} /></group>

      <group position={[-2.4, 1.25, -40]}><Island scale={[1.25, 1, 1]} /><mesh position={[-0.4, 1.25, 0]} rotation={[0, 0.12, -0.18]}><boxGeometry args={[2.9, 0.12, 1.45]} /><meshStandardMaterial color={cream} roughness={0.55} /></mesh><mesh position={[0.2, 1.05, 0.1]} rotation={[0, -0.1, 0.18]}><boxGeometry args={[2.9, 0.12, 1.45]} /><meshStandardMaterial color="#baa99b" roughness={0.6} /></mesh><mesh position={[0, 0.84, 0.2]}><boxGeometry args={[2.9, 0.12, 1.45]} /><meshStandardMaterial color={orange} emissive="#5d1400" emissiveIntensity={0.4} /></mesh><IslandText position={[0, 3.05, 0]} title={copy.studies} subtitle={copy.studiesSub} /><Sign position={[0, 0.25, 0]} size={0.14} color={cream}>{copy.studiesBody}</Sign></group>

      <group position={[2.2, 2.1, -54]}><Island scale={[1.25, 1, 1]} color="#15100e" /><mesh position={[0, 2, 0]}><torusGeometry args={[2, 0.14, 12, 64]} /><meshStandardMaterial color={orange} emissive="#711900" emissiveIntensity={0.65} /></mesh><mesh position={[0, 2, 0]}><sphereGeometry args={[0.45, 24, 14]} /><meshStandardMaterial color="#14100e" metalness={0.8} /></mesh><IslandText position={[0, 4.55, 0]} title={copy.contact} subtitle={copy.contactSub} /></group>
    </group>
  </>;
}
