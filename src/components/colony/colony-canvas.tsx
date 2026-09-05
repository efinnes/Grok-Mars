import { memo, Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  BasaltRock,
  CargoStarship,
  CraftModel,
  HabitatDome,
  IceBlock,
  IceStill,
  Kilopower,
  Megapack,
  Meteorite,
  OptimusBot,
  Starship,
} from "./models";
import { CHARGE_PAD, FROST, KILO_PIT, KILO_SPAWN, PACK_SLOT, PACK_SPAWN, RESUPPLY, STILL, WALK_R } from "@/lib/colony/types";
import { inWalk, placeCursor, siteLegal, useYard } from "@/lib/colony/yard-store";
import type { JobKind } from "@/lib/colony/types";

const ORBIT_TARGET = new THREE.Vector3(8.5, 9.5, 4.5);
const CAM_POS: [number, number, number] = [25, 17, 42];

export const ColonyCanvas = memo(function ColonyCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: CAM_POS, fov: 42, near: 0.15, far: 280 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor("#c17a52");
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        camera.lookAt(ORBIT_TARGET);
      }}
    >
      <fog attach="fog" args={["#c48462", 55, 150]} />
      <DustFog />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#f0c8a0", "#4a2818", 0.5]} />
      <Sun />
      <Ground />
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[WALK_R - 0.16, WALK_R + 0.1, 64]} />
        <meshBasicMaterial color="#9dba7a" transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>
      <Pads />
      <Suspense fallback={null}>
        <HabitatDome />
        <ClickMesh pos={[0, 4, 0]} r={8} h={8} onPick={() => useYard.getState().select({ kind: "dome" })} />
        <Starship />
        <ClickMesh pos={[20.5, 9, 6]} r={3.6} h={18} onPick={() => useYard.getState().select({ kind: "ship" })} />
        <LiveYard />
        <PlacedLayer />
        <PlaceSurface />
        <ResupplyCraft />
      </Suspense>
      <DustBits />
      <OrbitControls enableDamping autoRotate autoRotateSpeed={0.18} enablePan={false} minDistance={18} maxDistance={72} target={ORBIT_TARGET} />
    </Canvas>
  );
});

function Sun() {
  const ref = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const y = useYard.getState();
    const phase = y.calendarSol % 1;
    const night = phase < 0.22 || phase > 0.78;
    if (!ref.current) return;
    ref.current.intensity = y.storming ? 0.35 : night ? 0.16 : 2.2;
  });
  return (
    <directionalLight ref={ref} position={[42, 48, 18]} intensity={2.2} color="#ffe4c4" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
  );
}

function DustFog() {
  const fog = useRef<THREE.Fog>(null);
  useFrame(({ scene }) => {
    const storm = useYard.getState().storming;
    const f = scene.fog as THREE.Fog | null;
    if (!f) return;
    f.near = storm ? 12 : 55;
    f.far = storm ? 48 : 150;
    f.color.set(storm ? "#b88962" : "#c48462");
  });
  return null;
}

function DustBits() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = Math.random() * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    const storm = useYard.getState().storming;
    if (!ref.current) return;
    ref.current.visible = storm;
    ref.current.rotation.y += dt * 0.15;
    ref.current.position.x = (ref.current.position.x + dt * 4) % 8;
  });
  return (
    <points ref={ref} geometry={geo} visible={false}>
      <pointsMaterial color="#d4a078" size={0.22} transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[95, 64]} />
      <meshStandardMaterial color="#c57a4e" roughness={0.96} />
    </mesh>
  );
}

