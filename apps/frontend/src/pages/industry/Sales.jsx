import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import { salesTableConfig } from "../../configs/tables/salesTable.config";

const formatCurrency = (val) => "₹" + Number(val || 0).toLocaleString("en-IN");

const Sales = () => {
  const [salesList, setSalesList] = useState([]);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalSoldKg: 0,
    totalSalesCount: 0,
    availableStockKg: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.get("/reports/industry");
      if (res?.data?.success && res.data.data) {
        const report = res.data.data;
        if (report.kpis) {
          setKpis(report.kpis);
        }

        if (report.salesHistory && report.salesHistory.length > 0) {
          const mapped = report.salesHistory.map((s, idx) => ({
            id: s.id,
            orderId: `ORD-${s.id.slice(0, 6).toUpperCase()}`,
            buyerName: s.buyerName || "Registered Dealer / Buyer",
            location: "Industrial Zone",
            material: s.category || "Scrap Material",
            category: s.category || "Ferrous",
            quantity: `${(Number(s.quantityKg || 0) / 1000).toFixed(1)} MT`,
            totalValue: formatCurrency(s.totalValue),
            rawTotal: Number(s.totalValue || 0),
            paymentStatus: idx % 2 === 0 ? "Paid" : "Processing",
            fulfillmentStatus: idx % 3 === 0 ? "InTransit" : "Completed",
            date: new Date(s.completedAt || Date.now()).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }));
          setSalesList(mapped);
        } else {
          // Fallback sample data if no sales exist in DB yet
          setSalesList([
            {
              id: "S-101",
              orderId: "ORD-99042",
              buyerName: "Mahindra Recycling Hub",
              location: "Pune Industrial Estate",
              material: "MS Steel HMS 1&2",
              category: "Steel",
              quantity: "24.5 MT",
              totalValue: formatCurrency(943250),
              rawTotal: 943250,
              paymentStatus: "Paid",
              fulfillmentStatus: "Completed",
              date: "2026-08-28",
            },
            {
              id: "S-102",
              orderId: "ORD-99041",
              buyerName: "Tata Scrap Traders",
              location: "Jamshedpur Yard",
              material: "Copper Wire Scrap",
              category: "Copper",
              quantity: "8.2 MT",
              totalValue: formatCurrency(594500),
              rawTotal: 594500,
              paymentStatus: "Paid",
              fulfillmentStatus: "InTransit",
              date: "2026-08-24",
            },
            {
              id: "S-103",
              orderId: "ORD-99040",
              buyerName: "Hindalco Recycling",
              location: "Belagavi Hub",
              material: "Aluminium Offcuts",
              category: "Aluminium",
              quantity: "14.0 MT",
              totalValue: formatCurrency(280000),
              rawTotal: 280000,
              paymentStatus: "Processing",
              fulfillmentStatus: "Scheduled",
              date: "2026-08-20",
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Error fetching sales orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const rowSelection = useMemo(
    () => Object.fromEntries(selectedIds.map((id) => [id, true])),
    [selectedIds]
  );

  const handleRowSelectionChange = (updaterOrValue) => {
    const next = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    setSelectedIds(Object.keys(next).filter((id) => next[id]));
  };

  const handleExportCSV = () => {
    const itemsToExport =
      selectedIds.length > 0
        ? salesList.filter((s) => selectedIds.includes(s.id))
        : salesList;

    const headers = [
      "Order ID",
      "Buyer Name",
      "Material",
      "Category",
      "Quantity",
      "Total Amount",
      "Payment Status",
      "Fulfillment",
      "Date",
    ];

    const rows = itemsToExport.map((s) => [
      s.orderId,
      s.buyerName,
      s.material,
      s.category,
      s.quantity,
      s.totalValue,
      s.paymentStatus,
      s.fulfillmentStatus,
      s.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Industry_Sales_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
            <span>SmartScrap AI</span>
            <span>&rsaquo;</span>
            <span>Industry Portal</span>
            <span>&rsaquo;</span>
            <span className="text-slate-600 font-semibold">Sales Orders</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sales & Order Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track completed sales, buyer payments, and pickup schedules in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSalesData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white/90" />
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(kpis.totalRevenue || salesList.reduce((acc, s) => acc + (s.rawTotal || 0), 0))}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Volume Sold
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {(Number(kpis.totalSoldKg || 0) / 1000).toFixed(1)} MT
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Sales Count
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {kpis.totalSalesCount || salesList.length} Orders
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Available Stock
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {(Number(kpis.availableStockKg || 0) / 1000).toFixed(1)} MT
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Material Table */}
      <MaterialTable
        config={salesTableConfig}
        data={salesList}
        getRowId={(row) => row.id}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
};

export default Sales;
