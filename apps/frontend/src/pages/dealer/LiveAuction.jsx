import { useState, useEffect, useMemo } from "react";
import {
  Gavel,
  Clock,
  Search,
  X,
} from "lucide-react";
import ApiService from "../../core/services/api.service";

const inr = new Intl.NumberFormat("en-IN");
const money = (value) => `₹${inr.format(value || 0)}`;

const formatHMS = (totalSeconds) => {
  const s = Math.max(0, totalSeconds);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

const LiveAuction = () => {
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAuction, setOpenAuction] = useState(null);
  const [bidInput, setBidInput] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const fetchLiveAuctions = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAuctions();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setAuctions(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching live auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchLiveAuctions(); }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAuctions = useMemo(() => {
    return auctions.filter((a) => {
      const isLive = ["LIVE", "EXTENDED", "SCHEDULED"].includes(a.status);
      const matchesSearch =
        !search ||
        (a.listing?.scrapRecord?.description || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (a.listing?.scrapRecord?.category?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase());
      return isLive && matchesSearch;
    });
  }, [auctions, search]);

  const openDrawer = (auction) => {
    setOpenAuction(auction);
    const currentPrice = auction.currentHighestBid?.pricePerKg
      ? Number(auction.currentHighestBid.pricePerKg)
      : Number(auction.startingPricePerKg);
    const minIncrement = Number(auction.minIncrement || 100);
    const minBid = currentPrice + (auction.currentHighestBid ? minIncrement : 0);
    setBidInput(String(minBid));
    setBidError("");
    setBidSuccess("");
  };

  const closeDrawer = () => setOpenAuction(null);

  const handlePlaceBid = async () => {
    if (!openAuction) return;
    setBidError("");
    setBidSuccess("");

    const pricePerKg = Number(bidInput);
    const currentPrice = openAuction.currentHighestBid?.pricePerKg
      ? Number(openAuction.currentHighestBid.pricePerKg)
      : Number(openAuction.startingPricePerKg);
    const minIncrement = Number(openAuction.minIncrement || 100);
    const minBid = currentPrice + (openAuction.currentHighestBid ? minIncrement : 0);

    if (isNaN(pricePerKg) || pricePerKg < minBid) {
      setBidError(`Minimum valid bid is ${money(minBid)}/Kg`);
      return;
    }

    try {
      const res = await ApiService.placeBid(openAuction.id, { pricePerKg });
      if (res?.data?.success) {
        setBidSuccess("Bid placed successfully!");
        await fetchLiveAuctions();
        setTimeout(() => closeDrawer(), 1200);
      }
    } catch (err) {
      console.error("Bid placement failed:", err);
      setBidError(err.response?.data?.message || "Failed to place bid");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans text-left">
      {/* Navigation & Header */}
      <nav className="flex items-center gap-1.5 mb-2 text-xs text-slate-400 font-medium">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span>Dealer Portal</span>
        <span>›</span>
        <span className="text-slate-600 font-semibold">Live Auctions</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Gavel className="w-6 h-6 text-rose-500" />
            Live Scrap Auctions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Participate in real-time competitive bidding on verified industrial scrap lots.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search material or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid of Auctions */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading live auctions...</div>
      ) : activeAuctions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
          <Gavel className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Live Auctions Available</h3>
          <p className="text-xs text-slate-400 mt-1">There are currently no active auctions matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeAuctions.map((auction) => {
            const endsAtTime = new Date(auction.endsAt).getTime();
            const startsAtTime = new Date(auction.startsAt).getTime();
            // eslint-disable-next-line react-hooks/purity
            const remainingSec = Math.max(0, Math.floor((endsAtTime - Date.now()) / 1000) - elapsed);
            const durationSec = Math.max(3600, Math.floor((endsAtTime - startsAtTime) / 1000));
            const progress = Math.min(100, Math.max(0, ((durationSec - remainingSec) / durationSec) * 100));

            const currentPrice = auction.currentHighestBid?.pricePerKg
              ? Number(auction.currentHighestBid.pricePerKg)
              : Number(auction.startingPricePerKg);

            const totalQuantityMT = (Number(auction.listing?.quantityKg || 0) / 1000).toFixed(1);
            const totalValue = currentPrice * Number(auction.listing?.quantityKg || 0);

            return (
              <div
                key={auction.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        AUC-{auction.id.slice(0, 6).toUpperCase()}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
                        {auction.listing?.scrapRecord?.description ||
                          auction.listing?.scrapRecord?.category?.name ||
                          "Industrial Scrap Lot"}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      LIVE
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Current Highest Bid
                      </span>
                      <span className="text-lg font-extrabold text-blue-600">
                        {money(currentPrice)}<span className="text-xs text-slate-400 font-normal">/Kg</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Total Value
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {money(totalValue)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quantity</span>
                      <span className="font-semibold text-slate-800">{totalQuantityMT} Tons</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Min Increment</span>
                      <span className="font-semibold text-slate-800">₹{auction.minIncrement}/Kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Seller</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {auction.listing?.scrapRecord?.owner?.companyName || "Industrial Seller"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Bids</span>
                      <span className="font-semibold text-slate-800">{auction.bidCount || auction.bids?.length || 0} bids</span>
                    </div>
                  </div>

                  {/* Timer & Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-600 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Ends in {formatHMS(remainingSec)}
                      </span>
                      <span className="text-slate-400 font-normal">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openDrawer(auction)}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Place Bid Now</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bid Side Drawer */}
      {openAuction && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    AUC-{openAuction.id.slice(0, 6).toUpperCase()}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    {openAuction.listing?.scrapRecord?.description || "Scrap Bidding"}
                  </h2>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current High Bid summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                  Current Highest Bid
                </span>
                <span className="text-2xl font-extrabold text-blue-900 mt-1 block">
                  {money(
                    openAuction.currentHighestBid?.pricePerKg ||
                      openAuction.startingPricePerKg
                  )}
                  <span className="text-xs font-normal text-blue-600">/Kg</span>
                </span>
                <p className="text-[11px] text-blue-700 mt-1">
                  Min bid increment: ₹{openAuction.minIncrement}/Kg
                </p>
              </div>

              {/* Bid Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Enter Your Price (₹ / Kg)
                  </label>
                  <input
                    type="number"
                    value={bidInput}
                    onChange={(e) => setBidInput(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter bid price"
                  />
                </div>

                {bidError && (
                  <div className="p-3 text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
                    {bidError}
                  </div>
                )}

                {bidSuccess && (
                  <div className="p-3 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
                    {bidSuccess}
                  </div>
                )}
              </div>

              {/* Bid History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-3">Recent Bids History</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(!openAuction.bids || openAuction.bids.length === 0) ? (
                    <p className="text-xs text-slate-400">No bids placed yet. Be the first!</p>
                  ) : (
                    openAuction.bids.map((b, idx) => (
                      <div
                        key={b.id || idx}
                        className="flex items-center justify-between p-2.5 text-xs bg-slate-50 border border-slate-100 rounded-xl"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {b.bidder?.companyName || "Bidder"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(b.placedAt).toLocaleTimeString("en-IN")}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {money(b.pricePerKg)}/Kg
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <button
                onClick={handlePlaceBid}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAuction;
