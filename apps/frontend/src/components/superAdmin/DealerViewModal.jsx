import { X, Building2, MapPin, User, Mail, Phone, Tag, ShieldCheck, IndianRupee, FileText, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "Approved":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
      );
    case "Pending":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Pending
        </span>
      );
    case "Rejected":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1">
          <X className="w-3 h-3" /> Rejected
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};

const DealerViewModal = ({ isOpen, onClose, dealer, onEdit, onStatusChange }) => {
  if (!isOpen || !dealer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-sm">
              {dealer.initials || "DL"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">{dealer.name}</h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono font-semibold">
                  {dealer.code || dealer.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Verified Scrap Dealer Profile & Logistics Sourcing Record</p>
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

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Top Hero Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getStatusBadge(dealer.status)}
                <span className="text-xs text-slate-500 font-medium">Joined {dealer.date}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{dealer.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {dealer.location}
              </p>
            </div>

            <div className="sm:text-right bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Purchase Value
              </div>
              <div className="text-xl font-bold text-slate-900">{dealer.purchaseValue}</div>
              <div className="text-[10px] text-emerald-600 font-medium">Platform Sourced</div>
            </div>
          </div>

          {/* Key Metrics / Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Tag className="w-3 h-3 text-blue-600" /> Specialisation
              </div>
              <div className="text-xs font-bold text-slate-800">{dealer.specialisation}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3 text-blue-600" /> GSTIN
              </div>
              <div className="text-xs font-mono font-bold text-slate-800">{dealer.gstNumber || "27AABCS1429B1Z8"}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-blue-600" /> Registration Date
              </div>
              <div className="text-xs font-bold text-slate-800">{dealer.date}</div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Primary Contact & Communications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact Person</span>
                  <span className="font-semibold">{dealer.contactPerson || "Operations Head"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone Number</span>
                  <span className="font-semibold">{dealer.phone || "+91 98200 12345"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 sm:col-span-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Address</span>
                  <span className="font-semibold">{dealer.email || `contact@${dealer.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "dealer"}.com`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Status Control */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">Change Dealer Status:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(dealer.id, "Approved")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  dealer.status === "Approved"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Approve
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(dealer.id, "Pending")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  dealer.status === "Pending"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                Set Pending
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(dealer.id, "Rejected")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  dealer.status === "Rejected"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                Reject
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(dealer);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Edit Dealer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerViewModal;
