import { useState, useEffect, useMemo } from "react";
import {
  Package,
  DollarSign,
  Truck,
  Download,
  Search,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import ApiService from "../../core/services/api.service";

const formatCurrency = (val) => "₹" + Number(val || 0).toLocaleString("en-IN");

const PurchasedScrap = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      // Fetch sales orders where logged-in user is buyer
      const [salesRes, reportsRes] = await Promise.all([
        ApiService.getSales(),
        ApiService.getBuyerReports().catch(() => null),
      ]);

      let list = [];

      if (salesRes?.data?.success && Array.isArray(salesRes.data.data?.sales)) {
        list = salesRes.data.data.sales.map((s) => ({
          id: s.id,
          orderId: `ORD-${s.id.slice(0, 6).toUpperCase()}`,
          sellerName: s.seller?.companyName || "Industrial Seller",
          location: `${s.seller?.city || "Industrial Hub"}${s.seller?.state ? `, ${s.seller.state}` : ""}`,
          material: s.listing?.scrapRecord?.description || s.listing?.scrapRecord?.category?.name || "Scrap Material",
          category: s.listing?.scrapRecord?.category?.name || "General",
          quantityKg: Number(s.quantityKg || 0),
          quantityMT: `${(Number(s.quantityKg || 0) / 1000).toFixed(1)} Tons`,
          pricePerKg: Number(s.pricePerKg || 0),
          totalValue: Number(s.totalValue || 0),
          totalValueFormatted: formatCurrency(s.totalValue),
          status: s.status === "COMPLETED" ? "Completed" : s.status === "CANCELLED" ? "Cancelled" : s.status === "REFUNDED" ? "Refunded" : s.status === "PENDING_PAYMENT" ? "Pending Payment" : s.status === "PAYMENT_PROCESSING" ? "Processing" : "In Progress",
          date: new Date(s.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }));
      }

      // Fallback/supplement from reports if empty
      if (list.length === 0 && reportsRes?.data?.success && reportsRes.data.data?.purchasesHistory) {
        list = reportsRes.data.data.purchasesHistory.map((p) => ({
          id: p.id,
          orderId: `ORD-${p.id.slice(0, 6).toUpperCase()}`,
          sellerName: p.sellerName || "Industrial Seller",
          location: "Industrial Zone",
          material: `${p.category || "Scrap"} Material`,
          category: p.category || "General",
          quantityKg: Number(p.quantityKg || 0),
          quantityMT: `${(Number(p.quantityKg || 0) / 1000).toFixed(1)} Tons`,
          pricePerKg: Number(p.pricePerKg || 0),
          totalValue: Number(p.totalValue || 0),
          totalValueFormatted: formatCurrency(p.totalValue),
          status: "Completed",
          date: new Date(p.completedAt || 0).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }));
      }

      setPurchases(list);
    } catch (err) {
      console.error("Error fetching buyer purchased scrap:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPurchases(); }, []);

  const categories = useMemo(() => {
    const set = new Set(purchases.map((p) => p.category));
    return ["ALL", ...Array.from(set)];
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const matchesSearch =
        !search ||
        item.material.toLowerCase().includes(search.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(search.toLowerCase()) ||
        item.orderId.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [purchases, search, selectedCategory]);

  const kpis = useMemo(() => {
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalValue, 0);
    const totalKg = purchases.reduce((sum, p) => sum + p.quantityKg, 0);
    const completedCount = purchases.filter((p) => p.status === "Completed").length;

    return {
      totalDeals: purchases.length,
      totalTonnageMT: (totalKg / 1000).toFixed(1) + " Tons",
      totalSpentFormatted: formatCurrency(totalSpent),
      completedCount,
    };
  }, [purchases]);

  const handleExportCSV = () => {
    if (purchases.length === 0) return;
    const headers = ["Order ID", "Seller Name", "Material", "Category", "Quantity", "Price (₹/Kg)", "Total Value", "Status", "Date"];
    const rows = purchases.map((p) => [
      p.orderId,
      p.sellerName,
      p.material,
      p.category,
      p.quantityMT,
      p.pricePerKg,
      p.totalValueFormatted,
      p.status,
      p.date,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Buyer_Purchased_Scrap_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans text-left">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 mb-2 text-xs text-slate-400 font-medium">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span>Buyer Portal</span>
        <span>›</span>
        <span className="text-slate-600 font-semibold">Purchased Scrap</span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Purchased Scrap Inventory & Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track all scrap materials acquired by your company, seller information, and total spend.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPurchases}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white/90" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Purchases
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {kpis.totalDeals} Orders
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Scrap Volume Acquired
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {kpis.totalTonnageMT}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Spend
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {kpis.totalSpentFormatted}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search material, seller, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Material Table */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading purchased scrap records...</div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
          <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Purchased Scrap Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            You have not acquired any scrap materials yet. Browse marketplace listings or quotations to start buying.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Material / Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Seller Company</th>
                  <th className="py-3.5 px-4">Quantity (Tons)</th>
                  <th className="py-3.5 px-4">Price (₹/Kg)</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPurchases.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {row.orderId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{row.material}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">
                      {row.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{row.sellerName}</span>
                      <span className="text-[11px] text-slate-400">{row.location}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {row.quantityMT}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      ₹{row.pricePerKg}/Kg
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600">
                      {row.totalValueFormatted}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle className="w-3 h-3" />
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedScrap;

