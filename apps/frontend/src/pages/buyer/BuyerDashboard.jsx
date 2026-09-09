import { useNavigate } from "react-router-dom";
import {
  Package,
  FileText,
  Truck,
  CreditCard,
  Gavel,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatusBadge from "../../components/common/StatusBadge";

// --- Mock data ---
// Replace with API calls once the buyer dashboard endpoints are ready.
const statCards = [
  {
    title: "Available Scrap",
    value: "1,842 MT",
    change: "+94 MT",
    isPositive: true,
    note: "matching your filters",
    icon: Package,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    title: "Accepted Quotations",
    value: "14",
    change: "+2",
    isPositive: true,
    icon: FileText,
    iconClass: "bg-success/10 text-success",
  },
  {
    title: "Open Orders",
    value: "8",
    note: "3 in transit",
    icon: Truck,
    iconClass: "bg-info/10 text-info",
  },
  {
    title: "Payments Due",
    value: "₹12.4 L",
    change: "-8.1%",
    isPositive: false,
    icon: CreditCard,
    iconClass: "bg-warning/10 text-warning",
  },
  {
    title: "Live Auctions",
    value: "6",
    note: "2 shortlisted",
    icon: Gavel,
    iconClass: "bg-destructive/10 text-destructive",
  },
  {
    title: "Spend (MTD)",
    value: "₹48.6 L",
    change: "+6.4%",
    isPositive: true,
    icon: IndianRupee,
    iconClass: "bg-primary/10 text-primary",
  },
];

const spendData = [
  { name: "Jan", value: 47 },
  { name: "Feb", value: 49 },
  { name: "Mar", value: 56 },
  { name: "Apr", value: 54 },
  { name: "May", value: 68 },
  { name: "Jun", value: 76 },
  { name: "Jul", value: 84 },
];

const materialData = [
  { name: "Steel Turnings", value: 290 },
  { name: "Copper Millberry", value: 240 },
  { name: "Aluminium 6063", value: 190 },
  { name: "E-Waste PCB", value: 155 },
  { name: "HDPE Regrind", value: 105 },
];

const quotations = [
  { id: "QTN-8841", title: "Copper Scrap (Millberry)", meta: "12.5 MT · 28 Jul 2026", amount: "₹7,38,000", status: "Pending" },
  { id: "QTN-8840", title: "Aluminium Extrusion 6063", meta: "21.2 MT · 27 Jul 2026", amount: "₹3,94,500", status: "Approved" },
  { id: "QTN-8839", title: "HDPE Plastic Regrind", meta: "33 MT · 26 Jul 2026", amount: "₹1,45,000", status: "Rejected" },
  { id: "QTN-8838", title: "Brass Honey Scrap", meta: "6.8 MT · 24 Jul 2026", amount: "₹3,05,000", status: "Completed" },
];

const purchases = [
  { id: "ORD-5521", title: "E-Waste PCB Assorted", meta: "4.4 MT · 26 Jul 2026", amount: "₹5,46,000", status: "Completed" },
  { id: "ORD-5520", title: "Rubber Tyre Scrap", meta: "40 MT · 24 Jul 2026", amount: "₹1,12,000", status: "Completed" },
  { id: "ORD-5519", title: "Kraft Paper Waste", meta: "52 MT · 23 Jul 2026", amount: "₹78,000", status: "Pending" },
  { id: "ORD-5518", title: "Steel Turnings", meta: "30 MT · 21 Jul 2026", amount: "₹8,12,000", status: "Approved" },
];

const STATUS_VARIANTS = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
  Completed: "success",
};

// Recharts needs literal colour values, so the design tokens are referenced
// as CSS variables instead of Tailwind utility classes.
const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
};

const axisTick = { fill: "var(--muted-foreground)", fontSize: 10 };

const ListRow = ({ item }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border md:px-6 last:border-b-0 hover:bg-muted">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-card-foreground truncate">{item.title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground truncate">
        {item.id} · {item.meta}
      </p>
    </div>

    <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
      <span className="text-sm font-semibold text-card-foreground">{item.amount}</span>
      <StatusBadge label={item.status} variant={STATUS_VARIANTS[item.status]} />
    </div>
  </div>
);

const BuyerDashboard = () => {
  const navigate = useNavigate();


  return (
    <section>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
        <span>SmartScrap AI</span>
        <ChevronRight className="w-3 h-3" />
        <span>Buyer</span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-foreground">Dashboard</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            Verma Recycling Pvt. Ltd.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Procurement pipeline, quotation status and settlement overview.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/buyer/quotations")}
            className="px-4 py-2 text-sm font-semibold rounded-lg border shadow-sm transition-colors bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            My quotations
          </button>
          <button
            type="button"
            onClick={() => navigate("/buyer/marketplace")}
            className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-opacity bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
          >
            Browse marketplace
          </button>
        </div>
      </div>


      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const Trend = stat.isPositive ? TrendingUp : TrendingDown;

          return (
            <div
              key={stat.title}
              className="p-4 rounded-xl border shadow-sm transition-shadow bg-card border-border md:p-5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </h3>
                <div
                  className={`flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-lg ${stat.iconClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <p className="text-2xl font-bold text-card-foreground md:text-3xl">
                {stat.value}
              </p>

              {(stat.change || stat.note) && (
                <p className="flex items-center gap-1.5 mt-2 text-xs">
                  {stat.change && (
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        stat.isPositive ? "text-success" : "text-destructive"
                      }`}
                    >
                      <Trend className="w-3 h-3" />
                      {stat.change}
                    </span>
                  )}
                  {stat.note && (
                    <span className="text-muted-foreground">{stat.note}</span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
        {/* Procurement spend */}
        <div className="p-4 rounded-xl border shadow-sm bg-card border-border md:p-6 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-bold text-card-foreground">
              Procurement spend
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Settled purchase value by month
            </p>
          </div>

          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="buyerSpendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={axisTick}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={axisTick}
                  tickFormatter={(value) => `₹${value}L`}
                  width={50}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => [`₹${value}L`, "Spend"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#buyerSpendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most purchased materials */}
        <div className="flex flex-col p-4 rounded-xl border shadow-sm bg-card border-border md:p-6 lg:col-span-1">
          <h2 className="mb-4 text-base font-bold text-card-foreground">
            Most purchased materials
          </h2>

          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={materialData}
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 300]}
                  ticks={[0, 75, 150, 225, 300]}
                  axisLine={false}
                  tickLine={false}
                  tick={axisTick}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  width={110}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => [`${value} MT`, "Purchased"]}
                />
                <Bar
                  dataKey="value"
                  fill="var(--chart-3)"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border shadow-sm bg-card border-border">
          <div className="flex items-center justify-between gap-3 p-4 md:px-6">
            <h2 className="text-base font-bold text-card-foreground">
              Quotation status
            </h2>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
            >
              View all
            </button>
          </div>

          <div className="border-t border-border">
            {quotations.map((item) => (
              <ListRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl border shadow-sm bg-card border-border">
          <div className="p-4 md:px-6">
            <h2 className="text-base font-bold text-card-foreground">
              Recent purchases
            </h2>
          </div>

          <div className="border-t border-border">
            {purchases.map((item) => (
              <ListRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyerDashboard;
