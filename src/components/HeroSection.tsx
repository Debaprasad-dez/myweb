
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "../hooks/use-mobile";
import { useTheme } from "../providers/ThemeProvider";
import Ben10 from '../assets/ben10.png';
import Original from '../assets/original.jpeg';


const HeroSection = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Handle mouse movement for 3D effect
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!divRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Update mouse position for steel text effect
      setMousePosition({
        x: (clientX / innerWidth) * 2 - 1,
        y: (clientY / innerHeight) * 2 - 1
      });
      
      // Calculate rotation based on mouse position
      const xRotation = (clientY / innerHeight - 0.5) * 10;
      const yRotation = (clientX / innerWidth - 0.5) * -10;
      
      divRef.current.style.transform = `
        perspective(1000px)
        rotateX(${xRotation}deg)
        rotateY(${yRotation}deg)
        translateZ(20px)
      `;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);
  
  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Define shapes to draw
    const shapes = [
      { type: 'circle', x: canvas.width * 0.2, y: canvas.height * 0.3, size: 80, color: '#a8dadc50', speed: 0.3 },
      { type: 'triangle', x: canvas.width * 0.7, y: canvas.height * 0.2, size: 100, color: '#e6394650', speed: 0.5 },
      { type: 'square', x: canvas.width * 0.5, y: canvas.height * 0.7, size: 120, color: '#1d355750', speed: 0.2 },
      { type: 'circle', x: canvas.width * 0.8, y: canvas.height * 0.8, size: 60, color: '#457b9d50', speed: 0.4 },
      { type: 'triangle', x: canvas.width * 0.3, y: canvas.height * 0.6, size: 90, color: '#e6394650', speed: 0.3 },
    ];
    
    let time = 0;
    
    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 0.01;
      
      // Draw shapes with movement
      shapes.forEach((shape) => {
        ctx.save();
        
        // Create floating motion
        const x = shape.x + Math.sin(time * shape.speed * 5) * 40;
        const y = shape.y + Math.cos(time * shape.speed * 3) * 30;
        
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = 0.5 + Math.sin(time * shape.speed) * 0.2;
        
        if (shape.type === 'circle') {
          ctx.beginPath();
          ctx.arc(x, y, shape.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape.type === 'square') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(time * shape.speed);
          ctx.fillRect(-shape.size/2, -shape.size/2, shape.size, shape.size);
          ctx.restore();
        } else if (shape.type === 'triangle') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(time * shape.speed);
          ctx.beginPath();
          ctx.moveTo(0, -shape.size/2);
          ctx.lineTo(shape.size/2, shape.size/2);
          ctx.lineTo(-shape.size/2, shape.size/2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        
        ctx.restore();
      });
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  // Text animation variants
  const titleVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const roleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        delay: 0.6,
        type: "spring",
        stiffness: 100
      } 
    }
  };

  // Typewriter effect for the role
  const [displayText, setDisplayText] = useState("");
  const fullText = "Senior Frontend Engineer";
  
  useEffect(() => {
    let i = 0;
    const typeTimer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeTimer);
        setAnimationComplete(true);
      }
    }, 100);
    
    return () => clearInterval(typeTimer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Mobile specific layout
  if (isMobile) {
    return (
      <section className="min-h-screen relative overflow-hidden">
        {/* Canvas background */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0" 
          style={{ opacity: 0.8 }}
        />
        
        {/* Upper part with image */}
        <div className="relative h-[60vh] w-full flex items-center justify-center">
          <div className="w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&fit=crop" 
              alt="Debaprasad"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Arc overlay */}
        <div className="hero-arc-overlay" />
        
        {/* Content part */}
        <div className="relative z-10 px-6 pt-8 pb-20">
          <motion.h1 
            className={`text-5xl font-bold font-heading ${
              theme === 'light' 
                ? 'text-portfolio-gunmetal' 
                : 'steel-text'
            }`}
            initial="hidden"
            animate="visible"
            variants={titleVariants}
          >
            Debaprasad Paul
          </motion.h1>
          
          <motion.h2 
            className="text-2xl mt-4 text-modern-text dark:text-portfolio-almond font-heading"
            initial="hidden"
            animate="visible"
            variants={roleVariants}
          >
            <span className="typewriter">{displayText}</span>
            {!animationComplete && <span className="typing-cursor">|</span>}
          </motion.h2>
          
          <p className="mt-6 text-lg text-modern-text/70 dark:text-portfolio-almond/70 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
            Creating elegant, high-performance web experiences with an eye for detail 
            and a passion for clean code.
          </p>
          
          <div className="mt-8 animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
            <motion.button 
              className="group px-6 py-3 bg-modern-primary text-white font-medium rounded-md flex items-center space-x-2 relative overflow-hidden button-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-modern-primary to-modern-depth opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-lg"></span>
              
              <span className="relative z-10">Let's Connect</span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </section>
    );
  }
  
  // Desktop layout
  return (
    <section className="min-h-screen flex flex-col justify-center py-20 relative overflow-hidden">
      {/* Abstract Geometric Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0" 
        style={{ opacity: 0.8 }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Abstract Profile Shape */}
          <motion.div 
            className="mb-10 md:mb-0 md:mr-12 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-[180px] h-[180px] md:w-[450px] md:h-[450px]">
              {/* Abstract geometric shape container */}
              <div className="absolute inset-0 shape-animation">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path 
                    fill="#e63946" 
                    d="M40.8,-62.2C52.9,-51.2,62.4,-38.8,69.4,-24.2C76.4,-9.6,80.8,7.1,77.2,21.8C73.5,36.5,61.9,49.1,48.1,58.3C34.2,67.5,17.1,73.2,0.4,72.6C-16.3,72,-32.6,65.1,-45.9,54.6C-59.1,44.1,-69.3,29.9,-74.8,13C-80.3,-3.9,-81.1,-23.5,-73.4,-38.8C-65.7,-54.1,-49.5,-65.1,-33.8,-74C-18,-82.9,-2.7,-89.7,9.8,-84.7C22.3,-79.7,28.7,-73.1,40.8,-62.2Z" 
                    transform="translate(100 100)" 
                    className="opacity-90"
                  />
                </svg>
              </div>
              
              {/* Profile image */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="image-container" >

                <img 
                  src={Original} 
                  alt="original"
                  className="w-full h-full object-cover image-wrapper main-image"
                  style={{ width: '410px', height: '410px', objectFit: 'cover' }}
                />
                <img 
                  src={Ben10}
                  alt="Ben10"
                  className="w-full h-full object-cover image-wrapper hover-image"
                  style={{ width: '410px', height: '410px', objectFit: 'cover' }}
                />
                </div>
              </div>
              
              {/* Overlay effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-modern-primary/10 via-transparent to-modern-secondary/20"
                style={{
                  transform: `rotate(${45 + mousePosition.x * 15}deg)`,
                }}
                transition={{ type: "spring", bounce: 0.25 }}
              />
            </div>
          </motion.div>
          
          <div
            ref={divRef}
            className="transition-transform duration-200 ease-out md:max-w-2xl"
          >
            {/* Text Content */}
            <motion.h1 
              className={`text-5xl md:text-7xl font-bold font-heading ${
                theme === 'light' 
                  ? 'text-portfolio-gunmetal' 
                  : 'steel-text'
              }`}
              initial="hidden"
              animate="visible"
              variants={titleVariants}
            >
              Debaprasad Paul
            </motion.h1>
            
            <motion.h2 
              className="text-2xl md:text-3xl mt-4 text-modern-text dark:text-portfolio-almond font-heading"
              initial="hidden"
              animate="visible"
              variants={roleVariants}
            >
              <span className="typewriter">{displayText}</span>
              {!animationComplete && <span className="typing-cursor">|</span>}
            </motion.h2>
            
            <p className="max-w-2xl mt-6 text-lg text-modern-text/70 dark:text-portfolio-almond/70 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              Creating elegant, high-performance web experiences with an eye for detail 
              and a passion for clean code.
            </p>
            
            <div className="mt-10 animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
              <motion.button 
                className="group px-6 py-3 bg-modern-primary text-white font-medium rounded-md flex items-center space-x-2 relative overflow-hidden button-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button Glow Effect */}
                <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-modern-primary to-modern-depth opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-lg"></span>
                
                <span className="relative z-10" onClick={() => scrollToSection('contact')}>Let's Connect</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator - Centered */}
      {/* <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center animate-fade-in opacity-0 z-20" style={{ animationDelay: '1.2s' }}>
        <p className="text-sm text-modern-text/50 dark:text-portfolio-almond/50 mb-2">Scroll to explore</p>
        <div className="w-5 h-9 rounded-full border-2 border-modern-text/20 dark:border-portfolio-almond/20 flex justify-center">
          <div className="w-1 h-2 bg-modern-primary/70 rounded-full mt-2 animate-float"></div>
        </div>
      </div> */}
    </section>
  );
};

export default HeroSection;
