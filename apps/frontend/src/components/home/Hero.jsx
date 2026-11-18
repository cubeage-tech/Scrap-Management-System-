import { ArrowRight, Play, TrendingUp, Gavel, Zap, CheckCircle } from "lucide-react";

const scrapCategories = [
  { name: "Ferrous Metals", sub: "HMS · MS · Cast Iron", range: "₹28–34/kg", from: "from-slate-600", to: "to-slate-800" },
  { name: "Non-Ferrous", sub: "Copper · Aluminium · Brass", range: "₹140–480/kg", from: "from-amber-600", to: "to-orange-700" },
  { name: "E-Waste", sub: "PCBs · Motors · Wiring", range: "₹45–200/kg", from: "from-emerald-600", to: "to-teal-800" },
  { name: "Plastic Scrap", sub: "HDPE · PVC · ABS", range: "₹8–22/kg", from: "from-sky-600", to: "to-blue-800" },
];

const liveActivity = [
  { event: "Auction Closed", detail: "MS Scrap · 12 Tons · 8 bids", amount: "₹4.2L", color: "bg-green-400" },
  { event: "Tender Open", detail: "Copper Wire · 2.5 Tons · 3 days left", amount: "₹18.4L", color: "bg-amber-400" },
  { event: "Quote Accepted", detail: "Aluminium Ingot · 8 Tons", amount: "₹9.6L", color: "bg-blue-400" },
];

const Hero = () => {
  return (
    <section className="relative bg-brand text-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--brand-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--brand-foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow top-right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-brand-accent text-sm font-medium mb-8">
              <span>♻️</span> India's #1 Industrial Scrap Management Platform
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Digitize Your <span className="text-brand-accent">Scrap</span> <br />
              <span className="text-brand-accent">Lifecycle</span> <br />
              End to End
            </h1>

            {/* Sub-headline */}
            <p className="text-lg text-blue-200 mb-10 leading-relaxed max-w-xl">
              From inventory to auctions, tenders, quotations, and sales
              tracking — SmartScrap AI replaces paper registers,
              spreadsheets, and manual negotiations with one intelligent
              platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a
                href="/signup"
                className="px-8 py-4 rounded-xl bg-brand-accent text-foreground font-semibold flex items-center gap-2 hover:bg-brand-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand transition-all hover:-translate-y-0.5 active:scale-95 shadow-[0_0_20px_color-mix(in_oklch,var(--brand-accent)_30%,transparent)] w-fit"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/signup"
                className="px-8 py-4 rounded-xl border border-white/20 font-semibold flex items-center gap-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand transition-all hover:-translate-y-0.5 active:scale-95 w-fit"
              >
                <Play className="w-5 h-5 fill-current" /> Watch Demo
              </a>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-blue-100">
                <span>♻️</span> Carbon-neutral trading
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-blue-100">
                <span>🔒</span> Bank-grade security
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-blue-100">
                <span>⚡</span> Live in under 24 hrs
              </div>
            </div>
          </div>

          {/* Right Column: Industrial Market Composition */}
          <div className="relative w-full hidden lg:flex flex-col gap-4">

            {/* Header pill */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-white">Live Market</span>
                <span className="text-xs text-white/40">·</span>
                <span className="text-xs text-blue-300">Mumbai · Pune · Delhi · Chennai</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-accent font-semibold">
                <Zap className="w-3.5 h-3.5" /> Real-time
              </div>
            </div>

            {/* Scrap Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              {scrapCategories.map((cat) => (
                <div
                  key={cat.name}
                  className={`bg-gradient-to-br ${cat.from} ${cat.to} rounded-2xl p-5 text-white hover:scale-[1.02] transition-transform duration-200 cursor-default`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide mb-1 text-white/70">
                    Category
                  </div>
                  <div className="text-base font-bold mb-0.5">{cat.name}</div>
                  <div className="text-xs text-white/60 mb-3">{cat.sub}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">Market rate</span>
                    <span className="text-sm font-bold text-white">{cat.range}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wide">Recent Activity</span>
                <span className="text-xs text-blue-300">Updated just now</span>
              </div>
              {liveActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                    <div>
                      <div className="text-xs font-semibold text-white">{item.event}</div>
                      <div className="text-xs text-white/45 mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white shrink-0 ml-4">{item.amount}</span>
                </div>
              ))}
            </div>

            {/* Bottom strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <TrendingUp className="w-4 h-4 text-green-400" />, label: "Avg. Recovery", value: "+18%" },
                { icon: <Gavel className="w-4 h-4 text-brand-accent" />, label: "Auctions Today", value: "14 Live" },
                { icon: <CheckCircle className="w-4 h-4 text-blue-400" />, label: "Verified Users", value: "1,284+" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-1.5">{stat.icon}</div>
                  <div className="text-base font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Floating badge */}
            <div className="absolute -left-14 top-[30%] bg-white rounded-xl p-4 shadow-xl flex items-center gap-3 animate-[bounce_4s_infinite]">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-green-600">+18% Revenue</div>
                <div className="text-xs text-gray-500">vs last quarter</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
