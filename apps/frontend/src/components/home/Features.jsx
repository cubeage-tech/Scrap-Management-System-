import { Box, Globe, Gavel, FileText, MessageSquare, BarChart2, ChevronRight } from "lucide-react";

const features = [
  {
    title: "Smart Inventory",
    badge: "Core",
    icon: <Box className="w-6 h-6 text-brand" />,
    description: "Real-time scrap stock management with barcode tracking, weight logging, and automated status updates after every transaction."
  },
  {
    title: "B2B Marketplace",
    badge: "Revenue",
    icon: <Globe className="w-6 h-6 text-brand" />,
    description: "Publish verified listings to thousands of buyers. Grade A–C condition tagging, photo galleries, and seller reputation scores."
  },
  {
    title: "Live Auctions",
    badge: "High Value",
    icon: <Gavel className="w-6 h-6 text-brand" />,
    description: "Real-time competitive bidding with auto-extension, reserve price logic, bid history, and instant winner notification."
  },
  {
    title: "Sealed Tenders",
    badge: "Enterprise",
    icon: <FileText className="w-6 h-6 text-brand" />,
    description: "Closed-bid procurement with configurable deadlines, automated offer reveal, and side-by-side comparison tables."
  },
  {
    title: "Quotation Engine",
    badge: "AI Powered",
    icon: <MessageSquare className="w-6 h-6 text-brand" />,
    description: "Buyers submit competitive quotes; AI ranks by price, rating, distance, and payment terms. Accept with one click."
  },
  {
    title: "Analytics & Reports",
    badge: "Insights",
    icon: <BarChart2 className="w-6 h-6 text-brand" />,
    description: "Revenue trends, material performance, inventory velocity, commission tracking — exportable to CSV, Excel, or PDF."
  }
];

const Features = () => {
  return (
    <section id="features" className="bg-muted py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-brand text-sm font-semibold mb-6 uppercase tracking-wider">
            Platform Modules
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-brand mb-6 leading-tight">
            Everything to manage scrap, <br /> end to end
          </h2>
          <p className="text-xl text-gray-500">
            Six integrated modules that replace the entire scrap management stack — from warehouse to wallet.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  {feature.icon}
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-brand text-xs font-bold">
                  {feature.badge}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-500 leading-relaxed flex-1 mb-8">
                {feature.description}
              </p>
              
              <a href="/signup" className="flex items-center gap-1 text-brand font-semibold hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded transition-all w-fit">
                Learn more <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
