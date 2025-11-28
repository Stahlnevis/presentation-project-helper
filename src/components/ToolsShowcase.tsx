import { Database, Brain, MapPin, Shield, Link2, Fingerprint } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    icon: Database,
    title: "Digital Evidence Vault",
    subtitle: "Blockchain-Secured Evidence Storage",
    description: "A secure system where victims safely upload screenshots, videos, audio, and chat logs. Evidence is encrypted, stored securely, hashed using SHA-256, and anchored to the blockchain for tamper-proof verification.",
    features: [
      "Cryptographic hashing (SHA-256)",
      "Blockchain anchoring for integrity",
      "Metadata preservation (geo, timestamp, IP)",
      "Police-ready report exports",
      "Chain-of-custody preservation"
    ],
    color: "from-blue-600 to-cyan-500"
  },
  {
    icon: Brain,
    title: "Threat Intelligence Engine",
    subtitle: "Harasser Linking & Behavioral Analysis",
    description: "Advanced backend engine that analyzes patterns in harassment incidents. Links repeat offenders across multiple accounts and platforms using behavioral analysis, writing style patterns, and digital fingerprinting.",
    features: [
      "Writing style analysis",
      "Browser fingerprinting",
      "Behavioral similarity detection",
      "Serial harasser identification",
      "Multi-platform tracking",
      "Risk severity ratings"
    ],
    color: "from-purple-600 to-pink-500"
  },
  {
    icon: MapPin,
    title: "Geolocation Threat Capture",
    subtitle: "Real-time Attacker Tracking System",
    description: "Generates secure tracking links that capture attacker metadata when clicked. Collects geolocation, device information, and digital fingerprints to identify and locate perpetrators in real-time.",
    features: [
      "Secure trackable links",
      "Real-time geolocation capture",
      "Device & browser fingerprinting",
      "IP address logging",
      "Screenshot & metadata collection",
      "Automatic report generation"
    ],
    color: "from-emerald-600 to-teal-500"
  }
];

const ToolsShowcase = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-secondary" />
            <span className="text-secondary font-semibold tracking-wider uppercase text-sm">
              Our Tools
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Three-Pillar Security System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive cybersecurity toolkit designed to protect victims and bring perpetrators to justice
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={index} 
                className="border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-glow group"
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{tool.title}</CardTitle>
                  <CardDescription className="text-base font-medium text-secondary">
                    {tool.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {tool.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground mb-3">Key Features:</p>
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ToolsShowcase;
