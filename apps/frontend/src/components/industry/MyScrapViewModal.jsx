import { X, Package, MapPin, Scale, DollarSign, QrCode, Printer } from "lucide-react";

const MyScrapViewModal = ({ isOpen, onClose, scrapItem, onEdit }) => {
  if (!isOpen || !scrapItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#0f172a] text-white px-7 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#855836]/30 border border-[#855836]/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{scrapItem.material}</h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-semibold">
                  {scrapItem.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Scrap Inventory Lot Details & Specification Sheet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-6">
          
          {/* Top Hero Summary */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm">
              <img 
                src={scrapItem.imageUrl} 
                alt={scrapItem.material}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=150&auto=format&fit=crop&q=80";
                }}
              />
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {scrapItem.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  scrapItem.condition === "Grade A"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : scrapItem.condition === "Grade B"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-orange-50 text-orange-700 border border-orange-200"
                }`}>
                  {scrapItem.condition}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  scrapItem.status === "Available"
                    ? "bg-emerald-100 text-emerald-800"
                    : scrapItem.status === "Partially Listed"
                    ? "bg-amber-100 text-amber-800"
                    : scrapItem.status === "Fully Listed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {scrapItem.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{scrapItem.material}</h3>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {scrapItem.location}
              </p>
            </div>

            {/* QR Code / Digital Tag */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
              <QrCode className="w-12 h-12 mx-auto text-slate-800" />
              <div className="text-[9px] font-mono font-bold text-slate-400 mt-1">{scrapItem.id}</div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Scale className="w-3 h-3 text-slate-500" /> Total Weight
              </div>
              <div className="text-base font-bold text-slate-900">{scrapItem.weightKg}</div>
              <div className="text-[10px] text-slate-500 font-semibold">{scrapItem.qtyUnit}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-500" /> Exp. Price
              </div>
              <div className="text-base font-bold text-slate-900">{scrapItem.expPriceMT}</div>
              <div className="text-[10px] text-slate-500 font-semibold">per Metric Tonne</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                Estimated Value
              </div>
              <div className="text-base font-extrabold text-slate-900">
                ₹{scrapItem.totalValue ? scrapItem.totalValue.toLocaleString('en-IN') : "-"}
              </div>
              <div className="text-[10px] text-amber-700 font-semibold">Gross Lot Value</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Logged Date
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {scrapItem.dateAdded || "Aug 14, 2026"}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold">Verified Log</div>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Lot Attributes & Storage Logistics
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-slate-600 font-medium">
              <div><span className="text-slate-400">Storage Facility:</span> {scrapItem.location}</div>
              <div><span className="text-slate-400">Quality Classification:</span> {scrapItem.condition} Purity</div>
              <div><span className="text-slate-400">Primary Material:</span> {scrapItem.category}</div>
              <div><span className="text-slate-400">Market Channel:</span> {scrapItem.status === "Available" ? "Direct Inventory" : "Live Bidding"}</div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert(`Printing inventory label for ${scrapItem.id}...`)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print QR Label
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(scrapItem);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#855836] hover:bg-[#72492c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                Edit Details
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MyScrapViewModal;
