import { useEffect, type RefObject } from "react";
import { getScrollY, jumpTo } from "../lib/smoothScroll";

/** 1 = the video's real speed. Scrolling never plays faster or slower than this. */
export const PLAYBACK_RATE = 1;
/** How long playback keeps going after the last wheel / touch / key input (ms). */
const WHEEL_GRACE_MS = 420;
const TOUCH_GRACE_MS = 650;
const KEY_GRACE_MS = 700;

const DOWN_KEYS = new Set(["ArrowDown", "PageDown", "End"]);
const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

/**
 * Plays a pinned scroll section at a fixed, real-time speed.
 *
 * Inside the section, scroll input no longer moves the page by its own distance.
 * It only sets a direction. The page is then advanced at exactly
 * `duration / PLAYBACK_RATE` seconds for the whole section, for as long as the
 * user keeps scrolling. Fast flicks and slow nudges both play at natural speed.
 * At either end, control returns to normal scrolling.
 */
export function useFixedSpeedPlayback(
  sectionRef: RefObject<HTMLElement | null>,
  duration: number,
): void {
  useEffect(() => {
    let direction: 1 | -1 | 0 = 0;
    let playUntil = 0;
    let playhead = 0;
    let lastTick = performance.now();
    let rafId = 0;
    let touchY: number | null = null;

    const bounds = () => {
      const section = sectionRef.current;
      if (!section) return null;
      const top = section.offsetTop;
      const length = section.offsetHeight - window.innerHeight;
      return { top, end: top + length, length };
    };

    /** Claims an input event for the hero; returns false when it should scroll normally. */
    const claim = (dir: 1 | -1, graceMs: number): boolean => {
      const b = bounds();
      if (!b || b.length <= 0) return false;
      const y = getScrollY();
      if (y < b.top - 2 || y > b.end + 2) return false;
      if (dir === 1 && y >= b.end - 1) return false;
      if (dir === -1 && y <= b.top + 1) return false;

      const now = performance.now();
      // Re-sync the playhead whenever playback (re)starts, e.g. after an anchor jump.
      if (dir !== direction || now > playUntil) {
        playhead = ((y - b.top) / b.length) * duration;
        lastTick = now;
      }
      direction = dir;
      playUntil = now + graceMs;
      return true;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTick) / 1000);
      lastTick = now;
      const b = bounds();
      if (b && direction !== 0 && now < playUntil) {
        playhead = Math.min(duration, Math.max(0, playhead + direction * dt * PLAYBACK_RATE));
        jumpTo(b.top + (playhead / duration) * b.length);
        if ((direction === 1 && playhead >= duration) || (direction === -1 && playhead <= 0)) {
          playUntil = 0;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const block = (event: Event) => {
      if (event.cancelable) event.preventDefault();
      // Keep Lenis (listening in the bubble phase) from also scrolling.
      event.stopImmediatePropagation();
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      const dir = Math.sign(event.deltaY) as 1 | -1 | 0;
      if (dir !== 0 && claim(dir, WHEEL_GRACE_MS)) block(event);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY;
      if (touchY === null || y === undefined) return;
      const delta = touchY - y;
      if (Math.abs(delta) < 2) return;
      touchY = y;
      if (claim(delta > 0 ? 1 : -1, TOUCH_GRACE_MS)) block(event);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      let dir: 1 | -1 | 0 = 0;
      if (DOWN_KEYS.has(event.key) || (event.key === " " && !event.shiftKey)) dir = 1;
      else if (UP_KEYS.has(event.key) || (event.key === " " && event.shiftKey)) dir = -1;
      if (dir !== 0 && claim(dir, KEY_GRACE_MS)) block(event);
    };

    const capture = { capture: true, passive: false } as const;
    window.addEventListener("wheel", onWheel, capture);
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, capture);
    window.addEventListener("keydown", onKeyDown, capture);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheel, capture);
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, capture);
      window.removeEventListener("keydown", onKeyDown, capture);
    };
  }, [sectionRef, duration]);
}
