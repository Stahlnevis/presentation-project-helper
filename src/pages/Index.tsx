import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ToolsShowcase from "@/components/ToolsShowcase";
import TechnologyStack from "@/components/TechnologyStack";
import ImpactMetrics from "@/components/ImpactMetrics";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
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
