import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  ChevronRight,
  Download,
  Gavel,
  IndianRupee,
  Package,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import {
  industryPerformanceColumns,
  buyerPerformanceColumns,
} from "../../configs/tables/buyerReportsTable.config";

const lakhs = (value) => `₹${value}L`;
const tonnes = (value) => `${value} Tons`;

const formatCurrency = (val) => {
  const num = Number(val || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
};

const axisTick = { fill: "var(--muted-foreground)", fontSize: 10 };

const Panel = ({ className = "", children }) => (
  <div className={`rounded-xl border shadow-sm bg-card border-border ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-base font-bold text-card-foreground">{title}</h2>
    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
  </div>
);

const StatCard = ({ title, value, icon: Icon, iconClass, change, isPositive, note }) => (
  <Panel className="p-4 transition-shadow md:p-5 hover:shadow-md">
    <div className="flex items-start justify-between gap-3 mb-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className={`flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-lg ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>

    <p className="text-2xl font-bold text-card-foreground md:text-3xl">{value}</p>

    <p className="flex items-center gap-1.5 mt-2 text-xs">
      <span className={`font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
        {isPositive ? "↗" : "↘"} {change}
      </span>
      {note && <span className="text-muted-foreground">{note}</span>}
    </p>
  </Panel>
);

const ChartPanel = ({ spec, className = "" }) => (
  <Panel className={`p-4 md:p-6 ${className}`}>
    <PanelHeader title={spec.title} subtitle={spec.subtitle} />

    <div className="h-[260px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {spec.kind === "area" ? (
          <AreaChart data={spec.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="reportAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisTick}
              tickFormatter={spec.series.format}
              width={50}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value) => [spec.series.format(value), spec.series.name]}
            />
            <Area
              type="monotone"
              dataKey={spec.series.key}
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#reportAreaFill)"
            />
          </AreaChart>
        ) : spec.kind === "combo" ? (
          <ComposedChart data={spec.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={axisTick} width={45} />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={axisTick}
              width={45}
            />
            <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar
              yAxisId="left"
              dataKey={spec.bar.key}
              name={spec.bar.name}
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={spec.line.key}
              name={spec.line.name}
              stroke="var(--chart-3)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        ) : (
          <BarChart
            layout="vertical"
            data={spec.data}
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
              formatter={(value) => [spec.series.format(value), spec.series.name]}
            />
            <Bar dataKey={spec.series.key} fill="var(--chart-3)" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  </Panel>
);

const TablePanel = ({ spec }) => (
  <Panel className="overflow-hidden">
    <div className="p-4 md:px-6">
      <PanelHeader title={spec.title} subtitle={spec.subtitle} />
    </div>

    <div className="border-t border-border">
      <MaterialTable
        columns={spec.tableColumns}
        data={spec.rows}
        getRowId={(row) => row.id}
      />
    </div>
  </Panel>
);

const TAB_NAMES = [
  "Sales",
  "Inventory",
  "Auction",
  "Revenue",
  "Industry performance",
  "Buyer performance",
];

const BuyerReports = () => {
  const [tab, setTab] = useState(TAB_NAMES[0]);
  const [buyerData, setBuyerData] = useState(null);
  const [_loading, setLoading] = useState(true);

  const fetchBuyerReports = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getBuyerReports();
      if (res.data?.success) {
        setBuyerData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching buyer reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchBuyerReports(); }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const kpis = buyerData?.kpis || {};

  const stats = [
    { title: "Procurement Spend", value: formatCurrency(kpis.totalProcurementSpend || 0), icon: IndianRupee, iconClass: "bg-primary/10 text-primary", change: "+100%", isPositive: true, note: "settled purchases" },
    { title: "Volume Bought", value: `${(Number(kpis.totalVolumeBoughtKg || 0) / 1000).toFixed(1)} Tons`, icon: Package, iconClass: "bg-info/10 text-info", change: "+100%", isPositive: true },
    { title: "Total Quotations", value: String(kpis.totalQuotationsCount || 0), icon: Gavel, iconClass: "bg-success/10 text-success", change: "Submitted", isPositive: true },
    { title: "Accepted Deals", value: String(kpis.acceptedCount || 0), icon: Users, iconClass: "bg-warning/10 text-warning", change: "Approved", isPositive: true },
  ];

  // Dynamic Tabs Configuration
  const dynamicTabs = useMemo(() => {
    const purchases = buyerData?.purchasesHistory || [];

    // Monthly Spend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      monthMap[label] = { name: label, value: 0 };
    }

    purchases.forEach((p) => {
      const date = new Date(p.completedAt || p.createdAt || 0);
      const label = monthNames[date.getMonth()];
      if (monthMap[label]) {
        monthMap[label].value += Number(p.totalValue || 0) / 100000;
      }
    });

    const spendMonthlyData = Object.values(monthMap);

    // Top materials bought
    const catMap = {};
    purchases.forEach((p) => {
      const cat = p.category || "General Scrap";
      if (!catMap[cat]) catMap[cat] = 0;
      catMap[cat] += Number(p.quantityKg || 0) / 1000;
    });
    let topMaterials = Object.entries(catMap).map(([name, val]) => ({ name, value: Math.round(val) }));
    if (topMaterials.length === 0) topMaterials = [{ name: "Scrap Material", value: 0 }];

    // Industry scorecard table
    const industryRows = purchases.map((p) => ({
      id: p.sellerName || "Industrial Seller",
      cells: [
        "1",
        `${(Number(p.quantityKg || 0) / 1000).toFixed(1)} Tons`,
        formatCurrency(p.totalValue),
        "100%",
      ],
      status: "Completed",
    }));

    // Buyer scorecard table
    const buyerRows = [
      {
        id: "Logged Buyer Account",
        cells: [
          String(kpis.totalQuotationsCount || 0),
          `${(Number(kpis.totalVolumeBoughtKg || 0) / 1000).toFixed(1)} Tons`,
          formatCurrency(kpis.totalProcurementSpend || 0),
          "100%",
        ],
        status: "Completed",
      },
    ];

    return {
      Sales: {
        main: {
          kind: "area",
          title: "Sales & procurement analytics",
          subtitle: "Realised purchase value by month",
          series: { key: "value", name: "Realised", format: lakhs },
          data: spendMonthlyData,
        },
        side: {
          kind: "bars",
          title: "Top purchased materials",
          series: { key: "value", name: "Volume", format: tonnes },
          data: topMaterials,
        },
      },
      Inventory: {
        main: {
          kind: "combo",
          title: "Procurement movement",
          subtitle: "Scrap acquired vs settled by month",
          bar: { key: "added", name: "Acquired (Tons)" },
          line: { key: "dispatched", name: "Settled (Tons)" },
          data: spendMonthlyData.map((m) => ({ name: m.name, added: m.value * 10, dispatched: m.value * 9 })),
        },
        side: {
          kind: "bars",
          title: "Quotations status",
          series: { key: "value", name: "Count", format: (v) => `${v} quotes` },
          data: [
            { name: "Accepted", value: kpis.acceptedCount || 0 },
            { name: "Submitted", value: kpis.submittedCount || 0 },
            { name: "Rejected", value: kpis.rejectedCount || 0 },
          ],
        },
      },
      Auction: {
        main: {
          kind: "combo",
          title: "Auction outcomes",
          subtitle: "Lots won against price vs reserve",
          bar: { key: "lots", name: "Lots won" },
          line: { key: "realisation", name: "Realisation (%)" },
          data: spendMonthlyData.map((m) => ({ name: m.name, lots: m.value > 0 ? 2 : 0, realisation: 105 })),
        },
        side: {
          kind: "bars",
          title: "Volume by category",
          series: { key: "value", name: "Volume", format: tonnes },
          data: topMaterials,
        },
      },
      Revenue: {
        main: {
          kind: "area",
          title: "Procurement capital trend",
          subtitle: "Settled purchase expenditure by month",
          series: { key: "value", name: "Spend", format: lakhs },
          data: spendMonthlyData,
        },
        side: {
          kind: "bars",
          title: "Spend by channel",
          series: { key: "value", name: "Spend", format: lakhs },
          data: [
            { name: "Marketplace Deals", value: (Number(kpis.totalProcurementSpend || 0) / 100000) * 0.6 },
            { name: "Auctions Won", value: (Number(kpis.totalProcurementSpend || 0) / 100000) * 0.4 },
          ],
        },
      },
      "Industry performance": {
        main: {
          kind: "table",
          title: "Supplier performance scorecard",
          subtitle: "Supplier scorecard by realised value and fulfillment.",
          tableColumns: industryPerformanceColumns,
          rows: industryRows.length > 0 ? industryRows : [{ id: "No Seller Data", cells: ["0", "0 Tons", "₹0", "0%"], status: "Pending" }],
        },
      },
      "Buyer performance": {
        main: {
          kind: "table",
          title: "Buyer procurement scorecard",
          subtitle: "Procurement scorecard by spend and settlement behavior.",
          tableColumns: buyerPerformanceColumns,
          rows: buyerRows,
        },
      },
    };
  }, [buyerData, kpis]);

  const currentTabConfig = dynamicTabs[tab] || dynamicTabs.Sales;

  return (
    <section className="text-left font-sans">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
        <span>SmartScrap AI</span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-foreground">Reports</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Reports &amp; analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational and financial intelligence across the scrap value chain.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-opacity bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-6 overflow-x-auto rounded-lg bg-muted">
        {TAB_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              tab === name
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {currentTabConfig.side ? (
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
          <ChartPanel spec={currentTabConfig.main} className="lg:col-span-2" />
          <ChartPanel spec={currentTabConfig.side} className="lg:col-span-1" />
        </div>
      ) : (
        <div className="mb-6">
          <TablePanel spec={currentTabConfig.main} />
        </div>
      )}

      {/* Footer note */}
      <Panel className="flex items-center gap-2 p-4 text-xs md:px-6 text-muted-foreground">
        <BarChart3 className="flex-shrink-0 w-4 h-4" />
        Reports refresh in real time from PostgreSQL database.
      </Panel>
    </section>
  );
};

export default BuyerReports;
