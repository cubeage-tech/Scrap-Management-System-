import { useState, useEffect, useMemo } from "react";
import { Download, Search } from "lucide-react";

import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import { dealerCategoryPerformanceColumns } from "../../configs/tables/dealerCategoryPerformanceTable.config";

const formatCurrency = (val) => "₹" + Number(val || 0).toLocaleString("en-IN");

const DealerReports = () => {
  const [reportData, setReportData] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchDealerReports(); }, []);

  const kpis = reportData?.kpis || {};

  const categories = useMemo(() => {
    const list = reportData?.categoryPerformance || [];
    if (list.length === 0) {
      return [
        {
          category: "General Scrap",
          listed: "0 kg",
          sold: "0 kg",
          price: "₹0",
          revenue: "₹0",
          commission: "₹0",
          rate: 0,
        },
      ];
    }
    return list.map((c) => ({
      category: c.category || "General",
      listed: `${(Number(c.listedKg || 0)).toLocaleString()} kg`,
      sold: `${(Number(c.soldKg || 0)).toLocaleString()} kg`,
      price: formatCurrency(c.revenue && c.soldKg ? c.revenue / c.soldKg : 0),
      revenue: formatCurrency(c.revenue || c.soldKg * 35),
      commission: formatCurrency((c.revenue || 0) * 0.01),
      rate: c.listedKg > 0 ? Math.round((c.soldKg / c.listedKg) * 100) : 100,
    }));
  }, [reportData]);

  const revenueData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const map = {};
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      map[label] = { month: label, value: 0 };
    }

    const sales = reportData?.sales || [];
    sales.forEach((s) => {
      const date = new Date(s.createdAt || 0);
      const label = monthNames[date.getMonth()];
      if (map[label]) {
        map[label].value += Number(s.totalValue || 0) / 100000;
      }
    });

    const data = Object.values(map);
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    return data.map((d) => ({
      ...d,
      heightPct: Math.min(100, Math.max(10, Math.round((d.value / maxVal) * 100))),
    }));
  }, [reportData]);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) => !search || c.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const handleExportCSV = () => {
    if (categories.length === 0) return;
    const headers = ["Category", "Listed", "Sold", "Price/Kg", "Revenue", "Commission", "Conversion Rate"];
    const rows = categories.map((c) => [
      c.category,
      c.listed,
      c.sold,
      c.price,
      c.revenue,
      c.commission,
      `${c.rate}%`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dealer_Category_Reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-slate-800 font-sans text-left">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dealer Reports & Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Comprehensive business intelligence, procurement cost, sales revenue, and margin analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:w-64">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <Download className="h-4 w-4 text-slate-500" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-5 p-4 sm:p-6 lg:p-8">
        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Procurement Cost
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(kpis.totalProcurementCost || 0)}
            </span>
            <span className="text-xs text-slate-400 mt-1 block font-medium">
              {(Number(kpis.totalPurchasedKg || 0) / 1000).toFixed(1)} Tons Acquired
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sales Revenue
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {formatCurrency(kpis.totalSalesRevenue || 0)}
            </span>
            <span className="text-xs text-slate-400 mt-1 block font-medium">
              {(Number(kpis.totalSoldKg || 0) / 1000).toFixed(1)} Tons Sold
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Gross Profit
            </span>
            <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
              {formatCurrency(kpis.grossProfit || 0)}
            </span>
            <span className="text-xs text-emerald-600 mt-1 block font-medium">
              Margin: {kpis.marginPercent || 0}%
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Stock
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {(Number(kpis.currentStockKg || 0) / 1000).toFixed(1)} Tons
            </span>
            <span className="text-xs text-slate-400 mt-1 block font-medium">
              Available in inventory
            </span>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* MONTHLY REVENUE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">
              Monthly Sales Revenue
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Revenue trend (in ₹ Lakhs)
            </p>

            <div className="mt-6 flex h-60 items-end gap-3 border-b border-slate-100 px-2">
              {revenueData.map((item) => (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-blue-600 transition-all duration-500"
                    style={{ height: `${item.heightPct}%` }}
                  />
                  <span className="mt-2 text-xs font-semibold text-slate-500">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* INVENTORY STOCK TREND */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">
              Stock & Category Liquidity
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Inventory breakdown across active categories
            </p>

            <div className="mt-6 space-y-3">
              {filteredCategories.slice(0, 5).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.category}</span>
                    <span>{cat.sold} / {cat.listed} ({cat.rate}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${cat.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Category-wise Sales & Performance
            </h2>
          </div>

          <MaterialTable
            columns={dealerCategoryPerformanceColumns}
            data={filteredCategories}
            getRowId={(row) => row.category}
          />
        </div>
      </main>
    </div>
  );
};

export default DealerReports;