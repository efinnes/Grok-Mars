import { create } from "zustand";

export const US_HP = 140;
export const CN_HP = 70;
export const US_DMG = 14;
export const CN_DMG = 3;
export const US_HIT_R = 4.4;
export const CN_HIT_R = 2.2;

export type FightStatus = "idle" | "live" | "won" | "lost";

type FightState = {
  status: FightStatus;
  usHp: number;
  cnHp: number;
  yaw: number;
  speed: number;
  bank: number;
  notice: string;
  keys: Set<string>;
  reset: () => void;
  start: () => void;
  setKeys: (codes: string[]) => void;
  hold: (code: string, down: boolean) => void;
  reportHp: (p: { usHp: number; cnHp: number; status?: FightStatus }) => void;
};

export const fightKeys = new Set<string>();

let raf = 0;
let last = 0;
let bank = 0;

function flightLoop(now: number) {
  raf = requestAnimationFrame(flightLoop);
  const dt = Math.min((now - (last || now)) / 1000, 0.05);
  last = now;
  const st = useFight.getState();
  if (st.status !== "live") return;
  const left = fightKeys.has("KeyA") || fightKeys.has("ArrowLeft");
  const right = fightKeys.has("KeyD") || fightKeys.has("ArrowRight");
  const thr = fightKeys.has("KeyW") || fightKeys.has("ArrowUp");
  const brk = fightKeys.has("KeyS") || fightKeys.has("ArrowDown");
  let steer = 0;
  if (left) steer += 1;
  if (right) steer -= 1;
  bank = bank + (steer * 0.7 - bank) * Math.min(1, dt * 8);
  const yaw = st.yaw + bank * 1.7 * dt;
  const speed = Math.max(0, Math.min(44, st.speed + (thr ? 32 : brk ? -24 : -4) * dt));
  useFight.setState({ yaw, speed, bank });
}

function ensureLoop() {
  if (typeof window === "undefined") return;
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(flightLoop);
  }
}

export const useFight = create<FightState>((set) => ({
  status: "idle",
  usHp: US_HP,
  cnHp: CN_HP,
  yaw: 0,
  speed: 0,
  bank: 0,
  notice: "A banks left. D banks right. W throttle. Click fire.",
  keys: fightKeys,
  reset: () => {
    fightKeys.clear();
    bank = 0;
    set({ status: "idle", usHp: US_HP, cnHp: CN_HP, yaw: 0, speed: 0, bank: 0, notice: "Hold the sky." });
  },
  start: () => {
    fightKeys.clear();
    bank = 0;
    ensureLoop();
    set({ status: "live", usHp: US_HP, cnHp: CN_HP, yaw: 0, speed: 0, bank: 0, notice: "Weapons free." });
  },
  setKeys: (codes) => {
    fightKeys.clear();
    for (const c of codes) fightKeys.add(c);
    ensureLoop();
  },
  hold: (code, down) => {
    if (down) fightKeys.add(code);
    else fightKeys.delete(code);
  },
  reportHp: (p) => {
    set({
      usHp: p.usHp,
      cnHp: p.cnHp,
      ...(p.status ? { status: p.status } : {}),
    });
  },
}));

export function installControlsProbe() {
  if (typeof window === "undefined") return;
  ensureLoop();
  window.__controlsTest = {
    getYaw: () => useFight.getState().yaw,
    getSpeed: () => useFight.getState().speed,
    setKeys: (codes) => useFight.getState().setKeys(codes),
    setSteer: (v) => {
      fightKeys.delete("KeyA");
      fightKeys.delete("KeyD");
      if (v > 0.2) fightKeys.add("KeyA");
      if (v < -0.2) fightKeys.add("KeyD");
    },
  };
  (window as unknown as { __fight?: typeof useFight }).__fight = useFight;
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
