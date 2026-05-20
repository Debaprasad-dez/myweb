import { useState } from "react";
import { ArrowUpRight, Code, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import op7t from "../assets/op7t.png";
import pourfolio from "../assets/pourfolio.png";
import bodivue from "../assets/bodivue.png";
import ThoughtTag from "../assets/ThoughtTag.png";
import CheersPass from "../assets/CheersPass.png";
import billxo from "../assets/billxo.png";
import atlantis from "../assets/atlantis.png";

interface Project {
  id: number;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  liveUrl: string;
  codeUrl: string;
  year: string;
}

const projects: Project[] = [
  {
    id: 7,
    title: "Atlantis",
    tagline: "Fraud intelligence platform",
    description:
      "Offline-first fraud analytics dashboard with graph visualization, entity explorer, anomaly detection, and audit trails — built 100% through Claude Code prompts.",
    longDescription:
      "Atlantis is a browser-based fraud intelligence platform with a dark, data-dense analyst aesthetic. Features a live dashboard, entity relationship graph, investigation workspace, geospatial mapping, anomaly detection tuning, and hash-chained audit logs. Fully offline using IndexedDB and Service Workers — architected for seamless future backend integration. Every line of code was generated through Claude Code using only natural language prompts.",
    image: atlantis,
    tags: ["React", "Vite", "Tailwind", "IndexedDB", "Claude Code", "Made using AI ✨"],
    liveUrl: "https://debaprasad-dez.github.io/atlantis/",
    codeUrl: "https://github.com/Debaprasad-dez/atlantis",
    year: "2025",
  },
  {
    id: 1,
    title: "CheersPass",
    tagline: "Event ticketing platform",
    description:
      "Modern event ticketing with QR-coded entry, real-time analytics, and tooling for organizers and attendees alike.",
    longDescription:
      "A modern event ticketing platform that allows users to create, manage, and sell tickets for events. Features QR code scanning, real-time analytics, and user-friendly interfaces for both organizers and attendees.",
    image: CheersPass,
    tags: ["Next.js", "Stripe", "Tailwind"],
    liveUrl: "https://debaprasad-dez.github.io/cheerspass/",
    codeUrl: "https://github.com/Debaprasad-dez/cheerspass",
    year: "2025",
  },
  {
    id: 2,
    title: "Bodivue",
    tagline: "Health & nutrition companion",
    description:
      "Personal health and diet management with meal planning, exercise tracking, and data-driven recommendations.",
    longDescription:
      "A personal health and diet management platform that helps users track fitness goals and nutrition. Includes meal planning, exercise tracking, and personalized recommendations based on user data.",
    image: bodivue,
    tags: ["React", "TypeScript", "Redux", "Chart.js"],
    liveUrl: "https://debaprasad-dez.github.io/bodivue/",
    codeUrl: "https://github.com/Debaprasad-dez/bodivue",
    year: "2025",
  },
  {
    id: 3,
    title: "ThoughtTag",
    tagline: "Sticky notes, reimagined",
    description:
      "A visual canvas for capturing, organizing, and sharing sticky notes with drag-and-drop and collaborative editing.",
    longDescription:
      "A digital canvas for sticky notes: drag-and-drop, color-coding, collaborative editing, and calendar integration. Designed for both personal and team use.",
    image: ThoughtTag,
    tags: ["React", "Canvas API"],
    liveUrl: "https://debaprasad-dez.github.io/thought-tag/",
    codeUrl: "https://github.com/Debaprasad-dez/thought-tag",
    year: "2024",
  },
  {
    id: 4,
    title: "OP7T",
    tagline: "Phone product site",
    description:
      "A scroll-driven product site showcasing the OnePlus 7T's features and specs.",
    longDescription:
      "Product website for my phone — showcases its features and specifications with scroll-driven storytelling.",
    image: op7t,
    tags: ["React", "fullpage.js"],
    liveUrl: "https://debaprasad-dez.github.io/op7t/",
    codeUrl:
      "https://github.com/Debaprasad-dez?tab=repositories&q=op7&type=&language=&sort=",
    year: "2023",
  },
  {
    id: 5,
    title: "Pourfolio",
    tagline: "Tasting journal · PWA",
    description:
      "An offline-first tasting journal and party companion that tracks beverage experiences over time.",
    longDescription:
      "Tasting journal and party companion that helps users track their beverage experiences. Built as an installable PWA.",
    image: pourfolio,
    tags: ["React", "PWA"],
    liveUrl: "https://debaprasad-dez.github.io/pourfolio/",
    codeUrl: "https://github.com/Debaprasad-dez/pourfolio",
    year: "2024",
  },
  {
    id: 6,
    title: "Billxo",
    tagline: "Your invoicing platform",
    description:
      "Customizable invoice templates, payment tracking, and real-time analytics — all client-side.",
    longDescription:
      "A modern invoicing platform with customizable templates, payment tracking, and real-time analytics. Fully client-side with realtime sync via WebSockets.",
    image: billxo,
    tags: ["WebSockets", "React", "localStorage"],
    liveUrl: "https://debaprasad-dez.github.io/Billxo/",
    codeUrl: "https://github.com/Debaprasad-dez/Billxo",
    year: "2024",
  },
];

const SectionLabel = () => (
  <div className="flex items-center gap-4 mb-12">
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
      02 — Selected Work
    </span>
    <span className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />
    <span className="font-mono text-xs text-ink-500 dark:text-ink-400">
      {projects.length.toString().padStart(2, "0")} projects
    </span>
  </div>
);

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  return (
    <section
      id="projects"
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
            Things I've{" "}
            <span className="font-display italic font-normal text-accent2">
              shipped
            </span>
            .
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 lg:col-start-8 flex items-end text-ink-600 dark:text-ink-400 text-base md:text-lg leading-relaxed"
          >
            Side-projects, product work, and tasteful experiments. Each one
            taught me something I now bring into production code.
          </motion.p>
        </div>

        {/* Project list — repeating row pattern */}
        <div className="divide-y divide-ink-200 dark:divide-ink-800 border-y border-ink-200 dark:border-ink-800">
          {projects.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={index}
              onOpen={() => setSelectedProject(project.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="bg-white dark:bg-ink-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-ink-200 dark:border-ink-800"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const p = projects.find((x) => x.id === selectedProject);
                if (!p) return null;
                return (
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-2">
                          {p.year} · Project
                        </p>
                        <h3 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-ink-600 dark:text-ink-400">
                          {p.tagline}
                        </p>
                      </div>
                      <button
                        className="p-2 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-full transition-colors"
                        onClick={() => setSelectedProject(null)}
                      >
                        <X className="w-5 h-5 text-ink-700 dark:text-ink-300" />
                      </button>
                    </div>

                    <div className="mb-6 rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full object-cover h-72"
                      />
                    </div>

                    <p className="text-ink-700 dark:text-ink-300 leading-relaxed mb-6">
                      {p.longDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-8">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={p.liveUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-ink-950 dark:bg-white text-white dark:text-ink-950 rounded-full text-sm font-medium hover:opacity-90 transition-all"
                      >
                        Live demo
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={p.codeUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-ink-300 dark:border-ink-700 rounded-full text-sm font-medium hover:border-accent2 hover:text-accent2 transition-colors"
                      >
                        <Code className="w-4 h-4" />
                        Source
                      </a>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ProjectRow = ({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group w-full text-left relative py-6 md:py-8 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-ink-50/60 dark:hover:bg-ink-900/40 px-2 md:px-4 rounded-lg"
    >
      <span className="col-span-2 md:col-span-1 font-mono text-xs text-ink-500 dark:text-ink-500">
        {(index + 1).toString().padStart(2, "0")}
      </span>

      <div className="col-span-10 md:col-span-4">
        <h3 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50 group-hover:text-accent2 transition-colors">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">
          {project.tagline}
        </p>
      </div>

      <div className="hidden md:flex col-span-4 flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400"
          >
            {t}
          </span>
        ))}
      </div>

      <span className="hidden md:block col-span-2 font-mono text-xs text-ink-500 dark:text-ink-400">
        {project.year}
      </span>

      <span className="col-span-12 md:col-span-1 flex justify-end">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-200 dark:border-ink-800 text-ink-700 dark:text-ink-300 transition-all duration-300 group-hover:border-accent2 group-hover:text-accent2 group-hover:rotate-[-12deg]">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </span>

      {/* Hover preview thumb */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none hidden lg:block absolute right-20 top-1/2 -translate-y-1/2 w-56 aspect-[4/3] rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800 shadow-2xl z-10"
          >
            <img
              src={project.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ProjectsSection;
