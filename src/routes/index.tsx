import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export const Route = createFileRoute("/")({ component: Home });

const gameMod = typeof window !== "undefined" ? import("@/components/game/game") : null;

function Home() {
  const [App, setApp] = useState<ComponentType | null>(null);
  useEffect(() => {
    void gameMod?.then((m) => setApp(() => m.Game));
  }, []);
  if (!App) {
    return (
      <main className="flex h-dvh flex-col justify-end bg-bg p-6 text-fg">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">Phase 0 — Reconnaissance</p>
        <h1 className="mt-2 font-display text-5xl font-semibold">GROK MARS</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Fly the ellipsoid.
          <br />
          Listen to Juno.
          <br />
          Learn the ground before anyone tries to change it.
        </p>
        <p className="mt-6 text-sm text-accent">Enter mission</p>
      </main>
    );
  }
  return <App />;
}
