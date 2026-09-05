import { useEffect, type ReactNode } from "react";
import { Battery, Box, Bot, Droplets, Mountain, Timer, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATALOG, CHARGE_PAD, ICE_CAP, KILO_PIT, METAL_CAP, REG_CAP, SEEDS } from "@/lib/colony/types";
import { catalogItem, crewReadyOf, fmtSols, hasGreenhouse, hasRelay, placeCursor, solsUntilResupply, useYard } from "@/lib/colony/yard-store";
import { useMission } from "@/lib/mission-store";
import { cn } from "@/lib/utils";

export function ColonyOverlay() {
  const started = useYard((s) => s.started);
  const dead = useYard((s) => s.dead);
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <YardSim />
      {!started ? <StartGate /> : null}
      {started && dead ? <DeathGate /> : null}
      {started && !dead ? (
        <>
          <StormBanner />
          <TopHud />
          <Meters />
          <PrintHud />
          <PlaceHud />
          <CrewRoster />
          <Notice />
          <Panels />
        </>
      ) : null}
    </div>
  );
}

function YardSim() {
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let pacc = 0;
    let tacc = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.08);
      last = now;
      const y = useYard.getState();
      if (!y.started || y.dead) return;
      acc += dt;
      pacc += dt;
      tacc += dt;
      if (pacc >= 0.2) {
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
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-end bg-bg/55 p-4 sm:items-center sm:justify-center">
      <div className="panel w-full max-w-lg rounded-[var(--radius-xl)] p-6">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">GrokMars · Phase 1</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Keep the capitol alive</h1>
        <p className="mt-3 text-sm text-muted">
          Dust will come and bleed charge. Those dark rocks are basalt — sinter them into a radiation berm before humans.
          The second Starship drops three more Optimus.
        </p>
        <Button className="mt-6 min-h-11" onClick={start}>
          Walk the pad
        </Button>
      </div>
    </div>
  );
}

function DeathGate() {
  const restart = useYard((s) => s.restart);
  const death = useYard((s) => s.death);
  const back = useMission((s) => s.backToGlobe);
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-end bg-bg/70 p-4 sm:items-center sm:justify-center">
      <div className="panel w-full max-w-md rounded-[var(--radius-xl)] p-6">
        <p className="font-mono text-[10px] text-danger uppercase">Capitol dark</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">{death === "air" ? "The air ran out" : "The bots went dry"}</h2>
        <div className="mt-5 flex gap-2">
          <Button className="min-h-11" onClick={restart}>
            Restart
          </Button>
          <Button variant="outline" className="min-h-11" onClick={back}>
            New site
          </Button>
        </div>
      </div>
    </div>
  );
}

function StormBanner() {
  const storm = useYard((s) => s.storming);
  if (!storm) return null;
  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex justify-center p-3">
      <p className="rounded-full border border-danger bg-bg/80 px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-danger uppercase">
        Dust storm · charge bleed · solar blind
      </p>
    </div>
  );
}

function TopHud() {
  const quests = useYard((s) => s.quests);
  const sol = useYard((s) => s.calendarSol);
  const open = useYard((s) => s.openPanel);
  const site = useYard((s) => s.site?.name);
  const active = quests.find((q) => q.status === "active");
  return (
    <header className="pointer-events-auto absolute top-0 left-0 z-20 p-4">
      <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">
        GrokMars · {site ?? "Capitol"} · Sol {sol.toFixed(1)}
      </p>
      <h1 className="font-display text-2xl font-semibold">Surface yard</h1>
      <p className="mt-1 max-w-sm text-xs text-muted">{active?.title ?? "Keep the pad alive."}</p>
      <div className="mt-2 flex gap-1">
        <Button size="sm" className="min-h-11" onClick={() => open("ship")}>
          Starship
        </Button>
        <Button size="sm" variant="ghost" className="min-h-11" onClick={() => open("dome")}>
          Dome
        </Button>
      </div>
    </header>
  );
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
  return (
    <div className="pointer-events-none absolute top-4 right-3 w-44 sm:w-52">
      <div className="panel space-y-2 rounded-[var(--radius-md)] p-3">
        <Meter icon={<Box className="size-3.5" />} label="Metal" value={metal} max={METAL_CAP} />
        <Meter icon={<Mountain className="size-3.5" />} label="Regolith" value={reg} max={REG_CAP} />
        <Meter icon={<Droplets className="size-3.5" />} label="Ice" value={ice} max={ICE_CAP} frac danger={ice < 0.4} />
        <Meter icon={<Wind className="size-3.5" />} label={humans.length ? "Habitat air" : "Air tanks"} value={air} max={100} danger={!!humans.length && air < 40} />
        <Meter icon={<Battery className="size-3.5" />} label={storm ? "Power · storm" : "Power"} value={power} max={100} danger={brownout || storm} />
      </div>
    </div>
  );
}

