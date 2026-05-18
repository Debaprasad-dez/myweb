import { ArrowUpRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import comviva from "../assets/comviva.svg";
import equilend from "../assets/equilend.png";

const experiences = [
  {
    id: 1,
    period: "Jul 2025 — Present",
    role: "Senior Software Development Engineer",
    company: "EquiLend",
    companyUrl: "https://www.equilend.com/",
    logo: equilend,
    logoText: "EquiLend",
    summary:
      "Driving frontend architecture for real-time securities-finance platforms in microfrontend land.",
    bullets: [
      "Architected scalable, independently-deployable microfrontends for real-time securities-finance products using React, TypeScript, and Module Federation.",
      "Shipped low-latency UIs powered by WebSockets, with advanced rendering strategies, code splitting, and Core Web Vitals tuning.",
      "Designed and maintained shared component libraries and a design system — UI consistency and faster cross-team delivery.",
      "Engineered robust state and real-time data handling for high-volume trading data — consistency and fault tolerance under load.",
      "Led adoption of agentic AI workflows (Cursor, Copilot, Claude Code) across teams to lift engineering velocity and code quality.",
    ],
    skills: [
      "React",
      "TypeScript",
      "Microfrontends",
      "WebSockets",
      "Design Systems",
      "Module Federation",
      "AWS",
    ],
  },
  {
    id: 2,
    period: "Nov 2023 — Jun 2025",
    role: "Senior Engineer",
    company: "Comviva",
    companyUrl: "https://www.comviva.com/",
    logo: comviva,
    summary:
      "Owned scalable fintech UIs for critical money-movement modules in the Mobiquity Banking suite.",
    bullets: [
      "Built scalable fintech UIs for critical modules — bank transfers, currency conversion, bulk payouts, and pooled-account systems with RBAC.",
      "Integrated REST + GraphQL with caching layers — 25% faster response times.",
      "Optimized client-side performance and state management for sustained throughput on high-traffic flows.",
      "Raised test coverage to 95% with React Testing Library, Jest, and Cypress.",
    ],
    skills: [
      "React",
      "TypeScript",
      "Redux",
      "GraphQL",
      "Angular",
      "RTL",
      "Jest",
    ],
  },
  {
    id: 3,
    period: "Jul 2021 — Nov 2023",
    role: "Product Development Engineer",
    company: "Comviva",
    companyUrl: "https://www.comviva.com/",
    logo: comviva,
    summary:
      "Component systems, state architecture, and the unglamorous infra that lets a team ship without fear.",
    bullets: [
      "Built a reusable component system in React + TypeScript that cut UI development effort by 35%.",
      "Refactored Redux-based state, eliminating ~30% of redundant API calls.",
      "Improved API integration and data-handling for a 20% drop in response times.",
      "Streamlined deployments via Jenkins + Nginx — improved availability and release cadence.",
    ],
    skills: [
      "JavaScript",
      "TypeScript",
      "Redux",
      "ES6+",
      "Jenkins",
      "Nginx",
    ],
  },
];

const SectionLabel = () => (
  <div className="flex items-center gap-4 mb-12">
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
      03 — Experience
    </span>
    <span className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />
  </div>
);

const ExperienceSection = () => {
  return (
    <section
      id="experience"
      className="relative py-20 md:py-24 bg-white dark:bg-ink-950"
    >
      <div className="container mx-auto px-6 md:px-10">
        <SectionLabel />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 font-heading text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]"
          >
            Where I've been{" "}
            <span className="font-display italic font-normal text-accent2">
              shipping
            </span>
            .
          </motion.h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          <span className="absolute left-3 top-2 bottom-2 w-px bg-ink-200 dark:bg-ink-800" />
          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative pl-10 md:pl-14"
              >
                {/* Node */}
                <span className="absolute left-2 top-2 w-3 h-3 rounded-full bg-white dark:bg-ink-950 border-2 border-accent2" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Meta */}
                  <div className="lg:col-span-3">
                    <p className="font-mono text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">
                      {exp.period}
                    </p>
                    <div className="mt-4 h-10 flex items-center">
                      {exp.logo ? (
                        <img
                          src={exp.logo}
                          alt={`${exp.company} logo`}
                          className="h-7 object-contain opacity-80 dark:invert"
                        />
                      ) : (
                        <div className="inline-flex items-center gap-2 text-ink-700 dark:text-ink-200">
                          <Building2 className="w-4 h-4 text-accent2" />
                          <span className="font-heading text-base font-semibold tracking-tight">
                            {exp.logoText ?? exp.company}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="lg:col-span-9">
                    <a
                      href={exp.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2"
                    >
                      <h3 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50 group-hover:text-accent2 transition-colors">
                        {exp.role}{" "}
                        <span className="text-ink-500 dark:text-ink-500 font-normal">
                          ·
                        </span>{" "}
                        {exp.company}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-ink-500 group-hover:text-accent2 transition-all group-hover:-translate-y-0.5" />
                    </a>

                    <p className="mt-2 text-base text-ink-700 dark:text-ink-300">
                      {exp.summary}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {exp.bullets.map((b, j) => (
                        <li
                          key={j}
                          className="flex gap-3 text-sm text-ink-600 dark:text-ink-400 leading-relaxed"
                        >
                          <span className="font-mono text-[10px] text-accent2 mt-1.5">
                            ▸
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {exp.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
