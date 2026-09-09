import { ArrowRight, Play, TrendingUp, Gavel } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-brand text-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(var(--brand-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--brand-foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

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
              <a href="/signup" className="px-8 py-4 rounded-xl bg-brand-accent text-foreground font-semibold flex items-center gap-2 hover:bg-brand-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand transition-all hover:-translate-y-0.5 active:scale-95 shadow-[0_0_20px_color-mix(in_oklch,var(--brand-accent)_30%,transparent)] w-fit">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </a>
              <a href="/signup" className="px-8 py-4 rounded-xl border border-white/20 font-semibold flex items-center gap-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand transition-all hover:-translate-y-0.5 active:scale-95 w-fit">
                <Play className="w-5 h-5 fill-current" /> Watch Demo
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {/* Avatars */}
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-emerald-500 flex items-center justify-center text-xs font-bold">RM</div>
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-blue-500 flex items-center justify-center text-xs font-bold">PS</div>
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-purple-500 flex items-center justify-center text-xs font-bold">AG</div>
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-pink-500 flex items-center justify-center text-xs font-bold">SK</div>
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-red-500 flex items-center justify-center text-xs font-bold">NP</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-brand-accent mb-1">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                  <span className="text-white font-bold ml-1">4.9</span>
                </div>
                <div className="text-sm text-blue-200">
                  Trusted by 1,284+ businesses
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: UI Mockup */}
          <div className="relative w-full aspect-[4/3] hidden lg:block">
            {/* Main Browser Window */}
            <div className="absolute inset-0 bg-foreground rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
              {/* Browser Header */}
              <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-400 w-64 text-center">
                  app.smartscrap.ai/dashboard
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex-1 p-6 flex flex-col gap-4 relative">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-400 mb-1">Inventory</div>
                    <div className="text-lg font-bold">1,420 MT</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-400 mb-1">Active Auctions</div>
                    <div className="text-lg font-bold text-yellow-500">2 Live</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-400 mb-1">Today's Revenue</div>
                    <div className="text-lg font-bold text-green-500">₹1.7Cr</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-400 mb-1">Pending Quotes</div>
                    <div className="text-lg font-bold text-purple-400">3</div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4 flex-1">
                  <div className="text-sm font-semibold mb-4">Monthly Revenue</div>
                  <div className="flex items-end gap-2 h-24 mt-4">
                    {/* Mock Bars */}
                    {[40, 55, 30, 65, 45, 75, 60, 35].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                        <div 
                          className={`w-full rounded-t-sm ${i === 5 ? 'bg-blue-500' : 'bg-blue-500/40'}`} 
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-[10px] text-gray-500">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* List Items */}
                <div className="flex flex-col gap-2">
                  {/* Item 1 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-700"></div>
                      <div>
                        <div className="text-sm font-semibold">MS Steel HMS 1&2</div>
                        <div className="text-xs text-gray-400">Metro Recyclers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">₹42.5L</div>
                      <span className="px-2 py-1 rounded text-[10px] font-medium bg-yellow-500/20 text-yellow-500">
                        Live Auction
                      </span>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-700"></div>
                      <div>
                        <div className="text-sm font-semibold">Copper Cable Scrap</div>
                        <div className="text-xs text-gray-400">Sanjay Metals</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">₹28.05L</div>
                      <span className="px-2 py-1 rounded text-[10px] font-medium bg-orange-500/20 text-orange-400">
                        Pending
                      </span>
                    </div>
                  </div>
                  {/* Item 3 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-700"></div>
                      <div>
                        <div className="text-sm font-semibold">Aluminium Die-Cast</div>
                        <div className="text-xs text-gray-400">National Scrap</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">₹20.64L</div>
                      <span className="px-2 py-1 rounded text-[10px] font-medium bg-green-500/20 text-green-400">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-[30%] -left-12 bg-white rounded-xl p-4 shadow-xl flex items-center gap-3 animate-[bounce_4s_infinite]">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-green-600">+18% Revenue</div>
                <div className="text-xs text-gray-500">vs last month</div>
              </div>
            </div>

            <div className="absolute bottom-[20%] -right-8 bg-white rounded-xl p-4 shadow-xl flex items-center gap-3 animate-[bounce_5s_infinite]">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Live Auction</div>
                <div className="text-xs text-gray-500">₹37,800/MT · 14 bidders</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
