import { Shield, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-security.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero">
        <img
          src={heroImage}
          alt="Digital security shield protecting victims"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
          <Shield className="w-8 h-8 text-secondary" />
          <span className="text-secondary font-semibold tracking-wider uppercase text-sm">
            Cyber Defense Platform
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Protecting Victims of
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white">
            Digital Violence
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Advanced cybersecurity tools that empower victims, track harassers, and preserve tamper-proof evidence for justice.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            size="lg"
            className="bg-secondary text-primary hover:bg-secondary/90 font-semibold px-8 py-6 text-lg shadow-glow w-full sm:w-auto"
            onClick={() => navigate("/auth")}
          >
            Get Started Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm w-full sm:w-auto"
            onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="border border-white/20 rounded-lg p-6 backdrop-blur-sm bg-white/5">
            <div className="flex justify-center mb-2">
              <Lock className="w-8 h-8 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-sm text-gray-400">Evidence Integrity</div>
          </div>
          <div className="border border-white/20 rounded-lg p-6 backdrop-blur-sm bg-white/5">
            <div className="flex justify-center mb-2">
              <Shield className="w-8 h-8 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-gray-400">Threat Monitoring</div>
          </div>
          <div className="border border-white/20 rounded-lg p-6 backdrop-blur-sm bg-white/5">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">Real-time</div>
            <div className="text-sm text-gray-400">Attacker Detection</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default Hero;
