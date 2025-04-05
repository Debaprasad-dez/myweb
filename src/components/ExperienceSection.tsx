import { useState, useRef, useEffect } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "../hooks/use-mobile";
import comviva from "../assets/comviva.svg";

// Experience data - only keeping the first 2 experiences as requested
const experiences = [
  {
    id: 1,
    period: '2023 — Present',
    role: 'Senior Engineer',
    company: 'Comviva',
    companyUrl: 'https://www.comviva.com/',
    logo: comviva,
    description: 'Developed a high-performance banking transaction UI within a Micro Frontend architecture, boosting app load speed by 40% and delivering a seamless user experience. Built a robust bank transfer module with real-time balance validation, managing over ₹100 crore in monthly transactions. Integrated REST and GraphQL APIs with effective caching to reduce response times by 25%. Automated CI/CD pipelines using Jenkins, cutting deployment time by 50%, and improved code reliability by increasing test coverage to 90% using Jest, Cypress, and React Testing Library.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js','Redux','Angular','mongodb','payment gateway','graphql']
  },
  {
    id: 2,
    period: '2021 — 2023',
    role: 'Product Development Engineer',
    company: 'Comviva',
    companyUrl: 'https://www.comviva.com/',
    logo: comviva,
    description: 'Built reusable UI components to ensure design consistency and reduce development time by 35%. Optimized state management using Redux, cutting down unnecessary API calls by 30% and boosting overall performance. Improved API response times by 20% through efficient data handling strategies. Streamlined deployments and ensured high availability by deploying and managing Jenkins and Nginx.',
    skills: ['JavaScript', 'TypeScript','Linux','sql','postgressql']
  }
];

const ExperienceSection = () => {
  const [activeExperience, setActiveExperience] = useState<number | null>(null);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Handle carousel scroll on mobile
  const scrollToNext = () => {
    if (scrollContainerRef.current && currentExperienceIndex < experiences.length - 1) {
      setCurrentExperienceIndex(prev => prev + 1);
    }
  };

  const scrollToPrev = () => {
    if (scrollContainerRef.current && currentExperienceIndex > 0) {
      setCurrentExperienceIndex(prev => prev - 1);
    }
  };

  // Scroll to current experience when index changes
  useEffect(() => {
    if (scrollContainerRef.current && isMobile) {
      const cardWidth = scrollContainerRef.current.scrollWidth / experiences.length;
      scrollContainerRef.current.scrollTo({
        left: cardWidth * currentExperienceIndex,
        behavior: 'smooth'
      });
    }
  }, [currentExperienceIndex, isMobile]);
  
  return (
    <section id="experience" className="py-20 relative bg-white dark:bg-portfolio-black text-portfolio-gunmetal dark:text-portfolio-almond">
      <div className="container mx-auto px-8 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 flex items-center space-x-3">
          <span className="w-8 h-[2px] bg-portfolio-khaki"></span>
          <span>Experience</span>
        </h2>
        
        {/* Mobile Carousel Navigation */}
        {isMobile && (
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={scrollToPrev}
              disabled={currentExperienceIndex === 0}
              className={`p-2 rounded-full ${
                currentExperienceIndex === 0 
                  ? 'text-portfolio-gunmetal/30 dark:text-portfolio-almond/30' 
                  : 'text-portfolio-gunmetal dark:text-portfolio-almond hover:bg-portfolio-gunmetal/10 dark:hover:bg-portfolio-almond/10'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex space-x-2">
              {experiences.map((_, index) => (
                <span 
                  key={index} 
                  className={`block w-2 h-2 rounded-full ${
                    currentExperienceIndex === index 
                      ? 'bg-portfolio-khaki' 
                      : 'bg-portfolio-gunmetal/20 dark:bg-portfolio-almond/20'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={scrollToNext}
              disabled={currentExperienceIndex === experiences.length - 1}
              className={`p-2 rounded-full ${
                currentExperienceIndex === experiences.length - 1 
                  ? 'text-portfolio-gunmetal/30 dark:text-portfolio-almond/30' 
                  : 'text-portfolio-gunmetal dark:text-portfolio-almond hover:bg-portfolio-gunmetal/10 dark:hover:bg-portfolio-almond/10'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
        
        <div 
          ref={scrollContainerRef}
          className={isMobile ? "flex overflow-x-auto snap-x snap-mandatory scrollbar-none" : ""}
        >
          {experiences.map((exp) => (
            <motion.div 
              key={exp.id}
              className={`${isMobile ? 'flex-shrink-0 w-full snap-center mr-6 last:mr-0' : 'lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onMouseEnter={() => setActiveExperience(exp.id)}
              onMouseLeave={() => setActiveExperience(null)}
            >
              <div className={`${isMobile ? '' : 'lg:col-span-3'} text-portfolio-gunmetal/70 dark:text-portfolio-almond/70`}>
                {exp.period}
                
                {/* Company logo - positioned on the left for both mobile and desktop */}
                <div className="mt-2 p-2  rounded-md overflow-hidden w-full h-16 flex items-center justify-start">
                  <img 
                    src={exp.logo} 
                    alt={`${exp.company} logo`}
                    className="h-full object-contain"
                  />
                </div>
              </div>
              
              <div 
                className={`${isMobile ? 'mt-4' : 'lg:col-span-9'} p-4 rounded-md transition-colors duration-300 ${
                  activeExperience === exp.id 
                    ? 'bg-portfolio-gunmetal/10 dark:bg-portfolio-gunmetal/40' 
                    : ''
                }`}
              >
                <div className="flex flex-col space-y-4">
                  <h3 className="text-xl text-portfolio-khaki dark:text-portfolio-khaki font-semibold flex items-center">
                    {exp.role} · {exp.company}
                    <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex">
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </h3>
                  
                  <p className="text-portfolio-gunmetal/80 dark:text-portfolio-almond/80">
                    {exp.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {exp.skills.map((skill, index) => (
                      <span 
                        key={`${exp.id}-${index}`} 
                        className="px-3 py-1 text-xs rounded-full bg-portfolio-gunmetal/10 dark:bg-portfolio-khaki/10 text-portfolio-gunmetal dark:text-portfolio-khaki"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
