import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  CN_DMG,
  CN_HIT_R,
  CN_HP,
  US_DMG,
  US_HIT_R,
  US_HP,
  fightKeys,
  installControlsProbe,
  useFight,
} from "@/lib/combat/fight-store";

const FWD = new THREE.Vector3();
const CNFWD = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const YAXIS = new THREE.Vector3(0, 1, 0);
const TMP = new THREE.Vector3();
const DIR = new THREE.Vector3();
const CAM = new THREE.Vector3();
const LOOK = new THREE.Vector3();
const EUL = new THREE.Euler();
const RED = new THREE.Color("#ff3b2f");
const BLUE = new THREE.Color("#7ec8ff");

type Bolt = { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; friendly: boolean };

export function CombatCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 4, 16], fov: 55, near: 0.2, far: 400 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
      onCreated={({ gl }) => gl.setClearColor("#120c10")}
    >
      <fog attach="fog" args={["#120c10", 40, 220]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[30, 40, 20]} intensity={1.8} color="#ffe4c4" />
      <hemisphereLight args={["#f0c8a0", "#2a1810", 0.4]} />
      <mesh position={[0, -28, -40]}>
        <sphereGeometry args={[22, 48, 32]} />
        <meshStandardMaterial color="#c17a52" roughness={0.95} />
      </mesh>
      <Dogfight />
    </Canvas>
  );
}

function Ship({ url, yRot = 0 }: { url: string; yRot?: number }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
      }
    });
    return c;
  }, [scene]);
  return <primitive object={model} rotation={[0, yRot, 0]} dispose={null} />;
}

