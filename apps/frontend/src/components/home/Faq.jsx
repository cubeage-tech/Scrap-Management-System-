import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "Is SmartScrap AI free to use?",
    a: "Registration and creating your profile are free. We charge a small platform fee only on successfully closed transactions. There are no monthly subscriptions or hidden charges.",
  },
  {
    q: "How is my scrap inventory protected from unauthorized access?",
    a: "Every user operates within a strict role — Industry, Dealer, Buyer, or Admin. Each role can only see and act on data permitted for that role. All API calls are authenticated and organization-scoped.",
  },
  {
    q: "Can I participate in auctions and tenders as a dealer?",
    a: "Yes. Once your dealer account is verified by the admin, you can bid in live auctions and submit sealed offers in tenders. The platform enforces one active bid or submission per organization per event.",
  },
  {
    q: "How does the reserve price work in auctions and tenders?",
    a: "The reserve price is the minimum amount the industry is willing to accept. In auctions, the reserve is checked at closing — if the highest bid is below reserve, the lot may be unsold. In tenders, awarding a submission below reserve is blocked by the platform.",
  },
  {
    q: "What scrap categories are supported?",
    a: "The platform supports all major industrial scrap categories including ferrous metals (HMS, mild steel, cast iron), non-ferrous metals (copper, aluminium, brass), plastic waste, e-waste, paper & cardboard, and custom categories defined by the admin.",
  },
  {
    q: "How quickly can I start after registering?",
    a: "Admin verification typically takes 24 hours. Once verified, you can immediately add scrap to inventory, publish listings, and participate in active auctions or tenders — no additional setup required.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="bg-muted py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-16 items-start">

          {/* Left: header + CTA */}
          <div className="lg:col-span-2">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-brand text-sm font-semibold mb-6 uppercase tracking-wider">
              FAQ
            </div>
            <h2 className="text-4xl font-bold text-brand mb-5 leading-tight">
              Common questions, answered
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Everything you need to know about getting started with SmartScrap AI — pricing, security, auctions, and more.
            </p>
            <a
              href="/help-center"
              className="inline-flex items-center gap-2 px-5 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand/90 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm text-sm"
            >
              Browse all help articles <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-3 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow duration-200"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={openIndex === i}
                >
                  <span className="text-sm font-semibold text-foreground leading-relaxed">{faq.q}</span>
                  {openIndex === i
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  }
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-5 border-t border-gray-100">
                    <p className="text-sm text-gray-500 leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Faq;
