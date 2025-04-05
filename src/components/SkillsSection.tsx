
import { Monitor, Code, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

const expertiseAreas = [
  {
    icon: Monitor,
    title: "Frontend",
    subtitle: "Development",
    titleColor: "#ff58a7", // Pink color
    description: "Over 3 years of development experience in HTML, CSS, JS, React and NextJS frameworks."
  },
  {
    icon: Code,
    title: "Backend",
    subtitle: "Development",
    titleColor: "#6a89ff", // Blue color
    description: "Skilled in building secure, scalable backend systems with Spring Boot, Node.js, and Python."
  },
  {
    icon: Smartphone,
    title: "Product",
    subtitle: "Design",
    titleColor: "#ff5e3a", // Orange color
    description: "Passionate about intuitive UI/UX design, skilled in Figma and illustration for user-centric products."
  }
];

const SkillsSection = () => {
  const { theme } = useTheme();
  
  return (
    <section id="skills" className={`py-20 relative ${theme === 'light' ? 'bg-white' : 'bg-portfolio-black'}`}>
      <div className="container mx-auto px-12 md:px-20">
        <motion.h2 
          className={`text-5xl md:text-6xl font-bold mb-16 text-center font-heading ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          My Expertise
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {expertiseAreas.map((area, index) => (
            <motion.div 
              key={index}
              className={`p-8 rounded-xl shadow-lg ${
                theme === 'light' 
                ? 'bg-white/30 backdrop-blur-md border border-white/50' 
                : 'bg-portfolio-black/40 backdrop-blur-md border border-portfolio-walnut/30'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                boxShadow: theme === 'light' 
                  ? '0 8px 30px rgba(0, 0, 0, 0.12)'
                  : '0 8px 30px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center mb-6 space-x-4">
                <area.icon size={30} className={theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'} />
                <div>
                  <h3 className="text-2xl font-bold font-heading">
                    <span style={{ color: area.titleColor }}>{area.title}</span>{" "}
                    <span className={theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}>{area.subtitle}</span>
                  </h3>
                </div>
              </div>
              
              <div className={`border-l-2 ${theme === 'light' ? 'border-gray-300' : 'border-portfolio-walnut/50'} pl-4 py-2`}>
                <p className={`${theme === 'light' ? 'text-portfolio-gunmetal/90' : 'text-portfolio-almond/90'} leading-relaxed`}>
                  {area.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
