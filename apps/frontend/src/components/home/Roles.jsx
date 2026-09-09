import { Factory, Users, ShoppingCart, Shield, CheckCircle2, ArrowRight } from "lucide-react";

const roles = [
  {
    title: "Industry",
    icon: <Factory className="w-6 h-6 text-brand" />,
    iconBg: "bg-blue-50",
    description: "Manufacturers, factories, and production plants listing surplus or post-process scrap for maximum recovery.",
    features: [
      "Inventory digitization",
      "Multi-mode selling",
      "Automated stock deduction",
      "Commission-free listings"
    ],
    buttonText: "Join as Industry",
    buttonBg: "bg-blue-50 hover:bg-blue-100",
    buttonColor: "text-brand",
    checkColor: "text-brand"
  },
  {
    title: "Dealer",
    icon: <Users className="w-6 h-6 text-brand" />,
    iconBg: "bg-blue-50",
    description: "Scrap dealers who buy from industries and resell to processors — unified buying and selling in one dashboard.",
    features: [
      "Dual role dashboard",
      "Profit & loss tracking",
      "Purchase history",
      "Resale listing tools"
    ],
    buttonText: "Join as Dealer",
    buttonBg: "bg-blue-50 hover:bg-blue-100",
    buttonColor: "text-brand",
    checkColor: "text-brand"
  },
  {
    title: "Buyer",
    icon: <ShoppingCart className="w-6 h-6 text-blue-500" />,
    iconBg: "bg-blue-50/50",
    description: "Processors and recyclers purchasing raw scrap material at competitive prices through multiple buying modes.",
    features: [
      "Browse verified listings",
      "Auction participation",
      "Tender submissions",
      "Purchase tracking"
    ],
    buttonText: "Join as Buyer",
    buttonBg: "bg-blue-50/80 hover:bg-blue-100",
    buttonColor: "text-blue-700",
    checkColor: "text-blue-500"
  },
  {
    title: "Admin",
    icon: <Shield className="w-6 h-6 text-red-500" />,
    iconBg: "bg-red-50",
    description: "Platform administrators managing users, approvals, categories, commission settings, and platform analytics.",
    features: [
      "User verification",
      "Commission control",
      "Full platform reports",
      "Role management"
    ],
    buttonText: "Join as Admin",
    buttonBg: "bg-red-50 hover:bg-red-100",
    buttonColor: "text-red-700",
    checkColor: "text-red-500"
  }
];

const Roles = () => {
  return (
    <section id="roles" className="bg-muted py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-brand text-sm font-semibold mb-6 uppercase tracking-wider">
            Roles
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Built for every <br />
            <span className="text-brand">stakeholder in the chain</span>
          </h2>
        </div>

        {/* Roles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
            >
              <div className={`w-12 h-12 rounded-xl ${role.iconBg} flex items-center justify-center mb-6`}>
                {role.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {role.title}
              </h3>
              
              <p className="text-gray-500 leading-relaxed mb-8 h-24">
                {role.description}
              </p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {role.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3 text-gray-600 text-sm">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${role.checkColor}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <a href={`/signup?role=${role.title.toLowerCase()}`} className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${role.buttonBg} ${role.buttonColor}`}>
                {role.buttonText} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Roles;
