import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { SHIP, type PlaceableId } from "@/lib/colony/types";

const GLB = {
  starship: "/models/starship.glb",
  dome: "/models/dome.glb",
  robot: "/models/robot.glb",
  megapack: "/models/megapack.glb",
  kilopower: "/models/kilopower.glb",
  pylon: "/models/pylon.glb",
  greenhouse: "/models/greenhouse.glb",
} as const;

function cloneGltf(scene: THREE.Object3D) {
  const cloned = scene.clone(true);
  cloned.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = true;
    m.receiveShadow = true;
  });
  return cloned;
}

function GltfAsset({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => cloneGltf(scene), [scene]);
  return <primitive object={model} scale={scale} dispose={null} />;
}

function ObjAsset({ url, color = "#c5c8cc" }: { url: string; color?: string }) {
  const obj = useLoader(OBJLoader, url);
  const model = useMemo(() => {
    const c = obj.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.material = new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.4 });
    });
    return c;
  }, [obj, color]);
  return <primitive object={model} dispose={null} />;
}

export function Starship() {
  return (
    <group position={[SHIP.x, 0, SHIP.z]} rotation={[0, Math.PI / 2, 0]}>
      <GltfAsset url={GLB.starship} />
    </group>
  );
}
export function CargoStarship({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, -Math.PI / 4, 0]}>
      <GltfAsset url={GLB.starship} />
    </group>
  );
}
export function HabitatDome() {
  return <GltfAsset url={GLB.dome} />;
}
export function OptimusBot() {
  return <GltfAsset url={GLB.robot} />;
}
export function Megapack() {
  return <GltfAsset url={GLB.megapack} />;
}
export function Kilopower() {
  return <GltfAsset url={GLB.kilopower} />;
}
export function Meteorite() {
  return (
    <mesh castShadow rotation={[0.3, 0.4, 0.1]}>
      <icosahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#4a3428" metalness={0.8} roughness={0.32} />
    </mesh>
  );
}
export function BasaltRock() {
  return (
    <mesh castShadow rotation={[0.2, 1.1, 0.4]} scale={[1.15, 0.7, 1.35]}>
      <dodecahedronGeometry args={[0.62, 0]} />
      <meshStandardMaterial color="#3a332e" metalness={0.08} roughness={0.92} />
    </mesh>
  );
}
export function IceBlock() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.7, 0.5, 0.55]} />
      <meshStandardMaterial color="#d8f0ff" roughness={0.22} emissive="#7ec8e8" emissiveIntensity={0.3} />
    </mesh>
  );
}
export function IceStill({ level }: { level: number }) {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 1.4, 10]} />
        <meshStandardMaterial color="#2a3840" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#7ec8e8" emissive="#7ec8e8" emissiveIntensity={0.2 + level * 0.05} />
      </mesh>
    </group>
  );
}
export function BermPile() {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos(i) * 0.6, 0.35, Math.sin(i) * 0.55]} scale={[1.2, 0.55 + i * 0.08, 1]} castShadow>
          <dodecahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color="#6a4a38" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
export function CraftModel({ kind }: { kind: PlaceableId }) {
  if (kind === "pylon") return <GltfAsset url={GLB.pylon} />;
  if (kind === "greenhouse") return <GltfAsset url={GLB.greenhouse} scale={0.55} />;
  if (kind === "solar") return <ObjAsset url="/models/solar.obj" color="#1a2740" />;
  if (kind === "radiator") return <ObjAsset url="/models/radiator.obj" color="#c88854" />;
  if (kind === "mast") return <ObjAsset url="/models/mast.obj" color="#9dba7a" />;
  if (kind === "berm") return <BermPile />;
  return null;
}

if (typeof window !== "undefined") {
  useGLTF.preload(GLB.starship);
  useGLTF.preload(GLB.dome);
  useGLTF.preload(GLB.robot);
  useGLTF.preload(GLB.megapack);
  useGLTF.preload(GLB.kilopower);
  useGLTF.preload(GLB.pylon);
  useGLTF.preload(GLB.greenhouse);
}
