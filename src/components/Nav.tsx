import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { profile } from "../data";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

/** Fixed top navigation that hides on scroll-down and returns on scroll-up. */
export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > 200);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-5 mix-blend-difference md:px-8"
    >
      <a href="#top" className="font-display text-2xl font-black uppercase tracking-wide">
        {profile.name.slice(0, 1)}
        <span className="text-ember">/</span>
        {profile.name.slice(1)}
      </a>
      <nav aria-label="Primary" className="flex items-center gap-5 md:gap-8">
        <ul className="flex flex-wrap gap-3 sm:gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative font-mono text-xs uppercase tracking-[0.18em]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>
        <span className="hidden items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] lg:flex">
          <span className="size-2 animate-pulse-dot rounded-full bg-ember" />
          {profile.available}
        </span>

      </nav>
    </motion.header>
  );
}
