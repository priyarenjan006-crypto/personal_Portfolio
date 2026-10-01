import type Lenis from "lenis";

let instance: Lenis | null = null;

/** Registers the active Lenis instance (or null when smooth scrolling is off). */
export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

/** Current scroll offset, from Lenis when active. */
export function getScrollY(): number {
  return instance ? instance.animatedScroll : window.scrollY;
}

/** Jumps the page to `y` immediately, keeping Lenis in sync. */
export function jumpTo(y: number): void {
  if (instance) instance.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}
