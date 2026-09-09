import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="bg-muted py-24 pb-32">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* CTA Card */}
        <div className="bg-gradient-to-br from-brand to-brand-glow rounded-[2rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          
          {/* Subtle background glow effect inside the card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand-accent text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Zero setup fee • No credit card required</span>
            </div>
            
            {/* Headlines */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-2xl">
              Ready to digitize your <br className="hidden md:block" /> scrap operations?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl font-light">
              Join 1,284+ businesses already using SmartScrap AI to manage inventory, run auctions, and close deals faster.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <a href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand font-bold flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand transition-all hover:-translate-y-0.5 active:scale-95 shadow-[0_0_20px_color-mix(in_oklch,var(--brand-accent)_30%,transparent)] hover:shadow-[0_0_25px_color-mix(in_oklch,var(--brand-accent)_50%,transparent)]">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </a>
              
              <a href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand transition-all hover:-translate-y-0.5 active:scale-95 text-center">
                Schedule a Demo
              </a>
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTA;