function Meter({
  icon,
  label,
  value,
  max,
  danger,
  frac,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  max: number;
  danger?: boolean;
  frac?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className={cn("hud-num", danger && "text-danger")}>{frac ? value.toFixed(1) : Math.round(value)}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full", danger ? "bg-danger" : "bg-hud")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PrintHud() {
  const job = useYard((s) => s.crafting);
  const cancel = useYard((s) => s.cancelCraft);
  if (!job) return null;
  const def = catalogItem(job.id);
  return (
    <div className="pointer-events-auto absolute top-4 left-1/2 z-30 w-[min(100%-2rem,22rem)] -translate-x-1/2">
      <div className="panel p-3">
        <p className="flex items-center gap-1 font-mono text-[10px] text-accent uppercase">
          <Timer className="size-3.5" /> Printer
        </p>
        <p className="font-display text-lg">{def?.name}</p>
        <Button size="sm" variant="ghost" className="mt-2 min-h-11" onClick={cancel}>
          Abort
        </Button>
      </div>
    </div>
  );
}

function PlaceHud() {
  const kind = useYard((s) => s.placing);
  const cancel = useYard((s) => s.cancelPlace);
  if (!kind) return null;
  return (
    <div className="pointer-events-auto absolute top-4 left-1/2 z-30 w-[min(100%-2rem,22rem)] -translate-x-1/2">
      <div className="panel p-3">
        <p className="font-mono text-[10px] text-accent uppercase">Planting</p>
        <p className="text-xs text-muted">{placeCursor.valid ? "Click to seat." : "Move inside the ring."}</p>
        <Button size="sm" variant="ghost" className="mt-2 min-h-11" onClick={cancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Notice() {
  const notice = useYard((s) => s.notice);
  const storm = useYard((s) => s.storming);
  if (!notice && !storm) return null;
  return (
    <p className="pointer-events-none absolute bottom-4 left-1/2 z-30 w-[min(calc(100%-2rem),22rem)] -translate-x-1/2 panel rounded-[var(--radius-sm)] px-3 py-2 text-center text-xs md:left-[22rem] md:translate-x-0 md:text-left">
      {storm ? "Dust is on the glass. Bots bleed charge outdoors." : notice}
    </p>
  );
}

function CrewRoster() {
  const bots = useYard((s) => s.bots);
  const sel = useYard((s) => s.sel);
  const select = useYard((s) => s.select);
  const humans = useYard((s) => s.humans);
  return (
    <aside className="pointer-events-auto absolute bottom-4 left-3 z-20 w-[min(calc(100%-1.5rem),20.5rem)]">
      <div className="panel max-h-[min(46vh,28rem)] overflow-y-auto rounded-[var(--radius-lg)] p-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] text-accent uppercase">
          <Bot className="size-3.5" />
          Crew · {bots.length}
        </p>
        <ul className="mt-3 space-y-2">
          {bots.map((b) => {
            const on = sel.kind === "bot" && sel.id === b.id;
            return (
              <li key={b.id} className={cn("rounded-[var(--radius-md)] border border-border p-2", on && "ring-1 ring-accent")}>
                <button type="button" className="flex min-h-11 w-full items-center gap-3 text-left" onClick={() => select(on ? { kind: "none" } : { kind: "bot", id: b.id })}>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between font-mono text-[11px] text-subtle">
                      {b.name}
                      <span className="hud-num">{Math.round(b.charge)}%</span>
                    </span>
                    <span className="block truncate text-sm">{labelJob(b.job, b.carrying)}</span>
                    <span className="mt-1 block h-1 overflow-hidden rounded-full bg-border">
                      <span className="block h-full bg-hud" style={{ width: `${b.charge}%` }} />
                    </span>
                  </span>
                </button>
                {on ? <AssignRow id={b.id} /> : null}
              </li>
            );
          })}
        </ul>
        {humans.length ? (
          <ul className="mt-3 space-y-1 border-t border-border pt-2 text-sm">
            {humans.map((h) => (
              <li key={h.id}>
                {h.name} · {h.role}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}

function AssignRow({ id }: { id: string }) {
  const assign = useYard((s) => s.assignBot);
  const packAt = useYard((s) => s.packAtDome);
  const kiloOn = useYard((s) => s.kiloOn);
  const kiloSeated = useYard((s) => s.kiloSeated);
  const packX = useYard((s) => s.packX);
  const packZ = useYard((s) => s.packZ);
  const kiloX = useYard((s) => s.kiloX);
  const kiloZ = useYard((s) => s.kiloZ);
  const charge = useYard((s) => s.bots.find((b) => b.id === id)?.charge ?? 0);
  const dry = charge < 4;
  return (
    <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-border pt-2">
      <Button size="sm" className="min-h-11" disabled={dry} onClick={() => assign(id, "haulIce")}>
        Haul ice
      </Button>
      <Button size="sm" className="min-h-11" disabled={dry} onClick={() => assign(id, "sweep")}>
        Sweep iron
      </Button>
      <Button size="sm" variant="outline" className="min-h-11" disabled={dry} onClick={() => assign(id, "haulBasalt")}>
        Quarry rock
      </Button>
      {!packAt ? (
        <Button size="sm" variant="outline" className="min-h-11" disabled={dry} onClick={() => assign(id, "haulPack", "pack", packX, packZ)}>
          Haul Megapack
        </Button>
      ) : null}
      {!kiloOn ? (
        <Button
          size="sm"
          className="min-h-11"
          disabled={dry}
          onClick={() => assign(id, kiloSeated ? "install" : "haulKilo", "kilo", kiloSeated ? KILO_PIT.x : kiloX, kiloSeated ? KILO_PIT.z : kiloZ)}
        >
          {kiloSeated ? "Install kilo" : "Haul Kilopower"}
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" className="min-h-11" onClick={() => assign(id, "charge", "charge", CHARGE_PAD.x, CHARGE_PAD.z)}>
        Charge
      </Button>
    </div>
  );
}

function labelJob(job: string, carrying: string | null) {
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
  if (panel === "dome") return <DomePanel />;
  if (panel === "ship") return <ShipPanel />;
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
  return (
    <Modal onClose={() => close("none")}>
      <p className="font-mono text-[10px] text-accent uppercase">Capitol</p>
      <h2 className="mt-2 font-display text-2xl">Floor shop</h2>
      <p className="mt-2 text-sm text-muted">
        Metal {metal} · Regolith {reg} · Ice {ice.toFixed(1)}. Basalt becomes berms. Iron becomes tools.
      </p>
      {green ? (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {SEEDS.map((sd) => (
            <Button key={sd.id} size="sm" variant="outline" className="min-h-11" disabled={seeds[sd.id] < 1} onClick={() => plant(sd.id)}>
              {sd.name} {seeds[sd.id]}
            </Button>
          ))}
          {crops.map((c) => (
            <p key={c.id} className="col-span-2 text-xs text-muted">
              {c.kind} {Math.round(c.t * 100)}%
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-subtle">Seat a greenhouse to plant first-ship seeds.</p>
      )}
      <ul className="mt-4 space-y-2">
        {CATALOG.map((item) => {
          const done = printed.includes(item.id);
          const need = metal < item.cost || reg < item.costReg;
          return (
            <li key={item.id} className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-border p-3">
              <div>
                <p className="text-sm">
                  {item.name}{" "}
                  <span className="hud-num text-[11px] text-muted">
                    {item.cost ? `${item.cost} metal` : ""}
                    {item.costReg ? ` ${item.costReg} regolith` : ""}
                  </span>
                </p>
                <p className="text-xs text-muted">{item.detail}</p>
              </div>
              <Button size="sm" className="min-h-11 shrink-0" disabled={done || need || !!crafting} onClick={() => craft(item.id)}>
                {done ? "Seated" : need ? "Need stock" : "Print"}
              </Button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
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
  return (
    <Modal onClose={() => close("none")}>
      <p className="font-mono text-[10px] text-accent uppercase">Starship</p>
      <h2 className="mt-2 font-display text-2xl">Quests</h2>
      <p className="mt-2 text-sm text-muted">
        Next scheduled cargo in {fmtSols(solsUntilResupply(sol))}.{" "}
        {extra ? "Second ship already dropped three bots." : "Second Superheavy brings three more Optimus."}
      </p>
      <p className="mt-2 text-xs text-muted">
        Dark rocks are basalt, not iron. Quarry them into regolith and print a radiation berm. Humans will not land without it.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button className="min-h-11" disabled={!mast || !!resupply} onClick={orderCargo}>
          {mast ? "Call cargo" : "Need comms mast"}
        </Button>
        {ready ? (
          <Button variant="accent" className="min-h-11" onClick={landCrew}>
            Land first crew
          </Button>
        ) : null}
      </div>
      <ul className="mt-4 space-y-3">
        {quests.map((q) => (
          <li key={q.id}>
            <p className="text-sm">
              {q.status === "done" ? "✓ " : ""}
              {q.title}
            </p>
            <p className="text-xs text-muted">{q.detail}</p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-bg/60 p-4 sm:items-center">
      <div className="panel max-h-[min(90dvh,44rem)] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] p-6">
        {children}
        <div className="mt-5 flex justify-end">
          <Button variant="ghost" className="min-h-11" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
