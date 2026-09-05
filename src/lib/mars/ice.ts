import type { ColonySite } from "./gazetteer";

export function iceCountFor(site: ColonySite) {
  return Math.max(4, Math.min(16, Math.round(site.ice)));
}
