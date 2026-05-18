import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

const SECTIONS = [
  { id: "skills", label: "Expertise", num: "01" },
  { id: "projects", label: "Work", num: "02" },
  { id: "experience", label: "Experience", num: "03" },
  { id: "contact", label: "Contact", num: "04" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const scrollPosition = window.scrollY + window.innerHeight / 3;
      let current = "hero";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && scrollPosition >= el.offsetTop) {
          current = s.id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "py-3 border-b border-ink-200/60 dark:border-ink-800/60 bg-white/70 dark:bg-ink-950/70 backdrop-blur-xl"
          : "py-5 bg-transparent"
      }`}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="container mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="group flex items-center gap-2 font-mono text-sm"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-ink-950 dark:bg-white text-white dark:text-ink-950 font-semibold tracking-tight">
              D
            </span>
            <span className="hidden sm:block text-ink-900 dark:text-ink-100 font-medium">
              debaprasad
              <span className="text-accent2">-</span>
              dez
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full border border-ink-200 dark:border-ink-800 bg-white/40 dark:bg-ink-900/40 backdrop-blur-md">
            {SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "text-ink-950 dark:text-ink-50"
                      : "text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-ink-100 dark:bg-ink-800"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <motion.button
              className="p-2 rounded-full text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              title={theme === "light" ? "Switch to dark" : "Switch to light"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0, rotate: -30 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 30 }}
                  transition={{ duration: 0.25 }}
                >
                  {theme === "light" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <a
              href="/myweb/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-ink-950 dark:bg-white text-white dark:text-ink-950 text-xs font-medium hover:opacity-90 transition-all"
            >
              Resume
              <span aria-hidden>↗</span>
            </a>

            <button
              className="md:hidden p-2 text-ink-900 dark:text-ink-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: isOpen ? -90 : 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: isOpen ? 90 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-t border-ink-200 dark:border-ink-800 bg-white/95 dark:bg-ink-950/95 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="container mx-auto px-6 py-4 space-y-1">
              {SECTIONS.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg ${
                    activeSection === s.id
                      ? "bg-ink-100 dark:bg-ink-900 text-ink-950 dark:text-ink-50"
                      : "text-ink-600 dark:text-ink-300"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="font-mono text-xs text-ink-500 dark:text-ink-500">
                    {s.num}
                  </span>
                  <span className="font-medium">{s.label}</span>
                </motion.button>
              ))}
              <a
                href="/myweb/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-3 mt-3 rounded-lg bg-ink-950 dark:bg-white text-white dark:text-ink-950 text-sm font-medium"
              >
                Resume ↗
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
