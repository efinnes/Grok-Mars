import { create } from "zustand";
import {
  AIR_DRY,
  AIR_WET,
  BASALT_N,
  BEDS,
  BERM_SLOT,
  CATALOG,
  CHARGE_PAD,
  DOME,
  FIRST_CREW,
  FROST,
  ICE_CAP,
  ICE_N,
  ICE_PER_SOL,
  KILO_PIT,
  KILO_SPAWN,
  METAL_CAP,
  METEORITE_N,
  PACK_SLOT,
  PACK_SPAWN,
  REG_CAP,
  RESUPPLY,
  SEEDS,
  SHIP,
  SOLS_MONTH,
  SOL_SEC,
  STILL,
  WALK_R,
  type CraftId,
  type CraftJob,
  type Crop,
  type DeathCause,
  type Human,
  type JobKind,
  type LoopKind,
  type PlaceableId,
  type PlacedPart,
  type Quest,
  type QuestId,
  type ResupplyShip,
  type SeedId,
  type SeedStock,
  type YardBot,
  type YardNode,
} from "./types";
import { iceCountFor } from "@/lib/mars/ice";
import { DEFAULT_SITE, type ColonySite } from "@/lib/mars/gazetteer";

export type Panel = "none" | "dome" | "ship";
type Sel =
  | { kind: "none" }
  | { kind: "bot"; id: string }
  | { kind: "node"; id: string }
  | { kind: "dome" }
  | { kind: "ship" }
  | { kind: "pack" }
  | { kind: "kilo" }
  | { kind: "still" };

export const placeCursor = { x: 12, z: 8, valid: false };

type YardState = {
  started: boolean;
  ready: boolean;
  dead: boolean;
  death: DeathCause;
  site: ColonySite | null;
  monthsLived: number;
  calendarSol: number;
  bots: YardBot[];
  nodes: YardNode[];
  metal: number;
  ice: number;
  air: number;
  regolith: number;
  reserve: number;
  pack: number;
  packX: number;
  packZ: number;
  packAtDome: boolean;
  kiloX: number;
  kiloZ: number;
  kiloSeated: boolean;
  kiloOn: boolean;
  brownout: boolean;
  storming: boolean;
  stormUntil: number;
  nextStorm: number;
  printed: CraftId[];
  placed: PlacedPart[];
  placing: PlaceableId | null;
  crafting: CraftJob | null;
  resupply: ResupplyShip | null;
  extraCrewLanded: boolean;
  seeds: SeedStock;
  crops: Crop[];
  humans: Human[];
  dryAcc: number;
  quests: Quest[];
  sel: Sel;
  panel: Panel;
  notice: string | null;
  init: (site: ColonySite) => void;
  start: () => void;
  restart: () => void;
  select: (sel: Sel) => void;
  openPanel: (p: Panel) => void;
  assignBot: (botId: string, job: JobKind, targetId?: string, tx?: number, tz?: number) => void;
  tickBots: (dt: number) => void;
  tickPower: (dt: number) => void;
  tickTime: (dt: number) => void;
  craft: (id: CraftId) => void;
  cancelCraft: () => void;
  confirmPlace: (x: number, z: number) => void;
  cancelPlace: () => void;
  plant: (kind: SeedId) => void;
  orderCargo: () => void;
  landCrew: () => void;
};

function firstSeeds(): SeedStock {
  return { tomato: 3, potato: 3, lettuce: 4, strawberry: 2 };
}

function quests(): Quest[] {
  return [
    { id: "wake", title: "Wake the three", detail: "Walk Optimus off the ramp.", status: "active" },
    { id: "ice", title: "Feed the still", detail: "Haul ice. Water for beds.", status: "locked" },
    { id: "power", title: "Marry the Megapack", detail: "Haul the battery to the dome.", status: "locked" },
    { id: "kilopower", title: "Seat Kilopower", detail: "Haul the reactor to the pit. Dust will eat solar.", status: "locked" },
    { id: "metal", title: "Sweep the ejecta", detail: "Iron meteorites for the printer.", status: "locked" },
    { id: "print", title: "Print the first tool", detail: "Open the dome shop.", status: "locked" },
    { id: "shield", title: "Berm the capitol", detail: "Quarry local basalt. Pile a radiation berm before humans.", status: "locked" },
    { id: "crew", title: "Bring the first three", detail: "Air, power, living beds, and a berm.", status: "locked" },
  ];
}

