import { useState, useEffect } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  Package,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";

import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import { dealerCategoryPerformanceColumns } from "../../configs/tables/dealerCategoryPerformanceTable.config";


const reportTypes = [
  {
    title: "Sales Report",
    icon: TrendingUp,
    active: true,
  },
  {
    title: "Inventory Report",
    icon: Package,
    active: false,
  },
  {
    title: "Material Report",
    icon: Package,
    active: false,
  },
  {
    title: "Revenue Report",
    icon: FileText,
    active: false,
  },
];

const categories = [
  {
    category: "Steel",
    listed: "89,200 kg",
    sold: "72,400 kg",
    price: "₹36,800",
    revenue: "₹26,64,32,000",
    commission: "₹26,64,320",
    rate: 81,
  },
  {
    category: "Copper",
    listed: "18,600 kg",
    sold: "15,200 kg",
    price: "₹5,15,000",
    revenue: "₹78,28,00,000",
    commission: "₹78,28,000",
    rate: 82,
  },
  {
    category: "Aluminium",
    listed: "42,800 kg",
    sold: "38,100 kg",
    price: "₹1,75,000",
    revenue: "₹66,67,50,000",
    commission: "₹66,67,500",
    rate: 89,
  },
  {
    category: "Plastic",
    listed: "28,400 kg",
    sold: "22,600 kg",
    price: "₹58,000",
    revenue: "₹13,00,80,000",
    commission: "₹13,00,800",
    rate: 80,
  },
  {
    category: "E-Waste",
    listed: "6,200 kg",
    sold: "5,800 kg",
    price: "₹92,000",
    revenue: "₹5,33,60,000",
    commission: "₹5,33,600",
    rate: 94,
  },
];

const revenueData = [
  { month: "Jan", value: 55 },
  { month: "Feb", value: 70 },
  { month: "Mar", value: 52 },
  { month: "Apr", value: 82 },
  { month: "May", value: 96 },
  { month: "Jun", value: 73 },
  { month: "Jul", value: 100 },
  { month: "Aug", value: 42 },
];

const DealerReports = () => {
  const [reportData, setReportData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealerReports();
  }, []);

  const fetchDealerReports = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getDealerReports();
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (error) {
      console.error("Error loading dealer reports:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-slate-800">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reports & Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Comprehensive business intelligence and reporting
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:w-64">
              <Search className="h-4 w-4 text-slate-400" />

              <input
                type="text"
                placeholder="Search inventory, listings..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Notification */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />

              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                2
              </span>
            </button>

            {/* Settings */}
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Settings className="h-5 w-5" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                PS
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  Priya Sharma
                </p>

                <span className="text-xs text-orange-600">Dealer</span>
              </div>

              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-5 p-4 sm:p-6 lg:p-8">
        {/* REPORT TYPES */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;

            return (
              <button
                key={report.title}
                className={`rounded-xl border bg-white p-4 text-left shadow-sm ${
                  report.active
                    ? "border-blue-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      report.active
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="font-semibold text-slate-800">
                    {report.title}
                  </span>
                </div>

                {report.active && (
                  <div className="mt-4 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
              <CalendarDays className="h-4 w-4 text-slate-400" />

              <select className="bg-transparent py-2 text-sm outline-none">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
              <option>All Categories</option>
              <option>Steel</option>
              <option>Copper</option>
              <option>Aluminium</option>
              <option>Plastic</option>
            </select>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
              <option>All Dealers</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export CSV
            </button>

            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* MONTHLY REVENUE */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Monthly Revenue
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Jan — Aug 2026
            </p>

            <div className="mt-6 flex h-64 items-end gap-3 border-b border-slate-100 px-2">
              {revenueData.map((item) => (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="w-full max-w-10 rounded-t-md bg-blue-600"
                    style={{ height: `${item.value}%` }}
                  />

                  <span className="mt-2 text-xs text-slate-400">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* INVENTORY STOCK TREND */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Inventory Stock Trend
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Weekly stock levels (MT)
            </p>

            <div className="mt-6 h-64">
              <svg
                viewBox="0 0 700 260"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                {[40, 90, 140, 190, 240].map((y) => (
                  <line
                    key={y}
                    x1="30"
                    y1={y}
                    x2="680"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                ))}

                <polyline
                  points="30,90 120,115 210,75 300,145 390,60 480,95 570,42 680,72"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {[30, 120, 210, 300, 390, 480, 570, 680].map(
                  (x, index) => {
                    const points = [90, 115, 75, 145, 60, 95, 42, 72];

                    return (
                      <circle
                        key={x}
                        cx={x}
                        cy={points[index]}
                        r="5"
                        fill="#16a34a"
                      />
                    );
                  }
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* SECOND CHART ROW */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* MATERIAL DISTRIBUTION */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Material Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              By volume percentage
            </p>

            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <div
                className="h-44 w-44 rounded-full"
                style={{
                  background:
                    "conic-gradient(#2563eb 0% 42%, #f59e0b 42% 60%, #16a34a 60% 75%, #8b5cf6 75% 87%, #dc2626 87% 95%, #64748b 95% 100%)",
                }}
              />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <span>🔵 Steel 42%</span>
                <span>🟠 Copper 18%</span>
                <span>🟢 Aluminium 15%</span>
                <span>🟣 Plastic 12%</span>
                <span>🔴 E-Waste 8%</span>
                <span>⚫ Others 5%</span>
              </div>
            </div>
          </div>

          {/* REVENUE GROWTH */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Revenue Growth
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Month-over-month
            </p>

            <div className="mt-6 h-56">
              <svg
                viewBox="0 0 700 240"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                {[40, 90, 140, 190].map((y) => (
                  <line
                    key={y}
                    x1="30"
                    y1={y}
                    x2="680"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                ))}

                <polyline
                  points="30,130 120,110 210,145 300,80 390,68 480,100 570,40 680,150"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Category-wise Performance
            </h2>

            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <MaterialTable
            columns={dealerCategoryPerformanceColumns}
            data={categories}
            getRowId={(row) => row.category}
          />
        </div>
      </main>
    </div>
  );
};

export default DealerReports;