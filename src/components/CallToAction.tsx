import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-3xl p-12 md:p-16 text-center shadow-strong">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-glow">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Protect Victims?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join law enforcement agencies, NGOs, and communities using our platform to combat 
              digital violence and bring perpetrators to justice.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold px-8 py-6 text-lg shadow-glow group">
                Request Demo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold">
                View Documentation
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Trusted by organizations worldwide</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  Law Enforcement
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  NGO Partners
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  Educational Institutions
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  Victim Support Services
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
