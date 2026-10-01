import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { profile } from "../data";

/** Full-screen preloader shown while hero frames download. */
export default function Loader({ progress, visible }: { progress: number; visible: boolean }) {
  const [fastProgress, setFastProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFastProgress((p) => Math.min(1, p + 0.05));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const displayProgress = Math.max(progress, fastProgress);
  const pct = Math.round(displayProgress * 100);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[70] flex flex-col justify-between bg-ink p-4 md:p-8"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-live="polite"
          aria-label={`Loading ${pct}%`}
        >
          <div className="flex justify-between">
            <span className="label">{profile.name} — Portfolio</span>
            <span className="label">Loading frames</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <span className="font-display text-[28vw] font-black leading-[0.75] tabular-nums md:text-[18vw]">
              {String(pct).padStart(3, "0")}
            </span>
            <span className="mb-3 font-serif text-3xl italic text-ember md:text-5xl">%</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-bone/10">
            <motion.div
              className="h-full origin-left bg-ember"
              animate={{ scaleX: displayProgress }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
