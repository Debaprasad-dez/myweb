import { Monitor, Code2, Palette, Zap, Layers, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const frontendStack = [
  "React",
  "Next.js",
  "TypeScript",
  "Microfrontends",
  "Module Federation",
  "Redux",
  "Angular",
];
const dataStack = [
  "TanStack Query",
  "Apollo / GraphQL",
  "WebSockets",
  "REST",
  "Service Workers",
];
const toolingStack = [
  "Jest",
  "RTL",
  "Cypress",
  "Chromatic",
  "Webpack",
  "AWS",
  "NGINX",
];

const SectionLabel = () => (
  <div className="flex items-center gap-4 mb-12">
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
      01 — Expertise
    </span>
    <span className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />
  </div>
);

const SkillsSection = () => {
  return (
    <section
      id="skills"
      className="relative py-20 md:py-24 bg-white dark:bg-ink-950"
    >
      <div className="container mx-auto px-6 md:px-10">
        <SectionLabel />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
              What I do, and the{" "}
              <span className="font-display italic font-normal text-accent2">
                tools
              </span>{" "}
              I reach for.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 lg:col-start-8 flex items-end"
          >
            <p className="text-ink-600 dark:text-ink-400 text-base md:text-lg leading-relaxed">
              A focused stack honed over 3+ years shipping production
              interfaces — from banking-grade micro-frontends to crafted
              side-projects.
            </p>
          </motion.div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(180px,auto)]">
          {/* Frontend — big tile */}
          <BentoCard
            className="md:col-span-4 md:row-span-2"
            icon={<Monitor className="w-5 h-5" />}
            num="01"
            title="Frontend Architecture"
            description="4+ years building accessible, performance-tuned UIs in React, Next.js, and Angular. Specialist in microfrontends, Module Federation, and component systems that scale across teams."
            chips={frontendStack}
            highlight
          />

          {/* Data & real-time */}
          <BentoCard
            className="md:col-span-2"
            icon={<Code2 className="w-5 h-5" />}
            num="02"
            title="Real-time & Data"
            description="WebSocket-driven UIs, server-state with TanStack Query / Apollo, caching that holds up."
            chips={dataStack}
          />

          {/* Design */}
          <BentoCard
            className="md:col-span-2"
            icon={<Palette className="w-5 h-5" />}
            num="03"
            title="Design Systems"
            description="Figma → tokenized component libraries. Designs that already know how they'll be built."
          />

          {/* Stats tile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3 relative rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/50 p-6 overflow-hidden"
          >
            <div className="absolute inset-0 -z-10 mesh-gradient opacity-60" />
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">
                Track record
              </span>
              <Zap className="w-4 h-4 text-accent2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Stat value="4+ yrs" label="Fintech UI" />
              <Stat value="95%" label="Test coverage" />
              <Stat value="25%" label="Faster APIs" />
            </div>
          </motion.div>

          {/* Tooling */}
          <BentoCard
            className="md:col-span-3"
            icon={<Layers className="w-5 h-5" />}
            num="04"
            title="Tooling & DX"
            description="Testing pyramids, CI pipelines, and ops glue that lets product teams ship without fear."
            chips={toolingStack}
          />

          {/* Now playing */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-6 relative rounded-2xl border border-ink-200 dark:border-ink-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-ink-900/30"
          >
            <div className="flex items-center gap-4">
              <Cpu className="w-5 h-5 text-accent2" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">
                  Currently
                </p>
                <p className="text-ink-900 dark:text-ink-100 mt-1">
                  Shipping real-time securities-finance UIs at{" "}
                  <span className="text-accent2">EquiLend</span>. Exploring
                  server components, agentic AI workflows, and design systems
                  at scale.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-ink-500 dark:text-ink-400">
              <span className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse-soft" />
              v2026.05
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <p className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
      {value}
    </p>
    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">
      {label}
    </p>
  </div>
);

interface BentoCardProps {
  className?: string;
  icon: React.ReactNode;
  num: string;
  title: string;
  description: string;
  chips?: string[];
  highlight?: boolean;
}

const BentoCard = ({
  className = "",
  icon,
  num,
  title,
  description,
  chips,
  highlight,
}: BentoCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`group card-ring relative rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/30 p-6 flex flex-col overflow-hidden ${className}`}
  >
    {highlight && (
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent2/10 blur-3xl pointer-events-none" />
    )}
    <div className="flex items-start justify-between mb-6">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-ink-700 dark:text-ink-200">
        {icon}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-500">
        {num}
      </span>
    </div>
    <h3 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50 mb-2">
      {title}
    </h3>
    <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed flex-1">
      {description}
    </p>
    {chips && (
      <div className="mt-5 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c}
            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400"
          >
            {c}
          </span>
        ))}
      </div>
    )}
  </motion.div>
);

export default SkillsSection;
