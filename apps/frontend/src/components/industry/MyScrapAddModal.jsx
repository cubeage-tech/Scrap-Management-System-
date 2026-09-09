import { useState } from "react";
import { X, Package, Tag, Scale, DollarSign, Layers, MapPin, CheckCircle2, Image as ImageIcon } from "lucide-react";

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
  { id: "Grade A", label: "Grade A (High Purity / Premium)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "Grade B", label: "Grade B (Standard Industrial Mix)", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "Grade C", label: "Grade C (Mixed / Post-Process)", color: "text-orange-700 bg-orange-50 border-orange-200" },
];

const STATUS_OPTIONS = [
  { id: "Available", label: "Available" },
  { id: "Partially Listed", label: "Partially Listed" },
  { id: "Fully Listed", label: "Fully Listed" },
  { id: "Sold", label: "Sold" },
];

const DEFAULT_IMAGES = {
  "Steel": "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=150&auto=format&fit=crop&q=80",
  "Copper": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=150&auto=format&fit=crop&q=80",
  "Aluminium": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=80",
  "Plastic": "https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=150&auto=format&fit=crop&q=80",
  "Electronic Waste": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=150&auto=format&fit=crop&q=80",
  "Rubber": "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=150&auto=format&fit=crop&q=80",
  "Others": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=150&auto=format&fit=crop&q=80"
};

const MyScrapAddModal = ({ isOpen, onClose, onAddScrap, nextId = "INV-009" }) => {
  const [formData, setFormData] = useState({
    id: nextId,
    material: "",
    category: "Steel",
    weightKg: "",
    weightMT: "",
    condition: "Grade A",
    location: "Warehouse A - Bay 3",
    pricePerMT: "",
    status: "Available",
    imageUrl: "",
    notes: ""
  });

  if (!isOpen) return null;

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

    const newScrap = {
      id: formData.id || nextId,
      material: formData.material,
      category: formData.category,
      weightKg: `${kgNum.toLocaleString('en-IN')} kg`,
      weightRawKg: kgNum,
      qtyUnit: `${mtNum} MT`,
      qtyRawMT: mtNum,
      condition: formData.condition,
      location: formData.location || "Warehouse A - Bay 1",
      expPriceMT: `₹${priceNum.toLocaleString('en-IN')}`,
      expPriceRaw: priceNum,
      totalValue: Math.round(mtNum * priceNum),
      status: formData.status,
      imageUrl: formData.imageUrl || DEFAULT_IMAGES[formData.category] || DEFAULT_IMAGES["Others"],
      notes: formData.notes,
      dateAdded: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    onAddScrap(newScrap);
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
                <h2 className="text-lg font-bold">Add New Scrap Inventory</h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-semibold">
                  {formData.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Record and catalogue scrap batch in enterprise inventory</p>
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
          
          {/* Material Name & ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Material Name & Specification *
              </label>
              <input 
                type="text" 
                placeholder="e.g. MS Steel Scrap (Heavy Melting HMS 1&2)"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Inventory ID
              </label>
              <input 
                type="text" 
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Category & Condition */}
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
                <Layers className="w-3.5 h-3.5 text-[#855836]" /> Material Condition / Quality *
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

          {/* Weight & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#855836]" /> Total Weight (kg) *
              </label>
              <input 
                type="number" 
                placeholder="e.g. 24500"
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
                placeholder="24.5 MT"
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
                placeholder="e.g. 38500"
                value={formData.pricePerMT}
                onChange={(e) => setFormData({ ...formData, pricePerMT: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#855836]" /> Warehouse / Storage Location *
              </label>
              <input 
                type="text" 
                placeholder="e.g. Warehouse A - Bay 3"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#855836]" /> Initial Status *
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

          {/* Optional Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#855836]" /> Scrap Photo / Thumbnail URL (Optional)
            </label>
            <input 
              type="url" 
              placeholder="Leave empty for auto category image"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#855836] text-xs font-medium"
            />
          </div>

          {/* Modal Action Buttons */}
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
              + Add Scrap
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default MyScrapAddModal;
