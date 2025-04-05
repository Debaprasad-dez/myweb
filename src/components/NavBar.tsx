
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, toggleTheme } = useTheme();
  
  // Add scroll event listener to change navbar style and track active section
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar style on scroll
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Determine active section
      const sections = ["skills", "projects", "experience", "contact"];
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          } else if (scrollPosition < document.getElementById("skills")?.offsetTop!) {
            setActiveSection("hero");
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (section: string) => section === activeSection;
  
  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled 
          ? 'py-3 bg-white/80 backdrop-blur-lg shadow-lg dark:bg-portfolio-black/80' 
          : 'py-5 bg-white dark:bg-portfolio-black text-portfolio-gunmetal dark:text-portfolio-almond'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="text-2xl font-bold text-portfolio-gunmetal dark:text-portfolio-almond"
            whileHover={{ scale: 1.05 }}
          >
            <a href="/" className="flex items-center">
              <span className="text-portfolio-khaki dark:text-portfolio-khaki">D</span>P
            </a>
          </motion.div>
          
          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center space-x-8 mx-auto">
            <NavItem 
              label="Skills" 
              onClick={() => scrollToSection('skills')} 
              isActive={isActive('skills')}
            />
            <NavItem 
              label="Projects" 
              onClick={() => scrollToSection('projects')} 
              isActive={isActive('projects')}
            />
            <NavItem 
              label="Experience" 
              onClick={() => scrollToSection('experience')} 
              isActive={isActive('experience')}
            />
            <NavItem 
              label="Contact" 
              onClick={() => scrollToSection('contact')} 
              isActive={isActive('contact')}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle with smooth transition */}
            <motion.button
              className="p-2 rounded-full text-portfolio-gunmetal dark:text-portfolio-almond hover:bg-portfolio-gunmetal/10 dark:hover:bg-portfolio-gunmetal/20 transition-all duration-300"
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1, rotate: 15 }}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0, rotate: -30 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 30 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "light" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Resume Button */}
            <motion.a 
              href="/myweb/resume.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:block px-5 py-2.5 bg-transparent border border-portfolio-khaki text-portfolio-khaki font-medium rounded-full hover:bg-portfolio-khaki/10 transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Resume
            </motion.a>
            
            {/* Mobile Menu Button */}
            <motion.button 
              className="md:hidden text-portfolio-gunmetal dark:text-portfolio-almond focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: isOpen ? -90 : 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: isOpen ? 90 : -90 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden glass dark:glass"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <MobileNavItem 
                label="Skills" 
                onClick={() => scrollToSection('skills')} 
                isActive={isActive('skills')}
                index={0}
              />
              <MobileNavItem 
                label="Projects" 
                onClick={() => scrollToSection('projects')} 
                isActive={isActive('projects')}
                index={1}
              />
              <MobileNavItem 
                label="Experience" 
                onClick={() => scrollToSection('experience')} 
                isActive={isActive('experience')}
                index={2}
              />
              <MobileNavItem 
                label="Contact" 
                onClick={() => scrollToSection('contact')} 
                isActive={isActive('contact')}
                index={3}
              />
              <motion.a 
                href="/myweb/resume.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center px-5 py-2.5 bg-transparent border border-portfolio-khaki text-portfolio-khaki font-medium rounded-full transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                whileTap={{ scale: 0.95 }}
              >
                Resume
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Desktop Navigation Item with microanimation
const NavItem = ({ label, onClick, isActive }: { label: string; onClick: () => void; isActive: boolean }) => (
  <motion.button 
    onClick={onClick}
    className={`relative text-portfolio-gunmetal dark:text-portfolio-almond hover:text-portfolio-khaki dark:hover:text-portfolio-khaki transition-colors overflow-hidden ${isActive ? 'text-portfolio-khaki dark:text-portfolio-khaki font-medium' : ''}`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <span className="relative z-10">{label}</span>
    
    {/* Background animation on hover */}
    <motion.span
      className="absolute bottom-0 left-0 w-full h-0.5 bg-portfolio-khaki dark:bg-portfolio-khaki origin-left"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: isActive ? 1 : 0 }}
      whileHover={{ scaleX: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.button>
);

// Mobile Navigation Item
const MobileNavItem = ({ label, onClick, isActive, index }: { label: string; onClick: () => void; isActive: boolean; index: number }) => (
  <motion.button 
    onClick={onClick}
    className={`block w-full text-left py-2 px-3 rounded-md ${isActive ? 'bg-portfolio-khaki/10 dark:bg-portfolio-khaki/10 text-portfolio-khaki dark:text-portfolio-khaki' : 'text-portfolio-gunmetal/80 dark:text-portfolio-almond/80 hover:text-portfolio-khaki dark:hover:text-portfolio-khaki'} transition-colors`}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1, duration: 0.3 }}
    whileTap={{ scale: 0.95 }}
  >
    {label}
  </motion.button>
);

export default NavBar;
