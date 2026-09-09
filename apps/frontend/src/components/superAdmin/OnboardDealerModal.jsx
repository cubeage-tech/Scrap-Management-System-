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
  { value: "Approved", label: "Approved (Active)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { value: "Pending", label: "Pending (Under Verification)", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "Rejected", label: "Rejected (Declined)", color: "text-rose-700 bg-rose-50 border-rose-200" },
];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const OnboardDealerModal = ({ isOpen, onClose, onAddDealer, nextDealerCode = "DLR-2211" }) => {
  const [formData, setFormData] = useState({
    code: nextDealerCode,
    name: "",
    specialisation: "Ferrous & Non-Ferrous",
    location: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstNumber: "",
    purchaseValue: "",
    status: "Approved",
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.specialisation) {
      alert("Please fill in company name, location, and specialisation.");
      return;
    }

    const rawValue = parseFloat(formData.purchaseValue.toString().replace(/[^0-9.]/g, "")) || 0;

    const newDealer = {
      id: formData.code || nextDealerCode,
      code: formData.code || nextDealerCode,
      name: formData.name.trim(),
      initials: getInitials(formData.name),
      specialisation: formData.specialisation,
      location: formData.location.trim(),
      purchaseValueRaw: rawValue,
      purchaseValue: `₹${rawValue.toLocaleString("en-IN")}`,
      status: formData.status,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      contactPerson: formData.contactPerson.trim() || "Operations Manager",
      email: formData.email.trim() || `contact@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "dealer"}.com`,
      phone: formData.phone.trim() || "+91 98200 12345",
      gstNumber: formData.gstNumber.trim() || "27AABCS1429B1Z8",
      notes: formData.notes.trim(),
      verifiedAt: new Date().toISOString(),
    };

    onAddDealer(newDealer);
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
                <h2 className="text-base font-bold tracking-tight">Onboard New Scrap Dealer</h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 text-xs font-mono font-semibold">
                  {formData.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">Add verified sourcing partner to the network registry</p>
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
          {/* Company Name & Dealer Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Dealer / Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Recyclers & Alloys"
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
                placeholder="e.g. Bhiwandi, MH or Delhi, DL"
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
                placeholder="e.g. Rahul Sharma"
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
                placeholder="e.g. +91 98200 12345"
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
                placeholder="e.g. dealer@company.com"
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
                placeholder="e.g. 27AAAAA0000A1Z5"
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
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> Initial Purchase Value (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 2500000"
                value={formData.purchaseValue}
                onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Verification Status *
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
              Onboard Dealer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardDealerModal;
