import { useState } from "react";
import {
  Search, BookOpen, Gavel, FileText, MessageSquare,
  Shield, ChevronDown, ChevronUp, ArrowRight,
  Package, Users, HelpCircle, Mail,
} from "lucide-react";

const categories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Account setup, role selection, and verification",
    count: 8,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Gavel,
    title: "Live Auctions",
    description: "Bidding, reserve prices, extensions, and winning",
    count: 12,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: FileText,
    title: "Tenders",
    description: "Creating, submitting, evaluating sealed tenders",
    count: 9,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: MessageSquare,
    title: "Quotations",
    description: "Requesting quotes, comparing offers, accepting bids",
    count: 7,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Package,
    title: "Inventory",
    description: "Managing scrap records, quantities, and categories",
    count: 10,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    icon: Shield,
    title: "Account & Security",
    description: "Profile, roles, permissions, and data safety",
    count: 6,
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
  },
];

const faqs = [
  {
    q: "How do I register on SmartScrap AI?",
    a: "Click Get Started on the homepage, fill in your company details, select your role (Industry, Dealer, or Buyer), and submit. The admin team verifies your account within 24 hours, after which you get full access to your dashboard.",
  },
  {
    q: "What is the difference between an auction, a tender, and a quotation?",
    a: "An auction is a live, competitive bidding event where the highest bid wins at the closing time. A tender is a sealed-bid process — dealers submit offers privately, and the industry evaluates all offers after the deadline. A quotation is a buyer-initiated request where buyers submit competitive prices for a listed item, and the seller accepts the best one.",
  },
  {
    q: "Can a dealer submit an offer for a tender that has already closed?",
    a: "No. The submission deadline is enforced by the platform. Once a tender's closing time passes, the submission window locks automatically. Dealers must submit before the deadline shown on the tender detail page.",
  },
  {
    q: "How does the sealed-bid system protect confidentiality?",
    a: "Offer prices in a tender are hidden from the industry and all other dealers until the industry explicitly starts evaluation. During the open period, only the dealer's name and submission reference are visible to the industry. Prices are never revealed to competing dealers.",
  },
  {
    q: "How is the winning dealer selected in a tender?",
    a: "The industry reviews all eligible submissions during the evaluation phase. They can mark dealers as Eligible or Disqualify them with a reason. The industry then manually selects one winner by clicking Award. The platform enforces that only one dealer can be awarded, and all others are marked Not Selected.",
  },
  {
    q: "What happens to my inventory when I create a listing or auction?",
    a: "When you create a listing, tender, or auction, the corresponding quantity is automatically moved from Available to Listed in your scrap inventory. Once the deal is completed, the quantity is deducted from your inventory. If a tender is cancelled, the quantity is restored.",
  },
  {
    q: "Is my payment information secure?",
    a: "SmartScrap AI does not store payment card data. All financial transactions are handled through verified payment gateways. Role-based access control ensures only authorized personnel in your organisation can access financial records.",
  },
  {
    q: "How do I contact support for a specific transaction issue?",
    a: "Use the Contact page to send us a detailed message, or email support@smartscrap.ai. Include your tender or auction reference number (e.g. TND-XXXXXXXX or AUC-XXXXXXXX) so our team can investigate quickly.",
  },
];

const Hero = () => {
  const [query, setQuery]       = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = query.trim()
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(query.toLowerCase()) ||
          f.a.toLowerCase().includes(query.toLowerCase())
      )
    : faqs;

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--brand-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--brand-foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="max-w-3xl mx-auto px-6 py-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-accent text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4" /> Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How can we help you?
          </h1>
          <p className="text-blue-200 mb-8 text-lg">
            Search guides, FAQs, and documentation for every platform feature.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles… e.g. how to submit a tender"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm text-slate-800 bg-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ── Category cards ───────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Browse by topic</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(({ icon: Icon, title, description, count, color, bg, border }) => (
              <div
                key={title}
                className={`bg-white rounded-2xl border ${border} p-6 flex items-start gap-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5`}
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                    <span className={`text-xs font-semibold ${color} shrink-0`}>{count} articles</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand uppercase tracking-wider mb-2">FAQs</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Frequently asked questions
            </h2>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium">No results for "{query}"</p>
              <p className="text-xs mt-1">Try a different keyword or browse the categories above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                    aria-expanded={openIndex === i}
                  >
                    <span className="text-sm font-semibold text-slate-800 leading-relaxed">{faq.q}</span>
                    {openIndex === i
                      ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    }
                  </button>
                  {openIndex === i && (
                    <div className="px-6 pb-5 border-t border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Still need help ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Still need help?</h2>
            <p className="text-slate-500 text-sm">Our team is available Monday to Saturday, 9 AM – 6 PM IST.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <a
              href="/contact"
              className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Send a message</p>
                <p className="text-xs text-slate-500">Response within one business day</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </a>
            <a
              href="/contact"
              className="flex items-center gap-4 bg-brand rounded-2xl p-6 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Talk to our team</p>
                <p className="text-xs text-blue-200">Enterprise onboarding & demos</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/60 shrink-0" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
