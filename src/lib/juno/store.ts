import { create } from "zustand";
import { captionFor, playBlob, playLine, stopVoice } from "./voice";
import type { LineId } from "./script";

type JunoState = {
  caption: string;
  speaking: boolean;
  lineId: string | null;
  say: (id: LineId | string) => Promise<void>;
  speakText: (text: string) => Promise<void>;
  hush: () => void;
};

export const useJuno = create<JunoState>((set) => ({
  caption: captionFor("hello"),
  speaking: false,
  lineId: null,
  say: async (id) => {
    set({ caption: captionFor(id) || captionFor("hello"), speaking: true, lineId: id });
    await playLine(id);
    set({ speaking: false });
  },
  speakText: async (text) => {
    set({ caption: text, speaking: true, lineId: null });
    try {
      const res = await fetch("/api/juno/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 400) }),
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 32) await playBlob(buf);
      }
    } catch {
      /* baked rail still shows caption */
    }
    set({ speaking: false });
  },
  hush: () => {
    stopVoice();
    set({ speaking: false });
  },
}));
