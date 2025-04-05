
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';
import SkillsSection from '../components/SkillsSection';
import ExperienceSection from '../components/ExperienceSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import { useTheme } from '../providers/ThemeProvider';

const Index = () => {
  // Add smooth scrolling for the entire page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Get current theme to properly apply transitions
  const { theme } = useTheme();
  
  useEffect(() => {
    // Apply the font-family to the entire document
    document.documentElement.classList.add('font-heading');
  }, []);
  
  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${
      theme === 'light' 
        ? 'bg-white text-portfolio-gunmetal' 
        : 'bg-portfolio-black text-portfolio-almond'
    }`}>
      {/* <LoadingScreen /> */}
      <NavBar />
      <HeroSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
