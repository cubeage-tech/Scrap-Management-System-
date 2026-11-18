import { FileText, Gavel, Clock } from "lucide-react";

const MODES = [
  {
    value: "QUOTATION",
    label: "Quotation",
    description: "Dealers submit price quotes for you to accept or reject.",
    icon: FileText,
    disabled: false,
  },
  {
    value: "AUCTION",
    label: "Auction",
    description: "Dealers compete in a live timed bid. Highest bid wins.",
    icon: Gavel,
    disabled: false,
  },
  {
    value: "TENDER",
    label: "Tender",
    description: "Create sealed-bid tenders from the Tenders page in your sidebar.",
    icon: Clock,
    disabled: true,
  },
];

const SellingModeSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {MODES.map((mode) => {
      const Icon = mode.icon;
      const selected = value === mode.value;

      return (
        <button
          key={mode.value}
          type="button"
          disabled={mode.disabled}
          onClick={() => !mode.disabled && onChange(mode.value)}
          className={`text-left p-3.5 rounded-xl border transition-colors ${
            mode.disabled
              ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
              : selected
              ? "border-blue-500 bg-blue-50 text-blue-900 cursor-pointer"
              : "border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer"
          }`}
        >
          <Icon className={`w-5 h-5 mb-2 ${selected ? "text-blue-600" : ""}`} />
          <div className="font-semibold text-sm flex items-center gap-1.5">
            {mode.label}
            {mode.disabled && (
              <span className="text-[10px] font-medium bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">
                Separate module
              </span>
            )}
          </div>
          <div className="text-[11px] mt-0.5 leading-snug">{mode.description}</div>
        </button>
      );
    })}
  </div>
);

export default SellingModeSelector;
