// Generic, domain-agnostic status pill. Callers supply the label and a
// visual variant — this component has no idea what "Bidding Live" or
// "Approved" means, it just renders whatever it's told to.

const VARIANT_CLASSES = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-300",
  danger: "bg-rose-100 text-rose-800 border-rose-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
};

const StatusBadge = ({ label, variant = "neutral", icon: Icon, pulse = false, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
      VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral
    } ${className}`}
  >
    {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
    {Icon && <Icon className="w-3 h-3" />}
    {label}
  </span>
);

export default StatusBadge;
