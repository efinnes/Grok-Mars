import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CN_HP, US_HP, installControlsProbe, useFight } from "@/lib/combat/fight-store";
import { useJuno } from "@/lib/juno/store";
import { useMission } from "@/lib/mission-store";

export function CombatOverlay() {
  const status = useFight((s) => s.status);
  const usHp = useFight((s) => s.usHp);
  const cnHp = useFight((s) => s.cnHp);
  const start = useFight((s) => s.start);
  const reset = useFight((s) => s.reset);
  const won = useMission((s) => s.fightWon);
  const lost = useMission((s) => s.fightLost);
  const say = useJuno((s) => s.say);
  const site = useMission((s) => s.site);

  useEffect(() => {
    installControlsProbe();
  }, []);

  useEffect(() => {
    if (status === "won") void say("landing");
    if (status === "lost") void say("lost");
  }, [status, say]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <header className="pointer-events-none absolute top-0 left-0 p-4">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">Intercept · {site?.name ?? "Pad"}</p>
        <h1 className="font-display text-2xl font-semibold">Hold the sky</h1>
        <p className="mt-1 text-xs text-muted">A left · D right · W throttle · click fire</p>
      </header>
      <div className="absolute top-4 right-3 w-44">
        <div className="panel space-y-2 rounded-[var(--radius-md)] p-3">
          <Bar label="Interceptor" value={usHp} max={US_HP} />
          <Bar label="Colonizer" value={cnHp} max={CN_HP} danger />
        </div>
      </div>
      {status === "idle" ? (
        <div className="pointer-events-auto absolute inset-0 flex items-end bg-bg/45 p-4 sm:items-center sm:justify-center">
          <div className="panel w-full max-w-md rounded-[var(--radius-xl)] p-6">
            <p className="font-mono text-[10px] text-accent uppercase">Training wheels</p>
            <h2 className="mt-2 font-display text-3xl">Weapons free</h2>
            <p className="mt-3 text-sm text-muted">
              A banks left. D banks right. W is throttle. Click to fire red lasers. They miss more than you.
            </p>
            <Button className="mt-6 min-h-11" onClick={start}>
              Engage
            </Button>
          </div>
        </div>
      ) : null}
      {status === "won" ? (
        <div className="pointer-events-auto absolute inset-0 flex items-end bg-bg/50 p-4 sm:items-center sm:justify-center">
          <div className="panel w-full max-w-md rounded-[var(--radius-xl)] p-6">
            <p className="font-mono text-[10px] text-hud uppercase">Sky is yours</p>
            <h2 className="mt-2 font-display text-3xl">Superheavy inbound</h2>
            <Button className="mt-6 min-h-11" onClick={won}>
              Walk the pad
            </Button>
          </div>
        </div>
      ) : null}
      {status === "lost" ? (
        <div className="pointer-events-auto absolute inset-0 flex items-end bg-bg/50 p-4 sm:items-center sm:justify-center">
          <div className="panel w-full max-w-md rounded-[var(--radius-xl)] p-6">
            <p className="font-mono text-[10px] text-danger uppercase">Lost the sky</p>
            <h2 className="mt-2 font-display text-3xl">They took the pad</h2>
            <div className="mt-6 flex gap-2">
              <Button
                className="min-h-11"
                onClick={() => {
                  reset();
                  start();
                }}
              >
                Retry
              </Button>
              <Button variant="outline" className="min-h-11" onClick={lost}>
                New site
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <TouchPad />
    </div>
  );
}

function Bar({ label, value, max, danger }: { label: string; value: number; max: number; danger?: boolean }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted">
        <span>{label}</span>
        <span className="hud-num">{Math.round(value)}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
        <div className={danger ? "h-full bg-danger" : "h-full bg-hud"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TouchPad() {
  const hold = useFight((s) => s.hold);
  return (
    <div className="pointer-events-auto absolute bottom-4 left-3 right-3 flex justify-between gap-2 md:hidden">
      <div className="flex gap-1">
        <Button className="min-h-11" onPointerDown={() => hold("KeyA", true)} onPointerUp={() => hold("KeyA", false)}>
          A
        </Button>
        <Button className="min-h-11" onPointerDown={() => hold("KeyW", true)} onPointerUp={() => hold("KeyW", false)}>
          W
        </Button>
        <Button className="min-h-11" onPointerDown={() => hold("KeyD", true)} onPointerUp={() => hold("KeyD", false)}>
          D
        </Button>
      </div>
      <Button className="min-h-11" onPointerDown={() => hold("Space", true)} onPointerUp={() => hold("Space", false)}>
        Fire
      </Button>
    </div>
  );
}
