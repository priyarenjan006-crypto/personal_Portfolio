import { useEffect, useRef, useState } from "react";

export const FRAME_COUNT = 290;
export const VIDEO_FPS = 60;

/** Public URL of a zero-based frame index. */
export function frameUrl(index: number): string {
  return `/frames/f${String(index + 1).padStart(3, "0")}.webp`;
}

type FrameSequence = {
  images: React.RefObject<(HTMLImageElement | null)[]>;
  progress: number;
  ready: boolean;
};

/**
 * Preloads every hero frame and reports progress.
 * The first frame is loaded before the rest so the hero can paint immediately.
 */
export function useFrameSequence(count: number = FRAME_COUNT): FrameSequence {
  const images = useRef<(HTMLImageElement | null)[]>(Array(count).fill(null));
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadFrame = async (index: number): Promise<void> => {
      const img = new Image();
      img.src = frameUrl(index);
      try {
        await img.decode();
        if (!cancelled) images.current[index] = img;
      } catch {
        // A missing frame falls back to its nearest loaded neighbour at draw time.
      } finally {
        if (!cancelled) setLoaded((n) => n + 1);
      }
    };

    const loadAll = async (): Promise<void> => {
      await loadFrame(0);
      const queue = Array.from({ length: count - 1 }, (_, i) => i + 1);
      const workers = Array.from({ length: 8 }, async () => {
        while (queue.length && !cancelled) {
          const next = queue.shift();
          if (next !== undefined) await loadFrame(next);
        }
      });
      await Promise.all(workers);
    };

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, [count]);

  return { images, progress: loaded / count, ready: loaded >= count };
}

/** Returns the requested frame, or the closest frame that has finished loading. */
export function nearestLoaded(
  frames: (HTMLImageElement | null)[],
  index: number,
): HTMLImageElement | null {
  for (let offset = 0; offset < frames.length; offset++) {
    const before = frames[index - offset];
    if (before) return before;
    const after = frames[index + offset];
    if (after) return after;
  }
  return null;
}