export function inWalk(x: number, z: number) {
  return Math.hypot(x - DOME.x, z - DOME.z) <= WALK_R;
}

export function siteLegal(x: number, z: number, placed: PlacedPart[]) {
  if (!inWalk(x, z)) return false;
  if (Math.hypot(x, z) < 10.8) return false;
  if (Math.hypot(x - SHIP.x, z - SHIP.z) < 8.2) return false;
  if (Math.hypot(x - RESUPPLY.x, z - RESUPPLY.z) < 7) return false;
  return !placed.some((p) => Math.hypot(p.x - x, p.z - z) < 4);
}

function scatter(n: number, kind: YardNode["kind"], seed: number, near?: { x: number; z: number; r: number }): YardNode[] {
  const out: YardNode[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  let tries = 0;
  const inner = kind === "ice" ? 12 : kind === "basalt" ? 10 : 15;
  const outer = WALK_R - 1.8;
  while (out.length < n && tries < n * 50) {
    tries += 1;
    let x: number;
    let z: number;
    if (near) {
      const a = rand() * Math.PI * 2;
      const r = 2 + rand() * near.r;
      x = near.x + Math.cos(a) * r;
      z = near.z + Math.sin(a) * r;
    } else {
      const a = rand() * Math.PI * 2;
      const r = inner + rand() * (outer - inner);
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    }
    if (Math.hypot(x - SHIP.x, z - SHIP.z) < 9) continue;
    if (Math.hypot(x, z) < 11) continue;
    if (Math.hypot(x - PACK_SPAWN.x, z - PACK_SPAWN.z) < 3.2) continue;
    if (Math.hypot(x - KILO_SPAWN.x, z - KILO_SPAWN.z) < 3.2) continue;
    if (Math.hypot(x - RESUPPLY.x, z - RESUPPLY.z) < 6 && !near) continue;
    if (out.some((p) => Math.hypot(p.x - x, p.z - z) < 2.1)) continue;
    if (!inWalk(x, z)) continue;
    out.push({ id: `${kind}-${seed}-${out.length}`, kind, x, z, taken: false });
  }
  return out;
}

function nearestNode(nodes: YardNode[], kind: YardNode["kind"], x: number, z: number, claimed?: Set<string | null>) {
  let best: YardNode | null = null;
  let d0 = Infinity;
  for (const n of nodes) {
    if (n.taken || n.kind !== kind) continue;
    if (claimed?.has(n.id)) continue;
    const d = Math.hypot(n.x - x, n.z - z);
    if (d < d0) {
      d0 = d;
      best = n;
    }
  }
  return best;
}

const RAMP = [
  { x: 14.2, z: 4.2 },
  { x: 12.4, z: 3.4 },
  { x: 10.2, z: 2.6 },
];
const MUSTER = [
  { x: 11.2, z: 9.4 },
  { x: 8.1, z: 5.4 },
  { x: 12.6, z: 0.4 },
];
const WAVE2 = [
  { x: RESUPPLY.x + 3, z: RESUPPLY.z + 2 },
  { x: RESUPPLY.x + 1.2, z: RESUPPLY.z - 2.4 },
  { x: RESUPPLY.x - 2.2, z: RESUPPLY.z + 0.6 },
];

let partSeq = 1;
let nodeSeq = 1;
let cropSeq = 1;
let botSeq = 3;

function bootBots(wave: { x: number; z: number }[], names: string[], job: JobKind): YardBot[] {
  return names.map((name, i) => ({
    id: `b${botSeq++}`,
    name,
    x: wave[i]!.x,
    z: wave[i]!.z,
    heading: Math.PI * 1.15,
    charge: 100,
    carrying: null,
    job,
    loop: null,
    targetId: null,
    tx: wave[i]!.x,
    tz: wave[i]!.z,
  }));
}

function freshNodes(iceN: number) {
  nodeSeq += 1;
  return [
    ...scatter(METEORITE_N, "meteorite", 17 + nodeSeq),
    ...scatter(Math.min(3, iceN), "ice", 91 + nodeSeq, { x: FROST.x, z: FROST.z, r: 4.4 }),
    ...scatter(Math.max(0, iceN - 3), "ice", 140 + nodeSeq),
    ...scatter(BASALT_N, "basalt", 220 + nodeSeq),
  ];
}

function hasKind(placed: PlacedPart[], kind: PlaceableId) {
  return placed.some((p) => p.kind === kind);
}

export function catalogItem(id: CraftId) {
  return CATALOG.find((c) => c.id === id);
}

export function solsUntilResupply(sol: number) {
  return Math.max(0, SOLS_MONTH - (sol % SOLS_MONTH));
}

export function fmtSols(n: number) {
  if (n < 0.04) return "now";
  if (n < 1) return `${Math.max(1, Math.round(n * 24))} h`;
  return `${n.toFixed(n >= 10 ? 0 : 1)} sol`;
}

function mark(list: Quest[], id: QuestId): Quest[] {
  return list.map((q) => (q.id === id ? { ...q, status: "done" as const } : q));
}

function unlockNext(list: Quest[]): Quest[] {
  const order: QuestId[] = ["wake", "ice", "power", "kilopower", "metal", "print", "shield", "crew"];
  const next = list.map((q) => ({ ...q }));
  let changed = false;
  for (const id of order) {
    const q = next.find((x) => x.id === id);
    if (!q) continue;
    if (q.status === "active") break;
    if (q.status === "done") continue;
    q.status = "active";
    changed = true;
    break;
  }
  return changed ? next : list;
}

function initial() {
  return {
    started: false,
    ready: false,
    dead: false,
    death: null as DeathCause,
    site: null as ColonySite | null,
    monthsLived: 0,
    calendarSol: 0.08,
    bots: [] as YardBot[],
    nodes: [] as YardNode[],
    metal: 0,
    ice: 0,
    air: 86,
    regolith: 0,
    reserve: 100,
    pack: 38,
    packX: PACK_SPAWN.x,
    packZ: PACK_SPAWN.z,
    packAtDome: false,
    kiloX: KILO_SPAWN.x,
    kiloZ: KILO_SPAWN.z,
    kiloSeated: false,
    kiloOn: false,
    brownout: false,
    storming: false,
    stormUntil: 0,
    nextStorm: 1.8 + Math.random() * 2.4,
    printed: [] as CraftId[],
    placed: [] as PlacedPart[],
    placing: null as PlaceableId | null,
    crafting: null as CraftJob | null,
    resupply: null as ResupplyShip | null,
    extraCrewLanded: false,
    seeds: firstSeeds(),
    crops: [] as Crop[],
    humans: [] as Human[],
    dryAcc: 0,
    quests: quests(),
    sel: { kind: "none" } as Sel,
    panel: "none" as Panel,
    notice: null as string | null,
  };
}

export const useYard = create<YardState>((set, get) => ({
  ...initial(),

  init: (site) => {
    botSeq = 0;
    set({
      ...initial(),
      site,
      started: true,
      ready: true,
      bots: bootBots(RAMP, ["Optimus-1", "Optimus-2", "Optimus-3"], "disembark").map((b, i) => ({
        ...b,
        tx: MUSTER[i]!.x,
        tz: MUSTER[i]!.z,
      })),
      nodes: freshNodes(iceCountFor(site)),
      notice: `${site.name}. Kilopower on the south pad. Local basalt is shielding, not iron. Cargo in 28 sols.`,
    });
  },
  start: () => get().init(get().site ?? DEFAULT_SITE),
  restart: () => get().init(get().site ?? DEFAULT_SITE),

  select: (sel) => {
    if (get().placing || get().dead) return;
    const panel: Panel = sel.kind === "dome" ? "dome" : sel.kind === "ship" ? "ship" : sel.kind === "none" ? "none" : get().panel;
    set({ sel, panel });
  },
  openPanel: (panel) => set({ panel, sel: panel === "none" ? { kind: "none" } : get().sel }),

  assignBot: (botId, job, targetId, tx, tz) => {
    const { bots, nodes, dead } = get();
    if (dead) return;
    const self = bots.find((b) => b.id === botId);
    if (!self || (self.charge < 4 && job !== "charge" && job !== "idle")) return;
    set({
      bots: bots.map((b) => {
        if (b.id !== botId) return b;
        let loop: LoopKind = null;
        let tid = targetId ?? null;
        let ntx = tx ?? b.tx;
        let ntz = tz ?? b.tz;
        const kind: YardNode["kind"] | null = job === "sweep" ? "meteorite" : job === "haulIce" ? "ice" : job === "haulBasalt" ? "basalt" : null;
        if (kind) {
          loop = kind === "meteorite" ? "metal" : kind === "ice" ? "ice" : "basalt";
          const n = tid ? nodes.find((x) => x.id === tid) : nearestNode(nodes, kind, b.x, b.z);
          if (n && !n.taken) {
            tid = n.id;
            ntx = n.x;
            ntz = n.z;
          }
        }
        return { ...b, job, loop, targetId: tid, tx: ntx, tz: ntz };
      }),
      notice:
        job === "haulBasalt"
          ? "Quarry assigned. Basalt sinters into shielding. Humans need a berm."
          : job === "sweep"
            ? "Sweeper assigned."
            : job === "haulIce"
              ? "Ice haul assigned."
              : get().notice,
    });
  },

  tickTime: (dt) => {
    const s = get();
    if (!s.ready || s.dead) return;
    const prev = s.calendarSol;
    const calendarSol = prev + dt / SOL_SEC;
    const prevMonth = Math.floor(prev / SOLS_MONTH);
    const month = Math.floor(calendarSol / SOLS_MONTH);
    const solFrac = dt / SOL_SEC;
    let ice = s.ice;
    let air = s.air;
    let metal = s.metal;
    let pack = s.pack;
    let notice = s.notice;
    let dead = false;
    let death: DeathCause = s.death;
    let crafting = s.crafting;
    let placing = s.placing;
    let printed = s.printed;
    let resupply = s.resupply;
    let monthsLived = s.monthsLived;
    let humans = s.humans;
    let extraCrewLanded = s.extraCrewLanded;
    let bots = s.bots;
    let storming = s.storming;
    let stormUntil = s.stormUntil;
    let nextStorm = s.nextStorm;
    let dryAcc = s.dryAcc;
    const crops = s.crops.map((c) => ({ ...c }));
    const green = s.placed.filter((p) => p.kind === "greenhouse").length;
    const crewOn = humans.length > 0;

    if (!storming && calendarSol >= nextStorm) {
      storming = true;
      stormUntil = calendarSol + 1.4 + Math.random() * 1.2;
      notice = "Dust storm. Charge will bleed. Solar is blind. Get the bots to the pad.";
    }
    if (storming && calendarSol >= stormUntil) {
      storming = false;
      nextStorm = calendarSol + 7 + Math.random() * 9;
      notice = "Storm passed. Arrays will see the sun again.";
    }

    if (ice > 0) {
      ice = Math.max(0, ice - (ICE_PER_SOL + crops.filter((c) => c.t < 1).length * 0.05) * solFrac);
      air = Math.min(100, air + (AIR_WET + green * 0.5) * solFrac);
      for (const c of crops) {
        const dur = SEEDS.find((x) => x.id === c.kind)?.growSols ?? 8;
        c.t = Math.min(1, c.t + solFrac / dur);
      }
    } else if (crewOn) {
      air = Math.max(0, air - AIR_DRY * solFrac);
    }

    if (crafting) {
      const t = crafting.t + solFrac;
      if (t >= crafting.dur) {
        const def = CATALOG.find((c) => c.id === crafting!.id);
        if (def && !def.placeable) {
          printed = printed.includes(crafting.id) ? printed : [...printed, crafting.id];
          notice = `${def.name} printed.`;
        } else if (def) {
          placing = crafting.id as PlaceableId;
          notice = `${def.name} out of the printer. Click the yard.`;
        }
        crafting = null;
      } else crafting = { ...crafting, t };
    }

    if (month > prevMonth && !resupply) {
      resupply = { x: RESUPPLY.x, y: 78, z: RESUPPLY.z, phase: "down", parkedAt: calendarSol };
      notice = `Cargo Starship on approach. Month ${month + 1}.`;
    }
    if (resupply) {
      const r = { ...resupply };
      if (r.phase === "down") {
        r.y = Math.max(0, r.y - 22 * dt);
        if (r.y <= 0.05) {
          r.y = 0;
          r.phase = "parked";
          r.parkedAt = calendarSol;
          metal = Math.min(METAL_CAP, metal + 8);
          air = Math.min(100, air + 24);
          monthsLived = month;
          const notes = ["Metal and air into inventory."];
          if (!extraCrewLanded) {
            extraCrewLanded = true;
            bots = [
              ...bots,
              ...bootBots(WAVE2, ["Optimus-4", "Optimus-5", "Optimus-6"], "disembark").map((b, i) => ({
                ...b,
                tx: WAVE2[i]!.x - 4,
                tz: WAVE2[i]!.z - 3,
              })),
            ];
            notes.push("Three more Optimus on the pad.");
          }
          notice = notes.join(" ");
        }
        resupply = r;
      } else if (r.phase === "parked" && calendarSol - r.parkedAt > 1.6) resupply = { ...r, phase: "up" };
      else if (r.phase === "up") {
        r.y += 26 * dt;
        resupply = r.y > 92 ? null : r;
      }
    }

    const phase = calendarSol % 1;
    const night = phase < 0.22 || phase > 0.78;
    const solar = hasKind(s.placed, "solar") && !night && !storming;
    const power = s.packAtDome ? pack : s.reserve;
    const gen = s.kiloOn || solar;
    const botsDry = bots.length > 0 && bots.every((b) => b.charge <= 0.8);
    if (power < 0.6 && !gen && botsDry) {
      dryAcc += solFrac;
      if (dryAcc > 0.35) {
        dead = true;
        death = "power";
        notice = "The bots went dry.";
      }
    } else dryAcc = 0;
    if (crewOn && air <= 0.05) {
      dead = true;
      death = "air";
      air = 0;
    }

    set({
      calendarSol,
      ice,
      air,
      metal,
      pack,
      notice,
      dead,
      death,
      crafting,
      placing,
      printed,
      resupply,
      monthsLived,
      humans,
      extraCrewLanded,
      bots,
      storming,
      stormUntil,
      nextStorm,
      crops,
      dryAcc,
    });
  },

  tickBots: (dt) => {
    const s = get();
    if (!s.ready || s.dead) return;
    let metal = s.metal;
    let ice = s.ice;
    let regolith = s.regolith;
    let packX = s.packX;
    let packZ = s.packZ;
    let packAtDome = s.packAtDome;
    let kiloX = s.kiloX;
    let kiloZ = s.kiloZ;
    let kiloSeated = s.kiloSeated;
    let kiloOn = s.kiloOn;
    let notice = s.notice;
    let quests = s.quests;
    const nodes = s.nodes.map((n) => ({ ...n }));
    const bots = s.bots.map((b) => ({ ...b }));
    const phase = s.calendarSol % 1;
    const night = phase < 0.22 || phase > 0.78;
    const solar = hasKind(s.placed, "solar") && !night && !s.storming;
    const padPower = (s.packAtDome ? s.pack : s.reserve) > 1 || s.kiloOn || solar;
    const drain = 0.45 * (s.storming ? 3.4 : 1);

    const claimed = (loop: LoopKind) =>
      new Set(bots.filter((o) => o.loop === loop && !o.carrying && (o.job === "sweep" || o.job === "haulIce" || o.job === "haulBasalt")).map((o) => o.targetId));

    const resume = (b: YardBot) => {
      const kind: YardNode["kind"] = b.loop === "ice" ? "ice" : b.loop === "basalt" ? "basalt" : "meteorite";
      const n = nearestNode(nodes, kind, b.x, b.z, claimed(b.loop)) ?? nearestNode(nodes, kind, b.x, b.z);
      if (!n) {
        b.job = "idle";
        b.loop = null;
        return;
      }
      b.job = kind === "ice" ? "haulIce" : kind === "basalt" ? "haulBasalt" : "sweep";
      b.targetId = n.id;
      b.tx = n.x;
      b.tz = n.z;
    };

    const dropAt = (b: YardBot) => {
      if (b.carrying === "metal") metal = Math.min(METAL_CAP, metal + 1);
      if (b.carrying === "ice") ice = Math.min(ICE_CAP, ice + 1);
      if (b.carrying === "basalt") {
        regolith = Math.min(REG_CAP, regolith + 1);
        notice = `Basalt in the hopper. ${regolith} regolith. Berms need 6.`;
      }
      if (b.carrying === "pack") {
        packAtDome = true;
        packX = PACK_SLOT.x;
        packZ = PACK_SLOT.z;
        notice = "Megapack married to the dome.";
      }
      if (b.carrying === "kilo") {
        kiloSeated = true;
        kiloX = KILO_PIT.x;
        kiloZ = KILO_PIT.z;
        notice = "Kilopower in the pit. Install it.";
      }
      b.carrying = null;
      if (b.loop) resume(b);
      else b.job = "idle";
    };

    for (const b of bots) {
      if (b.job === "idle") {
        if (b.charge < 28 && padPower) {
          b.job = "charge";
          b.tx = CHARGE_PAD.x;
          b.tz = CHARGE_PAD.z;
        }
        continue;
      }
      if (b.job !== "charge" && b.job !== "install" && b.job !== "disembark") b.charge = Math.max(0, b.charge - dt * drain);
      if (b.charge <= 0 && b.job !== "charge") {
        b.job = "idle";
        notice = `${b.name} is dark.`;
        continue;
      }
      if (b.charge < 22 && b.job !== "charge" && b.job !== "install" && b.job !== "disembark" && padPower) {
        if (b.job === "sweep") b.loop = "metal";
        if (b.job === "haulIce") b.loop = "ice";
        if (b.job === "haulBasalt") b.loop = "basalt";
        b.job = "charge";
        b.tx = CHARGE_PAD.x;
        b.tz = CHARGE_PAD.z;
      }

      const looping = b.job === "sweep" || b.job === "haulIce" || b.job === "haulBasalt";
      const kind: YardNode["kind"] = b.job === "haulIce" || b.loop === "ice" ? "ice" : b.job === "haulBasalt" || b.loop === "basalt" ? "basalt" : "meteorite";
      if (looping && !b.carrying) {
        const node = b.targetId ? nodes.find((n) => n.id === b.targetId) : null;
        if (!node || node.taken) {
          const pick = nearestNode(nodes, kind, b.x, b.z, claimed(b.loop)) ?? nearestNode(nodes, kind, b.x, b.z);
          if (!pick) {
            b.job = "idle";
            b.loop = null;
            continue;
          }
          b.targetId = pick.id;
          b.tx = pick.x;
          b.tz = pick.z;
        } else {
          b.tx = node.x;
          b.tz = node.z;
        }
      }

      const carryHome =
        looping && (b.carrying === "metal" || b.carrying === "ice" || b.carrying === "basalt")
          ? b.carrying === "ice"
            ? STILL
            : DOME
          : b.job === "haulPack" && b.carrying === "pack"
            ? PACK_SLOT
            : b.job === "haulKilo" && b.carrying === "kilo"
              ? KILO_PIT
              : { x: b.tx, z: b.tz };
      const dx = (b.carrying === "metal" || b.carrying === "basalt" ? carryHome.x + 3.4 : carryHome.x) - b.x;
      const dz = carryHome.z - b.z;
      const dist = Math.hypot(dx, dz) || 0.0001;
      b.heading = Math.atan2(dx, dz);
      if (dist > 0.55) {
        const step = 3.4 * dt * (s.storming ? 0.7 : 1);
        const nx = b.x + (dx / dist) * Math.min(step, dist);
        const nz = b.z + (dz / dist) * Math.min(step, dist);
        if (Math.hypot(nx, nz) > WALK_R + 0.4) {
          b.job = "idle";
          continue;
        }
        b.x = nx;
        b.z = nz;
        if (b.carrying === "pack") {
          packX = b.x;
          packZ = b.z - 0.8;
        }
        if (b.carrying === "kilo") {
          kiloX = b.x;
          kiloZ = b.z - 0.8;
        }
        continue;
      }
      if (b.job === "disembark") {
        b.job = "idle";
        continue;
      }
      if (b.job === "charge") {
        if (!padPower) {
          if (b.loop) resume(b);
          else b.job = "idle";
          continue;
        }
        b.charge = Math.min(100, b.charge + dt * 22);
        if (b.charge >= 99) {
          if (b.loop) resume(b);
          else b.job = "idle";
        }
        continue;
      }
      if (looping && b.carrying) {
        dropAt(b);
        continue;
      }
      if (looping) {
        const node = nodes.find((n) => n.id === b.targetId);
        if (!node || node.taken) {
          resume(b);
          continue;
        }
        node.taken = true;
        b.carrying = node.kind === "ice" ? "ice" : node.kind === "basalt" ? "basalt" : "metal";
        continue;
      }
      if (b.job === "haulPack") {
        if (b.carrying !== "pack" && !packAtDome) b.carrying = "pack";
        else dropAt(b);
        continue;
      }
      if (b.job === "haulKilo") {
        if (b.carrying !== "kilo" && !kiloSeated) b.carrying = "kilo";
        else dropAt(b);
        continue;
      }
      if (b.job === "install") {
        kiloSeated = true;
        kiloOn = true;
        b.job = "idle";
        notice = "Kilopower online. Night is survivable.";
      }
    }

    if (bots.every((b) => b.job !== "disembark")) quests = mark(quests, "wake");
    if (ice >= 2) quests = mark(quests, "ice");
    if (packAtDome) quests = mark(quests, "power");
    if (kiloOn) quests = mark(quests, "kilopower");
    if (metal >= 4) quests = mark(quests, "metal");
    if (s.printed.includes("actuator")) quests = mark(quests, "print");
    if (hasKind(s.placed, "berm")) quests = mark(quests, "shield");
    if (s.humans.length) quests = mark(quests, "crew");
    quests = unlockNext(quests);

    set({ bots, nodes, metal, ice, regolith, packX, packZ, packAtDome, kiloX, kiloZ, kiloSeated, kiloOn, quests, notice });
  },

  tickPower: (dt) => {
    const s = get();
    if (!s.ready || s.dead) return;
    const phase = s.calendarSol % 1;
    const night = phase < 0.22 || phase > 0.78;
    const working = s.bots.filter((b) => b.job !== "idle" && b.job !== "charge").length;
    const solar = hasKind(s.placed, "solar") && !night && !s.storming;
    const drain = (0.1 + working * 0.025 + (night ? 0.14 : 0.04) + (s.storming ? 0.12 : 0)) * dt;
    const gen = (s.kiloOn ? (night ? 0.62 : 0.78) : 0) * dt + (solar ? 0.42 * dt : 0);
    let reserve = s.reserve;
    let pack = s.pack;
    let brownout = s.brownout;
    if (s.packAtDome) {
      pack = Math.max(0, Math.min(100, pack + gen - drain));
      brownout = pack <= 0.2 && !s.kiloOn && !solar;
      if (pack > 8) brownout = false;
    } else {
      reserve = Math.max(0, reserve - drain);
      brownout = reserve <= 0.2;
      if (reserve > 8) brownout = false;
    }
    set({ reserve, pack, brownout });
  },

  craft: (id) => {
    const s = get();
    const def = CATALOG.find((c) => c.id === id);
    if (!def || s.dead || s.crafting || s.placing) return;
    if (s.printed.includes(id)) return;
    if (s.metal < def.cost || s.regolith < def.costReg) return;
    set({
      metal: s.metal - def.cost,
      regolith: s.regolith - def.costReg,
      crafting: { id, t: 0, dur: def.printSols },
      panel: "none",
      notice: `Printing ${def.name.toLowerCase()}. ${fmtSols(def.printSols)}.`,
    });
  },
  cancelCraft: () => {
    const s = get();
    if (!s.crafting) return;
    const def = CATALOG.find((c) => c.id === s.crafting!.id);
    set({
      crafting: null,
      metal: s.metal + (def?.cost ?? 0),
      regolith: s.regolith + (def?.costReg ?? 0),
      notice: "Print aborted.",
    });
  },
  confirmPlace: (x, z) => {
    const s = get();
    if (!s.placing) return;
    if (!siteLegal(x, z, s.placed) && s.placing !== "berm") {
      set({ notice: "Not there." });
      return;
    }
    if (s.placing === "berm" && Math.hypot(x, z) > 14) {
      set({ notice: "Berm wants to hug the dome." });
      return;
    }
    const def = CATALOG.find((c) => c.id === s.placing);
    const part: PlacedPart = { id: `p${partSeq++}`, kind: s.placing, x, z, dist: Math.hypot(x, z) };
    set({
      placed: [...s.placed, part],
      printed: s.printed.includes(s.placing) ? s.printed : [...s.printed, s.placing],
      placing: null,
      notice: s.placing === "berm" ? "Radiation berm seated. The capitol can take a crew." : `${def?.name} seated.`,
    });
  },
  cancelPlace: () => {
    const s = get();
    if (!s.placing) return;
    const def = CATALOG.find((c) => c.id === s.placing);
    set({
      placing: null,
      metal: s.metal + (def?.cost ?? 0),
      regolith: s.regolith + (def?.costReg ?? 0),
    });
  },
  plant: (kind) => {
    const s = get();
    if (!hasKind(s.placed, "greenhouse") || s.seeds[kind] < 1 || s.crops.length >= BEDS) return;
    set({
      seeds: { ...s.seeds, [kind]: s.seeds[kind] - 1 },
      crops: [...s.crops, { id: `c${cropSeq++}`, kind, t: 0 }],
      notice: "Seed in the bed. Needs ice water.",
    });
  },
  orderCargo: () => {
    const s = get();
    if (s.dead || s.resupply || !hasRelay(s.placed)) return;
    set({
      resupply: { x: RESUPPLY.x, y: 78, z: RESUPPLY.z, phase: "down", parkedAt: s.calendarSol },
      notice: s.extraCrewLanded
        ? "Cargo on approach. Metal and air."
        : "Second Superheavy on approach. Three more Optimus on the pad.",
    });
  },
  landCrew: () => {
    const s = get();
    if (!crewReadyOf(s)) return;
    set({
      humans: FIRST_CREW,
      notice: "Biologist, geologist, astrophysicist on the pad. Keep the air and the kilowatts.",
    });
  },
}));

export function hasRelay(placed: PlacedPart[]) {
  return placed.some((p) => p.kind === "mast");
}
export function hasGreenhouse(placed: PlacedPart[]) {
  return placed.some((p) => p.kind === "greenhouse");
}
export function hasBerm(placed: PlacedPart[]) {
  return placed.some((p) => p.kind === "berm");
}
export function crewReadyOf(s: { placed: PlacedPart[]; crops: Crop[]; air: number; kiloOn: boolean; packAtDome: boolean; pack: number; humans: Human[] }) {
  if (s.humans.length) return false;
  if (!hasBerm(s.placed) || !hasGreenhouse(s.placed)) return false;
  if (!s.crops.some((c) => c.t >= 0.12)) return false;
  if (s.air < 40) return false;
  return s.kiloOn || (s.packAtDome && s.pack > 25);
}

void BERM_SLOT;

if (typeof window !== "undefined") {
  (window as unknown as { __yard?: typeof useYard }).__yard = useYard;
}
