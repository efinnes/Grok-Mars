import { useEffect } from "react";
import { ColonyCanvas } from "@/components/colony/colony-canvas";
import { ColonyOverlay } from "@/components/colony/colony-overlay";
import { CombatCanvas } from "@/components/combat/combat-canvas";
import { CombatOverlay } from "@/components/combat/combat-overlay";
import { GlobeCanvas } from "@/components/globe/globe-canvas";
import { GlobeOverlay } from "@/components/globe/globe-overlay";
import { JunoRail } from "@/components/juno/juno-rail";
import { Button } from "@/components/ui/button";
import { useFight } from "@/lib/combat/fight-store";
import { useMission } from "@/lib/mission-store";

export function Game() {
  const phase = useMission((s) => s.phase);
  const enterYard = useMission((s) => s.enterYard);

  useEffect(() => {
    const qa = new URLSearchParams(window.location.search).get("qa");
    if (qa === "yard" || qa === "ground") useMission.getState().skipToYard();
    if (qa === "fight") useMission.getState().skipToFight();
  }, []);

  useEffect(() => {
    if (phase === "fight") useFight.getState().reset();
  }, [phase]);

  if (phase === "fight") {
    return (
      <main className="relative h-dvh overflow-hidden bg-bg text-fg">
        <CombatCanvas />
        <CombatOverlay />
      </main>
    );
  }
  if (phase === "landing") {
    return (
      <main className="relative flex h-dvh items-end bg-bg p-6 text-fg sm:items-center sm:justify-center">
        <div className="panel max-w-lg rounded-[var(--radius-xl)] p-6">
          <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">Entry</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Superheavy on the pad</h1>
          <p className="mt-3 text-sm text-muted">
            Three Optimus on the ramp. Local basalt is shielding. Dust will bleed their charge. The next ship brings three more.
          </p>
          <Button className="mt-6 min-h-11" onClick={enterYard}>
            Walk the pad
          </Button>
        </div>
      </main>
    );
  }
  if (phase === "yard") {
    return (
      <main className="relative h-dvh overflow-hidden bg-bg text-fg">
        <ColonyCanvas />
        <ColonyOverlay />
      </main>
    );
  }
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-bg text-fg md:flex-row">
      <div className="relative min-h-0 min-w-0 flex-1 cursor-grab active:cursor-grabbing">
        <GlobeCanvas />
        <GlobeOverlay />
      </div>
      <div className="h-[38vh] shrink-0 md:h-full md:w-[min(32vw,22rem)]">
        <JunoRail />
      </div>
    </main>
  );
}
