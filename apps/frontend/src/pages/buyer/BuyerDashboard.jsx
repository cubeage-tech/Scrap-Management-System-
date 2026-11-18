import { useState, useEffect, useMemo } from "react";
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
import ApiService from "../../core/services/api.service";

const formatCurrency = (val) => {
  const num = Number(val || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const STATUS_VARIANTS = {
  Pending: "warning",
  SUBMITTED: "warning",
  Approved: "success",
  ACCEPTED: "success",
  Rejected: "danger",
  REJECTED: "danger",
  Completed: "success",
  COMPLETED: "success",
};

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
      <StatusBadge label={item.status} variant={STATUS_VARIANTS[item.status] || "neutral"} />
    </div>
  </div>
);

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [buyerData, setBuyerData] = useState(null);
  const [listings, setListings] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [_loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reportsRes, listingsRes, auctionsRes] = await Promise.all([
        ApiService.getBuyerReports().catch(() => null),
        ApiService.getListings().catch(() => null),
        ApiService.getAuctions().catch(() => null),
      ]);

      if (reportsRes?.data?.success && reportsRes.data.data) {
        setBuyerData(reportsRes.data.data);
      }
      if (listingsRes?.data?.success && Array.isArray(listingsRes.data.data)) {
        setListings(listingsRes.data.data);
      }
      if (auctionsRes?.data?.success && Array.isArray(auctionsRes.data.data)) {
        setAuctions(auctionsRes.data.data);
      }
    } catch (err) {
      console.error("Error loading buyer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchDashboardData(); }, []);

  // Aggregated KPIs
  const kpis = buyerData?.kpis || {};

  const availableScrapMT = useMemo(() => {
    const totalKg = listings.reduce((sum, l) => sum + Number(l.quantityKg || 0), 0);
    return (totalKg / 1000).toFixed(1);
  }, [listings]);

  const liveAuctionsCount = useMemo(() => {
    return auctions.filter((a) => ["LIVE", "EXTENDED"].includes(a.status)).length;
  }, [auctions]);

  const statCards = [
    {
      title: "Available Scrap",
      value: `${availableScrapMT} Tons`,
      change: "Active listings",
      isPositive: true,
      note: "on marketplace",
      icon: Package,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      title: "Accepted Quotations",
      value: String(kpis.acceptedCount || 0),
      change: "Approved",
      isPositive: true,
      icon: FileText,
      iconClass: "bg-success/10 text-success",
    },
    {
      title: "Open Purchases",
      value: String(buyerData?.purchasesHistory?.length || 0),
      note: "fulfilled deals",
      icon: Truck,
      iconClass: "bg-info/10 text-info",
    },
    {
      title: "Total Procurement Spend",
      value: formatCurrency(kpis.totalProcurementSpend || 0),
      change: "Committed capital",
      isPositive: true,
      icon: CreditCard,
      iconClass: "bg-warning/10 text-warning",
    },
    {
      title: "Live Auctions",
      value: String(liveAuctionsCount),
      note: "active bidding",
      icon: Gavel,
      iconClass: "bg-destructive/10 text-destructive",
    },
    {
      title: "Spend (MTD)",
      value: formatCurrency(kpis.totalProcurementSpend || 0),
      change: "Total spend",
      isPositive: true,
      icon: IndianRupee,
      iconClass: "bg-primary/10 text-primary",
    },
  ];

  // Spend chart data grouped by month
  const spendData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      map[label] = { name: label, value: 0 };
    }

    const purchases = buyerData?.purchasesHistory || [];
    purchases.forEach((p) => {
      const date = new Date(p.completedAt || p.createdAt || 0);
      const label = monthNames[date.getMonth()];
      if (map[label]) {
        map[label].value += Number(p.totalValue || 0) / 100000; // in Lakhs
      }
    });

    return Object.values(map);
  }, [buyerData]);

  // Material category breakdown chart
  const materialData = useMemo(() => {
    const map = {};
    const purchases = buyerData?.purchasesHistory || [];
    purchases.forEach((p) => {
      const cat = p.category || "General Scrap";
      if (!map[cat]) map[cat] = 0;
      map[cat] += Number(p.quantityKg || 0) / 1000; // in MT
    });

    const list = Object.entries(map).map(([name, val]) => ({ name, value: Math.round(val) }));
    if (list.length === 0) {
      return [{ name: "General Scrap", value: 0 }];
    }
    return list;
  }, [buyerData]);

  // Mapped quotations list
  const quotations = useMemo(() => {
    const history = buyerData?.quotationsHistory || [];
    return history.slice(0, 5).map((q) => ({
      id: `QTN-${q.id.slice(0, 6).toUpperCase()}`,
      title: `${q.category} Scrap`,
      meta: `${(Number(q.quantityKg || 0) / 1000).toFixed(1)} Tons · ${new Date(q.createdAt).toLocaleDateString("en-IN")}`,
      amount: formatCurrency(q.totalValue),
      status: q.status === "ACCEPTED" ? "Approved" : q.status === "SUBMITTED" ? "Pending" : q.status,
    }));
  }, [buyerData]);

  // Mapped purchases list
  const purchases = useMemo(() => {
    const history = buyerData?.purchasesHistory || [];
    return history.slice(0, 5).map((p) => ({
      id: `ORD-${p.id.slice(0, 6).toUpperCase()}`,
      title: `${p.sellerName || "Industrial Seller"} Deal`,
      meta: `${(Number(p.quantityKg || 0) / 1000).toFixed(1)} Tons · ${new Date(p.completedAt || 0).toLocaleDateString("en-IN")}`,
      amount: formatCurrency(p.totalValue),
      status: "Completed",
    }));
  }, [buyerData]);

  return (
    <section className="text-left font-sans">
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
            Buyer Procurement Dashboard
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
              Settled purchase value (₹ Lakhs) by month
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
                  formatter={(value) => [`${value} Tons`, "Purchased"]}
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
              onClick={() => navigate("/buyer/quotations")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="border-t border-border">
            {quotations.length === 0 ? (
              <p className="p-6 text-xs text-muted-foreground text-center">No quotations submitted yet.</p>
            ) : (
              quotations.map((item) => (
                <ListRow key={item.id} item={item} />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-xl border shadow-sm bg-card border-border">
          <div className="p-4 md:px-6">
            <h2 className="text-base font-bold text-card-foreground">
              Recent purchases
            </h2>
          </div>

          <div className="border-t border-border">
            {purchases.length === 0 ? (
              <p className="p-6 text-xs text-muted-foreground text-center">No completed purchases yet.</p>
            ) : (
              purchases.map((item) => (
                <ListRow key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyerDashboard;
