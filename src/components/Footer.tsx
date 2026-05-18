import { Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950">
      <div className="container mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-ink-950 dark:bg-white text-white dark:text-ink-950 font-mono text-sm font-semibold">
              D
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium text-ink-900 dark:text-ink-100">
                Debaprasad Paul
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-500">
                Senior Frontend Engineer
              </p>
            </div>
          </div>

          {/* Center — status */}
          <div className="flex md:justify-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-ink-500 dark:text-ink-400">
              <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-accent2 status-dot" />
              <span>All systems operational</span>
            </div>
          </div>

          {/* Right — socials */}
          <div className="flex md:justify-end items-center gap-2">
            <a
              href="https://github.com/Debaprasad-dez"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-ink-200 dark:border-ink-800 text-ink-700 dark:text-ink-300 hover:border-accent2 hover:text-accent2 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/debaprasad-paul/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-ink-200 dark:border-ink-800 text-ink-700 dark:text-ink-300 hover:border-accent2 hover:text-accent2 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-200 dark:border-ink-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-500">
          <span>© {new Date().getFullYear()} Debaprasad Paul · Crafted in React, Tailwind, Framer Motion</span>
          <span>Built with intention · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" })}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