function Dogfight() {
  const us = useRef<THREE.Group>(null);
  const cn = useRef<THREE.Group>(null);
  const lasers = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bolts = useRef<Bolt[]>([]);
  const fireHeld = useRef(false);
  const cool = useRef(0);
  const cnCool = useRef(0);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const bank = useRef(0);
  const speed = useRef(0);
  const pos = useRef(new THREE.Vector3(0, 6, 18));
  const cnPos = useRef(new THREE.Vector3(4, 8, -22));
  const cnYaw = useRef(Math.PI);
  const usHp = useRef(US_HP);
  const cnHp = useRef(CN_HP);
  const armed = useRef(false);
  const { camera } = useThree();

  useEffect(() => {
    installControlsProbe();
    const down = (e: KeyboardEvent) => {
      fightKeys.add(e.code);
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => fightKeys.delete(e.code);
    const md = () => {
      fireHeld.current = true;
    };
    const mu = () => {
      fireHeld.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    window.addEventListener("blur", () => fightKeys.clear());
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
    };
  }, []);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const st = useFight.getState();
    if (st.status !== "live") {
      armed.current = false;
      return;
    }
    if (!armed.current) {
      armed.current = true;
      yaw.current = 0;
      pitch.current = 0;
      bank.current = 0;
      speed.current = 0;
      pos.current.set(0, 6, 18);
      cnPos.current.set(4, 8, -22);
      cnYaw.current = Math.PI;
      usHp.current = US_HP;
      cnHp.current = CN_HP;
      bolts.current = [];
    }

    const thr = fightKeys.has("KeyW") || fightKeys.has("ArrowUp");
    const brk = fightKeys.has("KeyS") || fightKeys.has("ArrowDown");
    yaw.current = st.yaw;
    pitch.current = THREE.MathUtils.damp(pitch.current, thr ? 0.1 : brk ? -0.16 : 0, 4, dt);
    bank.current = st.bank;
    speed.current = Math.max(speed.current, st.speed);
    FWD.set(-Math.sin(yaw.current) * Math.cos(pitch.current), Math.sin(pitch.current), -Math.cos(yaw.current) * Math.cos(pitch.current));
    pos.current.addScaledVector(FWD, speed.current * dt);
    pos.current.y = THREE.MathUtils.clamp(pos.current.y, 1.2, 28);

    if (us.current) {
      us.current.position.copy(pos.current);
      EUL.set(pitch.current, yaw.current, bank.current);
      us.current.quaternion.setFromEuler(EUL);
    }

    CAM.copy(pos.current).addScaledVector(FWD, -14).addScaledVector(UP, 4.2);
    camera.position.lerp(CAM, 1 - Math.exp(-dt * 4));
    LOOK.copy(pos.current).addScaledVector(FWD, 12);
    camera.lookAt(LOOK);

    // CN: slow turn toward player
    TMP.copy(pos.current).sub(cnPos.current);
    const want = Math.atan2(-TMP.x, -TMP.z);
    let dy = want - cnYaw.current;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    cnYaw.current += Math.sign(dy) * Math.min(Math.abs(dy), 0.35 * dt);
    CNFWD.set(-Math.sin(cnYaw.current), 0, -Math.cos(cnYaw.current));
    cnPos.current.addScaledVector(CNFWD, 10 * dt);
    cnPos.current.y = THREE.MathUtils.damp(cnPos.current.y, pos.current.y + 1.2, 1.2, dt);
    if (cn.current) {
      cn.current.position.copy(cnPos.current);
      cn.current.rotation.set(0, cnYaw.current, 0);
    }

    cool.current -= dt;
    cnCool.current -= dt;
    if ((fireHeld.current || fightKeys.has("Space")) && cool.current <= 0) {
      cool.current = 0.16;
      // slight auto-aim
      TMP.copy(cnPos.current).sub(pos.current).normalize();
      FWD.lerp(TMP, 0.18).normalize();
      bolts.current.push({
        x: pos.current.x,
        y: pos.current.y,
        z: pos.current.z,
        vx: FWD.x * 90,
        vy: FWD.y * 90,
        vz: FWD.z * 90,
        life: 1.1,
        friendly: true,
      });
    }
    if (cnCool.current <= 0 && Math.abs(dy) < 0.45) {
      cnCool.current = 0.85;
      const aim = TMP.copy(pos.current).sub(cnPos.current).normalize();
      aim.x += (Math.random() - 0.5) * 0.35;
      aim.y += (Math.random() - 0.5) * 0.25;
      aim.normalize();
      bolts.current.push({
        x: cnPos.current.x,
        y: cnPos.current.y,
        z: cnPos.current.z,
        vx: aim.x * 48,
        vy: aim.y * 48,
        vz: aim.z * 48,
        life: 1.2,
        friendly: false,
      });
    }

    const next: Bolt[] = [];
    for (const b of bolts.current) {
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;
      if (b.life <= 0) continue;
      if (b.friendly) {
        if (Math.hypot(b.x - cnPos.current.x, b.y - cnPos.current.y, b.z - cnPos.current.z) < US_HIT_R) {
          cnHp.current = Math.max(0, cnHp.current - US_DMG);
          continue;
        }
      } else if (Math.hypot(b.x - pos.current.x, b.y - pos.current.y, b.z - pos.current.z) < CN_HIT_R) {
        usHp.current = Math.max(0, usHp.current - CN_DMG);
        continue;
      }
      next.push(b);
    }
    bolts.current = next;

    const mesh = lasers.current;
    if (mesh) {
      const n = Math.min(next.length, 64);
      for (let i = 0; i < n; i++) {
        const b = next[i]!;
        dummy.position.set(b.x, b.y, b.z);
        DIR.set(b.vx, b.vy, b.vz);
        if (DIR.lengthSq() > 0.001) dummy.quaternion.setFromUnitVectors(YAXIS, DIR.normalize());
        dummy.scale.set(0.07, 1.7, 0.07);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, b.friendly ? RED : BLUE);
      }
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    let status: "live" | "won" | "lost" = "live";
    if (cnHp.current <= 0) status = "won";
    if (usHp.current <= 0) status = "lost";
    st.reportHp({ usHp: usHp.current, cnHp: cnHp.current, status: status === "live" ? undefined : status });
  });

  return (
    <group>
      <group ref={us}>
        <Ship url="/models/us_interceptor.glb" yRot={0} />
      </group>
      <group ref={cn}>
        <Ship url="/models/cn_colonizer.glb" yRot={0} />
      </group>
      <instancedMesh ref={lasers} args={[undefined, undefined, 64]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshBasicMaterial color="#ff3b2f" />
      </instancedMesh>
    </group>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload("/models/us_interceptor.glb");
  useGLTF.preload("/models/cn_colonizer.glb");
}
