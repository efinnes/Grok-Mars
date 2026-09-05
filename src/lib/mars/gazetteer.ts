export type ColonySite = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  ice: number;
  risk: string;
  note: string;
};

export const SITES: ColonySite[] = [
  { id: "jezero", name: "Jezero Crater", lat: 18.4, lon: 77.5, ice: 6, risk: "contest", note: "Delta. Maps are good. Thin ice." },
  { id: "utopia", name: "Utopia Planitia", lat: 47, lon: 118, ice: 11, risk: "storms", note: "Ice plains. Honest water." },
  { id: "acidalia", name: "Acidalia Planitia", lat: 50, lon: -20, ice: 11, risk: "cold", note: "Ice without polar night." },
  { id: "hellas", name: "Hellas Basin", lat: -42, lon: 71, ice: 9, risk: "terrain", note: "Thickest air on the map." },
  { id: "olympus", name: "Olympus Mons", lat: 19, lon: -134, ice: 4, risk: "prestige", note: "Flag, not a well." },
  { id: "valles", name: "Valles Marineris", lat: -10, lon: -72, ice: 4, risk: "landing", note: "Shelter in the wound." },
  { id: "gale", name: "Gale Crater", lat: -5.4, lon: 137.8, ice: 4, risk: "dry", note: "Sun for arrays. Thin ice." },
  { id: "npole", name: "North Polar Cap", lat: 85, lon: 0, ice: 16, risk: "night", note: "The well. Polar night tax." },
  { id: "isidis", name: "Isidis Planitia", lat: 13, lon: 87, ice: 6, risk: "quiet", note: "Pad next to Jezero." },
  { id: "arabia", name: "Arabia Terra", lat: 21, lon: 6, ice: 6, risk: "import", note: "Clay, not a well." },
];

export const DEFAULT_SITE = SITES[0]!;

export function siteById(id: string) {
  return SITES.find((s) => s.id === id) ?? DEFAULT_SITE;
}

const SITE_ALIAS: [string, string][] = [
  ["north polar", "npole"],
  ["north pole", "npole"],
  ["polar cap", "npole"],
  ["marineris", "valles"],
  ["canyon", "valles"],
  ["olympus", "olympus"],
];

export function mentionSite(text: string): ColonySite | null {
  const t = text.toLowerCase();
  for (const s of SITES) {
    if (t.includes(s.name.toLowerCase()) || t.includes(s.id)) return s;
  }
  for (const [alias, id] of SITE_ALIAS) {
    if (t.includes(alias)) return siteById(id);
  }
  return null;
}
