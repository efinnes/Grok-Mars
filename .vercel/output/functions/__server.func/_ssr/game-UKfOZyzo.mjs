import { i as __toESM } from "../_runtime.mjs";
import { a as useFrame, d as require_react, i as Canvas, n as OrbitControls, o as useLoader, r as useGLTF, s as useThree, t as Stars, u as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { B as MathUtils, K as MeshStandardMaterial, Q as Object3D, St as TextureLoader, Tt as Vector3, c as BufferAttribute, f as Color, ft as SRGBColorSpace, h as Euler, l as BufferGeometry, n as VRMUtils, t as VRMLoaderPlugin } from "../_libs/pixiv__three-vrm+three.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as OBJLoader, t as GLTFLoader } from "../_libs/three.mjs";
import { a as Droplets, c as Battery, i as Mountain, o as Box, r as Timer, s as Bot, t as Wind } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/game-UKfOZyzo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATALOG = [
	{
		id: "actuator",
		name: "Actuator",
		detail: "First printed joint.",
		cost: 3,
		costReg: 0,
		placeable: false,
		hint: "A tool.",
		printSols: .4
	},
	{
		id: "pylon",
		name: "Charge pylon",
		detail: "Remote battery post.",
		cost: 2,
		costReg: 0,
		placeable: true,
		hint: "Extends the leash.",
		printSols: .55
	},
	{
		id: "mast",
		name: "Comms mast",
		detail: "Relay to orbit. Unlocks cargo orders.",
		cost: 2,
		costReg: 0,
		placeable: true,
		hint: "High and clear.",
		printSols: .75
	},
	{
		id: "solar",
		name: "Solar array",
		detail: "Daylight only. Dust kills it.",
		cost: 3,
		costReg: 0,
		placeable: true,
		hint: "Out of shadow.",
		printSols: 1
	},
	{
		id: "radiator",
		name: "Radiator farm",
		detail: "Heat dump.",
		cost: 3,
		costReg: 0,
		placeable: true,
		hint: "Away from the dome.",
		printSols: 1.25
	},
	{
		id: "greenhouse",
		name: "Greenhouse",
		detail: "Plant first-ship seeds here.",
		cost: 4,
		costReg: 0,
		placeable: true,
		hint: "Near the dome.",
		printSols: 2
	},
	{
		id: "berm",
		name: "Radiation berm",
		detail: "Regolith piled around the capitol. Humans will not land without it.",
		cost: 0,
		costReg: 6,
		placeable: true,
		hint: "Close to the dome. Shielding, not a wall.",
		printSols: .8
	}
];
var SEEDS = [
	{
		id: "lettuce",
		name: "Lettuce",
		growSols: 4,
		first: 4
	},
	{
		id: "tomato",
		name: "Tomato",
		growSols: 8,
		first: 3
	},
	{
		id: "potato",
		name: "Potato",
		growSols: 10,
		first: 3
	},
	{
		id: "strawberry",
		name: "Strawberry",
		growSols: 12,
		first: 2
	}
];
var FIRST_CREW = [
	{
		id: "bio",
		name: "Mara Chen",
		role: "Biologist"
	},
	{
		id: "geo",
		name: "Elias Voss",
		role: "Geologist"
	},
	{
		id: "astro",
		name: "Anika Rao",
		role: "Astrophysicist"
	}
];
var DOME = {
	x: 0,
	z: 0
};
var SHIP = {
	x: 20.5,
	z: 6
};
var PACK_SLOT = {
	x: 5.4,
	z: 1.2
};
var PACK_SPAWN = {
	x: 12.2,
	z: 13.6
};
var KILO_PIT = {
	x: -11,
	z: -9
};
var KILO_SPAWN = {
	x: 13.8,
	z: -8.4
};
var CHARGE_PAD = {
	x: 3.2,
	z: 3.6
};
var STILL = {
	x: 4.6,
	z: -2.2
};
var RESUPPLY = {
	x: -17.5,
	z: 13.5
};
var FROST = {
	x: 11.2,
	z: -12.4
};
var ICE_PER_SOL = .28;
var AIR_DRY = 7.2;
var AIR_WET = 1.6;
var GLB = {
	starship: "/models/starship.glb",
	dome: "/models/dome.glb",
	robot: "/models/robot.glb",
	megapack: "/models/megapack.glb",
	kilopower: "/models/kilopower.glb",
	pylon: "/models/pylon.glb",
	greenhouse: "/models/greenhouse.glb"
};
function cloneGltf(scene) {
	const cloned = scene.clone(true);
	cloned.traverse((o) => {
		const m = o;
		if (!m.isMesh) return;
		m.castShadow = true;
		m.receiveShadow = true;
	});
	return cloned;
}
function GltfAsset({ url, scale = 1 }) {
	const { scene } = useGLTF(url);
	const model = (0, import_react.useMemo)(() => cloneGltf(scene), [scene]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", {
		object: model,
		scale,
		dispose: null
	});
}
function ObjAsset({ url, color = "#c5c8cc" }) {
	const obj = useLoader(OBJLoader, url);
	const model = (0, import_react.useMemo)(() => {
		const c = obj.clone(true);
		c.traverse((o) => {
			const m = o;
			if (!m.isMesh) return;
			m.castShadow = true;
			m.material = new MeshStandardMaterial({
				color,
				metalness: .55,
				roughness: .4
			});
		});
		return c;
	}, [obj, color]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", {
		object: model,
		dispose: null
	});
}
function Starship() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		position: [
			SHIP.x,
			0,
			SHIP.z
		],
		rotation: [
			0,
			Math.PI / 2,
			0
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, { url: GLB.starship })
	});
}
function CargoStarship({ x, y, z }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		position: [
			x,
			y,
			z
		],
		rotation: [
			0,
			-Math.PI / 4,
			0
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, { url: GLB.starship })
	});
}
function HabitatDome() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, { url: GLB.dome });
}
function OptimusBot() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, { url: GLB.robot });
}
function Megapack() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, { url: GLB.megapack });
}
function Kilopower() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, { url: GLB.kilopower });
}
function Meteorite() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		castShadow: true,
		rotation: [
			.3,
			.4,
			.1
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.5, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#4a3428",
			metalness: .8,
			roughness: .32
		})]
	});
}
function BasaltRock() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		castShadow: true,
		rotation: [
			.2,
			1.1,
			.4
		],
		scale: [
			1.15,
			.7,
			1.35
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dodecahedronGeometry", { args: [.62, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#3a332e",
			metalness: .08,
			roughness: .92
		})]
	});
}
function IceBlock() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.7,
			.5,
			.55
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#d8f0ff",
			roughness: .22,
			emissive: "#7ec8e8",
			emissiveIntensity: .3
		})]
	});
}
function IceStill({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.7,
			0
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.55,
			.7,
			1.4,
			10
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#2a3840",
			metalness: .6,
			roughness: .35
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			1.5,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			.28,
			12,
			10
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#7ec8e8",
			emissive: "#7ec8e8",
			emissiveIntensity: .2 + level * .05
		})]
	})] });
}
function BermPile() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: [
		0,
		1,
		2,
		3,
		4
	].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			Math.cos(i) * .6,
			.35,
			Math.sin(i) * .55
		],
		scale: [
			1.2,
			.55 + i * .08,
			1
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dodecahedronGeometry", { args: [.7, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#6a4a38",
			roughness: .95
		})]
	}, i)) });
}
function CraftModel({ kind }) {
	if (kind === "pylon") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, { url: GLB.pylon });
	if (kind === "greenhouse") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GltfAsset, {
		url: GLB.greenhouse,
		scale: .55
	});
	if (kind === "solar") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjAsset, {
		url: "/models/solar.obj",
		color: "#1a2740"
	});
	if (kind === "radiator") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjAsset, {
		url: "/models/radiator.obj",
		color: "#c88854"
	});
	if (kind === "mast") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjAsset, {
		url: "/models/mast.obj",
		color: "#9dba7a"
	});
	if (kind === "berm") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BermPile, {});
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
function iceCountFor(site) {
	return Math.max(4, Math.min(16, Math.round(site.ice)));
}
var SITES = [
	{
		id: "jezero",
		name: "Jezero Crater",
		lat: 18.4,
		lon: 77.5,
		ice: 6,
		risk: "contest",
		note: "Delta. Maps are good. Thin ice."
	},
	{
		id: "utopia",
		name: "Utopia Planitia",
		lat: 47,
		lon: 118,
		ice: 11,
		risk: "storms",
		note: "Ice plains. Honest water."
	},
	{
		id: "acidalia",
		name: "Acidalia Planitia",
		lat: 50,
		lon: -20,
		ice: 11,
		risk: "cold",
		note: "Ice without polar night."
	},
	{
		id: "hellas",
		name: "Hellas Basin",
		lat: -42,
		lon: 71,
		ice: 9,
		risk: "terrain",
		note: "Thickest air on the map."
	},
	{
		id: "olympus",
		name: "Olympus Mons",
		lat: 19,
		lon: -134,
		ice: 4,
		risk: "prestige",
		note: "Flag, not a well."
	},
	{
		id: "valles",
		name: "Valles Marineris",
		lat: -10,
		lon: -72,
		ice: 4,
		risk: "landing",
		note: "Shelter in the wound."
	},
	{
		id: "gale",
		name: "Gale Crater",
		lat: -5.4,
		lon: 137.8,
		ice: 4,
		risk: "dry",
		note: "Sun for arrays. Thin ice."
	},
	{
		id: "npole",
		name: "North Polar Cap",
		lat: 85,
		lon: 0,
		ice: 16,
		risk: "night",
		note: "The well. Polar night tax."
	},
	{
		id: "isidis",
		name: "Isidis Planitia",
		lat: 13,
		lon: 87,
		ice: 6,
		risk: "quiet",
		note: "Pad next to Jezero."
	},
	{
		id: "arabia",
		name: "Arabia Terra",
		lat: 21,
		lon: 6,
		ice: 6,
		risk: "import",
		note: "Clay, not a well."
	}
];
var DEFAULT_SITE = SITES[0];
function siteById(id) {
	return SITES.find((s) => s.id === id) ?? DEFAULT_SITE;
}
var placeCursor = {
	x: 12,
	z: 8,
	valid: false
};
function firstSeeds() {
	return {
		tomato: 3,
		potato: 3,
		lettuce: 4,
		strawberry: 2
	};
}
function quests() {
	return [
		{
			id: "wake",
			title: "Wake the three",
			detail: "Walk Optimus off the ramp.",
			status: "active"
		},
		{
			id: "ice",
			title: "Feed the still",
			detail: "Haul ice. Water for beds.",
			status: "locked"
		},
		{
			id: "power",
			title: "Marry the Megapack",
			detail: "Haul the battery to the dome.",
			status: "locked"
		},
		{
			id: "kilopower",
			title: "Seat Kilopower",
			detail: "Haul the reactor to the pit. Dust will eat solar.",
			status: "locked"
		},
		{
			id: "metal",
			title: "Sweep the ejecta",
			detail: "Iron meteorites for the printer.",
			status: "locked"
		},
		{
			id: "print",
			title: "Print the first tool",
			detail: "Open the dome shop.",
			status: "locked"
		},
		{
			id: "shield",
			title: "Berm the capitol",
			detail: "Quarry local basalt. Pile a radiation berm before humans.",
			status: "locked"
		},
		{
			id: "crew",
			title: "Bring the first three",
			detail: "Air, power, living beds, and a berm.",
			status: "locked"
		}
	];
}
function inWalk(x, z) {
	return Math.hypot(x - DOME.x, z - DOME.z) <= 30;
}
function siteLegal(x, z, placed) {
	if (!inWalk(x, z)) return false;
	if (Math.hypot(x, z) < 10.8) return false;
	if (Math.hypot(x - SHIP.x, z - SHIP.z) < 8.2) return false;
	if (Math.hypot(x - RESUPPLY.x, z - RESUPPLY.z) < 7) return false;
	return !placed.some((p) => Math.hypot(p.x - x, p.z - z) < 4);
}
function scatter(n, kind, seed, near) {
	const out = [];
	let s = seed;
	const rand = () => {
		s = s * 16807 % 2147483647;
		return (s - 1) / 2147483646;
	};
	let tries = 0;
	const inner = kind === "ice" ? 12 : kind === "basalt" ? 10 : 15;
	const outer = 28.2;
	while (out.length < n && tries < n * 50) {
		tries += 1;
		let x;
		let z;
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
		out.push({
			id: `${kind}-${seed}-${out.length}`,
			kind,
			x,
			z,
			taken: false
		});
	}
	return out;
}
function nearestNode(nodes, kind, x, z, claimed) {
	let best = null;
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
var RAMP = [
	{
		x: 14.2,
		z: 4.2
	},
	{
		x: 12.4,
		z: 3.4
	},
	{
		x: 10.2,
		z: 2.6
	}
];
var MUSTER = [
	{
		x: 11.2,
		z: 9.4
	},
	{
		x: 8.1,
		z: 5.4
	},
	{
		x: 12.6,
		z: .4
	}
];
var WAVE2 = [
	{
		x: RESUPPLY.x + 3,
		z: RESUPPLY.z + 2
	},
	{
		x: RESUPPLY.x + 1.2,
		z: RESUPPLY.z - 2.4
	},
	{
		x: RESUPPLY.x - 2.2,
		z: RESUPPLY.z + .6
	}
];
var partSeq = 1;
var nodeSeq = 1;
var cropSeq = 1;
var botSeq = 3;
function bootBots(wave, names, job) {
	return names.map((name, i) => ({
		id: `b${botSeq++}`,
		name,
		x: wave[i].x,
		z: wave[i].z,
		heading: Math.PI * 1.15,
		charge: 100,
		carrying: null,
		job,
		loop: null,
		targetId: null,
		tx: wave[i].x,
		tz: wave[i].z
	}));
}
function freshNodes(iceN) {
	nodeSeq += 1;
	return [
		...scatter(18, "meteorite", 17 + nodeSeq),
		...scatter(Math.min(3, iceN), "ice", 91 + nodeSeq, {
			x: FROST.x,
			z: FROST.z,
			r: 4.4
		}),
		...scatter(Math.max(0, iceN - 3), "ice", 140 + nodeSeq),
		...scatter(14, "basalt", 220 + nodeSeq)
	];
}
function hasKind(placed, kind) {
	return placed.some((p) => p.kind === kind);
}
function catalogItem(id) {
	return CATALOG.find((c) => c.id === id);
}
function solsUntilResupply(sol) {
	return Math.max(0, 28 - sol % 28);
}
function fmtSols(n) {
	if (n < .04) return "now";
	if (n < 1) return `${Math.max(1, Math.round(n * 24))} h`;
	return `${n.toFixed(n >= 10 ? 0 : 1)} sol`;
}
function mark(list, id) {
	return list.map((q) => q.id === id ? {
		...q,
		status: "done"
	} : q);
}
function unlockNext(list) {
	const order = [
		"wake",
		"ice",
		"power",
		"kilopower",
		"metal",
		"print",
		"shield",
		"crew"
	];
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
		death: null,
		site: null,
		monthsLived: 0,
		calendarSol: .08,
		bots: [],
		nodes: [],
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
		printed: [],
		placed: [],
		placing: null,
		crafting: null,
		resupply: null,
		extraCrewLanded: false,
		seeds: firstSeeds(),
		crops: [],
		humans: [],
		dryAcc: 0,
		quests: quests(),
		sel: { kind: "none" },
		panel: "none",
		notice: null
	};
}
var useYard = create((set, get) => ({
	...initial(),
	init: (site) => {
		botSeq = 0;
		set({
			...initial(),
			site,
			started: true,
			ready: true,
			bots: bootBots(RAMP, [
				"Optimus-1",
				"Optimus-2",
				"Optimus-3"
			], "disembark").map((b, i) => ({
				...b,
				tx: MUSTER[i].x,
				tz: MUSTER[i].z
			})),
			nodes: freshNodes(iceCountFor(site)),
			notice: `${site.name}. Kilopower on the south pad. Local basalt is shielding, not iron. Cargo in 28 sols.`
		});
	},
	start: () => get().init(get().site ?? DEFAULT_SITE),
	restart: () => get().init(get().site ?? DEFAULT_SITE),
	select: (sel) => {
		if (get().placing || get().dead) return;
		set({
			sel,
			panel: sel.kind === "dome" ? "dome" : sel.kind === "ship" ? "ship" : sel.kind === "none" ? "none" : get().panel
		});
	},
	openPanel: (panel) => set({
		panel,
		sel: panel === "none" ? { kind: "none" } : get().sel
	}),
	assignBot: (botId, job, targetId, tx, tz) => {
		const { bots, nodes, dead } = get();
		if (dead) return;
		const self = bots.find((b) => b.id === botId);
		if (!self || self.charge < 4 && job !== "charge" && job !== "idle") return;
		set({
			bots: bots.map((b) => {
				if (b.id !== botId) return b;
				let loop = null;
				let tid = targetId ?? null;
				let ntx = tx ?? b.tx;
				let ntz = tz ?? b.tz;
				const kind = job === "sweep" ? "meteorite" : job === "haulIce" ? "ice" : job === "haulBasalt" ? "basalt" : null;
				if (kind) {
					loop = kind === "meteorite" ? "metal" : kind === "ice" ? "ice" : "basalt";
					const n = tid ? nodes.find((x) => x.id === tid) : nearestNode(nodes, kind, b.x, b.z);
					if (n && !n.taken) {
						tid = n.id;
						ntx = n.x;
						ntz = n.z;
					}
				}
				return {
					...b,
					job,
					loop,
					targetId: tid,
					tx: ntx,
					tz: ntz
				};
			}),
			notice: job === "haulBasalt" ? "Quarry assigned. Basalt sinters into shielding. Humans need a berm." : job === "sweep" ? "Sweeper assigned." : job === "haulIce" ? "Ice haul assigned." : get().notice
		});
	},
	tickTime: (dt) => {
		const s = get();
		if (!s.ready || s.dead) return;
		const prev = s.calendarSol;
		const calendarSol = prev + dt / 16;
		const prevMonth = Math.floor(prev / 28);
		const month = Math.floor(calendarSol / 28);
		const solFrac = dt / 16;
		let ice = s.ice;
		let air = s.air;
		let metal = s.metal;
		let pack = s.pack;
		let notice = s.notice;
		let dead = false;
		let death = s.death;
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
			ice = Math.max(0, ice - (ICE_PER_SOL + crops.filter((c) => c.t < 1).length * .05) * solFrac);
			air = Math.min(100, air + (AIR_WET + green * .5) * solFrac);
			for (const c of crops) {
				const dur = SEEDS.find((x) => x.id === c.kind)?.growSols ?? 8;
				c.t = Math.min(1, c.t + solFrac / dur);
			}
		} else if (crewOn) air = Math.max(0, air - AIR_DRY * solFrac);
		if (crafting) {
			const t = crafting.t + solFrac;
			if (t >= crafting.dur) {
				const def = CATALOG.find((c) => c.id === crafting.id);
				if (def && !def.placeable) {
					printed = printed.includes(crafting.id) ? printed : [...printed, crafting.id];
					notice = `${def.name} printed.`;
				} else if (def) {
					placing = crafting.id;
					notice = `${def.name} out of the printer. Click the yard.`;
				}
				crafting = null;
			} else crafting = {
				...crafting,
				t
			};
		}
		if (month > prevMonth && !resupply) {
			resupply = {
				x: RESUPPLY.x,
				y: 78,
				z: RESUPPLY.z,
				phase: "down",
				parkedAt: calendarSol
			};
			notice = `Cargo Starship on approach. Month ${month + 1}.`;
		}
		if (resupply) {
			const r = { ...resupply };
			if (r.phase === "down") {
				r.y = Math.max(0, r.y - 22 * dt);
				if (r.y <= .05) {
					r.y = 0;
					r.phase = "parked";
					r.parkedAt = calendarSol;
					metal = Math.min(40, metal + 8);
					air = Math.min(100, air + 24);
					monthsLived = month;
					const notes = ["Metal and air into inventory."];
					if (!extraCrewLanded) {
						extraCrewLanded = true;
						bots = [...bots, ...bootBots(WAVE2, [
							"Optimus-4",
							"Optimus-5",
							"Optimus-6"
						], "disembark").map((b, i) => ({
							...b,
							tx: WAVE2[i].x - 4,
							tz: WAVE2[i].z - 3
						}))];
						notes.push("Three more Optimus on the pad.");
					}
					notice = notes.join(" ");
				}
				resupply = r;
			} else if (r.phase === "parked" && calendarSol - r.parkedAt > 1.6) resupply = {
				...r,
				phase: "up"
			};
			else if (r.phase === "up") {
				r.y += 26 * dt;
				resupply = r.y > 92 ? null : r;
			}
		}
		const phase = calendarSol % 1;
		const night = phase < .22 || phase > .78;
		const solar = hasKind(s.placed, "solar") && !night && !storming;
		const power = s.packAtDome ? pack : s.reserve;
		const gen = s.kiloOn || solar;
		const botsDry = bots.length > 0 && bots.every((b) => b.charge <= .8);
		if (power < .6 && !gen && botsDry) {
			dryAcc += solFrac;
			if (dryAcc > .35) {
				dead = true;
				death = "power";
				notice = "The bots went dry.";
			}
		} else dryAcc = 0;
		if (crewOn && air <= .05) {
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
			dryAcc
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
		const night = phase < .22 || phase > .78;
		const solar = hasKind(s.placed, "solar") && !night && !s.storming;
		const padPower = (s.packAtDome ? s.pack : s.reserve) > 1 || s.kiloOn || solar;
		const drain = .45 * (s.storming ? 3.4 : 1);
		const claimed = (loop) => new Set(bots.filter((o) => o.loop === loop && !o.carrying && (o.job === "sweep" || o.job === "haulIce" || o.job === "haulBasalt")).map((o) => o.targetId));
		const resume = (b) => {
			const kind = b.loop === "ice" ? "ice" : b.loop === "basalt" ? "basalt" : "meteorite";
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
		const dropAt = (b) => {
			if (b.carrying === "metal") metal = Math.min(40, metal + 1);
			if (b.carrying === "ice") ice = Math.min(20, ice + 1);
			if (b.carrying === "basalt") {
				regolith = Math.min(24, regolith + 1);
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
			const kind = b.job === "haulIce" || b.loop === "ice" ? "ice" : b.job === "haulBasalt" || b.loop === "basalt" ? "basalt" : "meteorite";
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
			const carryHome = looping && (b.carrying === "metal" || b.carrying === "ice" || b.carrying === "basalt") ? b.carrying === "ice" ? STILL : DOME : b.job === "haulPack" && b.carrying === "pack" ? PACK_SLOT : b.job === "haulKilo" && b.carrying === "kilo" ? KILO_PIT : {
				x: b.tx,
				z: b.tz
			};
			const dx = (b.carrying === "metal" || b.carrying === "basalt" ? carryHome.x + 3.4 : carryHome.x) - b.x;
			const dz = carryHome.z - b.z;
			const dist = Math.hypot(dx, dz) || 1e-4;
			b.heading = Math.atan2(dx, dz);
			if (dist > .55) {
				const step = 3.4 * dt * (s.storming ? .7 : 1);
				const nx = b.x + dx / dist * Math.min(step, dist);
				const nz = b.z + dz / dist * Math.min(step, dist);
				if (Math.hypot(nx, nz) > 30.4) {
					b.job = "idle";
					continue;
				}
				b.x = nx;
				b.z = nz;
				if (b.carrying === "pack") {
					packX = b.x;
					packZ = b.z - .8;
				}
				if (b.carrying === "kilo") {
					kiloX = b.x;
					kiloZ = b.z - .8;
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
		set({
			bots,
			nodes,
			metal,
			ice,
			regolith,
			packX,
			packZ,
			packAtDome,
			kiloX,
			kiloZ,
			kiloSeated,
			kiloOn,
			quests,
			notice
		});
	},
	tickPower: (dt) => {
		const s = get();
		if (!s.ready || s.dead) return;
		const phase = s.calendarSol % 1;
		const night = phase < .22 || phase > .78;
		const working = s.bots.filter((b) => b.job !== "idle" && b.job !== "charge").length;
		const solar = hasKind(s.placed, "solar") && !night && !s.storming;
		const drain = (.1 + working * .025 + (night ? .14 : .04) + (s.storming ? .12 : 0)) * dt;
		const gen = (s.kiloOn ? night ? .62 : .78 : 0) * dt + (solar ? .42 * dt : 0);
		let reserve = s.reserve;
		let pack = s.pack;
		let brownout = s.brownout;
		if (s.packAtDome) {
			pack = Math.max(0, Math.min(100, pack + gen - drain));
			brownout = pack <= .2 && !s.kiloOn && !solar;
			if (pack > 8) brownout = false;
		} else {
			reserve = Math.max(0, reserve - drain);
			brownout = reserve <= .2;
			if (reserve > 8) brownout = false;
		}
		set({
			reserve,
			pack,
			brownout
		});
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
			crafting: {
				id,
				t: 0,
				dur: def.printSols
			},
			panel: "none",
			notice: `Printing ${def.name.toLowerCase()}. ${fmtSols(def.printSols)}.`
		});
	},
	cancelCraft: () => {
		const s = get();
		if (!s.crafting) return;
		const def = CATALOG.find((c) => c.id === s.crafting.id);
		set({
			crafting: null,
			metal: s.metal + (def?.cost ?? 0),
			regolith: s.regolith + (def?.costReg ?? 0),
			notice: "Print aborted."
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
		const part = {
			id: `p${partSeq++}`,
			kind: s.placing,
			x,
			z,
			dist: Math.hypot(x, z)
		};
		set({
			placed: [...s.placed, part],
			printed: s.printed.includes(s.placing) ? s.printed : [...s.printed, s.placing],
			placing: null,
			notice: s.placing === "berm" ? "Radiation berm seated. The capitol can take a crew." : `${def?.name} seated.`
		});
	},
	cancelPlace: () => {
		const s = get();
		if (!s.placing) return;
		const def = CATALOG.find((c) => c.id === s.placing);
		set({
			placing: null,
			metal: s.metal + (def?.cost ?? 0),
			regolith: s.regolith + (def?.costReg ?? 0)
		});
	},
	plant: (kind) => {
		const s = get();
		if (!hasKind(s.placed, "greenhouse") || s.seeds[kind] < 1 || s.crops.length >= 6) return;
		set({
			seeds: {
				...s.seeds,
				[kind]: s.seeds[kind] - 1
			},
			crops: [...s.crops, {
				id: `c${cropSeq++}`,
				kind,
				t: 0
			}],
			notice: "Seed in the bed. Needs ice water."
		});
	},
	orderCargo: () => {
		const s = get();
		if (s.dead || s.resupply || !hasRelay(s.placed)) return;
		set({
			resupply: {
				x: RESUPPLY.x,
				y: 78,
				z: RESUPPLY.z,
				phase: "down",
				parkedAt: s.calendarSol
			},
			notice: s.extraCrewLanded ? "Cargo on approach. Metal and air." : "Second Superheavy on approach. Three more Optimus on the pad."
		});
	},
	landCrew: () => {
		if (!crewReadyOf(get())) return;
		set({
			humans: FIRST_CREW,
			notice: "Biologist, geologist, astrophysicist on the pad. Keep the air and the kilowatts."
		});
	}
}));
function hasRelay(placed) {
	return placed.some((p) => p.kind === "mast");
}
function hasGreenhouse(placed) {
	return placed.some((p) => p.kind === "greenhouse");
}
function hasBerm(placed) {
	return placed.some((p) => p.kind === "berm");
}
function crewReadyOf(s) {
	if (s.humans.length) return false;
	if (!hasBerm(s.placed) || !hasGreenhouse(s.placed)) return false;
	if (!s.crops.some((c) => c.t >= .12)) return false;
	if (s.air < 40) return false;
	return s.kiloOn || s.packAtDome && s.pack > 25;
}
if (typeof window !== "undefined") window.__yard = useYard;
var ORBIT_TARGET = new Vector3(8.5, 9.5, 4.5);
var CAM_POS = [
	25,
	17,
	42
];
var ColonyCanvas = (0, import_react.memo)(function ColonyCanvas() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		shadows: true,
		camera: {
			position: CAM_POS,
			fov: 42,
			near: .15,
			far: 280
		},
		dpr: [1, 1.5],
		gl: {
			antialias: true,
			alpha: false
		},
		style: {
			position: "absolute",
			inset: 0,
			touchAction: "none"
		},
		onCreated: ({ gl, camera }) => {
			gl.setClearColor("#c17a52");
			gl.toneMapping = 4;
			camera.lookAt(ORBIT_TARGET);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
				attach: "fog",
				args: [
					"#c48462",
					55,
					150
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DustFog, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .22 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
				"#f0c8a0",
				"#4a2818",
				.5
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ground, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.07,
					0
				],
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					29.84,
					30.1,
					64
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#9dba7a",
					transparent: true,
					opacity: .32,
					side: 2
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pads, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
				fallback: null,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitatDome, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClickMesh, {
						pos: [
							0,
							4,
							0
						],
						r: 8,
						h: 8,
						onPick: () => useYard.getState().select({ kind: "dome" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Starship, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClickMesh, {
						pos: [
							20.5,
							9,
							6
						],
						r: 3.6,
						h: 18,
						onPick: () => useYard.getState().select({ kind: "ship" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveYard, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacedLayer, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSurface, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResupplyCraft, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DustBits, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
				enableDamping: true,
				autoRotate: true,
				autoRotateSpeed: .18,
				enablePan: false,
				minDistance: 18,
				maxDistance: 72,
				target: ORBIT_TARGET
			})
		]
	});
});
function Sun() {
	const ref = (0, import_react.useRef)(null);
	useFrame(() => {
		const y = useYard.getState();
		const phase = y.calendarSol % 1;
		const night = phase < .22 || phase > .78;
		if (!ref.current) return;
		ref.current.intensity = y.storming ? .35 : night ? .16 : 2.2;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
		ref,
		position: [
			42,
			48,
			18
		],
		intensity: 2.2,
		color: "#ffe4c4",
		castShadow: true,
		"shadow-mapSize-width": 1024,
		"shadow-mapSize-height": 1024
	});
}
function DustFog() {
	(0, import_react.useRef)(null);
	useFrame(({ scene }) => {
		const storm = useYard.getState().storming;
		const f = scene.fog;
		if (!f) return;
		f.near = storm ? 12 : 55;
		f.far = storm ? 48 : 150;
		f.color.set(storm ? "#b88962" : "#c48462");
	});
	return null;
}
function DustBits() {
	const ref = (0, import_react.useRef)(null);
	const geo = (0, import_react.useMemo)(() => {
		const g = new BufferGeometry();
		const n = 900;
		const pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			pos[i * 3] = (Math.random() - .5) * 70;
			pos[i * 3 + 1] = Math.random() * 14;
			pos[i * 3 + 2] = (Math.random() - .5) * 70;
		}
		g.setAttribute("position", new BufferAttribute(pos, 3));
		return g;
	}, []);
	useFrame((_, dt) => {
		const storm = useYard.getState().storming;
		if (!ref.current) return;
		ref.current.visible = storm;
		ref.current.rotation.y += dt * .15;
		ref.current.position.x = (ref.current.position.x + dt * 4) % 8;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
		ref,
		geometry: geo,
		visible: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			color: "#d4a078",
			size: .22,
			transparent: true,
			opacity: .45,
			depthWrite: false
		})
	});
}
function Ground() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		receiveShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [95, 64] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#c57a4e",
			roughness: .96
		})]
	});
}
function Pads() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				20.5,
				.04,
				6
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [6.8, 36] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#6d655c",
				roughness: .7
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				CHARGE_PAD.x,
				.05,
				CHARGE_PAD.z
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [1.35, 20] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#1a2420",
				emissive: "#9dba7a",
				emissiveIntensity: .35
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				PACK_SLOT.x,
				.05,
				PACK_SLOT.z
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [2.8, 1.6] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#2a3036" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				KILO_PIT.x,
				.03,
				KILO_PIT.z
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
				1.45,
				2.1,
				24
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5a4032" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			position: [
				STILL.x,
				0,
				STILL.z
			],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IceStill, { level: 1 })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				RESUPPLY.x,
				.04,
				RESUPPLY.z
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [5.4, 32] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5a5248" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				FROST.x,
				.045,
				FROST.z
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [5.2, 24] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#b9c8d4",
				transparent: true,
				opacity: .28
			})]
		})
	] });
}
function ClickMesh({ pos, r, h, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: pos,
		onClick: (e) => {
			e.stopPropagation();
			onPick();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			r,
			r,
			h,
			12
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			transparent: true,
			opacity: 0,
			depthWrite: false
		})]
	});
}
function Beacon({ color, hide }) {
	if (hide) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.08,
			0
		],
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
			1.5,
			1.9,
			24
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color,
			transparent: true,
			opacity: .75,
			side: 2
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
		position: [
			0,
			2,
			0
		],
		intensity: 5,
		distance: 9,
		color
	})] });
}
function LiveYard() {
	const nodes = useYard((s) => s.nodes);
	const bots = useYard((s) => s.bots);
	const packAt = useYard((s) => s.packAtDome);
	const kiloSeated = useYard((s) => s.kiloSeated);
	const packRef = (0, import_react.useRef)(null);
	const kiloRef = (0, import_react.useRef)(null);
	const botRefs = (0, import_react.useRef)([]);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		nodes.map((n) => n.taken ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			position: [
				n.x,
				.32,
				n.z
			],
			onClick: (e) => {
				e.stopPropagation();
				clickNode(n.id, n.x, n.z, n.kind);
			},
			children: n.kind === "ice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IceBlock, {}) : n.kind === "basalt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BasaltRock, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meteorite, {})
		}, n.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: packRef,
			position: [
				PACK_SPAWN.x,
				0,
				PACK_SPAWN.z
			],
			onClick: (e) => {
				e.stopPropagation();
				clickCarry("haulPack");
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megapack, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Beacon, {
				color: "#9dba7a",
				hide: packAt
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: kiloRef,
			position: [
				KILO_SPAWN.x,
				0,
				KILO_SPAWN.z
			],
			onClick: (e) => {
				e.stopPropagation();
				clickCarry("haulKilo");
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kilopower, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Beacon, {
				color: "#e8c36a",
				hide: kiloSeated
			})]
		}),
		bots.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: (el) => {
				if (el) botRefs.current[i] = el;
			},
			position: [
				b.x,
				0,
				b.z
			],
			onClick: (e) => {
				e.stopPropagation();
				useYard.getState().select({
					kind: "bot",
					id: b.id
				});
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptimusBot, {})
		}, b.id))
	] });
}
function PlacedLayer() {
	const placed = useYard((s) => s.placed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: placed.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		position: [
			p.x,
			0,
			p.z
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CraftModel, { kind: p.kind })
	}, p.id)) });
}
function PlaceSurface() {
	const placing = useYard((s) => s.placing);
	if (!placing) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		position: [
			0,
			.14,
			0
		],
		onPointerMove: (e) => {
			placeCursor.x = e.point.x;
			placeCursor.z = e.point.z;
			placeCursor.valid = siteLegal(e.point.x, e.point.z, useYard.getState().placed) || placing === "berm";
		},
		onClick: (e) => {
			e.stopPropagation();
			useYard.getState().confirmPlace(e.point.x, e.point.z);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [30.4, 48] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#9dba7a",
			transparent: true,
			opacity: .08,
			depthWrite: false
		})]
	});
}
function ResupplyCraft() {
	const ship = useYard((s) => s.resupply);
	const ref = (0, import_react.useRef)(null);
	useFrame(() => {
		const r = useYard.getState().resupply;
		if (ref.current && r) ref.current.position.set(r.x, r.y, r.z);
	});
	if (!ship) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref,
		position: [
			ship.x,
			ship.y,
			ship.z
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CargoStarship, {
			x: 0,
			y: 0,
			z: 0
		})
	});
}
function clickNode(id, x, z, kind) {
	const y = useYard.getState();
	const job = kind === "ice" ? "haulIce" : kind === "basalt" ? "haulBasalt" : "sweep";
	if (y.sel.kind === "bot") y.assignBot(y.sel.id, job, id, x, z);
	else y.select({
		kind: "node",
		id
	});
}
function clickCarry(job) {
	const y = useYard.getState();
	const idle = y.sel.kind === "bot" ? y.sel.id : y.bots.find((b) => b.job === "idle")?.id;
	if (!idle) return;
	if (job === "haulPack") y.assignBot(idle, "haulPack", "pack", y.packX, y.packZ);
	else y.assignBot(idle, y.kiloSeated ? "install" : "haulKilo", "kilo", y.kiloSeated ? KILO_PIT.x : y.kiloX, y.kiloSeated ? KILO_PIT.z : y.kiloZ);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition disabled:opacity-40 disabled:pointer-events-none", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			outline: "border border-border bg-surface text-fg hover:bg-surface-2",
			ghost: "text-muted hover:text-fg hover:bg-surface-2",
			accent: "bg-hud text-accent-fg hover:opacity-90"
		},
		size: {
			default: "h-10 px-4 text-sm",
			sm: "h-9 px-3 text-xs",
			lg: "h-11 px-5 text-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var useMission = create((set, get) => ({
	phase: "boot",
	site: null,
	picking: false,
	toursDone: false,
	lookId: null,
	begin: () => set({
		phase: "globe",
		picking: false
	}),
	finishTours: () => set({
		toursDone: true,
		picking: true
	}),
	enterPick: () => set({
		picking: true,
		toursDone: true,
		phase: "globe"
	}),
	lookAt: (lookId) => set({ lookId }),
	propose: (site) => set({
		site,
		phase: "confirm",
		lookId: site.id
	}),
	cancelConfirm: () => set({
		phase: "globe",
		picking: true
	}),
	confirmFight: () => set({ phase: "fight" }),
	fightWon: () => set({ phase: "landing" }),
	fightLost: () => set({
		phase: "globe",
		picking: true
	}),
	enterYard: () => {
		const site = get().site ?? DEFAULT_SITE;
		useYard.getState().init(site);
		set({
			phase: "yard",
			site,
			picking: false
		});
	},
	backToGlobe: () => {
		useYard.setState({
			started: false,
			ready: false
		});
		set({
			phase: "globe",
			picking: true,
			site: null,
			lookId: null
		});
	},
	skipToYard: (id) => {
		const site = siteById(id ?? DEFAULT_SITE.id);
		useYard.getState().init(site);
		set({
			phase: "yard",
			site,
			picking: false,
			toursDone: true
		});
	},
	skipToFight: (id) => {
		const site = siteById(id ?? DEFAULT_SITE.id);
		set({
			phase: "fight",
			site,
			picking: false,
			toursDone: true,
			lookId: site.id
		});
	}
}));
if (typeof window !== "undefined") window.__mission = useMission;
function ColonyOverlay() {
	const started = useYard((s) => s.started);
	const dead = useYard((s) => s.dead);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YardSim, {}),
			!started ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartGate, {}) : null,
			started && dead ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeathGate, {}) : null,
			started && !dead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StormBanner, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopHud, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meters, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintHud, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceHud, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrewRoster, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panels, {})
			] }) : null
		]
	});
}
function YardSim() {
	(0, import_react.useEffect)(() => {
		let raf = 0;
		let last = performance.now();
		let acc = 0;
		let pacc = 0;
		let tacc = 0;
		const loop = (now) => {
			raf = requestAnimationFrame(loop);
			const dt = Math.min((now - last) / 1e3, .08);
			last = now;
			const y = useYard.getState();
			if (!y.started || y.dead) return;
			acc += dt;
			pacc += dt;
			tacc += dt;
			if (pacc >= .2) {
				y.tickPower(pacc);
				pacc = 0;
			}
			if (tacc >= 1 / 20) {
				y.tickTime(tacc);
				tacc = 0;
			}
			while (acc >= 1 / 28) {
				y.tickBots(1 / 28);
				acc -= 1 / 28;
			}
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);
	return null;
}
function StartGate() {
	const start = useYard((s) => s.start);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 z-40 flex items-end bg-bg/55 p-4 sm:items-center sm:justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-lg rounded-[var(--radius-xl)] p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
					children: "GrokMars · Phase 1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl font-semibold",
					children: "Keep the capitol alive"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Dust will come and bleed charge. Those dark rocks are basalt — sinter them into a radiation berm before humans. The second Starship drops three more Optimus."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6 min-h-11",
					onClick: start,
					children: "Walk the pad"
				})
			]
		})
	});
}
function DeathGate() {
	const restart = useYard((s) => s.restart);
	const death = useYard((s) => s.death);
	const back = useMission((s) => s.backToGlobe);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 z-40 flex items-end bg-bg/70 p-4 sm:items-center sm:justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-md rounded-[var(--radius-xl)] p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] text-danger uppercase",
					children: "Capitol dark"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-semibold",
					children: death === "air" ? "The air ran out" : "The bots went dry"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						onClick: restart,
						children: "Restart"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "min-h-11",
						onClick: back,
						children: "New site"
					})]
				})
			]
		})
	});
}
function StormBanner() {
	if (!useYard((s) => s.storming)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute top-0 left-0 right-0 z-30 flex justify-center p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-full border border-danger bg-bg/80 px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-danger uppercase",
			children: "Dust storm · charge bleed · solar blind"
		})
	});
}
function TopHud() {
	const quests = useYard((s) => s.quests);
	const sol = useYard((s) => s.calendarSol);
	const open = useYard((s) => s.openPanel);
	const site = useYard((s) => s.site?.name);
	const active = quests.find((q) => q.status === "active");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "pointer-events-auto absolute top-0 left-0 z-20 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
				children: [
					"GrokMars · ",
					site ?? "Capitol",
					" · Sol ",
					sol.toFixed(1)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "Surface yard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-xs text-muted",
				children: active?.title ?? "Keep the pad alive."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "min-h-11",
					onClick: () => open("ship"),
					children: "Starship"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					className: "min-h-11",
					onClick: () => open("dome"),
					children: "Dome"
				})]
			})
		]
	});
}
function Meters() {
	const metal = useYard((s) => s.metal);
	const ice = useYard((s) => s.ice);
	const air = useYard((s) => s.air);
	const reg = useYard((s) => s.regolith);
	const packAt = useYard((s) => s.packAtDome);
	const pack = useYard((s) => s.pack);
	const reserve = useYard((s) => s.reserve);
	const humans = useYard((s) => s.humans);
	const storm = useYard((s) => s.storming);
	const brownout = useYard((s) => s.brownout);
	const power = packAt ? pack : reserve;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute top-4 right-3 w-44 sm:w-52",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel space-y-2 rounded-[var(--radius-md)] p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-3.5" }),
					label: "Metal",
					value: metal,
					max: 40
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, { className: "size-3.5" }),
					label: "Regolith",
					value: reg,
					max: 24
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "size-3.5" }),
					label: "Ice",
					value: ice,
					max: 20,
					frac: true,
					danger: ice < .4
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wind, { className: "size-3.5" }),
					label: humans.length ? "Habitat air" : "Air tanks",
					value: air,
					max: 100,
					danger: !!humans.length && air < 40
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Battery, { className: "size-3.5" }),
					label: storm ? "Power · storm" : "Power",
					value: power,
					max: 100,
					danger: brownout || storm
				})
			]
		})
	});
}
function Meter({ icon, label, value, max, danger, frac }) {
	const pct = Math.max(0, Math.min(100, value / max * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-[11px] text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1.5",
			children: [icon, label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("hud-num", danger && "text-danger"),
			children: frac ? value.toFixed(1) : Math.round(value)
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 h-1 overflow-hidden rounded-full bg-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full", danger ? "bg-danger" : "bg-hud"),
			style: { width: `${pct}%` }
		})
	})] });
}
function PrintHud() {
	const job = useYard((s) => s.crafting);
	const cancel = useYard((s) => s.cancelCraft);
	if (!job) return null;
	const def = catalogItem(job.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute top-4 left-1/2 z-30 w-[min(100%-2rem,22rem)] -translate-x-1/2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1 font-mono text-[10px] text-accent uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "size-3.5" }), " Printer"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: def?.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					className: "mt-2 min-h-11",
					onClick: cancel,
					children: "Abort"
				})
			]
		})
	});
}
function PlaceHud() {
	const kind = useYard((s) => s.placing);
	const cancel = useYard((s) => s.cancelPlace);
	if (!kind) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute top-4 left-1/2 z-30 w-[min(100%-2rem,22rem)] -translate-x-1/2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] text-accent uppercase",
					children: "Planting"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: placeCursor.valid ? "Click to seat." : "Move inside the ring."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					className: "mt-2 min-h-11",
					onClick: cancel,
					children: "Cancel"
				})
			]
		})
	});
}
function Notice() {
	const notice = useYard((s) => s.notice);
	const storm = useYard((s) => s.storming);
	if (!notice && !storm) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "pointer-events-none absolute bottom-4 left-1/2 z-30 w-[min(calc(100%-2rem),22rem)] -translate-x-1/2 panel rounded-[var(--radius-sm)] px-3 py-2 text-center text-xs md:left-[22rem] md:translate-x-0 md:text-left",
		children: storm ? "Dust is on the glass. Bots bleed charge outdoors." : notice
	});
}
function CrewRoster() {
	const bots = useYard((s) => s.bots);
	const sel = useYard((s) => s.sel);
	const select = useYard((s) => s.select);
	const humans = useYard((s) => s.humans);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "pointer-events-auto absolute bottom-4 left-3 z-20 w-[min(calc(100%-1.5rem),20.5rem)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel max-h-[min(46vh,28rem)] overflow-y-auto rounded-[var(--radius-lg)] p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1.5 font-mono text-[10px] text-accent uppercase",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-3.5" }),
						"Crew · ",
						bots.length
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: bots.map((b) => {
						const on = sel.kind === "bot" && sel.id === b.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: cn("rounded-[var(--radius-md)] border border-border p-2", on && "ring-1 ring-accent"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex min-h-11 w-full items-center gap-3 text-left",
								onClick: () => select(on ? { kind: "none" } : {
									kind: "bot",
									id: b.id
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex justify-between font-mono text-[11px] text-subtle",
											children: [b.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "hud-num",
												children: [Math.round(b.charge), "%"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm",
											children: labelJob(b.job, b.carrying)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block h-1 overflow-hidden rounded-full bg-border",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block h-full bg-hud",
												style: { width: `${b.charge}%` }
											})
										})
									]
								})
							}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignRow, { id: b.id }) : null]
						}, b.id);
					})
				}),
				humans.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-1 border-t border-border pt-2 text-sm",
					children: humans.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						h.name,
						" · ",
						h.role
					] }, h.id))
				}) : null
			]
		})
	});
}
function AssignRow({ id }) {
	const assign = useYard((s) => s.assignBot);
	const packAt = useYard((s) => s.packAtDome);
	const kiloOn = useYard((s) => s.kiloOn);
	const kiloSeated = useYard((s) => s.kiloSeated);
	const packX = useYard((s) => s.packX);
	const packZ = useYard((s) => s.packZ);
	const kiloX = useYard((s) => s.kiloX);
	const kiloZ = useYard((s) => s.kiloZ);
	const dry = useYard((s) => s.bots.find((b) => b.id === id)?.charge ?? 0) < 4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 grid grid-cols-2 gap-1.5 border-t border-border pt-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "min-h-11",
				disabled: dry,
				onClick: () => assign(id, "haulIce"),
				children: "Haul ice"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "min-h-11",
				disabled: dry,
				onClick: () => assign(id, "sweep"),
				children: "Sweep iron"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				className: "min-h-11",
				disabled: dry,
				onClick: () => assign(id, "haulBasalt"),
				children: "Quarry rock"
			}),
			!packAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				className: "min-h-11",
				disabled: dry,
				onClick: () => assign(id, "haulPack", "pack", packX, packZ),
				children: "Haul Megapack"
			}) : null,
			!kiloOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "min-h-11",
				disabled: dry,
				onClick: () => assign(id, kiloSeated ? "install" : "haulKilo", "kilo", kiloSeated ? KILO_PIT.x : kiloX, kiloSeated ? KILO_PIT.z : kiloZ),
				children: kiloSeated ? "Install kilo" : "Haul Kilopower"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				className: "min-h-11",
				onClick: () => assign(id, "charge", "charge", CHARGE_PAD.x, CHARGE_PAD.z),
				children: "Charge"
			})
		]
	});
}
function labelJob(job, carrying) {
	if (carrying === "basalt") return "Carrying basalt";
	if (carrying === "metal") return "Carrying metal";
	if (carrying === "ice") return "Carrying ice";
	if (carrying === "pack") return "Megapack";
	if (carrying === "kilo") return "Kilopower";
	if (job === "idle") return "Awaiting orders";
	if (job === "disembark") return "Off the ramp";
	if (job === "sweep") return "Sweeping iron";
	if (job === "haulIce") return "Hauling ice";
	if (job === "haulBasalt") return "Quarrying rock";
	if (job === "charge") return "Charging";
	return job;
}
function Panels() {
	const panel = useYard((s) => s.panel);
	if (panel === "dome") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DomePanel, {});
	if (panel === "ship") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShipPanel, {});
	return null;
}
function DomePanel() {
	const metal = useYard((s) => s.metal);
	const ice = useYard((s) => s.ice);
	const reg = useYard((s) => s.regolith);
	const printed = useYard((s) => s.printed);
	const placed = useYard((s) => s.placed);
	const crafting = useYard((s) => s.crafting);
	const craft = useYard((s) => s.craft);
	const close = useYard((s) => s.openPanel);
	const seeds = useYard((s) => s.seeds);
	const crops = useYard((s) => s.crops);
	const plant = useYard((s) => s.plant);
	const green = hasGreenhouse(placed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		onClose: () => close("none"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] text-accent uppercase",
				children: "Capitol"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl",
				children: "Floor shop"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					"Metal ",
					metal,
					" · Regolith ",
					reg,
					" · Ice ",
					ice.toFixed(1),
					". Basalt becomes berms. Iron becomes tools."
				]
			}),
			green ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-1.5",
				children: [SEEDS.map((sd) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					className: "min-h-11",
					disabled: seeds[sd.id] < 1,
					onClick: () => plant(sd.id),
					children: [
						sd.name,
						" ",
						seeds[sd.id]
					]
				}, sd.id)), crops.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "col-span-2 text-xs text-muted",
					children: [
						c.kind,
						" ",
						Math.round(c.t * 100),
						"%"
					]
				}, c.id))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-subtle",
				children: "Seat a greenhouse to plant first-ship seeds."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: CATALOG.map((item) => {
					const done = printed.includes(item.id);
					const need = metal < item.cost || reg < item.costReg;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								item.name,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hud-num text-[11px] text-muted",
									children: [item.cost ? `${item.cost} metal` : "", item.costReg ? ` ${item.costReg} regolith` : ""]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: item.detail
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "min-h-11 shrink-0",
							disabled: done || need || !!crafting,
							onClick: () => craft(item.id),
							children: done ? "Seated" : need ? "Need stock" : "Print"
						})]
					}, item.id);
				})
			})
		]
	});
}
function ShipPanel() {
	const quests = useYard((s) => s.quests);
	const close = useYard((s) => s.openPanel);
	const sol = useYard((s) => s.calendarSol);
	const extra = useYard((s) => s.extraCrewLanded);
	const placed = useYard((s) => s.placed);
	const resupply = useYard((s) => s.resupply);
	const orderCargo = useYard((s) => s.orderCargo);
	const landCrew = useYard((s) => s.landCrew);
	const ready = useYard((s) => crewReadyOf(s));
	const mast = hasRelay(placed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		onClose: () => close("none"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] text-accent uppercase",
				children: "Starship"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl",
				children: "Quests"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					"Next scheduled cargo in ",
					fmtSols(solsUntilResupply(sol)),
					".",
					" ",
					extra ? "Second ship already dropped three bots." : "Second Superheavy brings three more Optimus."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "Dark rocks are basalt, not iron. Quarry them into regolith and print a radiation berm. Humans will not land without it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11",
					disabled: !mast || !!resupply,
					onClick: orderCargo,
					children: mast ? "Call cargo" : "Need comms mast"
				}), ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "accent",
					className: "min-h-11",
					onClick: landCrew,
					children: "Land first crew"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-3",
				children: quests.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [q.status === "done" ? "✓ " : "", q.title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: q.detail
				})] }, q.id))
			})
		]
	});
}
function Modal({ onClose, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-bg/60 p-4 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel max-h-[min(90dvh,44rem)] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] p-6",
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "min-h-11",
					onClick: onClose,
					children: "Close"
				})
			})]
		})
	});
}
var fightKeys = /* @__PURE__ */ new Set();
var raf = 0;
var last = 0;
var bank = 0;
function flightLoop(now) {
	raf = requestAnimationFrame(flightLoop);
	const dt = Math.min((now - (last || now)) / 1e3, .05);
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
	bank = bank + (steer * .7 - bank) * Math.min(1, dt * 8);
	const yaw = st.yaw + bank * 1.7 * dt;
	const speed = Math.max(0, Math.min(44, st.speed + (thr ? 32 : brk ? -24 : -4) * dt));
	useFight.setState({
		yaw,
		speed,
		bank
	});
}
function ensureLoop() {
	if (typeof window === "undefined") return;
	if (!raf) {
		last = performance.now();
		raf = requestAnimationFrame(flightLoop);
	}
}
var useFight = create((set) => ({
	status: "idle",
	usHp: 140,
	cnHp: 70,
	yaw: 0,
	speed: 0,
	bank: 0,
	notice: "A banks left. D banks right. W throttle. Click fire.",
	keys: fightKeys,
	reset: () => {
		fightKeys.clear();
		bank = 0;
		set({
			status: "idle",
			usHp: 140,
			cnHp: 70,
			yaw: 0,
			speed: 0,
			bank: 0,
			notice: "Hold the sky."
		});
	},
	start: () => {
		fightKeys.clear();
		bank = 0;
		ensureLoop();
		set({
			status: "live",
			usHp: 140,
			cnHp: 70,
			yaw: 0,
			speed: 0,
			bank: 0,
			notice: "Weapons free."
		});
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
			...p.status ? { status: p.status } : {}
		});
	}
}));
function installControlsProbe() {
	if (typeof window === "undefined") return;
	ensureLoop();
	window.__controlsTest = {
		getYaw: () => useFight.getState().yaw,
		getSpeed: () => useFight.getState().speed,
		setKeys: (codes) => useFight.getState().setKeys(codes),
		setSteer: (v) => {
			fightKeys.delete("KeyA");
			fightKeys.delete("KeyD");
			if (v > .2) fightKeys.add("KeyA");
			if (v < -.2) fightKeys.add("KeyD");
		}
	};
	window.__fight = useFight;
}
var FWD = new Vector3();
var CNFWD = new Vector3();
var UP = new Vector3(0, 1, 0);
var YAXIS = new Vector3(0, 1, 0);
var TMP = new Vector3();
var DIR = new Vector3();
var CAM = new Vector3();
var LOOK = new Vector3();
var EUL = new Euler();
var RED = new Color("#ff3b2f");
var BLUE = new Color("#7ec8ff");
function CombatCanvas() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		camera: {
			position: [
				0,
				4,
				16
			],
			fov: 55,
			near: .2,
			far: 400
		},
		gl: {
			antialias: true,
			alpha: false
		},
		dpr: [1, 1.5],
		style: {
			position: "absolute",
			inset: 0,
			touchAction: "none"
		},
		onCreated: ({ gl }) => gl.setClearColor("#120c10"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
				attach: "fog",
				args: [
					"#120c10",
					40,
					220
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .25 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					30,
					40,
					20
				],
				intensity: 1.8,
				color: "#ffe4c4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
				"#f0c8a0",
				"#2a1810",
				.4
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					-28,
					-40
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					22,
					48,
					32
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#c17a52",
					roughness: .95
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dogfight, {})
		]
	});
}
function Ship({ url, yRot = 0 }) {
	const { scene } = useGLTF(url);
	const model = (0, import_react.useMemo)(() => {
		const c = scene.clone(true);
		c.traverse((o) => {
			const m = o;
			if (m.isMesh) m.castShadow = true;
		});
		return c;
	}, [scene]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", {
		object: model,
		rotation: [
			0,
			yRot,
			0
		],
		dispose: null
	});
}
function Dogfight() {
	const us = (0, import_react.useRef)(null);
	const cn = (0, import_react.useRef)(null);
	const lasers = (0, import_react.useRef)(null);
	const dummy = (0, import_react.useMemo)(() => new Object3D(), []);
	const bolts = (0, import_react.useRef)([]);
	const fireHeld = (0, import_react.useRef)(false);
	const cool = (0, import_react.useRef)(0);
	const cnCool = (0, import_react.useRef)(0);
	const yaw = (0, import_react.useRef)(0);
	const pitch = (0, import_react.useRef)(0);
	const bank = (0, import_react.useRef)(0);
	const speed = (0, import_react.useRef)(0);
	const pos = (0, import_react.useRef)(new Vector3(0, 6, 18));
	const cnPos = (0, import_react.useRef)(new Vector3(4, 8, -22));
	const cnYaw = (0, import_react.useRef)(Math.PI);
	const usHp = (0, import_react.useRef)(140);
	const cnHp = (0, import_react.useRef)(70);
	const armed = (0, import_react.useRef)(false);
	const { camera } = useThree();
	(0, import_react.useEffect)(() => {
		installControlsProbe();
		const down = (e) => {
			fightKeys.add(e.code);
			if ([
				"KeyW",
				"KeyA",
				"KeyS",
				"KeyD",
				"Space"
			].includes(e.code)) e.preventDefault();
		};
		const up = (e) => fightKeys.delete(e.code);
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
		const dt = Math.min(raw, .05);
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
			usHp.current = 140;
			cnHp.current = 70;
			bolts.current = [];
		}
		const thr = fightKeys.has("KeyW") || fightKeys.has("ArrowUp");
		const brk = fightKeys.has("KeyS") || fightKeys.has("ArrowDown");
		yaw.current = st.yaw;
		pitch.current = MathUtils.damp(pitch.current, thr ? .1 : brk ? -.16 : 0, 4, dt);
		bank.current = st.bank;
		speed.current = Math.max(speed.current, st.speed);
		FWD.set(-Math.sin(yaw.current) * Math.cos(pitch.current), Math.sin(pitch.current), -Math.cos(yaw.current) * Math.cos(pitch.current));
		pos.current.addScaledVector(FWD, speed.current * dt);
		pos.current.y = MathUtils.clamp(pos.current.y, 1.2, 28);
		if (us.current) {
			us.current.position.copy(pos.current);
			EUL.set(pitch.current, yaw.current, bank.current);
			us.current.quaternion.setFromEuler(EUL);
		}
		CAM.copy(pos.current).addScaledVector(FWD, -14).addScaledVector(UP, 4.2);
		camera.position.lerp(CAM, 1 - Math.exp(-dt * 4));
		LOOK.copy(pos.current).addScaledVector(FWD, 12);
		camera.lookAt(LOOK);
		TMP.copy(pos.current).sub(cnPos.current);
		let dy = Math.atan2(-TMP.x, -TMP.z) - cnYaw.current;
		while (dy > Math.PI) dy -= Math.PI * 2;
		while (dy < -Math.PI) dy += Math.PI * 2;
		cnYaw.current += Math.sign(dy) * Math.min(Math.abs(dy), .35 * dt);
		CNFWD.set(-Math.sin(cnYaw.current), 0, -Math.cos(cnYaw.current));
		cnPos.current.addScaledVector(CNFWD, 10 * dt);
		cnPos.current.y = MathUtils.damp(cnPos.current.y, pos.current.y + 1.2, 1.2, dt);
		if (cn.current) {
			cn.current.position.copy(cnPos.current);
			cn.current.rotation.set(0, cnYaw.current, 0);
		}
		cool.current -= dt;
		cnCool.current -= dt;
		if ((fireHeld.current || fightKeys.has("Space")) && cool.current <= 0) {
			cool.current = .16;
			TMP.copy(cnPos.current).sub(pos.current).normalize();
			FWD.lerp(TMP, .18).normalize();
			bolts.current.push({
				x: pos.current.x,
				y: pos.current.y,
				z: pos.current.z,
				vx: FWD.x * 90,
				vy: FWD.y * 90,
				vz: FWD.z * 90,
				life: 1.1,
				friendly: true
			});
		}
		if (cnCool.current <= 0 && Math.abs(dy) < .45) {
			cnCool.current = .85;
			const aim = TMP.copy(pos.current).sub(cnPos.current).normalize();
			aim.x += (Math.random() - .5) * .35;
			aim.y += (Math.random() - .5) * .25;
			aim.normalize();
			bolts.current.push({
				x: cnPos.current.x,
				y: cnPos.current.y,
				z: cnPos.current.z,
				vx: aim.x * 48,
				vy: aim.y * 48,
				vz: aim.z * 48,
				life: 1.2,
				friendly: false
			});
		}
		const next = [];
		for (const b of bolts.current) {
			b.life -= dt;
			b.x += b.vx * dt;
			b.y += b.vy * dt;
			b.z += b.vz * dt;
			if (b.life <= 0) continue;
			if (b.friendly) {
				if (Math.hypot(b.x - cnPos.current.x, b.y - cnPos.current.y, b.z - cnPos.current.z) < 4.4) {
					cnHp.current = Math.max(0, cnHp.current - 14);
					continue;
				}
			} else if (Math.hypot(b.x - pos.current.x, b.y - pos.current.y, b.z - pos.current.z) < 2.2) {
				usHp.current = Math.max(0, usHp.current - 3);
				continue;
			}
			next.push(b);
		}
		bolts.current = next;
		const mesh = lasers.current;
		if (mesh) {
			const n = Math.min(next.length, 64);
			for (let i = 0; i < n; i++) {
				const b = next[i];
				dummy.position.set(b.x, b.y, b.z);
				DIR.set(b.vx, b.vy, b.vz);
				if (DIR.lengthSq() > .001) dummy.quaternion.setFromUnitVectors(YAXIS, DIR.normalize());
				dummy.scale.set(.07, 1.7, .07);
				dummy.updateMatrix();
				mesh.setMatrixAt(i, dummy.matrix);
				mesh.setColorAt(i, b.friendly ? RED : BLUE);
			}
			mesh.count = n;
			mesh.instanceMatrix.needsUpdate = true;
			if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
		}
		let status = "live";
		if (cnHp.current <= 0) status = "won";
		if (usHp.current <= 0) status = "lost";
		st.reportHp({
			usHp: usHp.current,
			cnHp: cnHp.current,
			status: status === "live" ? void 0 : status
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: us,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, {
				url: "/models/us_interceptor.glb",
				yRot: 0
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: cn,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, {
				url: "/models/cn_colonizer.glb",
				yRot: 0
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: lasers,
			args: [
				void 0,
				void 0,
				64
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				1,
				1,
				1,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#ff3b2f" })]
		})
	] });
}
if (typeof window !== "undefined") {
	useGLTF.preload("/models/us_interceptor.glb");
	useGLTF.preload("/models/cn_colonizer.glb");
}
var LINES = {
	hello: "Mars is not empty. I am Juno. Navigation, weather, and the voice in the rail. Pick your ground. Ask me for a tour of the planet, the colony pads, the ice, or early terraform.",
	"tour-mars": "Mars itself. Not the flag. I will fly Olympus, the canyon, Hellas, Gale, and the north cap. Listen at each stop.",
	"tour-capitol": "A capitol wants ice, air, and a pad the Starship can keep.",
	"tour-colony": "Colony pads sit on honest ground. Jezero is mapped. Utopia is wet. Olympus is a postcard.",
	"tour-ice": "Ice is the well. Polar night taxes you. Mid-latitude plains are slower and safer.",
	"tour-terraform": "Terraform is later. First you keep three bots alive through dust.",
	"tour-done": "Briefing closed. Pick a crater. I will not lie about the ice.",
	fight: "They want the same site. Hold the sky or they take the colony. A banks left. D banks right. W is throttle. Fire is the trigger.",
	landing: "Pad is yours. Walk the bots off the ramp. Dust will come. Local rock is shielding, not iron.",
	lost: "Sky is lost. Pick another ground, or take the same one again.",
	"ask-jezero": "Jezero. Delta. Maps are good. Thin ice.",
	"stop-jezero": "Jezero. A known pad. You will import water.",
	"ask-utopia": "Utopia Planitia. Ice plains. Honest water. Storms.",
	"stop-utopia": "Utopia. The well without polar night. Dust likes it too.",
	"ask-acidalia": "Acidalia. Ice without polar night.",
	"stop-acidalia": "Acidalia. Cold, wet enough.",
	"ask-hellas": "Hellas. Thickest air on the map. Ugly landing.",
	"stop-hellas": "Hellas Basin. Air is a gift. Terrain is not.",
	"ask-olympus": "Olympus Mons. Flag, not a well.",
	"stop-olympus": "Olympus. Prestige. You will haul ice forever.",
	"ask-valles": "Valles Marineris. Shelter in the wound.",
	"stop-valles": "The canyon. Landing is the tax.",
	"ask-gale": "Gale. Sun for arrays. Thin ice.",
	"stop-gale": "Gale. Dry science. Poor well.",
	"ask-npole": "North polar cap. The well. Polar night tax.",
	"stop-npole": "The cap. Water enough to drown a colony, then six months of night.",
	"ask-isidis": "Isidis. Pad next to Jezero.",
	"stop-isidis": "Isidis. Quiet neighbor.",
	"ask-arabia": "Arabia Terra. Clay, not a well.",
	"stop-arabia": "Arabia. Import ice or go home."
};
var TOUR = [
	{
		id: "hello",
		look: null
	},
	{
		id: "tour-mars",
		look: "olympus"
	},
	{
		id: "tour-capitol",
		look: "jezero"
	},
	{
		id: "tour-colony",
		look: "utopia"
	},
	{
		id: "tour-ice",
		look: "npole"
	},
	{
		id: "tour-terraform",
		look: "hellas"
	},
	{
		id: "tour-done",
		look: null
	}
];
var current = null;
var seq = 0;
function stopVoice() {
	seq += 1;
	if (current) {
		current.pause();
		current.src = "";
		current = null;
	}
}
function captionFor(id) {
	return LINES[id] ?? "";
}
async function playLine(id) {
	const my = ++seq;
	if (current) {
		current.pause();
		current.src = "";
		current = null;
	}
	const src = `/juno/vo/${id}.mp3`;
	const audio = new Audio(src);
	audio.preload = "auto";
	current = audio;
	try {
		await new Promise((resolve, reject) => {
			audio.onended = () => resolve();
			audio.onerror = () => reject(/* @__PURE__ */ new Error("vo missing"));
			audio.play().catch(reject);
		});
	} catch {}
	if (my !== seq) return;
	current = null;
}
async function playBlob(buf) {
	const my = ++seq;
	if (current) {
		current.pause();
		current.src = "";
	}
	const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
	const audio = new Audio(url);
	current = audio;
	try {
		await new Promise((resolve) => {
			audio.onended = () => resolve();
			audio.onerror = () => resolve();
			audio.play().catch(() => resolve());
		});
	} finally {
		URL.revokeObjectURL(url);
	}
	if (my === seq) current = null;
}
var useJuno = create((set) => ({
	caption: captionFor("hello"),
	speaking: false,
	lineId: null,
	say: async (id) => {
		set({
			caption: captionFor(id) || captionFor("hello"),
			speaking: true,
			lineId: id
		});
		await playLine(id);
		set({ speaking: false });
	},
	speakText: async (text) => {
		set({
			caption: text,
			speaking: true,
			lineId: null
		});
		try {
			const res = await fetch("/api/juno/speak", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: text.slice(0, 400) })
			});
			if (res.ok) {
				const buf = await res.arrayBuffer();
				if (buf.byteLength > 32) await playBlob(buf);
			}
		} catch {}
		set({ speaking: false });
	},
	hush: () => {
		stopVoice();
		set({ speaking: false });
	}
}));
function CombatOverlay() {
	const status = useFight((s) => s.status);
	const usHp = useFight((s) => s.usHp);
	const cnHp = useFight((s) => s.cnHp);
	const start = useFight((s) => s.start);
	const reset = useFight((s) => s.reset);
	const won = useMission((s) => s.fightWon);
	const lost = useMission((s) => s.fightLost);
	const say = useJuno((s) => s.say);
	const site = useMission((s) => s.site);
	(0, import_react.useEffect)(() => {
		installControlsProbe();
	}, []);
	(0, import_react.useEffect)(() => {
		if (status === "won") say("landing");
		if (status === "lost") say("lost");
	}, [status, say]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute top-0 left-0 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
						children: ["Intercept · ", site?.name ?? "Pad"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-semibold",
						children: "Hold the sky"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "A left · D right · W throttle · click fire"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-4 right-3 w-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel space-y-2 rounded-[var(--radius-md)] p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						label: "Interceptor",
						value: usHp,
						max: 140
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						label: "Colonizer",
						value: cnHp,
						max: 70,
						danger: true
					})]
				})
			}),
			status === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto absolute inset-0 flex items-end bg-bg/45 p-4 sm:items-center sm:justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel w-full max-w-md rounded-[var(--radius-xl)] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] text-accent uppercase",
							children: "Training wheels"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl",
							children: "Weapons free"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "A banks left. D banks right. W is throttle. Click to fire red lasers. They miss more than you."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-6 min-h-11",
							onClick: start,
							children: "Engage"
						})
					]
				})
			}) : null,
			status === "won" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto absolute inset-0 flex items-end bg-bg/50 p-4 sm:items-center sm:justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel w-full max-w-md rounded-[var(--radius-xl)] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] text-hud uppercase",
							children: "Sky is yours"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl",
							children: "Superheavy inbound"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-6 min-h-11",
							onClick: won,
							children: "Walk the pad"
						})
					]
				})
			}) : null,
			status === "lost" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto absolute inset-0 flex items-end bg-bg/50 p-4 sm:items-center sm:justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel w-full max-w-md rounded-[var(--radius-xl)] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] text-danger uppercase",
							children: "Lost the sky"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl",
							children: "They took the pad"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "min-h-11",
								onClick: () => {
									reset();
									start();
								},
								children: "Retry"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "min-h-11",
								onClick: lost,
								children: "New site"
							})]
						})
					]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchPad, {})
		]
	});
}
function Bar({ label, value, max, danger }) {
	const pct = Math.max(0, Math.min(100, value / max * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between text-[11px] text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hud-num",
			children: Math.round(value)
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 h-1 overflow-hidden rounded-full bg-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: danger ? "h-full bg-danger" : "h-full bg-hud",
			style: { width: `${pct}%` }
		})
	})] });
}
function TouchPad() {
	const hold = useFight((s) => s.hold);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto absolute bottom-4 left-3 right-3 flex justify-between gap-2 md:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11",
					onPointerDown: () => hold("KeyA", true),
					onPointerUp: () => hold("KeyA", false),
					children: "A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11",
					onPointerDown: () => hold("KeyW", true),
					onPointerUp: () => hold("KeyW", false),
					children: "W"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11",
					onPointerDown: () => hold("KeyD", true),
					onPointerUp: () => hold("KeyD", false),
					children: "D"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "min-h-11",
			onPointerDown: () => hold("Space", true),
			onPointerUp: () => hold("Space", false),
			children: "Fire"
		})]
	});
}
var R = 2.2;
function latLonToVec(lat, lon, r = R) {
	const la = lat * Math.PI / 180;
	const lo = lon * Math.PI / 180;
	return new Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
}
function GlobeCanvas() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		camera: {
			position: [
				0,
				.6,
				6.4
			],
			fov: 38,
			near: .1,
			far: 80
		},
		gl: {
			antialias: true,
			alpha: false
		},
		dpr: [1, 1.5],
		style: {
			position: "absolute",
			inset: 0,
			touchAction: "none"
		},
		onCreated: ({ gl }) => gl.setClearColor("#09070a"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
				attach: "background",
				args: ["#09070a"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .28 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					6,
					4,
					8
				],
				intensity: 2.1,
				color: "#ffe4c4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
				radius: 40,
				depth: 20,
				count: 1200,
				factor: 2.2,
				fade: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mars, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pins, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rig, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
				enablePan: false,
				minDistance: 4.2,
				maxDistance: 11,
				enableDamping: true,
				autoRotate: false
			})
		]
	});
}
function Mars() {
	const tex = useLoader(TextureLoader, "/textures/mars.png");
	tex.colorSpace = SRGBColorSpace;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
		R,
		64,
		48
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
		map: tex,
		roughness: .92,
		metalness: .04
	})] });
}
function Pins() {
	const picking = useMission((s) => s.picking);
	const lookId = useMission((s) => s.lookId);
	const site = useMission((s) => s.site);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: SITES.map((s) => {
		const p = latLonToVec(s.lat, s.lon, 2.24);
		const active = lookId === s.id || site?.id === s.id;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: p.toArray(),
			onClick: (e) => {
				e.stopPropagation();
				const m = useMission.getState();
				m.lookAt(s.id);
				if (m.picking) m.propose(s);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				.035,
				10,
				8
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: active ? "#9dba7a" : "#f0e6d8" })] }), picking && active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
				.07,
				.1,
				20
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: "#9dba7a",
				side: 2
			})] }) : null]
		}, s.id);
	}) });
}
function Rig() {
	const lookId = useMission((s) => s.lookId);
	const target = (0, import_react.useMemo)(() => new Vector3(), []);
	const tmp = (0, import_react.useRef)(new Vector3());
	useFrame(({ camera }, dt) => {
		const id = lookId;
		const site = SITES.find((s) => s.id === id);
		if (!site) return;
		const p = latLonToVec(site.lat, site.lon, 5.4);
		target.lerp(p, 1 - Math.exp(-dt * 1.8));
		camera.position.lerp(target, 1 - Math.exp(-dt * 1.4));
		tmp.current.set(0, 0, 0);
		camera.lookAt(tmp.current);
	});
	return null;
}
function GlobeOverlay() {
	const phase = useMission((s) => s.phase);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10",
		children: [phase === "boot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recon, {}), phase === "confirm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Confirm, {}) : null]
	});
}
function Boot() {
	const begin = useMission((s) => s.begin);
	const say = useJuno((s) => s.say);
	(0, import_react.useEffect)(() => {
		say("hello");
	}, [say]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 flex items-end bg-bg/35 p-4 sm:items-center sm:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel max-w-lg rounded-[var(--radius-xl)] p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
					children: "GrokMars"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl font-semibold",
					children: "Pick the ground"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Juno flies the planet. You pick a capitol. Hold the sky, then keep three bots alive through dust."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						onClick: begin,
						children: "Begin recon"
					})
				})
			]
		})
	});
}
function Recon() {
	const picking = useMission((s) => s.picking);
	const enterPick = useMission((s) => s.enterPick);
	const lookAt = useMission((s) => s.lookAt);
	const propose = useMission((s) => s.propose);
	const finishTours = useMission((s) => s.finishTours);
	const say = useJuno((s) => s.say);
	const hush = useJuno((s) => s.hush);
	const [touring, setTouring] = (0, import_react.useState)(false);
	async function runTour() {
		setTouring(true);
		for (const step of TOUR) {
			if (step.look) lookAt(step.look);
			await say(step.id);
		}
		finishTours();
		setTouring(false);
	}
	function onDest(id) {
		const site = SITES.find((s) => s.id === id);
		if (!site) return;
		lookAt(site.id);
		say(`ask-${site.id}`);
		if (picking) propose(site);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "pointer-events-auto absolute top-0 left-0 z-20 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
				children: "GrokMars · Recon"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "Mars"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-xs text-muted",
				children: picking ? "Green ring is a capitol pick. Confirm, then hold the sky." : "Tours are baked. Skip when you know the ground."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "min-h-11",
					disabled: touring,
					onClick: () => void runTour(),
					children: touring ? "Touring" : "Tour"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					className: "min-h-11",
					onClick: () => {
						hush();
						enterPick();
					},
					children: "Pick a site"
				})]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute right-3 bottom-4 left-3 md:right-[unset] md:w-72",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "panel block rounded-[var(--radius-md)] p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] text-accent uppercase",
				children: "Destination"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: "mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm text-fg",
				defaultValue: "",
				onChange: (e) => {
					if (e.target.value) onDest(e.target.value);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					disabled: true,
					children: "Named pads"
				}), SITES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: s.id,
					children: s.name
				}, s.id))]
			})]
		})
	})] });
}
function Confirm() {
	const site = useMission((s) => s.site);
	const cancel = useMission((s) => s.cancelConfirm);
	const fight = useMission((s) => s.confirmFight);
	const say = useJuno((s) => s.say);
	(0, import_react.useEffect)(() => {
		if (site) say(`stop-${site.id}`);
	}, [site, say]);
	if (!site) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 z-40 flex items-end bg-bg/55 p-4 sm:items-center sm:justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-md rounded-[var(--radius-xl)] p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] text-danger uppercase",
					children: "Contest"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-semibold",
					children: "Are you sure?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						site.name,
						". ",
						site.note,
						" China wants this pad. Hold the sky or lose the colony."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						onClick: () => {
							say("fight");
							fight();
						},
						children: "Hold the sky"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "min-h-11",
						onClick: cancel,
						children: "Another site"
					})]
				})
			]
		})
	});
}
function JunoPortrait() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative h-full min-h-[14rem] w-full overflow-hidden bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
			camera: {
				position: [
					0,
					1.42,
					1.55
				],
				fov: 22,
				near: .05,
				far: 20
			},
			gl: {
				antialias: true,
				alpha: false
			},
			dpr: [1, 1.5],
			onCreated: ({ gl, camera }) => {
				gl.setClearColor("#2a1f18");
				camera.lookAt(0, 1.38, 0);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .55 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
					position: [
						1.4,
						2.2,
						2.4
					],
					intensity: 1.6,
					color: "#ffe4c4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
					"#f0c8a0",
					"#3a2218",
					.4
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: null,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JunoVrm, {})
				})
			]
		})
	});
}
function JunoVrm() {
	const group = (0, import_react.useRef)(null);
	const vrmRef = (0, import_react.useRef)(null);
	const speaking = useJuno((s) => s.speaking);
	(0, import_react.useEffect)(() => {
		const loader = new GLTFLoader();
		loader.register((parser) => new VRMLoaderPlugin(parser));
		let dead = false;
		loader.loadAsync("/juno/Juno.vrm").then((gltf) => {
			if (dead) return;
			const vrm = gltf.userData.vrm;
			VRMUtils.removeUnnecessaryVertices(gltf.scene);
			VRMUtils.rotateVRM0(vrm);
			vrm.scene.rotation.y = Math.PI;
			vrm.scene.traverse((o) => {
				o.frustumCulled = false;
			});
			vrmRef.current = vrm;
			group.current?.add(vrm.scene);
		});
		return () => {
			dead = true;
			if (vrmRef.current) {
				vrmRef.current.scene.removeFromParent();
				vrmRef.current = null;
			}
		};
	}, []);
	useFrame((_, dt) => {
		const vrm = vrmRef.current;
		if (!vrm) return;
		const t = performance.now() / 1e3;
		const look = speaking ? .08 : .03;
		vrm.humanoid?.getNormalizedBoneNode("neck")?.rotation.set(Math.sin(t * .6) * .03, Math.sin(t * .35) * look, 0);
		const jaw = vrm.humanoid?.getNormalizedBoneNode("jaw");
		if (jaw) jaw.rotation.x = speaking ? .08 + Math.abs(Math.sin(t * 10)) * .14 : .02;
		vrm.update(dt);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref: group,
		position: [
			0,
			-.08,
			0
		]
	});
}
function JunoRail() {
	const caption = useJuno((s) => s.caption);
	const speaking = useJuno((s) => s.speaking);
	const speakText = useJuno((s) => s.speakText);
	const [q, setQ] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onAsk(e) {
		e.preventDefault();
		const text = q.trim();
		if (!text || busy) return;
		setBusy(true);
		setQ("");
		try {
			const body = await (await fetch("/api/juno/ask", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text })
			})).json();
			const reply = body.ok ? body.text ?? "" : body.error ?? "Brain stalled.";
			await speakText(reply);
		} catch {
			await speakText("I am dark. Try the tours.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex h-full min-h-0 w-full flex-col border-l border-border bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-[13rem] shrink-0 md:min-h-0 md:flex-[1.15]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JunoPortrait, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-3 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
					children: "Juno · Eve"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "min-h-[4.5rem] overflow-y-auto text-sm leading-relaxed text-fg",
					children: caption
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] text-subtle",
					children: speaking ? "Speaking" : "Idle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: onAsk,
					className: "mt-auto flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Ask Juno",
						className: "min-h-11 flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "min-h-11",
						disabled: busy,
						children: "Ask"
					})]
				})
			]
		})]
	});
}
function Game() {
	const phase = useMission((s) => s.phase);
	const enterYard = useMission((s) => s.enterYard);
	(0, import_react.useEffect)(() => {
		const qa = new URLSearchParams(window.location.search).get("qa");
		if (qa === "yard" || qa === "ground") useMission.getState().skipToYard();
		if (qa === "fight") useMission.getState().skipToFight();
	}, []);
	(0, import_react.useEffect)(() => {
		if (phase === "fight") useFight.getState().reset();
	}, [phase]);
	if (phase === "fight") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh overflow-hidden bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CombatCanvas, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CombatOverlay, {})]
	});
	if (phase === "landing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "relative flex h-dvh items-end bg-bg p-6 text-fg sm:items-center sm:justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel max-w-lg rounded-[var(--radius-xl)] p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
					children: "Entry"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl font-semibold",
					children: "Superheavy on the pad"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Three Optimus on the ramp. Local basalt is shielding. Dust will bleed their charge. The next ship brings three more."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6 min-h-11",
					onClick: enterYard,
					children: "Walk the pad"
				})
			]
		})
	});
	if (phase === "yard") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh overflow-hidden bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColonyCanvas, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColonyOverlay, {})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg md:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-h-0 min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeCanvas, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeOverlay, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-[38vh] shrink-0 md:h-full md:w-[min(32vw,22rem)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JunoRail, {})
		})]
	});
}
//#endregion
export { Game };
