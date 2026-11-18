import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ message, type = "success", onClose, duration = 3500 }) => {
  useEffect(() => {
    if (duration > 0 && message) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, message, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all animate-in slide-in-from-bottom-3 duration-200 bg-white ${
      isSuccess ? "border-emerald-200 text-emerald-900" : isError ? "border-rose-200 text-rose-900" : "border-blue-200 text-blue-900"
    }`}>
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-600 shrink-0" />}

      <span className="font-semibold">{message}</span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;

