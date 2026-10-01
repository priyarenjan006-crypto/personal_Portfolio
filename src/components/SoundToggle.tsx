import { motion } from "motion/react";
import type { ScrubAudio } from "../hooks/useScrubAudio";

const BARS = [0.5, 1, 0.7, 0.9];

/** Pill button that unlocks / mutes the hero soundtrack, with a live equaliser. */
export default function SoundToggle({ audio }: { audio: ScrubAudio }) {
  const active = audio.unlocked && !audio.muted;
  const label = audio.muted ? "Sound off" : audio.unlocked ? "Sound on" : "Tap for sound";

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={audio.toggle}
      aria-pressed={active}
      aria-label={active ? "Mute hero sound" : "Enable hero sound"}
      className="absolute right-4 top-20 z-10 flex items-center gap-3 rounded-full border border-bone/20 bg-ink/40 px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-bone backdrop-blur-md transition-colors hover:border-ember md:right-8 md:top-24"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {BARS.map((peak, i) => (
          <motion.span
            key={i}
            className="w-[2px] rounded-full bg-ember"
            animate={active ? { height: ["20%", `${peak * 100}%`, "35%"] } : { height: "20%" }}
            transition={
              active
                ? { duration: 0.7 + i * 0.12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
                : { duration: 0.2 }
            }
          />
        ))}
      </span>
      {label}
      {!audio.unlocked && !audio.muted && (
        <span className="size-1.5 animate-pulse-dot rounded-full bg-ember" aria-hidden />
      )}
    </button>
  );
}
