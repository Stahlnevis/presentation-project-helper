import { TrendingUp, Users, FileCheck, AlertCircle } from "lucide-react";

const metrics = [
  {
    icon: FileCheck,
    value: "100%",
    label: "Evidence Integrity",
    description: "Blockchain-verified tamper-proof records"
  },
  {
    icon: AlertCircle,
    value: "Real-time",
    label: "Threat Detection",
    description: "Instant alerts on suspicious activities"
  },
  {
    icon: Users,
    value: "Multi-platform",
    label: "Harasser Tracking",
    description: "Links attackers across different accounts"
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Success Rate",
    description: "Cases strengthened with our evidence"
  }
];

const ImpactMetrics = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Making Real Impact
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Empowering victims and law enforcement with forensic-grade digital evidence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div 
                key={index}
                className="text-center group"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300">
                  <Icon className="w-10 h-10" />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">{metric.value}</div>
                <div className="text-lg font-semibold mb-2">{metric.label}</div>
                <p className="text-sm text-primary-foreground/70">{metric.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <blockquote className="text-2xl md:text-3xl font-semibold italic max-w-4xl mx-auto leading-relaxed">
            "Most cyberbullies think they can hide behind screens. This platform proves them wrong—
            tracking, documenting, and bringing them to justice."
          </blockquote>
          <p className="mt-4 text-primary-foreground/70">— Platform Mission Statement</p>
        </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
