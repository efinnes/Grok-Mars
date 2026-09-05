export type Carry = "metal" | "ice" | "pack" | "kilo" | "basalt" | null;
export type LoopKind = "metal" | "ice" | "basalt" | null;
export type JobKind =
  | "idle"
  | "disembark"
  | "sweep"
  | "haulIce"
  | "haulBasalt"
  | "deliver"
  | "haulPack"
  | "haulKilo"
  | "install"
  | "charge";

export type YardNodeKind = "meteorite" | "ice" | "basalt";

export type YardNode = {
  id: string;
  kind: YardNodeKind;
  x: number;
  z: number;
  taken: boolean;
};

export type YardBot = {
  id: string;
  name: string;
  x: number;
  z: number;
  heading: number;
  charge: number;
  carrying: Carry;
  job: JobKind;
  loop: LoopKind;
  targetId: string | null;
  tx: number;
  tz: number;
};

export type QuestId = "wake" | "ice" | "power" | "metal" | "kilopower" | "print" | "shield" | "crew";
export type QuestStatus = "locked" | "active" | "done";
export type Quest = { id: QuestId; title: string; detail: string; status: QuestStatus };

export type CraftId = "actuator" | "pylon" | "mast" | "solar" | "radiator" | "greenhouse" | "berm";
export type PlaceableId = Exclude<CraftId, "actuator">;
export type CraftDef = {
  id: CraftId;
  name: string;
  detail: string;
  cost: number;
  costReg: number;
  placeable: boolean;
  hint: string;
  printSols: number;
};
export type PlacedPart = { id: string; kind: PlaceableId; x: number; z: number; dist: number };
export type CraftJob = { id: CraftId; t: number; dur: number };
export type ResupplyShip = { x: number; y: number; z: number; phase: "down" | "parked" | "up"; parkedAt: number };
export type SeedId = "tomato" | "potato" | "lettuce" | "strawberry";
export type SeedStock = Record<SeedId, number>;
export type Crop = { id: string; kind: SeedId; t: number };
export type Human = { id: string; name: string; role: string };
export type DeathCause = "power" | "air" | null;

export const CATALOG: CraftDef[] = [
  { id: "actuator", name: "Actuator", detail: "First printed joint.", cost: 3, costReg: 0, placeable: false, hint: "A tool.", printSols: 0.4 },
  { id: "pylon", name: "Charge pylon", detail: "Remote battery post.", cost: 2, costReg: 0, placeable: true, hint: "Extends the leash.", printSols: 0.55 },
  { id: "mast", name: "Comms mast", detail: "Relay to orbit. Unlocks cargo orders.", cost: 2, costReg: 0, placeable: true, hint: "High and clear.", printSols: 0.75 },
  { id: "solar", name: "Solar array", detail: "Daylight only. Dust kills it.", cost: 3, costReg: 0, placeable: true, hint: "Out of shadow.", printSols: 1 },
  { id: "radiator", name: "Radiator farm", detail: "Heat dump.", cost: 3, costReg: 0, placeable: true, hint: "Away from the dome.", printSols: 1.25 },
  { id: "greenhouse", name: "Greenhouse", detail: "Plant first-ship seeds here.", cost: 4, costReg: 0, placeable: true, hint: "Near the dome.", printSols: 2 },
  { id: "berm", name: "Radiation berm", detail: "Regolith piled around the capitol. Humans will not land without it.", cost: 0, costReg: 6, placeable: true, hint: "Close to the dome. Shielding, not a wall.", printSols: 0.8 },
];

export const SEEDS: { id: SeedId; name: string; growSols: number; first: number }[] = [
  { id: "lettuce", name: "Lettuce", growSols: 4, first: 4 },
  { id: "tomato", name: "Tomato", growSols: 8, first: 3 },
  { id: "potato", name: "Potato", growSols: 10, first: 3 },
  { id: "strawberry", name: "Strawberry", growSols: 12, first: 2 },
];

export const FIRST_CREW: Human[] = [
  { id: "bio", name: "Mara Chen", role: "Biologist" },
  { id: "geo", name: "Elias Voss", role: "Geologist" },
  { id: "astro", name: "Anika Rao", role: "Astrophysicist" },
];

export const WALK_R = 30;
export const DOME = { x: 0, z: 0 };
export const SHIP = { x: 20.5, z: 6 };
export const PACK_SLOT = { x: 5.4, z: 1.2 };
export const PACK_SPAWN = { x: 12.2, z: 13.6 };
export const KILO_PIT = { x: -11, z: -9 };
export const KILO_SPAWN = { x: 13.8, z: -8.4 };
export const CHARGE_PAD = { x: 3.2, z: 3.6 };
export const STILL = { x: 4.6, z: -2.2 };
export const RESUPPLY = { x: -17.5, z: 13.5 };
export const FROST = { x: 11.2, z: -12.4 };
export const BERM_SLOT = { x: -6.5, z: 4.2 };

export const METEORITE_N = 18;
export const BASALT_N = 14;
export const METAL_CAP = 40;
export const ICE_N = 8;
export const ICE_CAP = 20;
export const REG_CAP = 24;
export const BEDS = 6;
export const SOL_SEC = 16;
export const SOLS_MONTH = 28;
export const ICE_PER_SOL = 0.28;
export const AIR_DRY = 7.2;
export const AIR_WET = 1.6;
