import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import Loader from "./components/Loader";
import Nav from "./components/Nav";
import { About, Contact, Journey, Marquee, Skills, Work } from "./components/Sections";
import { useFrameSequence } from "./hooks/useFrameSequence";
import { setLenis } from "./lib/smoothScroll";

const LOADER_TIMEOUT_MS = 1500;

/** Root layout: preloader, smooth scrolling, hero and content sections. */
export default function App() {
  const { images, progress, ready } = useFrameSequence();
  const [timedOut, setTimedOut] = useState(false);
  const showLoader = !ready && !timedOut;

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), LOADER_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.075,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = showLoader ? "hidden" : "";
  }, [showLoader]);

  return (
    <div className="grain">
      <Loader progress={progress} visible={showLoader} />
      <Nav />
      <main>
        <Hero frames={images} loadProgress={progress} />
        <Marquee />
        <About />
        <Work />
        <Skills />
        <Journey />
      </main>
      <Contact />
    </div>
  );
}
