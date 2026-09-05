import { create } from "zustand";
import { DEFAULT_SITE, siteById, type ColonySite } from "@/lib/mars/gazetteer";
import { useYard } from "@/lib/colony/yard-store";

export type Phase = "boot" | "globe" | "confirm" | "fight" | "landing" | "yard";

type MissionState = {
  phase: Phase;
  site: ColonySite | null;
  picking: boolean;
  toursDone: boolean;
  lookId: string | null;
  guiding: boolean;
  begin: () => void;
  finishTours: () => void;
  enterPick: () => void;
  lookAt: (id: string | null) => void;
  releaseGuide: () => void;
  propose: (site: ColonySite) => void;
  cancelConfirm: () => void;
  confirmFight: () => void;
  fightWon: () => void;
  fightLost: () => void;
  enterYard: () => void;
  backToGlobe: () => void;
  skipToYard: (id?: string) => void;
  skipToFight: (id?: string) => void;
};

export const useMission = create<MissionState>((set, get) => ({
  phase: "boot",
  site: null,
  picking: false,
  toursDone: false,
  lookId: null,
  guiding: false,
  begin: () => set({ phase: "globe", picking: false }),
  finishTours: () => set({ toursDone: true, picking: true, guiding: false }),
  enterPick: () => set({ picking: true, toursDone: true, phase: "globe" }),
  lookAt: (lookId) => set({ lookId, guiding: lookId != null }),
  releaseGuide: () => set({ guiding: false }),
  propose: (site) => set({ site, phase: "confirm", lookId: site.id, guiding: true }),
  cancelConfirm: () => set({ phase: "globe", picking: true, guiding: false }),
  confirmFight: () => set({ phase: "fight", guiding: false }),
  fightWon: () => set({ phase: "landing", guiding: false }),
  fightLost: () => set({ phase: "globe", picking: true, guiding: false }),
  enterYard: () => {
    const site = get().site ?? DEFAULT_SITE;
    useYard.getState().init(site);
    set({ phase: "yard", site, picking: false, guiding: false });
  },
  backToGlobe: () => {
    useYard.setState({ started: false, ready: false });
    set({ phase: "globe", picking: true, site: null, lookId: null, guiding: false });
  },
  skipToYard: (id) => {
    const site = siteById(id ?? DEFAULT_SITE.id);
    useYard.getState().init(site);
    set({ phase: "yard", site, picking: false, toursDone: true, guiding: false });
  },
  skipToFight: (id) => {
    const site = siteById(id ?? DEFAULT_SITE.id);
    set({ phase: "fight", site, picking: false, toursDone: true, lookId: site.id, guiding: false });
  },
}));

if (typeof window !== "undefined") {
  (window as unknown as { __mission?: typeof useMission }).__mission = useMission;
}
