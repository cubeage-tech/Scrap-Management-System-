import { useState, useEffect } from "react";
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


// --- Mock data ---
// Replace with API calls once the reporting endpoints are ready.
const stats = [
  { title: "Revenue (YTD)", value: "₹41.3 Cr", icon: IndianRupee, iconClass: "bg-primary/10 text-primary", change: "+18.2%", isPositive: true },
  { title: "Volume Traded", value: "12,846 MT", icon: Package, iconClass: "bg-info/10 text-info", change: "+8.4%", isPositive: true },
  { title: "Auction Realisation", value: "112%", icon: Gavel, iconClass: "bg-success/10 text-success", change: "+4 pts", isPositive: true, note: "vs reserve" },
  { title: "Active Buyers", value: "932", icon: Users, iconClass: "bg-warning/10 text-warning", change: "+21", isPositive: true },
];

const lakhs = (value) => `₹${value}L`;
const tonnes = (value) => `${value} MT`;

// Every tab renders the same two-panel shape, so each one is declared as data
// and handed to the shared <ChartPanel /> / <TablePanel /> renderers below.
const TABS = {
  Sales: {
    main: {
      kind: "area",
      title: "Sales analytics",
      subtitle: "Realised value by month",
      series: { key: "value", name: "Realised", format: lakhs },
      domain: [0, 100],
      ticks: [0, 25, 50, 75, 100],
      data: [
        { name: "Jan", value: 47 }, { name: "Feb", value: 49 }, { name: "Mar", value: 56 },
        { name: "Apr", value: 54 }, { name: "May", value: 68 }, { name: "Jun", value: 76 },
        { name: "Jul", value: 84 },
      ],
    },
    side: {
      kind: "bars",
      title: "Top selling materials",
      series: { key: "value", name: "Volume", format: tonnes },
      domain: [0, 300],
      ticks: [0, 75, 150, 225, 300],
      data: [
        { name: "Steel Turnings", value: 290 }, { name: "Copper Millberry", value: 240 },
        { name: "Aluminium 6063", value: 190 }, { name: "E-Waste PCB", value: 155 },
        { name: "HDPE Regrind", value: 105 },
      ],
    },
  },

  Inventory: {
    main: {
      kind: "combo",
      title: "Inventory movement",
      subtitle: "Stock added against stock dispatched by month",
      bar: { key: "added", name: "Added (MT)" },
      line: { key: "dispatched", name: "Dispatched (MT)" },
      data: [
        { name: "Jan", added: 980, dispatched: 910 }, { name: "Feb", added: 1040, dispatched: 995 },
        { name: "Mar", added: 1180, dispatched: 1120 }, { name: "Apr", added: 1120, dispatched: 1165 },
        { name: "May", added: 1340, dispatched: 1240 }, { name: "Jun", added: 1420, dispatched: 1380 },
        { name: "Jul", added: 1510, dispatched: 1465 },
      ],
    },
    side: {
      kind: "bars",
      title: "Stock ageing",
      series: { key: "value", name: "Lots", format: (value) => `${value} lots` },
      domain: [0, 60],
      ticks: [0, 15, 30, 45, 60],
      data: [
        { name: "0-15 days", value: 54 }, { name: "16-30 days", value: 38 },
        { name: "31-60 days", value: 22 }, { name: "61-90 days", value: 11 },
        { name: "90+ days", value: 6 },
      ],
    },
  },

  Auction: {
    main: {
      kind: "combo",
      title: "Auction outcomes",
      subtitle: "Lots closed against realisation over reserve",
      bar: { key: "lots", name: "Lots closed" },
      line: { key: "realisation", name: "Realisation (%)" },
      data: [
        { name: "Jan", lots: 8, realisation: 103 }, { name: "Feb", lots: 11, realisation: 106 },
        { name: "Mar", lots: 9, realisation: 101 }, { name: "Apr", lots: 14, realisation: 108 },
        { name: "May", lots: 12, realisation: 110 }, { name: "Jun", lots: 16, realisation: 109 },
        { name: "Jul", lots: 18, realisation: 112 },
      ],
    },
    side: {
      kind: "bars",
      title: "Bids by material",
      series: { key: "value", name: "Bids", format: (value) => `${value} bids` },
      domain: [0, 400],
      ticks: [0, 100, 200, 300, 400],
      data: [
        { name: "Steel Turnings", value: 372 }, { name: "Copper Millberry", value: 318 },
        { name: "Aluminium 6063", value: 244 }, { name: "Brass Honey", value: 168 },
        { name: "E-Waste PCB", value: 121 },
      ],
    },
  },

  Revenue: {
    main: {
      kind: "area",
      title: "Revenue trend",
      subtitle: "Settled revenue by month",
      series: { key: "value", name: "Revenue", format: lakhs },
      domain: [0, 120],
      ticks: [0, 30, 60, 90, 120],
      data: [
        { name: "Jan", value: 52 }, { name: "Feb", value: 58 }, { name: "Mar", value: 64 },
        { name: "Apr", value: 61 }, { name: "May", value: 79 }, { name: "Jun", value: 92 },
        { name: "Jul", value: 106 },
      ],
    },
    side: {
      kind: "bars",
      title: "Revenue by channel",
      series: { key: "value", name: "Revenue", format: lakhs },
      domain: [0, 200],
      ticks: [0, 50, 100, 150, 200],
      data: [
        { name: "Live Auction", value: 186 }, { name: "Marketplace", value: 142 },
        { name: "Sealed Tender", value: 98 }, { name: "Direct Deal", value: 61 },
      ],
    },
  },

  "Industry performance": {
    main: {
      kind: "table",
      title: "Industry performance",
      subtitle: "Supplier scorecard by realised value and fulfilment.",
      tableColumns: industryPerformanceColumns,
      rows: [
        { id: "Bharat Steel Works", cells: ["48", "2,140 MT", "₹9.8 Cr", "98%"], status: "Completed" },
        { id: "Tata Precision Forgings", cells: ["41", "1,860 MT", "₹8.2 Cr", "96%"], status: "Completed" },
        { id: "Ashok Auto Components", cells: ["33", "1,420 MT", "₹6.4 Cr", "91%"], status: "Active" },
        { id: "Sanjay Metals Pvt. Ltd.", cells: ["27", "1,105 MT", "₹4.9 Cr", "88%"], status: "Pending" },
        { id: "Green Loop Industries", cells: ["19", "760 MT", "₹3.1 Cr", "74%"], status: "Rejected" },
      ],
    },
  },

  "Buyer performance": {
    main: {
      kind: "table",
      title: "Buyer performance",
      subtitle: "Procurement scorecard by spend and settlement behaviour.",
      tableColumns: buyerPerformanceColumns,
      rows: [
        { id: "Verma Recycling Pvt. Ltd.", cells: ["64", "2,480 MT", "₹11.2 Cr", "99%"], status: "Completed" },
        { id: "Metro Recyclers Pvt Ltd", cells: ["52", "1,930 MT", "₹8.7 Cr", "95%"], status: "Completed" },
        { id: "Shaikh Metals & Alloys", cells: ["44", "1,610 MT", "₹7.1 Cr", "92%"], status: "Active" },
        { id: "National Scrap Corp", cells: ["31", "1,240 MT", "₹5.3 Cr", "84%"], status: "Pending" },
        { id: "Green Loop Recyclers", cells: ["22", "870 MT", "₹3.6 Cr", "71%"], status: "Rejected" },
      ],
    },
  },
};

