import { motion, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { profile } from "../data";
import { FRAME_COUNT, VIDEO_FPS, nearestLoaded } from "../hooks/useFrameSequence";
import { useFixedSpeedPlayback } from "../hooks/useFixedSpeedPlayback";
import { useMapped } from "../hooks/useMapped";
import { useScrubAudio } from "../hooks/useScrubAudio";


type HeroProps = {
  frames: React.RefObject<(HTMLImageElement | null)[]>;
  loadProgress: number;
};

type PhaseRange = { fadeIn?: [number, number]; fadeOut?: [number, number] };

/**
 * Horizontal focal point (0–1) of the subject per frame. On portrait screens the
 * canvas crops the sides, so the crop follows the subject as they turn to camera.
 */
const FOCAL_KEYS: [frame: number, x: number][] = [
  [0, 0.46],
  [24, 0.44],
  [72, 0.48],
  [120, 0.5],
  [FRAME_COUNT - 1, 0.5],
];

function focalAt(frame: number): number {
  for (let i = 1; i < FOCAL_KEYS.length; i++) {
    const [f1, x1] = FOCAL_KEYS[i];
    const [f0, x0] = FOCAL_KEYS[i - 1];
    if (frame <= f1) return x0 + ((frame - f0) / (f1 - f0)) * (x1 - x0);
  }
  return 0.5;
}

/**
 * Fades, lifts and un-blurs an element in over `fadeIn` and back out over `fadeOut`.
 * All offsets stay within [0, 1].
 */
function usePhase(progress: MotionValue<number>, { fadeIn, fadeOut }: PhaseRange) {
  const input: number[] = [];
  const opacity: number[] = [];
  const lift: number[] = [];
  const blur: string[] = [];
  if (fadeIn) {
    input.push(...fadeIn);
    opacity.push(0, 1);
    lift.push(40, 0);
    blur.push("blur(8px)", "blur(0px)");
  }
  if (fadeOut) {
    input.push(...fadeOut);
    opacity.push(1, 0);
    lift.push(0, -40);
    blur.push("blur(0px)", "blur(8px)");
  }
  return {
    opacity: useMapped(progress, input, opacity),
    y: useMapped(progress, input, lift),
    filter: useMapped(progress, input, blur),
  };
}

/** Draws an image with object-fit: cover, keeping `focalX` of the image centred where possible. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  focalX: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = Math.min(0, Math.max(w - dw, w / 2 - focalX * dw));
  ctx.drawImage(img, dx, (h - dh) / 2, dw, dh);
}

/** Scroll-scrubbed video hero rendered frame-by-frame on a canvas, with synced audio. */
export default function Hero({ frames, loadProgress }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrame = useRef(0);
  const rafId = useRef(0);

  const audio = useScrubAudio("/hero-audio.m4a");

  useFixedSpeedPlayback(sectionRef, FRAME_COUNT / VIDEO_FPS);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    const img = nearestLoaded(frames.current, currentFrame.current);
    if (!img) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#0a0707";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCover(ctx, img, canvas.width, canvas.height, focalAt(currentFrame.current));
  }, [frames]);

  const scheduleRender = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(render);
  }, [render]);

  // Match the canvas backing store to its CSS size at device resolution (capped at 2x).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, [render]);

  // Repaint as more frames arrive so a placeholder neighbour gets replaced.
  useEffect(() => {
    scheduleRender();
  }, [loadProgress, scheduleRender]);

  const { scrub } = audio;
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(p * (FRAME_COUNT - 1))));
    if (index === currentFrame.current) return;
    const direction = index > currentFrame.current ? 1 : -1;
    currentFrame.current = index;

    scheduleRender();
    if (p > 0 && p < 1) scrub(index / VIDEO_FPS, direction);
  });

  const intro = usePhase(scrollYProgress, { fadeOut: [0.12, 0.22] });
  const nameScale = useMapped(scrollYProgress, [0, 0.22], [1, 0.9]);
  const craft = usePhase(scrollYProgress, { fadeIn: [0.56, 0.62], fadeOut: [0.76, 0.81] });
  const hello = usePhase(scrollYProgress, { fadeIn: [0.84, 0.92] });
  const cueOpacity = useMapped(scrollYProgress, [0, 0.04], [1, 0]);


  return (
    <section ref={sectionRef} id="top" className="relative h-[600vh]" aria-label="Introduction">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Video portrait of ${profile.name} turning toward the camera and removing sunglasses`}
        />

        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(10_7_7/0.7)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink via-ink/50 to-transparent" />

        {/* Phase 1 — name */}
        <motion.div
          style={{ opacity: intro.opacity, filter: intro.filter }}
          className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 md:px-8 md:pb-6"
        >
          <div className="mb-3 flex items-end justify-between gap-6 md:mb-5">
            <p className="label max-w-[22rem] leading-relaxed text-bone">{profile.role}</p>
          </div>
          <motion.h1
            style={{ scale: nameScale }}
            className="origin-bottom-left font-display text-[9vw] uppercase leading-tight tracking-widest text-bone whitespace-nowrap md:text-[7.5vw]"
          >
            {profile.name}
          </motion.h1>
        </motion.div>

        {/* Phase 2 — what I do (subject is centred, left third is clear) */}
        <motion.div
          style={craft}
          className="pointer-events-none absolute inset-y-0 left-0 flex w-full items-center bg-gradient-to-r from-ink/85 via-ink/40 to-transparent px-4 md:w-[42%] md:px-8 lg:px-14"
        >
          <div>
            <p className="label mb-6">
              <span className="text-ember">01</span> — What I do
            </p>
            <h2 className="font-display text-5xl uppercase leading-[1.15] tracking-wide lg:text-6xl">
              I build
              <br />
              <span className="text-ember">
                digital worlds
              </span>
              <br />
              that move,
              <br />
              <span className="text-outline">respond & inspire.</span>
            </h2>
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-bone/70 md:text-base">
              Full-stack developer exploring the intersection of web, 3D, animation, AI, and data — transforming ideas into immersive digital experiences.
            </p>
          </div>
        </motion.div>

        {/* Phase 3 — hello */}
        <motion.div
          style={hello}
          className="absolute inset-x-0 bottom-0 flex flex-col gap-8 px-4 pb-10 md:flex-row md:items-end md:justify-between md:px-8 md:pb-14 lg:px-14"
        >
          <div className="max-w-xl">
            <p className="label mb-4">
              <span className="text-ember">02</span> — Nice to meet you
            </p>
            <h2 className="font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
              Hi, I&apos;m <span className="text-ember">{profile.name}</span>
            </h2>
            <p className="mt-5 flex flex-col gap-1 tracking-wide text-bone/75 md:text-lg">
              <span className="font-semibold uppercase text-bone">Full-Stack Developer</span>
              <span className="text-sm font-medium text-ember">AI • 3D • INTERACTIVE WEB</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-3 rounded-full bg-ember px-6 py-3.5 font-medium text-ink transition-transform hover:scale-[1.03]"
            >
              See my work
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-bone/30 px-6 py-3.5 font-medium backdrop-blur-sm transition-colors hover:border-bone hover:bg-bone hover:text-ink"
            >
              Get in touch
            </a>
          </div>
        </motion.div>

        {/* HUD */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="pointer-events-none absolute left-1/2 top-24 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        >
          <span className="label">Scroll to play</span>
          <span className="relative h-10 w-px overflow-hidden bg-bone/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-ember"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.div>

      </div>
    </section>
  );
}
