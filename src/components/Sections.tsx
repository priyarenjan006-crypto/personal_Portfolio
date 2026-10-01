import { motion, useScroll } from "motion/react";
import { useRef } from "react";
import { about, capabilities, marqueeWords, profile, projects, timeline } from "../data";
import { useMapped } from "../hooks/useMapped";
import Reveal, { SectionLabel } from "./Reveal";

export function Marquee() {
  const words = [...marqueeWords, ...marqueeWords];
  return (
    <div className="relative z-10 -mt-px overflow-hidden border-y border-line bg-ink-2 py-3" aria-hidden>
      {/* Edge fade gradients for a creative, polished look */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-ink via-transparent to-ink" />
      
      <div className="flex w-max animate-marquee items-center">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex items-center gap-8 pr-8 font-display text-3xl tracking-wide uppercase md:text-4xl"
          >
            <span className={i % 2 ? "text-outline opacity-70" : "bg-gradient-to-br from-bone to-bone/50 bg-clip-text text-transparent"}>
              {word}
            </span>
            <span className="text-lg text-ember animate-pulse">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Editorial about section with a scroll-lit statement and quick stats. */
export function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = about.statement.split(" ");

  return (
    <section id="about" className="px-4 py-28 md:px-8 md:py-40 lg:px-14">
      <SectionLabel index="03">About</SectionLabel>
      <p
        ref={ref}
        className="max-w-6xl font-serif text-4xl leading-[1.08] md:text-6xl lg:text-7xl"
      >
        {words.map((word, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {word}
          </Word>
        ))}
      </p>

      <div className="mt-20 grid gap-12 md:mt-28 md:grid-cols-12">
        <div className="space-y-6 text-bone/70 md:col-span-6 md:col-start-6 md:text-lg">
          {about.body.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="leading-relaxed">{paragraph}</p>
            </Reveal>
          ))}
        </div>
        <dl className="grid grid-cols-3 gap-4 md:col-span-12 md:mt-10 md:border-t md:border-line md:pt-10">
          {about.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.12} className="flex flex-col-reverse">
              <dt className="label mt-2">{stat.label}</dt>
              <dd className="font-display text-6xl font-black text-bone md:text-8xl">
                {stat.value.replace(/\D+$/, "")}
                <span className="text-ember">{stat.value.match(/\D+$/)?.[0]}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useMapped(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

/** Indexed project list with a fill-sweep hover state. */
export function Work() {
  return (
    <section id="work" className="px-4 py-28 md:px-8 md:py-40 lg:px-14">
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionLabel index="04">Selected work</SectionLabel>
          <h2 className="font-display text-7xl font-black uppercase leading-[0.85] md:text-[9rem]">
            Things I&apos;ve <span className="font-serif font-normal normal-case italic text-ember">built</span>
          </h2>
        </div>
        <p className="label">{String(projects.length).padStart(2, "0")} projects</p>
      </div>

      <ul className="border-t border-line">
        {projects.map((project, i) => (
          <Reveal key={project.title} delay={i * 0.06}>
            <li>
              <a
                href={project.href}
                className="group relative grid grid-cols-12 items-baseline gap-4 overflow-hidden border-b border-line py-8 md:py-10"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />
                <span className="label relative col-span-2 transition-colors group-hover:text-ink md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative col-span-10 flex flex-col items-start gap-6 font-display text-5xl font-bold uppercase leading-none transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-ink md:col-span-5 md:text-7xl">
                  {project.title}
                  {project.videoUrl && (
                    <div className="relative h-32 aspect-video max-w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-ink/10">
                      <video 
                        src={project.videoUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className={`absolute inset-0 h-full w-full object-cover ${project.cropTop ? "scale-[1.25] origin-bottom" : ""}`}
                      />
                    </div>
                  )}
                </span>
                <span className="relative col-span-12 text-bone/65 transition-colors group-hover:text-ink md:col-span-4 md:col-start-7">
                  {project.summary}
                  <span className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-current/30 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="label relative col-span-12 text-right transition-colors group-hover:text-ink md:col-span-2">
                  {project.year} <span aria-hidden>↗</span>
                </span>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/** Four-column capability grid. */
export function Skills() {
  return (
    <section id="skills" className="bg-ink-2 px-4 py-28 md:px-8 md:py-40 lg:px-14">
      <SectionLabel index="05">Capabilities</SectionLabel>
      <h2 className="mb-16 max-w-4xl font-serif text-5xl leading-[1.02] md:mb-24 md:text-7xl">
        Ideas become interfaces, <em className="text-ember">interfaces become products.</em>
      </h2>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((group, i) => (
          <Reveal key={group.title} delay={i * 0.08} className="bg-ink-2">
            <div className="group h-full p-8 transition-colors duration-500 hover:bg-ink md:p-10">
              <div className="mb-12 flex items-center justify-between">
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
                <span className="size-2 rounded-full bg-ember/40 transition-colors group-hover:bg-ember" />
              </div>
              <h3 className="mb-6 font-display text-4xl font-bold uppercase">{group.title}</h3>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-bone/70 transition-colors group-hover:text-bone"
                  >
                    <span className="h-px w-4 bg-ember" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Vertical timeline of roles and education. */
export function Journey() {
  return (
    <section className="px-4 py-28 md:px-8 md:py-40 lg:px-14">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionLabel index="06">Journey</SectionLabel>
          <h2 className="font-display text-6xl font-black uppercase leading-[0.88] md:sticky md:top-28 md:text-8xl">
            Beyond
            <br />
            <span className="text-outline">the code</span>
          </h2>
        </div>
        <ol className="relative border-l border-line md:col-span-7 md:col-start-6">
          {timeline.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <li className="relative pb-16 pl-8 last:pb-0 md:pl-12">
                <span className="absolute -left-[5px] top-2 size-[9px] rounded-full bg-ember ring-4 ring-ink" />
                <p className="label mb-3">{item.period}</p>
                <h3 className="font-display text-3xl uppercase tracking-wide md:text-4xl">{item.title}</h3>
                <p className="mt-1 font-serif text-xl italic text-ember">{item.org}</p>
                <p className="mt-4 max-w-lg text-bone/65">{item.detail}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Closing call-to-action and footer. */
export function Contact() {
  return (
    <footer id="contact" className="relative overflow-hidden px-4 pb-8 pt-28 md:px-8 md:pt-40 lg:px-14">
      <div className="pointer-events-none absolute -bottom-1/2 left-1/2 aspect-square w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_61_46/0.22),transparent_60%)]" />
      <div className="relative">
        <SectionLabel index="07">Contact</SectionLabel>
        <Reveal>
          <h2 className="font-display text-[9vw] uppercase leading-tight tracking-wide">
            Let&apos;s build
            <br />
            <span className="font-serif font-normal normal-case italic text-ember">something.</span>
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col gap-10 md:mt-24 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="label mb-4">Drop a line</p>
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-4 font-serif text-4xl md:text-6xl"
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                {profile.email}
              </span>
              <span className="text-ember transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden>
                ↗
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="flex flex-wrap gap-3">
              {profile.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-bone/25 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] transition-colors hover:border-ember hover:bg-ember hover:text-ink"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-bone px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ember"
                >
                  Résumé
                </a>
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="mt-28 flex flex-col justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <span className="label">© {new Date().getFullYear()} {profile.name}</span>
          <span className="label">{profile.location}</span>
          <a href="#top" className="label transition-colors hover:text-ember">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
