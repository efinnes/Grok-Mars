import { createFileRoute } from "@tanstack/react-router";

const ttsCache = new Map<string, Uint8Array>();

export const Route = createFileRoute("/api/juno/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) return new Response("voice offline", { status: 503 });
        let text = "";
        try {
          const body = (await request.json()) as { text?: string };
          text = String(body.text ?? "").slice(0, 400);
        } catch {
          return new Response("bad json", { status: 400 });
        }
        if (text.length < 2) return new Response("empty", { status: 400 });
        const hit = ttsCache.get(text);
        if (hit) return new Response(hit, { headers: { "Content-Type": "audio/mpeg" } });
        const res = await fetch("https://api.x.ai/v1/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ text, voice_id: "eve", language: "en" }),
        });
        if (!res.ok) return new Response("tts failed", { status: 502 });
        const buf = new Uint8Array(await res.arrayBuffer());
        if (ttsCache.size > 16) ttsCache.delete(ttsCache.keys().next().value as string);
        ttsCache.set(text, buf);
        return new Response(buf, { headers: { "Content-Type": res.headers.get("Content-Type") ?? "audio/mpeg" } });
      },
    },
  },
});
