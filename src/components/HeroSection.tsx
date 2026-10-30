import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDown, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mountHero } from "./hero/heroStage.js";
// Screen images, pre-rendered from assets/original.jpeg (same files as the hero-devices prototype).
import g3 from "../assets/hero/g3.png";
import portrait from "../assets/hero/portrait.jpg";
import wide from "../assets/hero/wide.jpg";
import ascii from "../assets/hero/ascii.txt?raw";

const ROLES = [
  "Senior Frontend Engineer",
  "Microfrontend Architect",
  "Real-time Systems",
  "Performance Engineer",
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// Its own component, so the 2.6 s role change doesn't re-render the hero around the 3D stage.
const RoleRotator = () => {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-flex h-5 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={roleIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="text-ink-900 dark:text-ink-100 whitespace-nowrap"
        >
          {ROLES[roleIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const HeroSection = () => {
  const skyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Device timeline (three.js), black-hole transition and the planetarium sky with its scroll parallax.
  useEffect(
    () =>
      mountHero({
        sceneEl: sceneRef.current!,
        skyEl: skyRef.current!,
        images: { g3, portrait, wide },
        ascii,
      }),
    []
  );

  return (
    // overflow-x-clip, not overflow-hidden: the sky runs on below the hero and fades there, with no seam
    <section className="hero relative isolate min-h-screen flex items-center pt-20 md:pt-16 pb-12 overflow-x-clip">
      {/* Background sky: a slow planetarium dome (true colour in dark mode, an observatory plate in light mode).
          On scroll its depth planes drift at their own pace and it dissolves into the page background. */}
      <div
        ref={skyRef}
        className="hero-sky absolute left-0 top-0 -z-10 w-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 md:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left — copy */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-ink-200 dark:border-ink-800 bg-white/60 dark:bg-ink-900/60 backdrop-blur-md text-[11px] font-mono"
            >
              <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-accent2 status-dot" />
              <span className="text-ink-600 dark:text-ink-400">
                Currently at EquiLend · Open to collaborations
              </span>
            </motion.div>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-7 md:mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-500 dark:text-ink-400"
            >
              Debaprasad Paul — Portfolio / 2026
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 font-heading text-[clamp(2.5rem,6.2vw,5rem)] leading-[0.98] tracking-[-0.04em] font-semibold text-gradient"
            >
              Building interfaces
              <br />
              that feel{" "}
              <span className="font-display italic font-normal text-accent2">
                inevitable
              </span>
              .
            </motion.h1>

            {/* Role rotator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 md:mt-7 flex items-center gap-3 font-mono text-[13px] text-ink-600 dark:text-ink-400"
            >
              <span className="inline-block h-px w-8 bg-ink-300 dark:bg-ink-700" />
              <RoleRotator />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 max-w-[34rem] text-[15px] md:text-base text-ink-600 dark:text-ink-300 leading-[1.75]"
            >
              Senior Frontend Engineer with 5 years of experience building high-performance real-time financial platforms. At EquiLend, I architect trading systems with React, TypeScript, microfrontends, and agentic AI workflows.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-9 md:mt-10 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => scrollTo("projects")}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-950 dark:bg-white text-white dark:text-ink-950 text-[13px] font-medium hover:opacity-90 transition-all"
              >
                View selected work
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink-300 dark:border-ink-700 text-[13px] font-medium hover:border-accent2 hover:text-accent2 transition-all"
              >
                Get in touch
              </button>
              <a
                href="/myweb/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[13px] font-mono text-ink-500 dark:text-ink-400 hover:text-accent2 transition-colors underline-offset-4 hover:underline"
              >
                resume.pdf ↗
              </a>
            </motion.div>

            {/* Meta strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 md:mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] text-ink-500 dark:text-ink-400"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Bengaluru, IN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-400 dark:text-ink-600">·</span>
                <span>5+ yrs in fintech UI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-400 dark:text-ink-600">·</span>
                <span>Real-time · microfrontends · DS</span>
              </div>
            </motion.div>
          </div>

          {/* Right — device timeline in the portrait card's place (same grid cell and sizing, no frame) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 order-1 lg:order-2 relative mx-auto w-full max-w-[320px] sm:max-w-[380px] lg:max-w-none"
          >
            <div className="w-full">
              <div
                ref={sceneRef}
                className="hero-scene"
                role="button"
                tabIndex={0}
                aria-label="Debaprasad Paul. Show the next device."
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      
    </section>
  );
};

export default HeroSection;