const TAB_NAMES = Object.keys(TABS);

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

// --- Reusable building blocks ---

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
              domain={spec.domain}
              ticks={spec.ticks}
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
              domain={spec.domain}
              ticks={spec.ticks}
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

const BuyerReports = () => {
  const [tab, setTab] = useState(TAB_NAMES[0]);

  const [buyerData, setBuyerData] = useState(null);

  useEffect(() => {
    fetchBuyerReports();
  }, []);

  const fetchBuyerReports = async () => {
    try {
      const res = await ApiService.getBuyerReports();
      if (res.data?.success) {
        setBuyerData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching buyer reports:", err);
    }
  };

  const { main, side } = TABS[tab];


  return (
    <section>
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
            className="px-4 py-2 text-sm font-semibold rounded-lg border shadow-sm transition-colors bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
          >
            Schedule report
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-opacity bg-primary text-primary-foreground hover:opacity-90"
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
            className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors ${
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
      {side ? (
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
          <ChartPanel spec={main} className="lg:col-span-2" />
          <ChartPanel spec={side} className="lg:col-span-1" />
        </div>
      ) : (
        <div className="mb-6">
          <TablePanel spec={main} />
        </div>
      )}

      {/* Footer note */}
      <Panel className="flex items-center gap-2 p-4 text-xs md:px-6 text-muted-foreground">
        <BarChart3 className="flex-shrink-0 w-4 h-4" />
        Reports refresh every 15 minutes. Scheduled exports are delivered to
        finance@smartscrap.ai.
      </Panel>
    </section>
  );
};

export default BuyerReports;
