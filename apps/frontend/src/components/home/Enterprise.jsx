import { Lock, Zap, Globe, Award, ArrowRight } from "lucide-react";

const enterpriseFeatures = [
  {
    title: "Bank-Grade Security",
    icon: <Lock className="w-6 h-6 text-brand" />,
    description: "AES-256 encryption, SOC 2 Type II certified, role-based access control."
  },
  {
    title: "99.98% Uptime SLA",
    icon: <Zap className="w-6 h-6 text-brand" />,
    description: "Multi-region infrastructure. Auto-failover. Zero-downtime deployments."
  },
  {
    title: "Pan-India Coverage",
    icon: <Globe className="w-6 h-6 text-brand" />,
    description: "Sellers and buyers across 28 states. Real-time distance-aware matching."
  },
  {
    title: "AI-Ready Platform",
    icon: <Award className="w-6 h-6 text-brand" />,
    description: "Price prediction, image recognition, fraud detection — built for scale."
  }
];

const Enterprise = () => {
  return (
    <section id="enterprise" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 text-brand text-sm font-semibold mb-6 uppercase tracking-wider">
            Enterprise Grade
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Built for scale, <br />
            <span className="text-brand">secured for enterprise</span>
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {enterpriseFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="bg-muted rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 border border-gray-50"
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* AI Banner */}
        <div className="bg-brand rounded-2xl p-8 md:p-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 text-center lg:text-left">
            <div className="w-16 h-16 rounded-2xl bg-brand-accent flex items-center justify-center shrink-0 shadow-lg">
              <Zap className="w-8 h-8 text-brand" />
            </div>
            <div>
              <p className="text-brand-accent font-bold text-sm tracking-wider mb-2 uppercase">
                Coming Soon — AI Layer
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">
                Scrap Image Recognition • Price Prediction • Fraud Detection • Demand Forecasting
              </h3>
              <p className="text-gray-300 text-sm md:text-base max-w-3xl">
                SmartScrap AI is architected for next-gen capabilities — ML models ready to plug in as the platform scales.
              </p>
            </div>
          </div>
          <button className="shrink-0 px-6 py-3 rounded-lg bg-brand-accent hover:bg-brand-accent/90 text-brand font-bold flex items-center gap-2 transition-colors">
            Learn More <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Enterprise;
