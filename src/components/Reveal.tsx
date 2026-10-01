import { motion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** Fades and lifts its children into view once, when scrolled into the viewport. */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Small uppercase section eyebrow with an index number. */
export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="label mb-10 flex items-center gap-3">
      <span className="text-ember">{index}</span>
      <span className="h-px w-10 bg-ash/40" />
      {children}
    </p>
  );
}
