import { useState, useEffect } from "react";
import { Gavel, Trophy, TrendingUp, Clock, Loader2, AlertCircle } from "lucide-react";
import ApiService from "../../core/services/api.service";

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val ?? 0);

const fmtQty = (kg) =>
  kg >= 1000 ? `${(kg / 1000).toFixed(2)} T` : `${kg} kg`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const getBidResult = (bid) => {
  const { auction } = bid;
  if (auction.status === "ACTIVE" || auction.status === "CREATED") {
    return { label: "Live", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" };
  }
  if (auction.status === "CANCELLED") {
    return { label: "Cancelled", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
  }
  if (auction.winningBid?.id === bid.id) {
    return { label: "Won", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" };
  }
  if (auction.status === "CLOSED") {
    return { label: "Outbid", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" };
  }
  return { label: "Closed", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
};

const StatusBadge = ({ bid }) => {
  const r = getBidResult(bid);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${r.bg} ${r.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
      {r.label}
    </span>
  );
};

const FILTERS = [
  { value: "all",      label: "All bids" },
  { value: "live",     label: "Live" },
  { value: "won",      label: "Won" },
  { value: "outbid",   label: "Outbid" },
];

const matchesFilter = (bid, filter) => {
  if (filter === "all") return true;
  const result = getBidResult(bid);
  if (filter === "live")   return result.label === "Live";
  if (filter === "won")    return result.label === "Won";
  if (filter === "outbid") return result.label === "Outbid";
  return true;
};

const MyBids = () => {
  const [bids, setBids]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getMyBids();
        if (res?.data?.success) setBids(res.data.data || []);
      } catch {
        setError("Failed to load your bids. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = bids.filter((b) => matchesFilter(b, filter));
  const wonCount  = bids.filter((b) => getBidResult(b).label === "Won").length;
  const liveCount = bids.filter((b) => getBidResult(b).label === "Live").length;
  const bestWin   = bids
    .filter((b) => getBidResult(b).label === "Won")
    .reduce((max, b) => (b.totalValue > max ? b.totalValue : max), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Loading your bids…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
      {/* Breadcrumb */}
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span className="font-medium text-slate-600">My Bids</span>
      </div>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">My Bids</h1>
        <p className="mt-0.5 text-sm text-slate-500">Track all auction bids you have placed.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Gavel className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{bids.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total bids placed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{wonCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Auctions won</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{liveCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Live auctions</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                : "text-slate-500 hover:bg-white hover:text-slate-700"
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs text-slate-400">
              ({bids.filter((b) => matchesFilter(b, f.value)).length})
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Gavel className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="text-base font-medium text-slate-700 mb-1">
            {filter === "all" ? "No bids placed yet" : `No ${filter} bids`}
          </p>
          <p className="text-sm text-slate-400">
            {filter === "all"
              ? "Head to Live Auctions to place your first bid."
              : 'Switch to "All bids" to see everything.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">
              Showing {filtered.length} bid{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          <ul className="divide-y divide-slate-100">
            {filtered.map((bid) => {
              const result = getBidResult(bid);
              const isWon  = result.label === "Won";
              const cat    = bid.auction?.listing?.scrapRecord?.category?.name;
              const owner  = bid.auction?.listing?.scrapRecord?.owner?.companyName;
              const winPx  = bid.auction?.winningBid?.pricePerKg;

              return (
                <li key={bid.id} className="px-4 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isWon ? "bg-green-50" : "bg-slate-100"}`}>
                        {isWon
                          ? <Trophy className="w-4 h-4 text-green-600" />
                          : <Gavel className="w-4 h-4 text-slate-500" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {cat || "Scrap auction"}
                        </p>
                        {owner && (
                          <p className="text-xs text-slate-400 mt-0.5">Seller: {owner}</p>
                        )}

                        {/* Numbers */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">My bid / kg</p>
                            <p className="text-sm font-semibold text-slate-800">{fmt(bid.pricePerKg)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Quantity</p>
                            <p className="text-sm font-semibold text-slate-800">{fmtQty(bid.quantityKg)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Total value</p>
                            <p className={`text-sm font-semibold ${isWon ? "text-green-700" : "text-slate-800"}`}>
                              {fmt(bid.totalValue)}
                            </p>
                          </div>
                          {!isWon && winPx != null && (
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Winning bid</p>
                              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                {fmt(winPx)}/kg
                              </p>
                            </div>
                          )}
                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          Placed {fmtDate(bid.placedAt)}
                          {" · "}Auction {bid.auction?.status?.replace("_", " ").toLowerCase() ?? "—"}
                        </p>
                      </div>
                    </div>

                    <StatusBadge bid={bid} />
                  </div>
                </li>
              );
            })}
          </ul>

          {wonCount > 0 && bestWin > 0 && (
            <div className="px-4 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700">
                You have won <strong>{wonCount}</strong> auction{wonCount !== 1 ? "s" : ""}.
                Largest win: <strong>{fmt(bestWin)}</strong>. Check <em>Won Auctions</em> to manage delivery.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBids;
