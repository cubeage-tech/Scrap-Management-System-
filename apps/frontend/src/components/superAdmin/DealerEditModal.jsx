import { useState } from "react";
import { X, Building2, User, Mail, Phone, MapPin, Tag, ShieldCheck, IndianRupee, FileText } from "lucide-react";

const SPECIALISATION_OPTIONS = [
  "Ferrous & Non-Ferrous",
  "Ferrous",
  "Non-Ferrous",
  "Polymer",
  "E-Waste",
  "Mixed Scrap",
  "Industrial Metal",
  "Paper & Cardboard",
  "Rubber",
];

const STATUS_OPTIONS = [
  { value: "Approved", label: "Approved (Active)" },
  { value: "Pending", label: "Pending (Under Verification)" },
  { value: "Rejected", label: "Rejected (Declined)" },
];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const DealerEditModal = ({ isOpen, onClose, dealer, onUpdateDealer }) => {
  const [formData, setFormData] = useState({
    name: dealer?.name || "",
    code: dealer?.code || dealer?.id || "",
    specialisation: dealer?.specialisation || "Ferrous & Non-Ferrous",
    location: dealer?.location || "",
    contactPerson: dealer?.contactPerson || "",
    email: dealer?.email || "",
    phone: dealer?.phone || "",
    gstNumber: dealer?.gstNumber || "",
    purchaseValue: dealer?.purchaseValueRaw !== undefined ? dealer.purchaseValueRaw : (dealer?.purchaseValue ? dealer.purchaseValue.replace(/[^0-9.]/g, "") : ""),
    status: dealer?.status || "Approved",
  });

  if (!isOpen || !dealer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert("Please fill in company name and location.");
      return;
    }

    const rawValue = parseFloat(formData.purchaseValue.toString().replace(/[^0-9.]/g, "")) || 0;

    const updated = {
      ...dealer,
      name: formData.name.trim(),
      code: formData.code.trim(),
      initials: getInitials(formData.name),
      specialisation: formData.specialisation,
      location: formData.location.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      gstNumber: formData.gstNumber.trim(),
      purchaseValueRaw: rawValue,
      purchaseValue: `₹${rawValue.toLocaleString("en-IN")}`,
      status: formData.status,
    };

    onUpdateDealer(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Edit Dealer Information</h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 text-xs font-mono font-semibold">
                  {dealer.code || dealer.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Update verified partner credentials and status</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Company Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Dealer / Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dealer Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Specialisation & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" /> Material Specialisation *
              </label>
              <select
                value={formData.specialisation}
                onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium cursor-pointer"
              >
                {SPECIALISATION_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Location (City, State) *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
              />
            </div>
          </div>

          {/* Email & GST Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> GST Identification Number
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono font-medium uppercase"
              />
            </div>
          </div>

          {/* Purchase Value & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> Total Purchase Value (₹)
              </label>
              <input
                type="number"
                value={formData.purchaseValue}
                onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerEditModal;
