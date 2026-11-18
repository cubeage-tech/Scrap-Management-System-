import { UserCheck, LayoutList, Gavel, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Register & Verify",
    description: "Create your account, choose your role — Industry, Dealer, or Buyer — and get admin-verified within 24 hours.",
    accent: "bg-brand border-brand text-white",
    iconBg: "bg-white/10",
    numberColor: "text-brand-accent",
    connector: "bg-gradient-to-r from-brand to-slate-200",
  },
  {
    number: "02",
    icon: LayoutList,
    title: "List or Browse",
    description: "Industries digitize inventory and publish listings. Buyers and dealers browse live auctions, tenders, and quotations.",
    accent: "bg-white border-gray-100 text-foreground",
    iconBg: "bg-blue-50",
    numberColor: "text-brand",
    connector: "bg-gradient-to-r from-slate-200 to-brand",
  },
  {
    number: "03",
    icon: Gavel,
    title: "Bid, Tender, Quote",
    description: "Participate in live auctions with real-time bidding, submit sealed tender offers, or send competitive quotations.",
    accent: "bg-brand border-brand text-white",
    iconBg: "bg-white/10",
    numberColor: "text-brand-accent",
    connector: "bg-gradient-to-r from-brand to-brand-accent",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Transact & Track",
    description: "Close deals, auto-update inventory, and track every transaction with built-in reports, P&L, and commission records.",
    accent: "bg-brand-accent border-brand-accent text-foreground",
    iconBg: "bg-brand/10",
    numberColor: "text-brand",
    connector: null,
  },
];

const Process = () => {
  return (
    <section id="how-it-works" className="bg-white py-24 relative overflow-hidden">

      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold mb-6 uppercase tracking-wider">
            Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Up and running <span className="text-brand">in 4 steps</span>
          </h2>
          <p className="text-gray-500 mt-4 text-lg">
            Every industry, dealer and buyer follows the same clean flow from sign-up to closed deal.
          </p>
        </div>

        {/* Steps — Desktop: 4-column horizontal */}
        <div className="hidden md:grid grid-cols-4 gap-0 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex flex-col items-center text-center px-4">

                {/* Connector line */}
                {step.connector && (
                  <div className={`absolute top-8 left-1/2 w-full h-0.5 ${step.connector} -z-10`} />
                )}

                {/* Circle with icon */}
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center mb-4 shadow-lg relative z-10 ${step.accent}`}>
                  <Icon className={`w-7 h-7 ${step.accent.includes("text-white") ? "text-white" : "text-brand"}`} />
                </div>

                {/* Step number */}
                <span className={`text-xs font-black uppercase tracking-widest mb-3 ${step.numberColor}`}>
                  Step {step.number}
                </span>

                <h3 className="text-lg font-bold text-foreground mb-3 leading-tight">
                  {step.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Steps — Mobile: vertical list */}
        <div className="md:hidden space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={i} className="flex gap-6">
                {/* Left: icon + connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md ${step.accent}`}>
                    <Icon className={`w-5 h-5 ${step.accent.includes("text-white") ? "text-white" : "text-brand"}`} />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-2 min-h-[40px]" />}
                </div>

                {/* Right: content */}
                <div className={`pb-10 ${isLast ? "" : ""}`}>
                  <span className={`text-xs font-black uppercase tracking-widest ${step.numberColor}`}>
                    Step {step.number}
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-20 flex justify-center">
          <a
            href="/signup"
            className="px-8 py-4 rounded-xl bg-brand text-white font-semibold flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            Create your free account <ArrowRight className="w-5 h-5" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default Process;
