
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

const LoadingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [splitting, setSplitting] = useState(false);
  const controls = useAnimation();
  const { theme } = useTheme();
  
  useEffect(() => {
    // Start the loading sequence
    const loadingTimer = setTimeout(() => {
      setSplitting(true);
      
      // Prepare for the zoom animation
      setTimeout(async () => {
        await controls.start({
          scale: 15,
          opacity: 0,
          transition: { duration: 0.6, ease: "easeInOut" }
        });
        setLoading(false);
      }, 500);
      
    }, 1200);

    return () => clearTimeout(loadingTimer);
  }, [controls]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-portfolio-black'}`}
        >
          <motion.div 
            animate={controls}
            className="text-center origin-center"
          >
            {!splitting ? (
              <h1 className={`text-7xl md:text-9xl font-bold italic ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'} font-mono enhanced-glitch`}>
                <span 
                  className="relative inline-block"
                  data-text="DP"
                >
                  DP
                </span>
              </h1>
            ) : (
              <div className="flex">
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`text-7xl md:text-9xl font-bold italic ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'} font-mono enhanced-glitch overflow-hidden`}
                >
                  <span className="relative inline-block">D</span>
                </motion.div>
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: 50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`text-7xl md:text-9xl font-bold italic ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'} font-mono enhanced-glitch overflow-hidden`}
                >
                  <span className="relative inline-block">P</span>
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
