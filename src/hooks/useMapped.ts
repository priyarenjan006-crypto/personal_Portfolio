import { transform, useTransform, type MotionValue } from "motion/react";

/**
 * Maps a scroll progress value through input/output ranges in JS.
 * The function form keeps Motion from swapping in a native ScrollTimeline,
 * which would measure the whole page instead of the tracked target element.
 */
export function useMapped<T extends number | string>(
  progress: MotionValue<number>,
  input: number[],
  output: T[],
): MotionValue<T> {
  return useTransform(progress, transform(input, output) as (v: number) => T);
}
