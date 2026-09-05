import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { mentionSite } from "@/lib/mars/gazetteer";
import { useJuno } from "@/lib/juno/store";
import { useMission } from "@/lib/mission-store";
import { JunoPortrait } from "./juno-portrait";

export function JunoRail() {
  const caption = useJuno((s) => s.caption);
  const speaking = useJuno((s) => s.speaking);
  const speakText = useJuno((s) => s.speakText);
  const lookAt = useMission((s) => s.lookAt);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  async function onAsk(e: FormEvent) {
    e.preventDefault();
    const text = q.trim();
    if (!text || busy) return;
    setBusy(true);
    setQ("");
    const asked = mentionSite(text);
    if (asked) lookAt(asked.id);
    try {
      const res = await fetch("/api/juno/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body = (await res.json()) as { ok?: boolean; text?: string; error?: string };
      const reply = body.ok ? (body.text ?? "") : (body.error ?? "Brain stalled.");
      if (!asked) {
        const mentioned = mentionSite(reply);
        if (mentioned) lookAt(mentioned.id);
      }
      await speakText(reply);
    } catch {
      await speakText("I am dark. Try the tours.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-border bg-bg">
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden md:aspect-auto md:h-[min(52%,22rem)]">
        <JunoPortrait />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">Juno</p>
        <p className="min-h-[4.5rem] overflow-y-auto text-sm leading-relaxed text-fg">{caption}</p>
        <p className="font-mono text-[10px] text-subtle">{speaking ? "Speaking" : "Idle"}</p>
        <form onSubmit={onAsk} className="mt-auto flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask Juno"
            className="min-h-11 flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle"
          />
          <Button type="submit" className="min-h-11" disabled={busy}>
            Ask
          </Button>
        </form>
      </div>
    </aside>
  );
}
