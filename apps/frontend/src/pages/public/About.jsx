import {
  Target,
  Eye,
  Gavel,
  ShieldCheck,
  Users,
  Handshake,
  Coins,
  LineChart,
  Award,
  Leaf,
  Factory,
  Truck,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  Globe,
  Sparkles,
  Wallet,
  Recycle,
} from "lucide-react";

const stats = [
  { value: "500+", label: "Verified Dealers" },
  { value: "120+", label: "Industries Onboarded" },
  { value: "2,400+", label: "Auctions Completed" },
  { value: "₹85Cr+", label: "Scrap Traded" },
];

const howItWorks = [
  {
    icon: Users,
    step: "01",
    title: "Create Your Account",
    description:
      "Industries, dealers and buyers register and get verified with role-based access controlled by the super admin.",
  },
  {
    icon: Search,
    step: "02",
    title: "List or Browse Scrap",
    description:
      "Industries list their scrap inventory with categories, quantity and inspection reports. Buyers and dealers browse live listings.",
  },
  {
    icon: Gavel,
    step: "03",
    title: "Bid in Live Auctions",
    description:
      "Registered buyers and dealers place real-time bids in scheduled auctions with transparent, price-based winner selection.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Win, Pay & Get Delivered",
    description:
      "The highest bidder wins the lot, completes a secure payment and the scrap is scheduled for pickup and delivery.",
  },
];

const features = [
  {
    icon: Gavel,
    title: "Transparent Auctions",
    description:
      "Every bid is recorded and visible — no under-the-table deals, only fair, price-driven trading.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Security",
    description:
      "Super admin, industry, dealer and buyer roles keep data safe and every action accountable.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Impact",
    description:
      "We keep usable scrap out of landfills and push it back into the production cycle.",
  },
  {
    icon: LineChart,
    title: "Real-Time Analytics",
    description:
      "Track auction trends, scrap categories and trading volumes through detailed reports.",
  },
  {
    icon: Handshake,
    title: "Trusted Network",
    description:
      "Every participant is verified, so you always deal with genuine, reliable businesses.",
  },
  {
    icon: Coins,
    title: "Fair Market Pricing",
    description:
      "Live bidding ensures you always get the best current market value for your scrap.",
  },
];

const WhyChooseUsItem = ({ icon: Icon, title, description }) => (
  <div className="bg-card rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6">
    <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-brand" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const HowItWorksStep = ({ icon: Icon, step, title, description, isLast }) => (
  <div className="relative flex flex-col items-center text-center px-4">
    <div className="h-16 w-16 rounded-full bg-brand text-white flex items-center justify-center shadow-lg mb-4">
      <Icon className="h-7 w-7" />
    </div>
    <span className="text-sm font-bold text-brand mb-1">{step}</span>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
      {description}
    </p>
    {!isLast && (
      <ArrowRight className="hidden lg:block absolute top-1/3 -right-6 h-6 w-6 text-muted-foreground" />
    )}
  </div>
);

const About = () => {
  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-brand-foreground/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" /> Scrap Management System
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            About Us
          </h1>
          <p className="text-lg md:text-xl text-brand-foreground/80 max-w-3xl mx-auto leading-relaxed">
            A digital marketplace where industries, dealers and buyers come
            together to buy and sell scrap through transparent, fair and
            live auctions.
          </p>
        </div>
      </section>

      {/* ================= WHO WE ARE ================= */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-bold text-brand uppercase tracking-wider mb-3 block">
              Who We Are
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 leading-tight">
              Giving Scrap a Second Life Through Smart Digital Auctions
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We are a team on a mission to organize the unstructured scrap
              trading industry. What was once done through word-of-mouth and
              unverified middlemen now happens on a single platform — with
              live auctions, verified participants and complete transparency.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our platform connects industrial scrap generators with verified
              dealers and buyers. A dedicated super admin keeps the
              marketplace safe by managing roles, categories, auctions and
              reporting — while every participant enjoys a clean, honest
              trading experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Govt-grade verification
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-success" />
                100% digital process
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Pan-India reach
              </div>
            </div>
          </div>

          <div className="gradient-brand rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Recycle className="h-10 w-10 text-brand-accent" />
              <h3 className="text-xl font-bold">Our Commitment</h3>
            </div>
            <ul className="space-y-5">
              {[
                "Transparency in every auction, every bid, every deal",
                "Fair pricing driven by the market, never by middlemen",
                "A greener planet through responsible scrap recycling",
                "Trust built on verified buyers, sellers and dealers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                  <span className="text-brand-foreground/90 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-brand-glow/40 pt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand-accent" />
                <span className="text-sm">Works across India</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-accent" />
                <span className="text-sm">Live 24/7 auctions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl shadow-md p-8 border-t-4 border-brand">
            <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-brand" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To digitalize the entire scrap trading lifecycle — from listing
              and inspection to auction and delivery — so every kilogram of
              scrap finds its highest-value buyer at the fairest market price.
            </p>
          </div>
          <div className="bg-card rounded-2xl shadow-md p-8 border-t-4 border-brand-accent">
            <div className="h-12 w-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4">
              <Eye className="h-6 w-6 text-brand-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Our Vision
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To become India's most trusted scrap exchange — building a
              circular economy where nothing goes to waste, businesses grow
              sustainably and recycling becomes the default, not the last
              resort.
            </p>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-20 bg-brand text-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
            Our Impact So Far
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-brand-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-brand-foreground/80 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-brand uppercase tracking-wider mb-3 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              From Scrap Listing to a Winning Bid
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              A simple, four-step journey that every industry, dealer and
              buyer follows on our platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {howItWorks.map((item, index) => (
              <HowItWorksStep
                key={item.step}
                icon={item.icon}
                step={item.step}
                title={item.title}
                description={item.description}
                isLast={index === howItWorks.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-brand uppercase tracking-wider mb-3 block">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Built for Honest, Modern Scrap Trading
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <WhyChooseUsItem key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHO CAN USE ================= */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-brand uppercase tracking-wider mb-3 block">
              For Everyone
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Who Can Use This Platform?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-muted rounded-2xl p-8 text-center border border-border hover:border-brand hover:shadow-lg transition-all duration-300">
              <Factory className="h-10 w-10 text-brand mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                Industries
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                List your production scrap, set reserve prices and watch
                buyers compete for your lots in live auctions.
              </p>
            </div>
            <div className="bg-muted rounded-2xl p-8 text-center border border-border hover:border-brand hover:shadow-lg transition-all duration-300">
              <Handshake className="h-10 w-10 text-brand mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                Dealers
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Access a steady pipeline of industrial scrap, bid
                competitively and grow your trading business digitally.
              </p>
            </div>
            <div className="bg-muted rounded-2xl p-8 text-center border border-border hover:border-brand hover:shadow-lg transition-all duration-300">
              <Wallet className="h-10 w-10 text-brand mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                Buyers
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Source quality scrap at transparent market prices with
                verified sellers and secure payment flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="gradient-brand rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl relative overflow-hidden">
            <Award className="h-16 w-16 text-brand-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to Join the Scrap Revolution?
            </h2>
            <p className="text-brand-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Whether you're an industry looking to sell, a dealer or buyer
              looking to bid — your place in India's smartest scrap
              marketplace is just a sign-up away.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-brand-accent text-foreground font-bold px-8 py-4 rounded-xl hover:bg-brand-accent/90 transition-colors duration-300"
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;