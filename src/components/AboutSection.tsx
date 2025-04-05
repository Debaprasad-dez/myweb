
import { Code, Layout, Smartphone, Zap } from "lucide-react";
import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 relative bg-portfolio-gunmetal">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 flex items-center space-x-3 text-portfolio-almond">
          <span className="w-8 h-[2px] bg-portfolio-khaki"></span>
          <span>About Me</span>
        </h2>
        
        <div className="space-y-10">
          <div className="space-y-6">
            <p className="text-lg text-portfolio-almond leading-relaxed">
              I'm a passionate frontend engineer with over 8 years of experience crafting
              exceptional digital experiences. My approach combines clean code, thoughtful
              design, and cutting-edge technology to build products that people love.
            </p>
            <p className="text-lg text-portfolio-almond leading-relaxed">
              I specialize in building modern web applications with React, TypeScript, and
              Next.js, with a strong focus on performance, accessibility, and user experience.
              I believe that great software should be both beautiful and functional.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10">
              <motion.div 
                className="bg-portfolio-black p-6 rounded-2xl border border-portfolio-khaki/30 hover:border-portfolio-khaki transition-all duration-300 group"
                whileHover={{ y: -10, boxShadow: '0 10px 25px rgba(198, 172, 143, 0.2)' }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-portfolio-khaki to-portfolio-almond/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Code className="w-6 h-6 text-portfolio-black" />
                  </div>
                  <span className="text-portfolio-almond font-medium text-center">Clean Code</span>
                  <div className="w-10 h-1 bg-portfolio-khaki mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-portfolio-black p-6 rounded-2xl border border-portfolio-khaki/30 hover:border-portfolio-khaki transition-all duration-300 group"
                whileHover={{ y: -10, boxShadow: '0 10px 25px rgba(198, 172, 143, 0.2)' }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-portfolio-khaki to-portfolio-almond/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Layout className="w-6 h-6 text-portfolio-black" />
                  </div>
                  <span className="text-portfolio-almond font-medium text-center">UI Design</span>
                  <div className="w-10 h-1 bg-portfolio-khaki mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-portfolio-black p-6 rounded-2xl border border-portfolio-khaki/30 hover:border-portfolio-khaki transition-all duration-300 group"
                whileHover={{ y: -10, boxShadow: '0 10px 25px rgba(198, 172, 143, 0.2)' }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-portfolio-khaki to-portfolio-almond/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-6 h-6 text-portfolio-black" />
                  </div>
                  <span className="text-portfolio-almond font-medium text-center">Responsive</span>
                  <div className="w-10 h-1 bg-portfolio-khaki mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-portfolio-black p-6 rounded-2xl border border-portfolio-khaki/30 hover:border-portfolio-khaki transition-all duration-300 group"
                whileHover={{ y: -10, boxShadow: '0 10px 25px rgba(198, 172, 143, 0.2)' }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-portfolio-khaki to-portfolio-almond/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 text-portfolio-black" />
                  </div>
                  <span className="text-portfolio-almond font-medium text-center">Performance</span>
                  <div className="w-10 h-1 bg-portfolio-khaki mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
