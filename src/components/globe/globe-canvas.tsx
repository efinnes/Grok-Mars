import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SITES } from "@/lib/mars/gazetteer";
import { useMission } from "@/lib/mission-store";

const R = 2.15;
const FLAT = 3376.2 / 3396.19;
const SITE_DIR = new THREE.Vector3();
const CAM_DIR = new THREE.Vector3();
const TARGET_Q = new THREE.Quaternion();

export function latLonToVec(lat: number, lon: number, r = R) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(la) * Math.sin(lo),
    r * Math.sin(la) * FLAT,
    r * Math.cos(la) * Math.cos(lo),
  );
}

export function GlobeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 6.6], fov: 36, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.6]}
      frameloop="always"
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor("#050308");
        (window as unknown as { __globeCam?: THREE.Camera }).__globeCam = camera;
      }}
    >
      <color attach="background" args={["#050308"]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[7, 2.4, 4]} intensity={2.6} color="#ffe2c4" />
      <directionalLight position={[-5, -1, -6]} intensity={0.18} color="#4a6a9a" />
      <Starfield />
      <Planet />
      <Controls />
    </Canvas>
  );
}

function Starfield() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 1600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 18 + Math.random() * 28;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(b) * Math.cos(a);
      pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
      pos[i * 3 + 2] = r * Math.cos(b);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#d8dde8" size={0.035} sizeAttenuation />
    </points>
  );
}

function Planet() {
  const group = useRef<THREE.Group>(null);
  const lastLook = useRef<string | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    return useMission.subscribe((s) => {
      if (s.guiding) invalidate();
    });
  }, [invalidate]);

  useFrame(({ camera }, dt) => {
    const g = group.current;
    if (!g) return;
    const { lookId, guiding } = useMission.getState();
    if (!guiding || !lookId) {
      if (!guiding) lastLook.current = null;
      return;
    }
    const site = SITES.find((s) => s.id === lookId);
    if (!site) return;
    if (lastLook.current !== lookId) {
      lastLook.current = lookId;
      SITE_DIR.copy(latLonToVec(site.lat, site.lon, 1)).normalize();
      CAM_DIR.copy(camera.position).normalize();
      TARGET_Q.setFromUnitVectors(SITE_DIR, CAM_DIR);
    }
    g.quaternion.slerp(TARGET_Q, 1 - Math.exp(-Math.min(dt, 0.1) * 1.5));
    if (g.quaternion.angleTo(TARGET_Q) < 0.03) {
      g.quaternion.copy(TARGET_Q);
      useMission.getState().releaseGuide();
    } else {
      invalidate();
    }
  });

  return (
    <group
      ref={(node) => {
        group.current = node;
        if (node) (window as unknown as { __planet?: THREE.Group }).__planet = node;
      }}
    >
      <Mars />
      <Atmosphere />
      <Pins />
    </group>
  );
}

function Mars() {
  const color = useLoader(THREE.TextureLoader, "/textures/mars.jpg");
  const bump = useLoader(THREE.TextureLoader, "/textures/mars-bump.jpg");
  color.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 8;
  return (
    <mesh scale={[1, FLAT, 1]}>
      <sphereGeometry args={[R, 96, 72]} />
      <meshStandardMaterial map={color} bumpMap={bump} bumpScale={0.045} roughness={0.88} metalness={0.02} />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <mesh scale={[1.035, FLAT * 1.035, 1.035]}>
      <sphereGeometry args={[R, 48, 32]} />
      <meshBasicMaterial color="#c47a52" transparent opacity={0.11} side={THREE.BackSide} />
    </mesh>
  );
}

function Pins() {
  const picking = useMission((s) => s.picking);
  const lookId = useMission((s) => s.lookId);
  const site = useMission((s) => s.site);
  const yUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  return (
    <group>
      {SITES.map((s) => {
        const p = latLonToVec(s.lat, s.lon, R + 0.02);
        const active = lookId === s.id || site?.id === s.id;
        const q = new THREE.Quaternion().setFromUnitVectors(yUp, p.clone().normalize());
        return (
          <group
            key={s.id}
            position={p.toArray()}
            quaternion={q}
            onClick={(e) => {
              e.stopPropagation();
              const m = useMission.getState();
              m.lookAt(s.id);
              if (m.picking) m.propose(s);
            }}
          >
            <mesh position={[0, 0.055, 0]}>
              <sphereGeometry args={[0.032, 12, 10]} />
              <meshStandardMaterial color={active ? "#f7f3ea" : "#efe8dc"} roughness={0.35} metalness={0.15} />
            </mesh>
            <mesh position={[0, 0.018, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.018, 0.055, 8]} />
              <meshStandardMaterial color="#ddd4c6" roughness={0.4} />
            </mesh>
            {picking && active ? (
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[0.07, 0.095, 24]} />
                <meshBasicMaterial color="#9dba7a" side={THREE.DoubleSide} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function Controls() {
  const phase = useMission((s) => s.phase);
  const [held, setHeld] = useState(false);
  return (
    <OrbitControls
      enablePan={false}
      minDistance={4.1}
      maxDistance={11}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.72}
      zoomSpeed={0.9}
      autoRotate={phase === "boot" && !held}
      autoRotateSpeed={0.35}
      onStart={() => setHeld(true)}
    />
  );
}
