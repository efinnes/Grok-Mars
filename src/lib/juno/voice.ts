import { LINES, type LineId } from "./script";

let current: HTMLAudioElement | null = null;
let seq = 0;

export function stopVoice() {
  seq += 1;
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
}

export function captionFor(id: string) {
  return LINES[id] ?? "";
}

export async function playLine(id: LineId | string): Promise<void> {
  const my = ++seq;
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
  const src = `/juno/vo/${id}.mp3`;
  const audio = new Audio(src);
  audio.preload = "auto";
  current = audio;
  try {
    await new Promise<void>((resolve) => {
      const done = () => {
        audio.onended = null;
        audio.onerror = null;
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      const poll = window.setInterval(() => {
        if (my !== seq) {
          window.clearInterval(poll);
          done();
        }
      }, 80);
      void audio.play().catch(done);
    });
  } catch {
    /* baked file may be absent */
  }
  if (my !== seq) return;
  current = null;
}

export async function playBlob(buf: ArrayBuffer): Promise<void> {
  const my = ++seq;
  if (current) {
    current.pause();
    current.src = "";
  }
  const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
  const audio = new Audio(url);
  current = audio;
  try {
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      void audio.play().catch(() => resolve());
    });
  } finally {
    URL.revokeObjectURL(url);
  }
  if (my === seq) current = null;
}
