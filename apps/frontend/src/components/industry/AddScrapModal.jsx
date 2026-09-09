import { useState } from "react";
import { X, Package, Tag, Scale, DollarSign, Layers, Plus } from "lucide-react";

const AddScrapModal = ({ isOpen, onClose, onAddScrap, initialMode = "B2B Marketplace" }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Ferrous Metal",
    weight: "",
    unit: "MT",
    grade: "Grade A",
    pricePerUnit: "",
    mode: initialMode,
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.weight || !formData.pricePerUnit) {
      alert("Please fill in all required fields.");
      return;
    }

    const totalVal = parseFloat(formData.weight) * parseFloat(formData.pricePerUnit);
    const formattedVal = totalVal >= 100000 
      ? `₹${(totalVal / 100000).toFixed(2)}L` 
      : `₹${totalVal.toLocaleString('en-IN')}`;

    const newLot = {
      id: `SCRAP-2026-0${Math.floor(100 + Math.random() * 900)}`,
      title: formData.title,
      category: formData.category,
      grade: formData.grade,
      weight: `${formData.weight} ${formData.unit}`,
      pricePerUnit: `₹${parseFloat(formData.pricePerUnit).toLocaleString('en-IN')}/${formData.unit}`,
      totalValue: formattedVal,
      mode: formData.mode,
      status: formData.mode === "Live Auction" ? "Bidding Live" : formData.mode === "Sealed Tender" ? "Pending Quote" : "In Stock",
      biddersCount: formData.mode === "Live Auction" ? 0 : 0,
      topBid: formData.mode === "Live Auction" ? `₹${parseFloat(formData.pricePerUnit).toLocaleString('en-IN')}/${formData.unit}` : "-",
      buyer: "Pending Matching",
      dateAdded: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    onAddScrap(newLot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#011C6B] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F59E0B]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Log New Scrap Inventory Lot</h2>
              <p className="text-xs text-blue-200">Add scrap batch to digital ledger & marketplace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-gray-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Scrap Material Name / Description *
            </label>
            <input 
              type="text" 
              placeholder="e.g. MS Heavy Melting Scrap HMS 1&2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#011C6B] text-xs font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#011C6B]" /> Material Category
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#011C6B] text-xs font-semibold cursor-pointer"
              >
                <option value="Ferrous Metal">Ferrous Metal (Steel, Iron)</option>
                <option value="Non-Ferrous Metal">Non-Ferrous (Copper, Brass, Alu)</option>
                <option value="Electrical & Cable">Electrical Scrap & Heavy Cables</option>
                <option value="Plastic & Rubber">Plastic & Rubber Scrap</option>
                <option value="E-Scrap & Machinery">Machinery & E-Scrap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#011C6B]" /> Quality Grade
              </label>
              <select 
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#011C6B] text-xs font-semibold cursor-pointer"
              >
                <option value="Grade A">Grade A (High Purity / Clean)</option>
                <option value="Grade B">Grade B (Medium Industrial Mix)</option>
                <option value="Grade C">Grade C (Post-Process / Mixed)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#011C6B]" /> Weight / Quantity *
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 45.0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#011C6B] text-xs font-medium"
                  required
                />
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-900 text-xs font-bold cursor-pointer"
                >
                  <option value="MT">MT</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#011C6B]" /> Reserve Price (₹ / MT) *
              </label>
              <input 
                type="number" 
                placeholder="e.g. 37800"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#011C6B] text-xs font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Sales Channel / Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "B2B Marketplace", label: "Marketplace", desc: "Listed for direct quotes" },
                { id: "Live Auction", label: "Live Auction", desc: "Real-time bidding" },
                { id: "Sealed Tender", label: "Sealed Tender", desc: "Closed-bid RFQ" },
              ].map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: channel.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.mode === channel.id
                      ? "border-[#011C6B] bg-blue-50 text-[#011C6B] ring-2 ring-[#011C6B]"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-xs font-bold">{channel.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{channel.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#011C6B] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Scrap Lot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScrapModal;
