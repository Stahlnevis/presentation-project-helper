import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ToolsShowcase from "@/components/ToolsShowcase";
import TechnologyStack from "@/components/TechnologyStack";
import ImpactMetrics from "@/components/ImpactMetrics";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <div className="bg-muted/30 py-8 text-center">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Protect Yourself?</h3>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-secondary text-primary hover:bg-secondary/90 font-semibold w-full md:w-auto"
              onClick={() => navigate("/auth")}
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              size="lg"
              variant="default"
              className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto"
              onClick={() => navigate("/get-extension")}
            >
              Get Browser Extension
            </Button>
          </div>
        </div>
      </div>
      <div id="tools">
        <ToolsShowcase />
      </div>
      <div id="technology">
        <TechnologyStack />
      </div>
      <div id="impact">
        <ImpactMetrics />
      </div>
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