function Pads() {
  return (
    <group>
      <mesh position={[20.5, 0.04, 6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.8, 36]} />
        <meshStandardMaterial color="#6d655c" roughness={0.7} />
      </mesh>
      <mesh position={[CHARGE_PAD.x, 0.05, CHARGE_PAD.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 20]} />
        <meshStandardMaterial color="#1a2420" emissive="#9dba7a" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[PACK_SLOT.x, 0.05, PACK_SLOT.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 1.6]} />
        <meshStandardMaterial color="#2a3036" />
      </mesh>
      <mesh position={[KILO_PIT.x, 0.03, KILO_PIT.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 2.1, 24]} />
        <meshStandardMaterial color="#5a4032" />
      </mesh>
      <mesh position={[STILL.x, 0, STILL.z]}>
        <IceStill level={1} />
      </mesh>
      <mesh position={[RESUPPLY.x, 0.04, RESUPPLY.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.4, 32]} />
        <meshStandardMaterial color="#5a5248" />
      </mesh>
      <mesh position={[FROST.x, 0.045, FROST.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.2, 24]} />
        <meshStandardMaterial color="#b9c8d4" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function ClickMesh({ pos, r, h, onPick }: { pos: [number, number, number]; r: number; h: number; onPick: () => void }) {
  return (
    <mesh position={pos} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <cylinderGeometry args={[r, r, h, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function Beacon({ color, hide }: { color: string; hide: boolean }) {
  if (hide) return null;
  return (
    <group>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.9, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 2, 0]} intensity={5} distance={9} color={color} />
    </group>
  );
}

function LiveYard() {
  const nodes = useYard((s) => s.nodes);
  const bots = useYard((s) => s.bots);
  const packAt = useYard((s) => s.packAtDome);
  const kiloSeated = useYard((s) => s.kiloSeated);
  const packRef = useRef<THREE.Group>(null);
  const kiloRef = useRef<THREE.Group>(null);
  const botRefs = useRef<THREE.Group[]>([]);
  useFrame(() => {
    const s = useYard.getState();
    s.bots.forEach((b, i) => {
      const g = botRefs.current[i];
      if (!g) return;
      g.position.set(b.x, 0, b.z);
      g.rotation.y = b.heading;
    });
    if (packRef.current) packRef.current.position.set(s.packX, 0, s.packZ);
    if (kiloRef.current) kiloRef.current.position.set(s.kiloX, 0, s.kiloZ);
  });
  return (
    <group>
      {nodes.map((n) =>
        n.taken ? null : (
          <group
            key={n.id}
            position={[n.x, 0.32, n.z]}
            onClick={(e) => {
              e.stopPropagation();
              clickNode(n.id, n.x, n.z, n.kind);
            }}
          >
            {n.kind === "ice" ? <IceBlock /> : n.kind === "basalt" ? <BasaltRock /> : <Meteorite />}
          </group>
        ),
      )}
      <group
        ref={packRef}
        position={[PACK_SPAWN.x, 0, PACK_SPAWN.z]}
        onClick={(e) => {
          e.stopPropagation();
          clickCarry("haulPack");
        }}
      >
        <Megapack />
        <Beacon color="#9dba7a" hide={packAt} />
      </group>
      <group
        ref={kiloRef}
        position={[KILO_SPAWN.x, 0, KILO_SPAWN.z]}
        onClick={(e) => {
          e.stopPropagation();
          clickCarry("haulKilo");
        }}
      >
        <Kilopower />
        <Beacon color="#e8c36a" hide={kiloSeated} />
      </group>
      {bots.map((b, i) => (
        <group
          key={b.id}
          ref={(el) => {
            if (el) botRefs.current[i] = el;
          }}
          position={[b.x, 0, b.z]}
          onClick={(e) => {
            e.stopPropagation();
            useYard.getState().select({ kind: "bot", id: b.id });
          }}
        >
          <OptimusBot />
        </group>
      ))}
    </group>
  );
}

function PlacedLayer() {
  const placed = useYard((s) => s.placed);
  return (
    <>
      {placed.map((p) => (
        <group key={p.id} position={[p.x, 0, p.z]}>
          <CraftModel kind={p.kind} />
        </group>
      ))}
    </>
  );
}

function PlaceSurface() {
  const placing = useYard((s) => s.placing);
  if (!placing) return null;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.14, 0]}
      onPointerMove={(e) => {
        placeCursor.x = e.point.x;
        placeCursor.z = e.point.z;
        placeCursor.valid = siteLegal(e.point.x, e.point.z, useYard.getState().placed) || placing === "berm";
      }}
      onClick={(e) => {
        e.stopPropagation();
        useYard.getState().confirmPlace(e.point.x, e.point.z);
      }}
    >
      <circleGeometry args={[WALK_R + 0.4, 48]} />
      <meshBasicMaterial color="#9dba7a" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

function ResupplyCraft() {
  const ship = useYard((s) => s.resupply);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const r = useYard.getState().resupply;
    if (ref.current && r) ref.current.position.set(r.x, r.y, r.z);
  });
  if (!ship) return null;
  return (
    <group ref={ref} position={[ship.x, ship.y, ship.z]}>
      <CargoStarship x={0} y={0} z={0} />
    </group>
  );
}

function clickNode(id: string, x: number, z: number, kind: "meteorite" | "ice" | "basalt") {
  const y = useYard.getState();
  const job: JobKind = kind === "ice" ? "haulIce" : kind === "basalt" ? "haulBasalt" : "sweep";
  if (y.sel.kind === "bot") y.assignBot(y.sel.id, job, id, x, z);
  else y.select({ kind: "node", id });
}

function clickCarry(job: "haulPack" | "haulKilo") {
  const y = useYard.getState();
  const idle = y.sel.kind === "bot" ? y.sel.id : y.bots.find((b) => b.job === "idle")?.id;
  if (!idle) return;
  if (job === "haulPack") y.assignBot(idle, "haulPack", "pack", y.packX, y.packZ);
  else y.assignBot(idle, y.kiloSeated ? "install" : "haulKilo", "kilo", y.kiloSeated ? KILO_PIT.x : y.kiloX, y.kiloSeated ? KILO_PIT.z : y.kiloZ);
}

void inWalk;
