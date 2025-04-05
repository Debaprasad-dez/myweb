
import { useState, useRef } from "react";
import { Mail, Send, Github, Linkedin, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

const ContactSection = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  
  const [focused, setFocused] = useState({
    name: false,
    email: false,
    message: false,
  });
  
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { theme } = useTheme();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFocus = (field: string) => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };
  
  const handleBlur = (field: string) => {
    setFocused(prev => ({ ...prev, [field]: false }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Form submitted:", formState);
      setIsSubmitting(false);
      setFormSubmitted(true);
      
      // Reset form
      setFormState({
        name: "",
        email: "",
        message: "",
      });
      
      // Reset success message after delay
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <section id="contact" className={`py-20 relative ${theme === 'light' ? 'bg-white' : 'bg-portfolio-black'}`}>
      <div className="container mx-auto px-12 md:px-20">
        <h2 className={`text-3xl md:text-4xl font-bold mb-8 flex items-center space-x-3 font-heading ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}>
          <span className="w-8 h-[2px] bg-portfolio-khaki"></span>
          <span>Get In Touch</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className={`text-2xl font-semibold mb-4 font-heading ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`}>Let's Connect</h3>
            <p className={`text-lg ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'} mb-6 leading-relaxed`}>
              I'm currently available for freelance work and exciting opportunities.
              If you have a project that needs some creative coding, send me a message!
            </p>
            
            <motion.div 
              className={`flex items-center space-x-4 mb-6 backdrop-blur-md rounded-xl border p-3 ${
                theme === 'light' 
                  ? 'bg-white/30 border-white/50 shadow-sm' 
                  : 'bg-portfolio-black/30 border-portfolio-walnut/30'
              }`}
              whileHover={{ x: 5, boxShadow: theme === 'light' ? "0 5px 15px rgba(0,0,0,0.1)" : "0 5px 15px rgba(0,0,0,0.3)" }}
            >
              <div className="w-8 h-8 rounded-full bg-portfolio-khaki/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-portfolio-khaki" />
              </div>
              <a href="mailto:debaprasadpaul208@gmail.com" className={`${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'} hover:text-portfolio-khaki transition-colors`}>
              debaprasadpaul208@gmail.com
              </a>
            </motion.div>
            
            <div className="flex space-x-4">
              <motion.a 
                href="https://github.com/Debaprasad-dez" 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === 'light'
                    ? 'border border-portfolio-gunmetal/30 hover:bg-portfolio-khaki/20' 
                    : 'border border-portfolio-walnut/50 hover:bg-portfolio-khaki/20'
                } hover:border-portfolio-khaki transition-all duration-300`}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className={`w-5 h-5 ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`} />
              </motion.a>
              <motion.a 
                href="https://www.linkedin.com/in/debaprasad-paul/" 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === 'light'
                    ? 'border border-portfolio-gunmetal/30 hover:bg-portfolio-khaki/20' 
                    : 'border border-portfolio-walnut/50 hover:bg-portfolio-khaki/20'
                } hover:border-portfolio-khaki transition-all duration-300`}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className={`w-5 h-5 ${theme === 'light' ? 'text-portfolio-gunmetal' : 'text-portfolio-almond'}`} />
              </motion.a>
              
            </div>
          </div>
          
          <div className={`backdrop-blur-md rounded-xl relative overflow-hidden ${
            theme === 'light' 
              ? 'bg-white/40 border border-white/50 shadow-lg' 
              : 'bg-portfolio-black/30 border border-portfolio-walnut/30'
          }`}>
            {/* Background gradient effect */}
            <div className="absolute -inset-1 opacity-20 bg-gradient-to-r from-portfolio-khaki/30 via-transparent to-portfolio-khaki/30 blur-xl"></div>
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 p-5 relative">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Name"
                    value={formState.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    className={`w-full p-2 rounded-md ${
                      theme === 'light'
                        ? 'bg-white/50 border border-portfolio-gunmetal/20 text-portfolio-gunmetal focus:ring-1 focus:ring-portfolio-khaki' 
                        : 'bg-portfolio-gunmetal/50 border border-portfolio-walnut/30 text-portfolio-almond focus:ring-1 focus:ring-portfolio-khaki'
                    } focus:outline-none`}
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={formState.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    className={`w-full p-2 rounded-md ${
                      theme === 'light'
                        ? 'bg-white/50 border border-portfolio-gunmetal/20 text-portfolio-gunmetal focus:ring-1 focus:ring-portfolio-khaki' 
                        : 'bg-portfolio-gunmetal/50 border border-portfolio-walnut/30 text-portfolio-almond focus:ring-1 focus:ring-portfolio-khaki'
                    } focus:outline-none`}
                    required
                  />
                </div>
              </div>
              
              <div>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Message"
                  value={formState.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  rows={2}
                  className={`w-full resize-none p-2 rounded-md ${
                    theme === 'light'
                      ? 'bg-white/50 border border-portfolio-gunmetal/20 text-portfolio-gunmetal focus:ring-1 focus:ring-portfolio-khaki' 
                      : 'bg-portfolio-gunmetal/50 border border-portfolio-walnut/30 text-portfolio-almond focus:ring-1 focus:ring-portfolio-khaki'
                  } focus:outline-none`}
                  required
                ></textarea>
              </div>
              
              <motion.button 
                type="submit" 
                className="group w-full py-2 bg-portfolio-khaki text-portfolio-black font-medium rounded-md flex items-center justify-center space-x-2 overflow-hidden relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {/* Button background animation */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-portfolio-khaki via-white/20 to-portfolio-khaki bg-size-200 bg-pos-0 transition-all duration-500 group-hover:bg-pos-100"></span>
                
                {/* Button content */}
                <span className="relative z-10 flex items-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-portfolio-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : formSubmitted ? (
                    <>
                      <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="text-green-800"
                      >
                        Message Sent!
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
