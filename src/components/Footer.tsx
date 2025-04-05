
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 border-t border-portfolio-walnut/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-portfolio-almond/70 text-sm">
              © {new Date().getFullYear()} Debaprasad.
            </p>
          </div>
          
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
