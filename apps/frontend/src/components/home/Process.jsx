import { ArrowRight } from "lucide-react";

const Process = () => {
  return (
    <section id="how-it-works" className="bg-white py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold mb-6 uppercase tracking-wider">
            Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Up and running <span className="text-brand">in 3 steps</span>
          </h2>
        </div>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Horizontal Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gray-200 -z-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center text-3xl font-bold text-brand mb-8">
                01
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Register & Verify
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">
                Create your account, select your role, and get verified by our admin team within 24 hours.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-brand shadow-[0_10px_30px_color-mix(in_oklch,var(--brand)_30%,transparent)] flex items-center justify-center text-3xl font-bold text-brand-accent mb-8">
                02
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                List or Browse
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">
                Industries add scrap to inventory and publish listings. Buyers browse, bid, or submit quotations instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center text-3xl font-bold text-brand mb-8">
                03
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Transact & Track
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">
                Close deals through auctions, tenders, or quotations. Inventory updates automatically. Reports built in.
              </p>
            </div>

          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-20 flex justify-center">
          <button className="px-8 py-4 rounded-xl bg-brand text-white font-semibold flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg">
            Create your free account <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Process;
