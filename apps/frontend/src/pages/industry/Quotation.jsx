import { useState, useEffect, useMemo } from "react";
import {
  Check,
  X,
  Package,
  Building2,
  IndianRupee,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import Toast from "../../components/common/Toast";

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val ?? 0);

const STATUS_BADGE = {
  SUBMITTED: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400", label: "Pending" },
  ACCEPTED:  { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-400",  label: "Accepted" },
  REJECTED:  { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400",    label: "Rejected" },
  EXPIRED:   { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   label: "Expired" },
  WITHDRAWN: { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   label: "Withdrawn" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.SUBMITTED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const SORTS = [
  { value: "totalValue_desc", label: "Highest total value" },
  { value: "totalValue_asc",  label: "Lowest total value" },
  { value: "pricePerKg_desc", label: "Highest price / kg" },
  { value: "pricePerKg_asc",  label: "Lowest price / kg" },
];

const Quotation = () => {
  const [quotations, setQuotations]           = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [isProcessing, setIsProcessing]       = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [sort, setSort]                       = useState("totalValue_desc");
  const [toast, setToast]                     = useState({ message: "", type: "success" });

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getQuotations();
      if (res?.data?.success) {
        const data = res.data.data || [];
        setQuotations(data);
        // Auto-select the first lot that has quotations
        if (data.length > 0 && !selectedListingId) {
          setSelectedListingId(data[0].listingId);
        }
      }
    } catch {
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Group all quotations by listing
  const lotMap = useMemo(() => {
    return quotations.reduce((acc, q) => {
      const id = q.listingId;
      if (!acc[id]) acc[id] = { listing: q.listing, items: [] };
      acc[id].items.push(q);
      return acc;
    }, {});
  }, [quotations]);

  const lotList = useMemo(() => Object.entries(lotMap), [lotMap]);

  // Offers for the selected lot, sorted
  const selectedOffers = useMemo(() => {
    const offers = lotMap[selectedListingId]?.items ?? [];
    const [field, dir] = sort.split("_");
    return [...offers].sort((a, b) =>
      dir === "asc" ? a[field] - b[field] : b[field] - a[field]
    );
  }, [lotMap, selectedListingId, sort]);

  // Stat card values
  const lotsWithOffers  = lotList.length;
  const totalOffers     = quotations.length;
  const bestOfferOnLot  = useMemo(() => {
    const offers = lotMap[selectedListingId]?.items ?? [];
    return offers.length ? Math.max(...offers.map((o) => o.pricePerKg)) : null;
  }, [lotMap, selectedListingId]);

  const handleAccept = async (quotationId) => {
    if (!window.confirm("Accept this offer? All other pending offers for this listing will be rejected.")) return;
    setIsProcessing(true);
    try {
      const res = await ApiService.acceptQuotation(quotationId);
      if (res?.data?.success) {
        setToast({ message: "Offer accepted!", type: "success" });
        load();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to accept offer", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (quotationId) => {
    if (!window.confirm("Reject this offer?")) return;
    setIsProcessing(true);
    try {
      const res = await ApiService.rejectQuotation(quotationId);
      if (res?.data?.success) {
        setToast({ message: "Offer rejected", type: "info" });
        load();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to reject offer", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Loading offers…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
      {/* Breadcrumb */}
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span className="font-medium text-slate-600">Offers Received</span>
      </div>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">Offers Received</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Review and respond to quotations from buyers and dealers.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{lotsWithOffers}</p>
            <p className="text-xs text-slate-500 mt-0.5">Lots with offers</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalOffers}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total offers</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {bestOfferOnLot != null ? fmt(bestOfferOnLot).replace("₹", "") : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Best offer on this lot (₹/kg)</p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {lotList.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="text-base font-medium text-slate-700 mb-1">No offers yet</p>
          <p className="text-sm text-slate-400">When buyers or dealers submit offers on your listings, they will appear here.</p>
        </div>
      ) : (
        /* Two-panel layout */
        <div className="flex flex-col lg:flex-row gap-4 min-h-[500px]">

          {/* ── LEFT: Lot list ── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-700">Your lots</p>
              </div>
              <ul className="divide-y divide-slate-100">
                {lotList.map(([id, { listing, items }]) => {
                  const isSelected = id === selectedListingId;
                  const pending = items.filter((o) => o.status === "SUBMITTED").length;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => setSelectedListingId(id)}
                        className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-l-2 border-blue-600"
                            : "hover:bg-slate-50 border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                            {listing?.scrapRecord?.category?.name || "Scrap Material"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {listing?.quantityKg != null
                              ? listing.quantityKg >= 1000
                                ? `${(listing.quantityKg / 1000).toFixed(1)} T`
                                : `${listing.quantityKg} kg`
                              : "—"}
                            {" · "}
                            {items.length} offer{items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {pending > 0 && (
                          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 text-white text-[10px] font-bold">
                            {pending}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-blue-500" : "text-slate-300"}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Offer cards ── */}
          <div className="flex-1 min-w-0">
            {selectedListingId ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Panel header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {lotMap[selectedListingId]?.listing?.scrapRecord?.category?.name || "Offers"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedOffers.length} offer{selectedOffers.length !== 1 ? "s" : ""}
                      {lotMap[selectedListingId]?.listing?.expectedPricePerKg
                        ? ` · asking ${fmt(lotMap[selectedListingId].listing.expectedPricePerKg)}/kg`
                        : ""}
                    </p>
                  </div>
                  {/* Sort control */}
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Sort:</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="text-xs text-slate-700 font-medium border-0 bg-transparent focus:outline-none cursor-pointer"
                    >
                      {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Offer list */}
                {selectedOffers.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-slate-400">
                    No offers for this lot.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {selectedOffers.map((offer, idx) => {
                      const isTop = idx === 0 && offer.status === "SUBMITTED";
                      return (
                        <li key={offer.id} className="px-4 py-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            {/* Buyer info + details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">
                                    {offer.buyer?.companyName || "Unknown buyer"}
                                  </p>
                                  {offer.buyer?.contactName && (
                                    <p className="text-xs text-slate-400">
                                      {offer.buyer.contactName}
                                      {offer.buyer.contactPhone ? ` · ${offer.buyer.contactPhone}` : ""}
                                    </p>
                                  )}
                                </div>
                                {isTop && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                                    Highest offer
                                  </span>
                                )}
                              </div>

                              {/* Numbers */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Price / kg</p>
                                  <p className="text-sm font-semibold text-slate-800">{fmt(offer.pricePerKg)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Quantity</p>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {offer.quantityKg >= 1000
                                      ? `${(offer.quantityKg / 1000).toFixed(2)} T`
                                      : `${offer.quantityKg} kg`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Total value</p>
                                  <p className="text-sm font-semibold text-green-700">{fmt(offer.totalValue)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Payment terms</p>
                                  <p className="text-sm font-medium text-slate-700">{offer.paymentTerms || "—"}</p>
                                </div>
                              </div>

                              {offer.note && (
                                <div className="mt-2.5 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                                  <span className="font-medium text-slate-400">Note: </span>{offer.note}
                                </div>
                              )}

                              <p className="mt-2 text-[11px] text-slate-400">
                                Submitted {new Date(offer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                {offer.validUntil && ` · valid until ${new Date(offer.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                              </p>
                            </div>

                            {/* Status + actions */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <StatusBadge status={offer.status} />
                              {offer.status === "SUBMITTED" && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleAccept(offer.id)}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleReject(offer.id)}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors disabled:opacity-50 border border-red-200"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 text-center px-4">
                <ChevronRight className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">Select a lot on the left to view its offers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
    </div>
  );
};

export default Quotation;
