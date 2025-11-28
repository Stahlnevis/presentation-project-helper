import { Code2, Database, Lock, Zap, Globe, Shield } from "lucide-react";

const technologies = [
  {
    icon: Lock,
    title: "Blockchain Integration",
    description: "Evidence anchoring with cryptographic hashing for tamper-proof verification"
  },
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "Military-grade encryption for all stored evidence and communications"
  },
  {
    icon: Database,
    title: "Secure Database",
    description: "Encrypted cloud storage with automatic backups and redundancy"
  },
  {
    icon: Code2,
    title: "Digital Fingerprinting",
    description: "Advanced browser and device fingerprinting for attacker identification"
  },
  {
    icon: Globe,
    title: "Geolocation Services",
    description: "Real-time location tracking and IP address analysis"
  },
  {
    icon: Zap,
    title: "Real-time Analysis",
    description: "AI-powered behavioral analysis and pattern recognition"
  }
];

const TechnologyStack = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="w-6 h-6 text-secondary" />
            <span className="text-secondary font-semibold tracking-wider uppercase text-sm">
              Technology
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Built on Advanced Cybersecurity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade security infrastructure designed for victim protection and evidence preservation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div 
                key={index}
                className="group p-8 rounded-2xl border border-border/50 bg-card hover:border-secondary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{tech.title}</h3>
                <p className="text-muted-foreground">{tech.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center shadow-strong">
            <h3 className="text-3xl font-bold text-primary-foreground mb-4">
              Cybersecurity That Protects
            </h3>
            <p className="text-lg text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Every feature is designed with victim safety, evidence integrity, and legal admissibility in mind. 
              Our platform combines cutting-edge technology with trauma-informed design principles.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-primary-foreground/80">
              <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">SHA-256 Hashing</span>
              <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">AES-256 Encryption</span>
              <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">Zero-Knowledge Architecture</span>
              <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologyStack;
