
import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Code, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';
import { useTheme } from '../providers/ThemeProvider';
import op7t from '../assets/op7t.png'
import pourfolio from '../assets/pourfolio.png'
import bodivue from '../assets/bodivue.png'
import ThoughtTag from '../assets/ThoughtTag.png'
import CheersPass from '../assets/CheersPass.png'
import billxo from '../assets/billxo.png'

// Project data
const projects = [
  {
    id: 1,
    title: 'CheersPass - The Event Ticketing Platform',
    category: ' an event ticketing platform that allows users to create, manage, and sell tickets for events',
    description: 'an event ticketing platform that allows users to create, manage, and sell tickets for events.',
    longDescription: 'A modern event ticketing platform that allows users to create, manage, and sell tickets for events. The platform includes features like QR code scanning, real-time analytics, and user-friendly interfaces for both organizers and attendees.',
    image: CheersPass,
    tags: ['React', 'Next.js', 'Stripe', 'Tailwind CSS'],
    liveUrl: '#',
    codeUrl: '#',
  },
  {
    id: 2,
    title: 'Bodivue - Personal health and diet management platform',
    category: 'Web Development',
    description: 'personal health and diet management platform that helps users track their fitness goals and nutrition.',
    longDescription: 'A personal health and diet management platform that helps users track their fitness goals and nutrition. The platform includes features like meal planning, exercise tracking, and personalized recommendations based on user data. It aims to promote a healthier lifestyle through data-driven insights and community support.',
    image: bodivue,
    tags: ['React', 'TypeScript', 'Redux', 'Chart.js'],
    liveUrl: 'https://debaprasad-dez.github.io/bodivue/',
    codeUrl: 'https://github.com/Debaprasad-dez/bodivue',
  },
  {
    id: 3,
    title: 'ThoughtTag – A sticky notes application',
    category: 'Web Development',
    description: 'sticky notes application that allows users to create, organize, and share notes visually.',
    longDescription: 'This web application provides a digital canvas for users to create, organize, and share sticky notes. It features drag-and-drop functionality, color-coded notes, and collaborative editing. Users can categorize notes, set reminders, and integrate with calendar applications. The app is designed for both personal and team use, enhancing productivity and organization.',
    image: ThoughtTag,
    tags: ['React','canvas API'],
    liveUrl: '#',
    codeUrl: '#',
  },
  {
    id: 4,
    title: 'OP7T – A product website for my phone',
    category: 'App Development',
    description: 'Website for my phone that showcases its features and specifications.',
    longDescription: 'portfolio website for my phone that showcases its features and specifications.',
    image: op7t,
    tags: ['React ','fullpage.js'],
    liveUrl: 'https://debaprasad-dez.github.io/op7t/',
    codeUrl: 'https://github.com/Debaprasad-dez?tab=repositories&q=op7&type=&language=&sort=',
  },
  {
    id: 5,
    title: 'Pourfolio - Personal Tasting Journal & Party Companion',
    category: 'Web Development',
    description: 'Tasting journal and party companion that helps users track their drinking experiences',
    longDescription: 'tasting journal and party companion that helps users track their beverage experiences',
    image: pourfolio,
    tags: ['React', 'PWA'],
    liveUrl: 'https://debaprasad-dez.github.io/pourfolio/',
    codeUrl: 'https://github.com/Debaprasad-dez/pourfolio',
  },
  {
    id: 6,
    title: 'Billxo - Your own invoicing platform',
    category: 'Web Development',
    description: 'A invoicing platform that allows users to create, manage, and send invoices easily.',
    longDescription: 'A modern invoicing platform that allows users to create, manage, and send invoices easily. The platform includes features like customizable templates, payment tracking, and real-time analytics.',
    image: billxo,
    tags: ['WebSockets', 'React', 'localStorage'],
    liveUrl: 'https://debaprasad-dez.github.io/Billxo/',
    codeUrl: 'https://github.com/Debaprasad-dez/Billxo',
  },
];

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  // Open project modal
  const openProjectModal = (projectId: number) => {
    setSelectedProject(projectId);
    setModalVisible(true);
  };

  // Handle carousel scroll on mobile
  const scrollToNext = () => {
    if (scrollContainerRef.current && currentProjectIndex < projects.length - 1) {
      setCurrentProjectIndex(prev => prev + 1);
    }
  };

  const scrollToPrev = () => {
    if (scrollContainerRef.current && currentProjectIndex > 0) {
      setCurrentProjectIndex(prev => prev - 1);
    }
  };

  // Scroll to current project when index changes
  useEffect(() => {
    if (scrollContainerRef.current && isMobile) {
      const cardWidth = scrollContainerRef.current.scrollWidth / projects.length;
      scrollContainerRef.current.scrollTo({
        left: cardWidth * currentProjectIndex,
        behavior: 'smooth'
      });
    }
  }, [currentProjectIndex, isMobile]);
  
  return (
    <section id="projects" className={`py-20 relative ${theme === 'light' ? 'bg-white' : 'bg-portfolio-black'}`}>
      <div className="container mx-auto px-12 md:px-20">
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 flex items-center space-x-3 ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}>
          <span className="w-8 h-[2px] bg-modern-primary"></span>
          <span>Featured Projects</span>
        </h2>
        
        <p className={`${theme === 'light' ? 'text-portfolio-gunmetal/80' : 'text-portfolio-almond/80'} mb-12 max-w-2xl`}>
          A showcase of my best work, featuring responsive, user-friendly applications built with modern technologies.
        </p>
        
        {/* Mobile Carousel Navigation */}
        {isMobile && (
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={scrollToPrev}
              disabled={currentProjectIndex === 0}
              className={`p-2 rounded-full ${
                currentProjectIndex === 0 
                  ? 'text-portfolio-gunmetal/30 dark:text-portfolio-almond/30' 
                  : 'text-portfolio-gunmetal dark:text-portfolio-almond hover:bg-portfolio-gunmetal/10 dark:hover:bg-portfolio-almond/10'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex space-x-2">
              {projects.map((_, index) => (
                <span 
                  key={index} 
                  className={`block w-2 h-2 rounded-full ${
                    currentProjectIndex === index 
                      ? 'bg-portfolio-khaki' 
                      : 'bg-portfolio-gunmetal/20 dark:bg-portfolio-almond/20'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={scrollToNext}
              disabled={currentProjectIndex === projects.length - 1}
              className={`p-2 rounded-full ${
                currentProjectIndex === projects.length - 1 
                  ? 'text-portfolio-gunmetal/30 dark:text-portfolio-almond/30' 
                  : 'text-portfolio-gunmetal dark:text-portfolio-almond hover:bg-portfolio-gunmetal/10 dark:hover:bg-portfolio-almond/10'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {/* Projects Grid with unequal sizes */}
        <div 
          ref={scrollContainerRef}
          className={`${isMobile ? 'flex overflow-x-auto snap-x snap-mandatory scrollbar-none' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}
        >
          {projects.map((project, index) => {
            // Create unequal card sizes
            const isLarge = index % 3 === 0;
            const isMedium = index % 3 === 1;
            const isSmall = index % 3 === 2;
            
            return (
              <motion.div 
                key={project.id}
                className={`${isMobile ? 'flex-shrink-0 w-full snap-center mr-6 last:mr-0' : 
                  isLarge ? 'col-span-1' : 
                  isMedium ? 'col-span-1' : 
                  isSmall ? 'col-span-1' : ''} 
                  flex flex-col overflow-hidden h-full`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                {/* Project Card */}
                <div className="flex-1 flex flex-col overflow-hidden group relative">
                  {/* Project Image */}
                  <div className="relative overflow-hidden bg-portfolio-gunmetal dark:bg-portfolio-walnut aspect-[4/3] cursor-pointer">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={() => openProjectModal(project.id)}
                    />
                    
                    {/* Buttons on hover (desktop) or always visible (mobile) */}
                    <div className={`absolute inset-0 bg-portfolio-black/60 flex items-center justify-center gap-4 transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <motion.a 
                        href={project.liveUrl} 
                        target='_blank'
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-portfolio-khaki text-portfolio-black rounded-lg hover:bg-portfolio-almond transition-colors"
                        whileHover={{ y: -2 }}
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </motion.a>
                      <motion.a 
                        href={project.codeUrl} 
                        target='_blank'
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-portfolio-almond/30 text-portfolio-almond rounded-lg hover:bg-portfolio-walnut/20 transition-colors"
                        whileHover={{ y: -2 }}
                      >
                        <Code className="w-4 h-4" />
                        <span>Code</span>
                      </motion.a>
                    </div>
                  </div>
                  
                  {/* Project Title and Category */}
                  <div className="mt-4">
                    <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}>{project.title}</h3>
                    <p className={`text-sm ${theme === 'light' ? 'text-portfolio-gunmetal/60' : 'text-portfolio-almond/60'}`}>{project.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {modalVisible && selectedProject && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-modern-depth/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`${theme === 'light' ? 'bg-white' : 'bg-portfolio-black'} rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border ${theme === 'light' ? 'border-portfolio-gunmetal/20' : 'border-portfolio-walnut/50'}`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {projects.find(p => p.id === selectedProject) && (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}>
                      {projects.find(p => p.id === selectedProject)?.title}
                    </h3>
                    <button 
                      className={`p-1 ${theme === 'light' ? 'hover:bg-portfolio-gunmetal/10' : 'hover:bg-portfolio-walnut/20'} rounded-full transition-colors`}
                      onClick={() => setModalVisible(false)}
                    >
                      <X className={`w-6 h-6 ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`} />
                    </button>
                  </div>
                  
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img 
                      src={projects.find(p => p.id === selectedProject)?.image} 
                      alt={projects.find(p => p.id === selectedProject)?.title}
                      className="w-full object-cover h-64"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}>Project Overview</h4>
                    <p className={`${theme === 'light' ? 'text-portfolio-gunmetal/80' : 'text-portfolio-almond/80'}`}>
                      {projects.find(p => p.id === selectedProject)?.longDescription}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}>Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {projects.find(p => p.id === selectedProject)?.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`text-sm px-3 py-1 rounded-full ${theme === 'light' ? 'bg-portfolio-gunmetal/10 text-portfolio-gunmetal border border-portfolio-gunmetal/30' : 'bg-portfolio-walnut/30 text-portfolio-almond border border-portfolio-walnut/50'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <a 
                    target='_blank'
                      href={projects.find(p => p.id === selectedProject)?.liveUrl} 
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-portfolio-khaki text-portfolio-black rounded-lg hover:bg-portfolio-almond transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                    <a 
                      href={projects.find(p => p.id === selectedProject)?.codeUrl} 
                      className={`flex items-center justify-center space-x-2 px-4 py-2 ${theme === 'light' ? 'border border-portfolio-gunmetal/30 text-portfolio-gunmetal hover:bg-portfolio-gunmetal/10' : 'border border-portfolio-almond/30 text-portfolio-almond hover:bg-portfolio-walnut/20'} rounded-lg transition-colors`}
                    >
                      <Code className="w-4 h-4" />
                      <span>View Code</span>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsSection;
