import { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Package,
  Building2,
  Loader2,
  AlertCircle,
  ArrowRight,
  InboxIcon,
  SendHorizontal,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/common/Toast";

const STATUS_BADGE = {
  SUBMITTED: { bg: "bg-yellow-50", text: "text-yellow-700 border-yellow-200", label: "Pending", icon: Clock },
  ACCEPTED:  { bg: "bg-green-50",  text: "text-green-700 border-green-200",   label: "Accepted", icon: Check },
  REJECTED:  { bg: "bg-red-50",    text: "text-red-700 border-red-200",       label: "Rejected", icon: X },
  EXPIRED:   { bg: "bg-gray-50",   text: "text-gray-600 border-gray-200",     label: "Expired", icon: Clock },
  WITHDRAWN: { bg: "bg-gray-50",   text: "text-gray-600 border-gray-200",     label: "Withdrawn", icon: X },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

const StatusBadge = ({ status }) => {
  const b = STATUS_BADGE[status] || STATUS_BADGE.SUBMITTED;
  const Icon = b.icon;
  return (
    <span className={`${b.bg} ${b.text} border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {b.label}
    </span>
  );
};

// ── Submitted tab (dealer's own quotations to industry listings) ──────────────

const SubmittedTab = ({ quotations, isLoading, onWithdraw, navigate }) => {
  const [filter, setFilter] = useState("all");

  const filtered = quotations.filter((q) => filter === "all" || q.status === filter);

  if (isLoading) return <Spinner />;

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["all", "SUBMITTED", "ACCEPTED", "REJECTED", "WITHDRAWN"].map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === v ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {v === "all" ? "All" : v.charAt(0) + v.slice(1).toLowerCase()}{" "}
            <span className="opacity-70">({quotations.filter((q) => v === "all" || q.status === v).length})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No quotations submitted yet"
          desc="Browse the marketplace and submit offers on industry listings."
          cta="Browse Marketplace"
          onClick={() => navigate("/dealer/marketplace")}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => (
            <QuotationCard key={q.id} quotation={q} role="buyer" onWithdraw={onWithdraw} />
          ))}
        </div>
      )}
    </>
  );
};

// ── Received tab (buyer quotations on dealer's own listings) ──────────────────

const ReceivedTab = ({ quotations, isLoading, onAccept, onReject, navigate }) => {
  const [filter, setFilter] = useState("all");
  const filtered = quotations.filter((q) => filter === "all" || q.status === filter);

  if (isLoading) return <Spinner />;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-5">
        {["all", "SUBMITTED", "ACCEPTED", "REJECTED"].map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === v ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {v === "all" ? "All" : v.charAt(0) + v.slice(1).toLowerCase()}{" "}
            <span className="opacity-70">({quotations.filter((q) => v === "all" || q.status === v).length})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No quotations received yet"
          desc="Create listings from your Scrap Inventory so buyers can submit offers."
          cta="Go to Scrap Inventory"
          onClick={() => navigate("/dealer/scrap-inventory")}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => (
            <QuotationCard key={q.id} quotation={q} role="seller" onAccept={onAccept} onReject={onReject} />
          ))}
        </div>
      )}
    </>
  );
};

// ── Shared card component ─────────────────────────────────────────────────────

const QuotationCard = ({ quotation, role, onWithdraw, onAccept, onReject }) => {
  const [acting, setActing] = useState(false);

  const handleAccept = async () => {
    if (!window.confirm("Accept this quotation? A sale will be created immediately.")) return;
    setActing(true);
    await onAccept(quotation.id);
    setActing(false);
  };

  const handleReject = async () => {
    if (!window.confirm("Reject this quotation?")) return;
    setActing(true);
    await onReject(quotation.id);
    setActing(false);
  };

  const handleWithdraw = async () => {
    if (!window.confirm("Withdraw this quotation? This cannot be undone.")) return;
    setActing(true);
    await onWithdraw(quotation.id);
    setActing(false);
  };

  const catName = quotation.listing?.scrapRecord?.category?.name || "Scrap Material";
  const desc    = quotation.listing?.scrapRecord?.description;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{catName}</h3>
              {desc && <p className="text-xs text-gray-500 truncate">{desc}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadge status={quotation.status} />
            <p className="text-xs text-gray-400">{new Date(quotation.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 bg-gray-50 rounded-lg text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{role === "seller" ? "Offered Price" : "Your Offer"}</p>
            <p className="font-semibold text-gray-900">{formatPrice(quotation.pricePerKg)}/kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Quantity</p>
            <p className="font-semibold text-gray-900">{quotation.quantityKg} kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Value</p>
            <p className="font-semibold text-emerald-600">{formatPrice(quotation.totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Payment Terms</p>
            <p className="font-semibold text-gray-900">{quotation.paymentTerms?.replace(/_/g, " ") || "—"}</p>
          </div>
        </div>

        {quotation.note && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-gray-700">
            <span className="font-medium text-blue-700">Note: </span>{quotation.note}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 className="w-4 h-4" />
            {role === "seller"
              ? <span>From: <strong className="text-gray-700">{quotation.buyer?.companyName || "Buyer"}</strong></span>
              : <span>Seller: <strong className="text-gray-700">{quotation.listing?.scrapRecord?.owner?.companyName || "—"}</strong></span>
            }
          </div>

          <div className="flex gap-2">
            {/* Buyer actions */}
            {role === "buyer" && quotation.status === "SUBMITTED" && (
              <button
                onClick={handleWithdraw}
                disabled={acting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Withdraw
              </button>
            )}
            {role === "buyer" && quotation.status === "ACCEPTED" && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-3.5 h-3.5" /> Accepted — Check Orders
              </span>
            )}

            {/* Seller actions */}
            {role === "seller" && quotation.status === "SUBMITTED" && (
              <>
                <button
                  onClick={handleReject}
                  disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={handleAccept}
                  disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                >
                  {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Accept
                </button>
              </>
            )}
            {role === "seller" && quotation.status === "ACCEPTED" && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-3.5 h-3.5" /> Sale Created
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex justify-center py-16">
    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
  </div>
);

const EmptyState = ({ title, desc, cta, onClick }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
    <AlertCircle className="w-14 h-14 text-gray-300 mx-auto mb-3" />
    <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-5">{desc}</p>
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
    >
      {cta}
    </button>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const DealerQuotation = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("submitted"); // submitted | received
  const [submitted, setSubmitted] = useState([]);
  const [received, setReceived]   = useState([]);
  const [loadingSubmitted, setLoadingSubmitted] = useState(true);
  const [loadingReceived,  setLoadingReceived]  = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadSubmitted = async () => {
    setLoadingSubmitted(true);
    try {
      const res = await ApiService.getQuotations();
      if (res?.data?.success) setSubmitted(res.data.data || []);
    } catch { setSubmitted([]); }
    finally { setLoadingSubmitted(false); }
  };

  const loadReceived = async () => {
    setLoadingReceived(true);
    try {
      const res = await ApiService.getQuotations({ view: "received" });
      if (res?.data?.success) setReceived(res.data.data || []);
    } catch { setReceived([]); }
    finally { setLoadingReceived(false); }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadSubmitted(); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadReceived(); }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleWithdraw = async (id) => {
    try {
      await ApiService.withdrawQuotation(id);
      showToast("Quotation withdrawn.");
      loadSubmitted();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to withdraw.", "error");
    }
  };

  const handleAccept = async (id) => {
    try {
      await ApiService.acceptQuotation(id);
      showToast("Quotation accepted — sale created!");
      loadReceived();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to accept.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await ApiService.rejectQuotation(id);
      showToast("Quotation rejected.");
      loadReceived();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to reject.", "error");
    }
  };

  const pendingReceived = received.filter((q) => q.status === "SUBMITTED").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage quotations you submitted and offers received from buyers
          </p>
        </div>
        <button
          onClick={() => navigate("/dealer/marketplace")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors self-start"
        >
          Browse Marketplace <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("submitted")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "submitted" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <SendHorizontal className="w-4 h-4" />
          Submitted to Industry
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === "submitted" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
            {submitted.length}
          </span>
        </button>
        <button
          onClick={() => setTab("received")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "received" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <InboxIcon className="w-4 h-4" />
          Received from Buyers
          {pendingReceived > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
              {pendingReceived} new
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {tab === "submitted" ? (
        <SubmittedTab
          quotations={submitted}
          isLoading={loadingSubmitted}
          onWithdraw={handleWithdraw}
          navigate={navigate}
        />
      ) : (
        <ReceivedTab
          quotations={received}
          isLoading={loadingReceived}
          onAccept={handleAccept}
          onReject={handleReject}
          navigate={navigate}
        />
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: "" })} />
    </div>
  );
};

export default DealerQuotation;
