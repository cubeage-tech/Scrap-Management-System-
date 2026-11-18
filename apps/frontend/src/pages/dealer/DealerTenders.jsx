import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Search, AlertCircle, Clock, ChevronRight,
  Loader2, RefreshCw, CheckCircle2, XCircle,
} from "lucide-react";
import ApiService from "../../core/services/api.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCcy = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : null;
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_BADGE = {
  DRAFT:            { cls: "bg-slate-100 text-slate-600",       label: "Draft"            },
  SCHEDULED:        { cls: "bg-indigo-100 text-indigo-700",     label: "Scheduled"        },
  OPEN:             { cls: "bg-emerald-100 text-emerald-700",   label: "Open"             },
  CLOSED:           { cls: "bg-amber-100 text-amber-700",       label: "Closed"           },
  UNDER_EVALUATION: { cls: "bg-blue-100 text-blue-700",         label: "Under Evaluation" },
  AWARDED:          { cls: "bg-purple-100 text-purple-700",     label: "Awarded"          },
  UNSUCCESSFUL:     { cls: "bg-rose-100 text-rose-700",         label: "Unsuccessful"     },
  CANCELLED:        { cls: "bg-slate-100 text-slate-500",       label: "Cancelled"        },
};

const MY_SUBMISSION_BADGE = {
  SUBMITTED:    { cls: "bg-blue-100 text-blue-700",       label: "Submitted"    },
  UNDER_REVIEW: { cls: "bg-amber-100 text-amber-700",     label: "Under Review" },
  ELIGIBLE:     { cls: "bg-emerald-100 text-emerald-700", label: "Eligible"     },
  DISQUALIFIED: { cls: "bg-red-100 text-red-700",         label: "Disqualified" },
  SELECTED:     { cls: "bg-purple-100 text-purple-700",   label: "Won!"         },
  NOT_SELECTED: { cls: "bg-slate-100 text-slate-500",     label: "Not Selected" },
};

const StatusBadge = ({ status, map = STATUS_BADGE, size = "sm" }) => {
  const b = map[status] ?? { cls: "bg-slate-100 text-slate-500", label: status };
  const sz = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return <span className={`inline-flex items-center rounded-full font-medium ${sz} ${b.cls}`}>{b.label}</span>;
};

const countdown = (dt) => {
  if (!dt) return null;
  const diff = new Date(dt) - new Date();
  if (diff <= 0) return "Deadline passed";
  const h = Math.floor(diff / 3600000);
  if (h > 48) return `${Math.floor(h / 24)}d left`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "all",          label: "All Tenders"    },
  { key: "OPEN",         label: "Open / Scheduled" },
  { key: "mine",         label: "My Submissions" },
  { key: "WON",          label: "Won"            },
  { key: "NOT_SELECTED", label: "Not Selected"   },
];

export default function DealerTenders() {
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [tab, setTab]         = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getTenders();
      setTenders(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load tenders");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const filtered = tenders.filter((t) => {
    const matchTab = tab === "all"          ? true
      : tab === "OPEN"          ? ["OPEN", "SCHEDULED"].includes(t.status)
      : tab === "mine"          ? t.mySubmissionStatus != null
      : tab === "WON"           ? t.mySubmissionStatus === "SELECTED"
      : tab === "NOT_SELECTED"  ? t.mySubmissionStatus === "NOT_SELECTED"
      : true;
    const q = search.toLowerCase();
    const matchSearch = !q
      || t.title?.toLowerCase().includes(q)
      || t.ref?.toLowerCase().includes(q)
      || t.scrapRecord?.category?.name?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tenders</h1>
        <p className="text-sm text-slate-500 mt-1">Browse sealed-bid tenders and submit confidential offers</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 flex-wrap">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === t.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-44" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          <button onClick={load} className="ml-auto flex items-center gap-1 text-red-600 hover:underline text-xs">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">No tenders found</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => navigate(`/dealer/tenders/${t.id}`)}
              className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-slate-400">{t.ref}</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={t.status} />
                  {t.mySubmissionStatus && (
                    <StatusBadge status={t.mySubmissionStatus} map={MY_SUBMISSION_BADGE} size="xs" />
                  )}
                </div>
              </div>

              {/* Title + basic meta */}
              <p className="font-semibold text-slate-900 text-sm truncate">{t.scrapRecord?.category?.name || t.title}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                <span>{Number(t.quantityKg).toLocaleString()} kg</span>
                {t.locationLabel && <span>{t.locationLabel}</span>}
              </div>

              {/* My submission strip — shown when dealer has submitted */}
              {t.mySubmissionStatus && t.mySubmissionPricePerKg != null && (
                <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center gap-3 text-xs">
                  <span className="text-indigo-500 font-medium">My offer:</span>
                  <span className="font-bold text-indigo-800">{fmtCcy(t.mySubmissionPricePerKg)}/kg</span>
                  <span className="text-indigo-400">· Total {fmtCcy(t.mySubmissionTotalValue)}</span>
                  {t.mySubmissionDate && (
                    <span className="text-indigo-300 ml-auto">{fmtDateShort(t.mySubmissionDate)}</span>
                  )}
                </div>
              )}

              {/* Not-selected notice */}
              {t.mySubmissionStatus === "NOT_SELECTED" && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  Tender awarded to another dealer
                </div>
              )}

              {/* Won highlight */}
              {t.mySubmissionStatus === "SELECTED" && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                  Your offer was selected — you won!
                </div>
              )}

              {/* Deadline countdown for open tenders */}
              {t.closesAt && ["OPEN", "SCHEDULED"].includes(t.status) && (
                <div className={`text-xs font-medium mt-2 ${new Date(t.closesAt) < new Date() ? "text-red-500" : "text-amber-600"}`}>
                  <Clock className="inline w-3 h-3 mr-0.5" />
                  {t.status === "SCHEDULED" ? `Opens ${fmtDateShort(t.opensAt)}` : countdown(t.closesAt)}
                </div>
              )}

              <div className="flex items-center justify-end mt-3">
                <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                  View details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
