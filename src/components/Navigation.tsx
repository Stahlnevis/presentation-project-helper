import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "Tools", href: "#tools" },
    { name: "Technology", href: "#technology" },
    { name: "Impact", href: "#impact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SafeGuard</h1>
              <p className="text-xs text-muted-foreground">GBV Protection Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => navigate("/get-extension")}
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Extension
            </button>
            <Button
              className="bg-secondary text-primary hover:bg-secondary/90 font-semibold"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-foreground hover:text-secondary transition-colors p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-lg absolute left-0 right-0 px-6 shadow-lg">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-secondary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => {
                  navigate("/get-extension");
                  setIsMenuOpen(false);
                }}
                className="text-sm font-medium text-foreground hover:text-secondary transition-colors py-2 text-left"
              >
                Extension
              </button>
              <Button
                className="bg-secondary text-primary hover:bg-secondary/90 font-semibold w-full"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
