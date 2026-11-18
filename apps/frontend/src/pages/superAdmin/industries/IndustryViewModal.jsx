import { X, ShieldCheck } from "lucide-react";
import StatusBadge from "../../../components/common/StatusBadge";
import { STATUS_VARIANTS } from "../../../configs/tables/adminTable.config";

const Field = ({ label, value }) => (
  <div>
    <span className="text-xs text-muted-foreground font-semibold block uppercase">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

const IndustryViewModal = ({ isOpen, industry, onClose, onStatusChange }) => {
  if (!isOpen || !industry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 border border-border">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-border">
              {industry.initials}
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground leading-tight">
                {industry.companyName}
              </h3>
              <p className="text-xs text-muted-foreground">{industry.code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <div className="py-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sector" value={industry.sector} />
            <div>
              <span className="text-xs text-muted-foreground font-semibold block uppercase">
                Status
              </span>
              <div className="mt-0.5">
                <StatusBadge
                  label={industry.status}
                  variant={STATUS_VARIANTS[industry.status] || "neutral"}
                />
              </div>
            </div>
            <Field label="Location" value={industry.location} />
            <div>
              <span className="text-xs text-muted-foreground font-semibold block uppercase">
                Traded Volume / Value
              </span>
              <span className="font-bold text-foreground text-base">
                {industry.tradedValueDisplay}
              </span>
            </div>
            <Field label="Registration Date" value={industry.date} />
            <Field label="GST Number" value={industry.gstNumber || "N/A"} />
            <Field label="Contact Person" value={industry.contactPerson || "N/A"} />
            <Field label="Email" value={industry.email || "N/A"} />
          </div>

          {onStatusChange && (
            <div className="p-3.5 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Change Industry Status:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStatusChange(industry.id, "Approved")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    industry.status === "Approved"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => onStatusChange(industry.id, "Pending")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    industry.status === "Pending"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  Set Pending
                </button>

                <button
                  type="button"
                  onClick={() => onStatusChange(industry.id, "Rejected")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    industry.status === "Rejected"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndustryViewModal;
