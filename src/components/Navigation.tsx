import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SafeGuard</h1>
              <p className="text-xs text-muted-foreground">GBV Protection Platform</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#tools" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
              Tools
            </a>
            <a href="#technology" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
              Technology
            </a>
            <a href="#impact" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
              Impact
            </a>
            <Button 
              className="bg-secondary text-primary hover:bg-secondary/90 font-semibold"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
