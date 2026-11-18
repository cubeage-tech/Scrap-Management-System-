import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Trophy,
  Package,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader2,
  CreditCard,
  ShieldCheck,
  XCircle,
  RefreshCw,
  Truck,
  PackageCheck,
} from "lucide-react";
import ApiService from "../../core/services/api.service";

const formatCurrency = (val) =>
  "₹" + Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// ── Status badge helper ───────────────────────────────────────────────────────

const PaymentStatusBadge = ({ status }) => {
  const map = {
    PENDING_PAYMENT:    { cls: "bg-amber-50 text-amber-600 border-amber-200",    icon: <Clock className="w-3 h-3" />,       label: "Payment Pending" },
    PAYMENT_PROCESSING: { cls: "bg-blue-50 text-blue-600 border-blue-200",       icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Processing" },
    COMPLETED:          { cls: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: <CheckCircle className="w-3 h-3" />, label: "Completed" },
    REFUNDED:           { cls: "bg-slate-50 text-slate-500 border-slate-200",    icon: <RefreshCw className="w-3 h-3" />,    label: "Refunded" },
    CANCELLED:          { cls: "bg-red-50 text-red-500 border-red-200",          icon: <XCircle className="w-3 h-3" />,      label: "Cancelled" },
    ACCEPTED:           { cls: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: <CheckCircle className="w-3 h-3" />, label: "Won" },
  };
  const cfg = map[status] || map.ACCEPTED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ── Payment Modal ─────────────────────────────────────────────────────────────

const PaymentModal = ({ sale, onClose, onPaymentComplete }) => {
  const [step, setStep] = useState("initiate"); // initiate | processing | confirm | done | error
  const [paymentId, setPaymentId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInitiate = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await ApiService.initiatePayment(sale.id);
      const pid = res?.data?.data?.id;
      if (!pid) throw new Error(res?.data?.message || "Payment initiation failed");
      setPaymentId(pid);
      setStep("confirm");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to initiate payment"
      );
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!paymentId) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await ApiService.verifyPayment(sale.id, paymentId);
      setStep("done");
      onPaymentComplete();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Payment verification failed"
      );
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Complete Payment</h2>
              <p className="text-[11px] text-slate-400">{sale.material}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount summary */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Material</span>
              <span className="font-semibold text-slate-700">{sale.material}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Quantity</span>
              <span className="font-semibold text-slate-700">{sale.quantityMT}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Rate</span>
              <span className="font-semibold text-slate-700">₹{sale.pricePerKg}/kg</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="text-sm font-bold text-slate-700">Total Amount</span>
              <span className="text-sm font-extrabold text-blue-600">{sale.totalValueFormatted}</span>
            </div>
          </div>

          {/* Steps */}
          {step === "initiate" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Payment window is open. Complete payment before the deadline to secure your won lot.</span>
              </div>
              <button
                onClick={handleInitiate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {isLoading ? "Initiating..." : "Initiate Payment"}
              </button>
            </div>
          )}

          {step === "confirm" && paymentId && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Payment Reference</p>
                <p className="text-xs font-mono text-blue-800 break-all">{paymentId}</p>
              </div>
              <div className="text-xs text-slate-500 space-y-1 px-1">
                <p className="font-semibold text-slate-700">Payment Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Transfer {sale.totalValueFormatted} to the seller's bank account.</li>
                  <li>Use the payment reference above as the transfer description.</li>
                  <li>Click <strong>Confirm Payment</strong> once the transfer is complete.</li>
                </ol>
              </div>
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isLoading ? "Verifying..." : "Confirm Payment"}
              </button>
              <button
                onClick={onClose}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
              >
                I'll pay later
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-slate-900">Payment Verified!</p>
              <p className="text-xs text-slate-500 text-center">
                Ownership has been transferred. Check your Scrap Inventory for the new material.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setStep(paymentId ? "confirm" : "initiate")}
                className="w-full text-xs font-semibold text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const WonAuction = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentSale, setPaymentSale] = useState(null); // sale currently being paid

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all sales where this dealer is the buyer, across all post-win statuses
      const res = await ApiService.getSales();
      const raw = res?.data?.data?.sales || res?.data?.data || [];
      const list = Array.isArray(raw) ? raw : [];

      setSales(
        list.map((s) => ({
          id: s.id,
          orderId: `ORD-${s.id.slice(0, 6).toUpperCase()}`,
          sellerName: s.seller?.companyName || "Industrial Seller",
          location: `${s.seller?.city || ""}${s.seller?.state ? `, ${s.seller.state}` : ""}`.replace(/^,\s*/, "") || "India",
          material: s.listing?.scrapRecord?.description || s.listing?.scrapRecord?.category?.name || "Scrap Material",
          category: s.listing?.scrapRecord?.category?.name || "Scrap",
          quantityKg: Number(s.quantityKg || 0),
          quantityMT: `${(Number(s.quantityKg || 0) / 1000).toFixed(2)} Tons`,
          pricePerKg: Number(s.pricePerKg || 0),
          totalValue: Number(s.totalValue || 0),
          totalValueFormatted: formatCurrency(s.totalValue),
          status: s.status,
          deliveryStatus: s.deliveryStatus || null,
          expectedDelivery: s.expectedDelivery || null,
          deliveredAt: s.deliveredAt || null,
          paymentExpiresAt: s.paymentExpiresAt ? new Date(s.paymentExpiresAt) : null,
          date: new Date(s.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        }))
      );
    } catch (err) {
      console.error("Error fetching won auctions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sales.filter(
      (s) =>
        !q ||
        s.material.toLowerCase().includes(q) ||
        s.sellerName.toLowerCase().includes(q) ||
        s.orderId.toLowerCase().includes(q)
    );
  }, [sales, search]);

  // Separate pending-payment items for the hero banner
  const pendingPayment = filtered.filter((s) => s.status === "PENDING_PAYMENT");
  const processingPayment = filtered.filter((s) => s.status === "PAYMENT_PROCESSING");
  const completed = filtered.filter((s) => s.status === "COMPLETED" || s.status === "ACCEPTED");
  const other = filtered.filter((s) => !["PENDING_PAYMENT", "PAYMENT_PROCESSING", "COMPLETED", "ACCEPTED"].includes(s.status));

  const kpis = useMemo(() => {
    const totalSpent = sales.filter(s => s.status === "COMPLETED").reduce((sum, s) => sum + s.totalValue, 0);
    const totalKg = sales.filter(s => s.status === "COMPLETED").reduce((sum, s) => sum + s.quantityKg, 0);
    return {
      wonCount: sales.length,
      completedCount: sales.filter(s => s.status === "COMPLETED").length,
      pendingCount: sales.filter(s => ["PENDING_PAYMENT", "PAYMENT_PROCESSING"].includes(s.status)).length,
      totalTonnageMT: (totalKg / 1000).toFixed(2) + " Tons",
      totalSpentFormatted: formatCurrency(totalSpent),
    };
  }, [sales]);

  const isExpired = (sale) =>
    sale.paymentExpiresAt && sale.paymentExpiresAt < new Date();

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans text-left">
      {/* Breadcrumb & Header */}
      <nav className="flex items-center gap-1.5 mb-2 text-xs text-slate-400 font-medium">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span>Dealer Portal</span>
        <span>›</span>
        <span className="text-slate-600 font-semibold">Won Auctions & Payments</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Won Auctions & Payments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your won lots, payment status, and completed procurements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search won lots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Lots Won", value: kpis.wonCount, icon: <Trophy className="w-5 h-5" />, color: "amber" },
          { label: "Pending Payment", value: kpis.pendingCount, icon: <Clock className="w-5 h-5" />, color: "orange" },
          { label: "Completed", value: kpis.completedCount, icon: <CheckCircle className="w-5 h-5" />, color: "emerald" },
          { label: "Total Acquired (Tons)", value: kpis.totalTonnageMT, icon: <Package className="w-5 h-5" />, color: "blue" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{label}</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{value}</span>
            </div>
            <div className={`w-9 h-9 rounded-xl bg-${color}-50 text-${color}-600 border border-${color}-100 flex items-center justify-center`}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading your won lots...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-slate-200 shadow-2xs">
          <Trophy className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Won Auctions Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Participate in live auctions and submit competitive bids to win procurement lots.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Pending Payment — Hero Section ──────────────────────────── */}
          {pendingPayment.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Action Required — Complete Payment
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPayment.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden"
                  >
                    {/* Winner banner */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-white" />
                      <span className="text-sm font-extrabold text-white">You Won!</span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Sale details */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sale.orderId}</p>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{sale.material}</h3>
                        <p className="text-xs text-slate-500">{sale.category} · {sale.sellerName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-slate-400">Quantity</p>
                          <p className="font-bold text-slate-800">{sale.quantityMT}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Rate</p>
                          <p className="font-bold text-slate-800">₹{sale.pricePerKg}/kg</p>
                        </div>
                      </div>

                      {/* Winning amount */}
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">
                          Winning Amount
                        </p>
                        <p className="text-xl font-extrabold text-amber-700">{sale.totalValueFormatted}</p>
                      </div>

                      {/* Payment status + expiry */}
                      <div className="flex items-center justify-between">
                        <PaymentStatusBadge status={sale.status} />
                        {sale.paymentExpiresAt && (
                          <span className={`text-[10px] font-semibold ${isExpired(sale) ? "text-red-500" : "text-slate-400"}`}>
                            {isExpired(sale)
                              ? "EXPIRED"
                              : `Due ${sale.paymentExpiresAt.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`}
                          </span>
                        )}
                      </div>

                      {/* Pay Now button */}
                      {isExpired(sale) ? (
                        <div className="w-full py-2.5 bg-red-50 text-red-500 text-xs font-bold text-center rounded-xl border border-red-100">
                          Payment Window Expired
                        </div>
                      ) : (
                        <button
                          onClick={() => setPaymentSale(sale)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Payment Processing ───────────────────────────────────────── */}
          {processingPayment.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Payment Processing
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {processingPayment.map((sale) => (
                  <div key={sale.id} className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-xs font-bold text-blue-600">Processing Payment</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sale.orderId}</p>
                      <h3 className="text-sm font-bold text-slate-900">{sale.material}</h3>
                      <p className="text-xs text-slate-500">{sale.category} · {sale.sellerName}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-blue-600">{sale.totalValueFormatted}</span>
                      <PaymentStatusBadge status={sale.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Completed Deals ──────────────────────────────────────────── */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Completed Procurements
              </h2>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Material</th>
                        <th className="py-3 px-4">Seller</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Rate</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Delivery</th>
                        <th className="py-3 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {completed.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.orderId}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">{row.material}</span>
                            <span className="text-[10px] text-slate-400">{row.category}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700 block">{row.sellerName}</span>
                            <span className="text-[10px] text-slate-400">{row.location}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{row.quantityMT}</td>
                          <td className="py-3 px-4 text-slate-700">₹{row.pricePerKg}/kg</td>
                          <td className="py-3 px-4 font-extrabold text-emerald-600">{row.totalValueFormatted}</td>
                          <td className="py-3 px-4"><PaymentStatusBadge status={row.status} /></td>
                          <td className="py-3 px-4">
                            {row.deliveryStatus ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                row.deliveryStatus === 'DELIVERED'  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                row.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                'bg-amber-50 text-amber-600 border-amber-200'
                              }`}>
                                {row.deliveryStatus === 'DELIVERED'  ? <><PackageCheck className="w-3 h-3" /> Delivered</> :
                                 row.deliveryStatus === 'IN_TRANSIT' ? <><Truck className="w-3 h-3" /> In Transit</> :
                                 'Awaiting Dispatch'}
                              </span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── Loser / Other ────────────────────────────────────────────── */}
          {other.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Other
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {other.map((sale) => (
                  <div key={sale.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sale.orderId}</p>
                      <h3 className="text-sm font-bold text-slate-900">{sale.material}</h3>
                      <p className="text-xs text-slate-500">{sale.sellerName}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">{sale.totalValueFormatted}</span>
                      <PaymentStatusBadge status={sale.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {paymentSale && (
        <PaymentModal
          sale={paymentSale}
          onClose={() => setPaymentSale(null)}
          onPaymentComplete={() => {
            setPaymentSale(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default WonAuction;
