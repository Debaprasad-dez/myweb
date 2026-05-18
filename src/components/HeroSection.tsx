import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDown, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Original from "../assets/original.jpeg";
import { useIsMobile } from "../hooks/use-mobile";

const ROLES = [
  "Senior Frontend Engineer",
  "Microfrontend Architect",
  "Real-time Systems",
  "Performance Engineer",
];

const HeroSection = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const t = setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // On mobile, tap toggles reveal. On desktop, hover handles it.
  const imageGrayClass = isMobile
    ? revealed
      ? ""
      : "grayscale"
    : "grayscale group-hover:grayscale-0";

  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-16 pb-12 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 mesh-gradient" />
      <div className="absolute inset-0 -z-10 bg-grid mask-radial-fade" />
      <div className="absolute inset-0 -z-10 bg-noise opacity-30 mix-blend-overlay pointer-events-none" />

      {/* Mobile-only animated aurora behind the portrait — fades out by 50% down */}
      <div
        aria-hidden
        className="lg:hidden absolute inset-x-0 top-0 h-[55%] -z-10 overflow-hidden pointer-events-none"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
        }}
      >
        <div className="absolute top-[8%] left-[12%] w-[65%] aspect-square rounded-full bg-emerald-400/35 dark:bg-emerald-400/25 blur-3xl animate-drift-a" />
        <div className="absolute top-[2%] right-[8%] w-[55%] aspect-square rounded-full bg-indigo-400/30 dark:bg-indigo-400/20 blur-3xl animate-drift-b" />
        <div className="absolute top-[18%] left-[30%] w-[50%] aspect-square rounded-full bg-pink-400/25 dark:bg-pink-400/15 blur-3xl animate-drift-c" />
      </div>

      <div className="container mx-auto px-6 md:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left — copy */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-ink-200 dark:border-ink-800 bg-white/60 dark:bg-ink-900/60 backdrop-blur-md text-xs font-mono"
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
              className="mt-5 md:mt-6 font-mono text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400"
            >
              Debaprasad Paul — Portfolio / 2026
            </motion.p>

            {/* Name + role */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-3 font-heading text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.04em] font-semibold text-gradient"
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
              className="mt-5 md:mt-6 flex items-center gap-3 font-mono text-sm text-ink-600 dark:text-ink-400"
            >
              <span className="inline-block h-px w-8 bg-ink-300 dark:bg-ink-700" />
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
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 max-w-xl text-base md:text-[1.0625rem] text-ink-600 dark:text-ink-300 leading-relaxed"
            >
              Frontend engineer with 4+ years building scalable, high-performance
              web applications in banking and financial markets. Currently
              shaping real-time securities-finance systems at EquiLend with
              React, TypeScript, and microfrontends.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-7 md:mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => scrollTo("projects")}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-950 dark:bg-white text-white dark:text-ink-950 text-sm font-medium hover:opacity-90 transition-all"
              >
                View selected work
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink-300 dark:border-ink-700 text-sm font-medium hover:border-accent2 hover:text-accent2 transition-all"
              >
                Get in touch
              </button>
              <a
                href="/myweb/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-sm font-mono text-ink-500 dark:text-ink-400 hover:text-accent2 transition-colors underline-offset-4 hover:underline"
              >
                resume.pdf ↗
              </a>
            </motion.div>

            {/* Meta strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 md:mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs text-ink-500 dark:text-ink-400"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Bengaluru, IN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-400 dark:text-ink-600">·</span>
                <span>4+ yrs in fintech UI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-400 dark:text-ink-600">·</span>
                <span>Real-time · microfrontends · DS</span>
              </div>
            </motion.div>
          </div>

          {/* Right — portrait card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-4 order-1 lg:order-2 relative mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-none"
          >
            <div
              className={`group relative card-ring rounded-2xl border border-ink-200 dark:border-ink-800 bg-white/40 dark:bg-ink-900/40 backdrop-blur-md p-2.5 md:p-3 ${
                isMobile ? "cursor-pointer select-none" : ""
              }`}
              onClick={() => {
                if (isMobile) setRevealed((r) => !r);
              }}
            >
              <div className="relative aspect-square lg:aspect-[4/5] overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-900">
                <img
                  src={Original}
                  alt="Debaprasad Paul"
                  className={`w-full h-full object-cover object-[center_12%] lg:object-[center_15%] transition-all duration-700 ${imageGrayClass}`}
                />

                {/* Mobile-only ripple hint (only while not revealed) */}
                {isMobile && !revealed && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                  >
                    <span
                      className="absolute top-1/2 left-1/2 w-14 h-14 rounded-full border border-white/40 animate-tap-ripple"
                      style={{ transform: "translate(-50%, -50%)" }}
                    />
                    <span
                      className="absolute top-1/2 left-1/2 w-14 h-14 rounded-full border border-white/40 animate-tap-ripple"
                      style={{
                        transform: "translate(-50%, -50%)",
                        animationDelay: "1.4s",
                      }}
                    />
                  </span>
                )}
              </div>

              <div className="mt-2.5 md:mt-3 flex items-center justify-between px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">
                <span>DP / 01</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse-soft" />
                  {isMobile
                    ? revealed
                      ? "Color"
                      : "Tap to reveal"
                    : "Live"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => scrollTo("skills")}
        className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400 hover:text-accent2 transition-colors"
      >
        <span>Scroll</span>
        <ArrowDown className="w-3.5 h-3.5 animate-float" />
      </button>
    </section>
  );
};

export default HeroSection;
