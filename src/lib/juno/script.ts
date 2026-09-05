export type LineId =
  | "hello"
  | "tour-mars"
  | "tour-capitol"
  | "tour-colony"
  | "tour-ice"
  | "tour-terraform"
  | "tour-done"
  | "fight"
  | "landing"
  | "lost"
  | `ask-${string}`
  | `stop-${string}`;

export const HELLO =
  "Hello, I am Juno, your personal Mars terraforming AI assistant. Our first mission is to choose a colony site. Would you like to take some tours to learn about Mars and its best sites to host a colony? Just let me know what you want to do first.";

export const LINES: Record<string, string> = {
  hello: HELLO,
  "tour-mars":
    "Mars itself. Not the flag. I will fly Olympus, the canyon, Hellas, Gale, and the north cap. Listen at each stop.",
  "tour-capitol": "A capitol wants ice, air, and a pad the Starship can keep.",
  "tour-colony": "Colony pads sit on honest ground. Jezero is mapped. Utopia is wet. Olympus is a postcard.",
  "tour-ice": "Ice is the well. Polar night taxes you. Mid-latitude plains are slower and safer.",
  "tour-terraform": "Terraform is later. First you keep three bots alive through dust.",
  "tour-done": "Briefing closed. Pick a crater. I will not lie about the ice.",
  fight:
    "They want the same site. Hold the sky or they take the colony. A banks left. D banks right. W is throttle. Fire is the trigger.",
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
  "stop-arabia": "Arabia. Import ice or go home.",
};

export const TOUR: { id: LineId; look: string | null }[] = [
  { id: "hello", look: null },
  { id: "tour-mars", look: "olympus" },
  { id: "tour-capitol", look: "jezero" },
  { id: "tour-colony", look: "utopia" },
  { id: "tour-ice", look: "npole" },
  { id: "tour-terraform", look: "hellas" },
  { id: "tour-done", look: null },
];
