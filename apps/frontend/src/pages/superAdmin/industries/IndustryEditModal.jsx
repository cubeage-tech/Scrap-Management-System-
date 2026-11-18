import { Edit2, X } from "lucide-react";
import FormField from "../../../components/common/FormField";

const SECTOR_OPTIONS = [
  "Automobile",
  "Steel Plant",
  "Electronics",
  "Plastics",
  "Textile",
  "Manufacturing",
];

const STATUS_OPTIONS = ["Approved", "Pending", "Rejected"];

const IndustryEditModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => {
  if (!isOpen) return null;

  const setField = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 border border-border">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground">Edit Industry</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="py-4 space-y-4 text-left">
          <FormField
            label="Company Name *"
            required
            value={formData.companyName}
            onChange={setField("companyName")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Sector"
              options={SECTOR_OPTIONS}
              value={formData.sector}
              onChange={setField("sector")}
            />
            <FormField
              label="Location"
              required
              value={formData.location}
              onChange={setField("location")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Traded Value"
              value={formData.tradedValue}
              onChange={setField("tradedValue")}
            />
            <FormField
              label="Status"
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={setField("status")}
            />
          </div>

          <FormField
            label="Contact Person"
            value={formData.contactPerson}
            onChange={setField("contactPerson")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={setField("email")}
            />
            <FormField label="Phone" value={formData.phone} onChange={setField("phone")} />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndustryEditModal;
