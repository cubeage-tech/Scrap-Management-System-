import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "SmartScrap AI reduced our scrap cycle time from 3 weeks to 4 days. The auction module alone recovered 18% more revenue than our previous bilateral negotiations.",
    initials: "RM",
    name: "Rajesh Mehta",
    title: "Head of Operations, Tata Steel Ltd."
  },
  {
    quote: "Running both buying and selling from one dashboard changed everything. I can track my dealer P&L in real time and respond to marketplace listings instantly.",
    initials: "PN",
    name: "Priya Nair",
    title: "Managing Director, Metro Recyclers Pvt Ltd"
  },
  {
    quote: "The quotation comparison screen with AI ranking is exceptional. We saved 12% on our last 5 copper purchases by getting genuine competitive data.",
    initials: "AG",
    name: "Amit Goyal",
    title: "Procurement Manager, GreenMetal Solutions"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="bg-brand py-24 relative overflow-hidden">
      {/* Background Grid Pattern (matching Hero) */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(var(--brand-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--brand-foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-accent text-sm font-bold mb-6 uppercase tracking-wider">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            What our customers say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col h-full backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-accent text-brand-accent" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-gray-300 leading-relaxed mb-8 flex-1 text-lg">
                "{testimonial.quote}"
              </p>
              
              {/* Divider */}
              <div className="h-px w-full bg-white/10 mb-6"></div>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center text-brand font-bold text-lg shrink-0">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="text-white font-bold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
