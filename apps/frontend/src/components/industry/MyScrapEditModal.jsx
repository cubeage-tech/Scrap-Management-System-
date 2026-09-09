import { useState } from "react";
import { X, Package, Tag, Scale, DollarSign, Layers, MapPin, CheckCircle2, Save } from "lucide-react";

const CATEGORY_OPTIONS = [
  "Steel",
  "Copper",
  "Aluminium",
  "Plastic",
  "Electronic Waste",
  "Rubber",
  "Paper & Cardboard",
  "Glass & Ceramic",
  "Others"
];

const CONDITION_OPTIONS = [
  { id: "Grade A", label: "Grade A (High Purity / Clean)" },
  { id: "Grade B", label: "Grade B (Standard Industrial Mix)" },
  { id: "Grade C", label: "Grade C (Mixed / Post-Process)" },
];

const STATUS_OPTIONS = [
  { id: "Available", label: "Available" },
  { id: "Partially Listed", label: "Partially Listed" },
  { id: "Fully Listed", label: "Fully Listed" },
  { id: "Sold", label: "Sold" },
];

const MyScrapEditModal = ({ isOpen, onClose, scrapItem, onUpdateScrap }) => {
  const [formData, setFormData] = useState(() => ({
    id: scrapItem?.id || "",
    material: scrapItem?.material || "",
    category: scrapItem?.category || "Steel",
    weightKg: scrapItem?.weightRawKg || scrapItem?.weightKg?.replace(/[^0-9.]/g, '') || "",
    weightMT: scrapItem?.qtyRawMT || scrapItem?.qtyUnit?.replace(/[^0-9.]/g, '') || "",
    condition: scrapItem?.condition || "Grade A",
    location: scrapItem?.location || "",
    pricePerMT: scrapItem?.expPriceRaw || scrapItem?.expPriceMT?.replace(/[^0-9.]/g, '') || "",
    status: scrapItem?.status || "Available",
    imageUrl: scrapItem?.imageUrl || ""
  }));

  if (!isOpen || !scrapItem) return null;

  const handleWeightKgChange = (val) => {
    const num = parseFloat(val) || 0;
    setFormData((prev) => ({
      ...prev,
      weightKg: val,
      weightMT: val ? (num / 1000).toFixed(2) : ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.material || !formData.weightKg || !formData.pricePerMT) {
      alert("Please fill in all required fields.");
      return;
    }

    const priceNum = parseFloat(formData.pricePerMT.toString().replace(/[^0-9.]/g, '')) || 0;
    const kgNum = parseFloat(formData.weightKg) || 0;
    const mtNum = parseFloat(formData.weightMT) || (kgNum / 1000);

    const updated = {
      ...scrapItem,
      id: formData.id,
      material: formData.material,
      category: formData.category,
      weightKg: `${kgNum.toLocaleString('en-IN')} kg`,
      weightRawKg: kgNum,
      qtyUnit: `${mtNum} MT`,
      qtyRawMT: mtNum,
      condition: formData.condition,
      location: formData.location,
      expPriceMT: `₹${priceNum.toLocaleString('en-IN')}`,
      expPriceRaw: priceNum,
      totalValue: Math.round(mtNum * priceNum),
      status: formData.status,
      imageUrl: formData.imageUrl || scrapItem.imageUrl,
    };

    onUpdateScrap(updated);
    onClose();
  };

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
                <h2 className="text-lg font-bold">Edit Scrap Lot Details</h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-semibold">
                  {formData.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Update material specifications, quantity or valuation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Material Name & Specification *
            </label>
            <input 
              type="text" 
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#855836]" /> Category *
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-semibold cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#855836]" /> Quality Grade *
              </label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-semibold cursor-pointer"
              >
                {CONDITION_OPTIONS.map((cond) => (
                  <option key={cond.id} value={cond.id}>{cond.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#855836]" /> Weight (kg) *
              </label>
              <input 
                type="number" 
                value={formData.weightKg}
                onChange={(e) => handleWeightKgChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Metric Tonnes (MT)
              </label>
              <input 
                type="text" 
                readOnly
                value={formData.weightMT ? `${formData.weightMT} MT` : ""}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#855836]" /> Exp. Price / MT (₹) *
              </label>
              <input 
                type="number" 
                value={formData.pricePerMT}
                onChange={(e) => setFormData({ ...formData, pricePerMT: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#855836]" /> Storage Location *
              </label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#855836]" /> Inventory Status *
              </label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-semibold cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
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
              className="px-6 py-2.5 rounded-xl bg-[#855836] hover:bg-[#72492c] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default MyScrapEditModal;
