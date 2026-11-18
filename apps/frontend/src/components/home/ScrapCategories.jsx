import { ArrowRight } from "lucide-react";

const categories = [
  {
    emoji: "🔩",
    name: "Ferrous Metals",
    items: ["HMS 1 & 2", "Mild Steel (MS)", "Cast Iron", "Stainless Steel", "Galvanised Iron"],
    rate: "₹28–34/kg",
    rateLabel: "Current market",
    from: "from-slate-50",
    to: "to-slate-100",
    border: "border-slate-200",
    badge: "bg-slate-200 text-slate-700",
    badgeText: "High Volume",
    dot: "bg-slate-500",
  },
  {
    emoji: "⚡",
    name: "Non-Ferrous Metals",
    items: ["Copper Wire & Cable", "Aluminium Scrap", "Brass Turnings", "Lead Plates", "Zinc Scrap"],
    rate: "₹140–480/kg",
    rateLabel: "Current market",
    from: "from-amber-50",
    to: "to-orange-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    badgeText: "Premium Value",
    dot: "bg-amber-500",
  },
  {
    emoji: "💻",
    name: "E-Waste",
    items: ["PCBs & Motherboards", "Electric Motors", "Cables & Wiring", "Batteries", "Telecom Equipment"],
    rate: "₹45–200/kg",
    rateLabel: "Current market",
    from: "from-emerald-50",
    to: "to-teal-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    badgeText: "Eco-Certified",
    dot: "bg-emerald-500",
  },
  {
    emoji: "🧴",
    name: "Plastic Scrap",
    items: ["HDPE Granules", "PVC Pipe Scrap", "ABS Rejects", "PP Woven Bags", "PET Bottles"],
    rate: "₹8–22/kg",
    rateLabel: "Current market",
    from: "from-sky-50",
    to: "to-blue-50",
    border: "border-sky-200",
    badge: "bg-sky-100 text-sky-800",
    badgeText: "Recyclable",
    dot: "bg-sky-500",
  },
  {
    emoji: "📄",
    name: "Paper & Cardboard",
    items: ["OCC Corrugated", "News Print", "Office Paper Mix", "Kraft Liners", "Tissue Waste"],
    rate: "₹5–12/kg",
    rateLabel: "Current market",
    from: "from-yellow-50",
    to: "to-lime-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800",
    badgeText: "Easy Listing",
    dot: "bg-yellow-500",
  },
  {
    emoji: "🔧",
    name: "Industrial Machinery",
    items: ["Lathe Machine Parts", "Hydraulic Cylinders", "Gear Boxes", "Pumps & Motors", "CNC Scrap"],
    rate: "₹30–80/kg",
    rateLabel: "Current market",
    from: "from-purple-50",
    to: "to-indigo-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    badgeText: "High Demand",
    dot: "bg-purple-500",
  },
];

const ScrapCategories = () => {
  return (
    <section id="categories" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-brand text-sm font-semibold mb-6 uppercase tracking-wider">
            Scrap Categories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            What can you <span className="text-brand">trade here?</span>
          </h2>
          <p className="text-xl text-gray-500">
            Six major industrial scrap categories — each with live pricing, verified listings, and
            multiple buying modes.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`bg-gradient-to-br ${cat.from} ${cat.to} border ${cat.border} rounded-2xl p-6 flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{cat.emoji}</span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{cat.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${cat.badge}`}>
                      {cat.badgeText}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-xs text-gray-400 mb-0.5">{cat.rateLabel}</div>
                  <div className="text-sm font-bold text-gray-700">{cat.rate}</div>
                </div>
              </div>

              {/* Items list */}
              <ul className="flex-1 space-y-1.5 mb-5">
                {cat.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.dot}`} />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="/signup"
                className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-blue-700 transition-colors w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
              >
                Browse listings <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-brand rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">Custom Categories</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              Don't see your scrap type?
            </h3>
            <p className="text-blue-200 text-sm max-w-xl">
              Platform admins can create and publish custom scrap categories. Industries list anything — the platform handles pricing, compliance, and buyer matching.
            </p>
          </div>
          <a
            href="/contact"
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-foreground font-bold hover:bg-brand-accent/90 transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            Request a Category <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default ScrapCategories;
