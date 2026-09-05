import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SITES } from "@/lib/mars/gazetteer";
import { useJuno } from "@/lib/juno/store";
import { HELLO, TOUR } from "@/lib/juno/script";
import { useMission } from "@/lib/mission-store";

const TOURS: { id: string; label: string; steps: { id: string; look: string | null }[] }[] = [
  { id: "mars", label: "Mars", steps: TOUR.filter((s) => s.id !== "hello") },
  {
    id: "colony",
    label: "Colony pads",
    steps: [
      { id: "tour-colony", look: "jezero" },
      { id: "tour-capitol", look: "utopia" },
      { id: "ask-gale", look: "gale" },
    ],
  },
  {
    id: "ice",
    label: "Ice",
    steps: [
      { id: "tour-ice", look: "npole" },
      { id: "ask-utopia", look: "utopia" },
      { id: "ask-acidalia", look: "acidalia" },
    ],
  },
  {
    id: "terraform",
    label: "Terraform",
    steps: [
      { id: "tour-terraform", look: "hellas" },
      { id: "tour-done", look: "jezero" },
    ],
  },
];

export function GlobeOverlay() {
  const phase = useMission((s) => s.phase);
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {phase === "boot" ? <Boot /> : <Recon />}
      {phase === "confirm" ? <Confirm /> : null}
    </div>
  );
}

function Boot() {
  const begin = useMission((s) => s.begin);
  const speakText = useJuno((s) => s.speakText);
  const [trailer, setTrailer] = useState(false);
  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    void speakText(HELLO);
  }, [speakText]);
  return (
    <>
      <div className="absolute inset-0 flex items-end p-5 sm:items-center sm:p-8">
        <div className="pointer-events-auto relative z-20 max-w-xl">
          <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">Phase 0 — Reconnaissance</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">GROK MARS</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Fly the ellipsoid.
            <br />
            Listen to Juno.
            <br />
            Learn the ground before anyone tries to change it.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Button className="min-h-11" variant="accent" onClick={begin}>
              Enter mission
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => setTrailer(true)}>
              Save trailer
            </Button>
          </div>
          <p className="mt-5 font-mono text-[10px] tracking-wide text-subtle">Drag to orbit · scroll to zoom</p>
        </div>
      </div>
      {trailer ? <Trailer onClose={() => setTrailer(false)} /> : null}
    </>
  );
}

function Recon() {
  const picking = useMission((s) => s.picking);
  const enterPick = useMission((s) => s.enterPick);
  const lookAt = useMission((s) => s.lookAt);
  const propose = useMission((s) => s.propose);
  const finishTours = useMission((s) => s.finishTours);
  const say = useJuno((s) => s.say);
  const hush = useJuno((s) => s.hush);
  const [touring, setTouring] = useState<string | null>(null);

  async function runTour(id: string) {
    const tour = TOURS.find((t) => t.id === id);
    if (!tour) return;
    hush();
    setTouring(id);
    for (const step of tour.steps) {
      if (step.look) lookAt(step.look);
      await say(step.id);
    }
    finishTours();
    setTouring(null);
  }

  function onDest(id: string) {
    const site = SITES.find((s) => s.id === id);
    if (!site) return;
    hush();
    lookAt(site.id);
    void say(`ask-${site.id}`);
    if (picking) propose(site);
  }

  return (
    <>
      <header className="pointer-events-auto absolute top-0 left-0 z-20 max-w-[min(100%,22rem)] p-4 sm:p-5">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">Phase 0 — Reconnaissance</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">GROK MARS</h1>
        <p className="mt-1 max-w-sm text-xs text-muted">
          {picking ? "Green ring is a capitol pick. Confirm, then hold the sky." : "Ask Juno for a tour, or pick a site when you are ready."}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TOURS.map((t) => (
            <Button key={t.id} size="sm" variant={touring === t.id ? "accent" : "outline"} className="min-h-11" disabled={!!touring} onClick={() => void runTour(t.id)}>
              {touring === t.id ? "Touring…" : t.label}
            </Button>
          ))}
          <Button
            size="sm"
            className="min-h-11"
            onClick={() => {
              hush();
              setTouring(null);
              enterPick();
            }}
          >
            Pick a site
          </Button>
        </div>
      </header>
      <div className="pointer-events-auto absolute bottom-4 left-3 z-20 w-[min(calc(100%-1.5rem),18rem)]">
        <label className="panel block rounded-[var(--radius-md)] p-3">
          <span className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">Destination</span>
          <select
            className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm text-fg"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onDest(e.target.value);
            }}
          >
            <option value="" disabled>
              Named pads
            </option>
            {SITES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 px-1 font-mono text-[10px] text-subtle">Drag to orbit · scroll to zoom</p>
      </div>
    </>
  );
}

function Confirm() {
  const site = useMission((s) => s.site);
  const cancel = useMission((s) => s.cancelConfirm);
  const fight = useMission((s) => s.confirmFight);
  const say = useJuno((s) => s.say);
  useEffect(() => {
    if (site) void say(`stop-${site.id}`);
  }, [site, say]);
  if (!site) return null;
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-end bg-bg/55 p-4 sm:items-center sm:justify-center">
      <div className="panel w-full max-w-md rounded-[var(--radius-xl)] p-6">
        <p className="font-mono text-[10px] text-danger uppercase">Contest</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">Are you sure?</h2>
        <p className="mt-3 text-sm text-muted">
          {site.name}. {site.note} China wants this pad. Hold the sky or lose the colony.
        </p>
        <div className="mt-6 flex gap-2">
          <Button
            className="min-h-11"
            onClick={() => {
              void say("fight");
              fight();
            }}
          >
            Hold the sky
          </Button>
          <Button variant="outline" className="min-h-11" onClick={cancel}>
            Another site
          </Button>
        </div>
      </div>
    </div>
  );
}

function Trailer({ onClose }: { onClose: () => void }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4">
      <div className="w-full max-w-3xl">
        <video src="/cinematics/trailer.mp4" className="w-full rounded-[var(--radius-lg)]" controls autoPlay playsInline />
        <div className="mt-3 flex justify-end">
          <Button variant="outline" className="min-h-11" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
