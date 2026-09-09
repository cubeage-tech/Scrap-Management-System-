import { X, Gavel, Clock, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";

const LiveBidsModal = ({ isOpen, onClose, lot, onAcceptBid }) => {
  if (!isOpen || !lot) return null;

  const mockBids = [
    { bidder: "Metro Recyclers Pvt Ltd", bidPrice: "₹37,800/MT", totalAmount: "₹17,01,000", time: "2 mins ago", verified: true, isTop: true },
    { bidder: "GreenMetal Solutions", bidPrice: "₹37,200/MT", totalAmount: "₹16,74,000", time: "8 mins ago", verified: true, isTop: false },
    { bidder: "Sanjay Metals Pvt. Ltd.", bidPrice: "₹36,500/MT", totalAmount: "₹16,42,500", time: "15 mins ago", verified: true, isTop: false },
    { bidder: "National Scrap Corp", bidPrice: "₹35,800/MT", totalAmount: "₹16,11,000", time: "24 mins ago", verified: false, isTop: false },
    { bidder: "Apex Recyclers LLP", bidPrice: "₹35,000/MT", totalAmount: "₹15,75,000", time: "40 mins ago", verified: true, isTop: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#011C6B] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-[#F59E0B]">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{lot.title}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-[#F59E0B] border border-amber-500/30">
                  {lot.id}
                </span>
              </div>
              <p className="text-xs text-blue-200">Live Bidding Log & Purchaser Ranking</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-gray-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Banner & Stats */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">Current Highest Bid</div>
            <div className="text-xl font-extrabold text-emerald-600 flex items-center gap-1.5">
              <span>{lot.topBid || "₹37,800/MT"}</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Reserve: {lot.pricePerUnit || "₹35,000/MT"}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">Active Bidders</div>
            <div className="text-xl font-extrabold text-[#011C6B]">
              14 Verified Buyers
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Total Bids: 38 submissions</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Time Remaining
            </div>
            <div className="text-xl font-extrabold text-amber-600">
              02h : 34m : 18s
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Auto-extension active</div>
          </div>
        </div>

        {/* Bidders History List */}
        <div className="p-6 max-h-80 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Real-Time Bid Submissions Log
          </h3>
          <div className="space-y-3">
            {mockBids.map((bid, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  bid.isTop 
                    ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/30" 
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    bid.isTop ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    #{i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{bid.bidder}</span>
                      {bid.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                          <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {bid.bidPrice} · Submitted {bid.time}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900">{bid.totalAmount}</div>
                  {bid.isTop ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
                      HIGHEST BID
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Under Bid</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Winner declared upon auction expiry or direct acceptance.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (onAcceptBid) onAcceptBid(mockBids[0].bidder, mockBids[0].totalAmount);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept Top Bid Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveBidsModal;
