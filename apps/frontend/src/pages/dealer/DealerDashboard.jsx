import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Gavel,
  Trophy,
  Truck,
  IndianRupee,
  ArrowUpRight,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import RoutePath from "../../core/constants/routes.constant";

const formatCurrency = (val) => {
  const num = Number(val || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const DealerDashboard = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [sales, setSales] = useState([]);
  const [listings, setListings] = useState([]);
  const [_loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [auctionsRes, salesRes, listingsRes] = await Promise.all([
        ApiService.getAuctions().catch(() => null),
        ApiService.getSales().catch(() => null),
        ApiService.getListings().catch(() => null),
      ]);

      if (auctionsRes?.data?.success && Array.isArray(auctionsRes.data.data)) {
        setAuctions(auctionsRes.data.data);
      }
      if (salesRes?.data?.success && Array.isArray(salesRes.data.data?.sales)) {
        setSales(salesRes.data.data.sales);
      }
      if (listingsRes?.data?.success && Array.isArray(listingsRes.data.data)) {
        setListings(listingsRes.data.data);
      }
    } catch (err) {
      console.error("Error loading dealer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchDashboardData(); }, []);

  const liveAuctionsList = useMemo(() => {
    return auctions.filter((a) => ["LIVE", "EXTENDED"].includes(a.status));
  }, [auctions]);

  const wonAuctionsCount = useMemo(() => {
    return sales.length || auctions.filter((a) => a.status === "CLOSED_WITH_WINNER").length;
  }, [sales, auctions]);

  const totalPurchasedMT = useMemo(() => {
    const totalKg = sales.reduce((sum, s) => sum + Number(s.quantityKg || 0), 0);
    return (totalKg / 1000).toFixed(1);
  }, [sales]);

  const totalSpend = useMemo(() => {
    return sales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
  }, [sales]);

  const availableScrapMT = useMemo(() => {
    const totalKg = listings.reduce((sum, l) => sum + Number(l.quantityKg || 0), 0);
    return (totalKg / 1000).toFixed(1);
  }, [listings]);

  const stats = [
    {
      title: "Available Scrap",
      value: `${availableScrapMT} Tons`,
      change: "Active listings",
      subtitle: "",
      icon: Box,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Live Auctions",
      value: String(liveAuctionsList.length),
      change: "Active now",
      subtitle: "",
      icon: Gavel,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
    },
    {
      title: "Current Bids",
      value: String(auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0)),
      change: "Placed bids",
      subtitle: "",
      icon: Trophy,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "Won Auctions",
      value: String(wonAuctionsCount),
      change: "Fulfilled deals",
      subtitle: "",
      icon: Trophy,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "Purchased Materials",
      value: `${totalPurchasedMT} Tons`,
      change: "Acquired",
      subtitle: "",
      icon: Truck,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Spend (MTD)",
      value: formatCurrency(totalSpend),
      change: "Total committed",
      subtitle: "",
      icon: IndianRupee,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 sm:p-5 lg:p-6 text-left font-sans">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>SmartScrap AI</span>
            <span>›</span>
            <span>Scrap Dealer</span>
            <span>›</span>
            <span className="text-slate-500">Dashboard</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Scrap Dealer Dashboard
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Real-time scrap pipeline, live bidding activity and fulfillment status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(RoutePath.DEALER_WON_AUCTIONS)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
          >
            Won Auctions
          </button>

          <button
            onClick={() => navigate(RoutePath.DEALER_LIVE_AUCTIONS)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
          >
            Join Live Auction
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </span>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {stat.value}
                </h2>

                <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold text-emerald-600">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Auctions Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden mb-6">
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-rose-500" />
            Live Auctions Available for Bidding
          </h2>
          <button
            onClick={() => navigate(RoutePath.DEALER_LIVE_AUCTIONS)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All →
          </button>
        </div>

        {liveAuctionsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No live auctions currently active. Check back soon or view marketplace listings.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {liveAuctionsList.slice(0, 4).map((a) => {
              const currentPrice = a.currentHighestBid?.pricePerKg
                ? Number(a.currentHighestBid.pricePerKg)
                : Number(a.startingPricePerKg);

              return (
                <div
                  key={a.id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      AUC-{a.id.slice(0, 6).toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {a.listing?.scrapRecord?.description || a.listing?.scrapRecord?.category?.name || "Scrap Auction Lot"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quantity: {(Number(a.listing?.quantityKg || 0) / 1000).toFixed(1)} Tons · Bids: {a.bidCount || a.bids?.length || 0}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Current Highest
                      </span>
                      <span className="text-sm font-extrabold text-blue-600">
                        ₹{currentPrice}/Kg
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(RoutePath.DEALER_LIVE_AUCTIONS)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      Bid Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Purchases & Won Deals */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Recent Purchases & Won Deals
          </h2>
          <button
            onClick={() => navigate(RoutePath.DEALER_WON_AUCTIONS)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All →
          </button>
        </div>

        {sales.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed purchases yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sales.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">
                    {s.listing?.scrapRecord?.description || "Scrap Material"}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ORD-{s.id.slice(0, 6).toUpperCase()} · {(Number(s.quantityKg || 0) / 1000).toFixed(1)} Tons · {s.seller?.companyName || "Seller"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">
                    ₹{Number(s.totalValue || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerDashboard;