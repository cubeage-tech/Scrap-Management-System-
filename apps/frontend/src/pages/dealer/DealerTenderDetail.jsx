import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Package, MapPin, Clock, Shield,
  CheckCircle2, AlertCircle, Award, Loader2, RefreshCw,
  Users, FileText, Info, Paperclip, Download,
} from "lucide-react";
import ApiService from "../../core/services/api.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtCcy = (n) => (n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—");

const countdown = (dt) => {
  if (!dt) return null;
  const diff = new Date(dt) - new Date();
  if (diff <= 0) return "Deadline passed";
  const h = Math.floor(diff / 3600000);
  if (h > 48) return `${Math.floor(h / 24)}d remaining`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m remaining`;
};

const isClosingSoon = (dt) => {
  if (!dt) return false;
  const diff = new Date(dt) - new Date();
  return diff > 0 && diff < 24 * 3600000;
};

const STATUS_CONFIG = {
  DRAFT:            { cls: "bg-slate-100 text-slate-600 border-slate-200",     label: "Draft",            dot: "bg-slate-400"  },
  SCHEDULED:        { cls: "bg-indigo-100 text-indigo-700 border-indigo-200",   label: "Scheduled",        dot: "bg-indigo-500" },
  OPEN:             { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Open",             dot: "bg-emerald-500" },
  CLOSING_SOON:     { cls: "bg-orange-100 text-orange-700 border-orange-200",    label: "Closing Soon",     dot: "bg-orange-500" },
  CLOSED:           { cls: "bg-amber-100 text-amber-700 border-amber-200",       label: "Closed",           dot: "bg-amber-500"  },
  UNDER_EVALUATION: { cls: "bg-blue-100 text-blue-700 border-blue-200",          label: "Under Evaluation", dot: "bg-blue-500"   },
  AWARDED:          { cls: "bg-purple-100 text-purple-700 border-purple-200",    label: "Awarded",          dot: "bg-purple-500" },
  UNSUCCESSFUL:     { cls: "bg-rose-100 text-rose-700 border-rose-200",          label: "Unsuccessful",     dot: "bg-rose-500"   },
  CANCELLED:        { cls: "bg-slate-100 text-slate-500 border-slate-200",       label: "Cancelled",        dot: "bg-slate-400"  },
};

const SUBMISSION_STATUS = {
  SUBMITTED:    { cls: "bg-blue-100 text-blue-700",       label: "Submitted"    },
  UNDER_REVIEW: { cls: "bg-amber-100 text-amber-700",     label: "Under Review" },
  ELIGIBLE:     { cls: "bg-emerald-100 text-emerald-700", label: "Eligible"     },
  DISQUALIFIED: { cls: "bg-red-100 text-red-700",         label: "Disqualified" },
  SELECTED:     { cls: "bg-purple-100 text-purple-700",   label: "Won!"         },
  NOT_SELECTED: { cls: "bg-slate-100 text-slate-500",     label: "Not Selected" },
};

const getDisplayStatus = (tender) => {
  if (tender.status === "OPEN" && isClosingSoon(tender.closesAt)) return "CLOSING_SOON";
  return tender.status;
};


// ── Tender Documents (Dealer view) ───────────────────────────────────────────

const MIME_LABEL = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'image/jpeg': 'Image',
  'image/png': 'Image',
};

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

function TenderDocumentsSection({ tenderId }) {
  const [docs, setDocs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    ApiService.getTenderDocuments(tenderId)
      .then((res) => setDocs(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenderId]);

  const handleDownload = async (doc) => {
    setDownloading(doc.id);
    try {
      const res = await ApiService.downloadTenderDocument(tenderId, doc.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: doc.mimeType }));
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    finally { setDownloading(null); }
  };

  if (loading) return null;
  if (!docs.length) return null;

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-slate-400" /> Tender Documents
      </h3>
      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{doc.originalName}</p>
              <p className="text-[10px] text-slate-400">
                {MIME_LABEL[doc.mimeType] ?? 'File'} · {fmtBytes(doc.fileSizeBytes)}
              </p>
            </div>
            <button
              onClick={() => handleDownload(doc)}
              disabled={downloading === doc.id}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40 transition-colors"
            >
              {downloading === doc.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />
              }
              Download
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

const TimelineItem = ({ label, date, done, active, last }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 border-2 ${
        done    ? "bg-emerald-500 border-emerald-500" :
        active  ? "bg-indigo-500 border-indigo-500 ring-2 ring-indigo-200" :
                  "bg-white border-slate-300"
      }`} />
      {!last && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[1.25rem]" />}
    </div>
    <div className="pb-4 min-w-0">
      <div className={`text-xs font-semibold ${done ? "text-emerald-700" : active ? "text-indigo-700" : "text-slate-400"}`}>
        {label}
      </div>
      <div className="text-xs text-slate-400 mt-0.5">{fmtDate(date)}</div>
    </div>
  </div>
);

// ── Shared micro-components ───────────────────────────────────────────────────

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
      <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">{icon}{label}</div>
      <div className="font-semibold text-slate-800 text-sm truncate">{value}</div>
    </div>
  );
}

function FactRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`font-medium text-right ${highlight ? "text-amber-600" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DealerTenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tender, setTender]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getTenderById(id);
      setTender(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tender details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const goBack = () => navigate("/dealer/tenders");

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading tender details…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 space-y-4">
        <button onClick={goBack} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Tenders
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
          <button onClick={load} className="ml-auto flex items-center gap-1 text-red-600 hover:underline text-xs">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tender) return null;

  // ── Derived state ────────────────────────────────────────────────────────────
  const displayStatus = getDisplayStatus(tender);
  const statusCfg     = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG[tender.status] ?? { cls: "bg-slate-100 text-slate-500 border-slate-200", label: tender.status, dot: "bg-slate-400" };
  const mySubmission  = tender.submissions?.[0] ?? null;
  const subCfg        = mySubmission ? (SUBMISSION_STATUS[mySubmission.status] ?? { cls: "bg-slate-100 text-slate-500", label: mySubmission.status }) : null;

  const isOpen      = tender.status === "OPEN";
  const isScheduled = tender.status === "SCHEDULED";
  const canSubmit   = isOpen && !mySubmission;
  // Bid counts are competitively sensitive during an open sealed-bid process
  const bidsVisible = !["SCHEDULED", "OPEN"].includes(tender.status);
  const scrap       = tender.scrapRecord;
  const primaryImg = scrap?.images?.[0];
  const imgSrc     = primaryImg ? (primaryImg.url || primaryImg.publicUrl || primaryImg.path) : null;
  const now        = new Date();
  const passed     = (dt) => dt && new Date(dt) <= now;

  // Build timeline steps
  const timelineSteps = [
    { label: "Published",           date: tender.publishedAt,          show: !!tender.publishedAt },
    { label: "Opens for Bids",      date: tender.opensAt,               show: true },
    { label: "Submission Deadline", date: tender.closesAt,              show: true },
    { label: "Evaluation Started",  date: tender.evaluationStartedAt,   show: !!tender.evaluationStartedAt },
    { label: "Tender Awarded",      date: tender.closedAt,              show: tender.status === "AWARDED" },
    { label: "Cancelled",           date: tender.cancelledAt,           show: tender.status === "CANCELLED" },
    { label: "Unsuccessful",        date: tender.closedAt,              show: tender.status === "UNSUCCESSFUL" },
  ].filter((s) => s.show);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={goBack} className="hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Tenders
        </button>
        <span className="text-slate-300">/</span>
        <span className="font-mono text-slate-400">{tender.ref}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            <span className="text-xs font-mono text-slate-400">{tender.ref}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {scrap?.category?.name || tender.title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {Number(tender.quantityKg).toLocaleString()} kg
            {tender.locationLabel || scrap?.locationLabel
              ? ` · ${tender.locationLabel || scrap.locationLabel}`
              : ""}
          </p>
        </div>
      </div>

      {/* Closing soon banner */}
      {displayStatus === "CLOSING_SOON" && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-xl p-3.5 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span><strong>Closing soon —</strong> {countdown(tender.closesAt)}. Submit your offer before the deadline.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─────────────── MAIN COLUMN ─────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Scrap overview */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {imgSrc ? (
              <div className="h-48 sm:h-56 overflow-hidden bg-slate-100">
                <img src={imgSrc} alt={tender.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-28 bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                <Package className="w-10 h-10 text-slate-300" />
              </div>
            )}
            <div className="p-5 space-y-4">
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Scrap Material</div>
                <h2 className="font-bold text-slate-900 text-lg leading-snug">
                  {scrap?.category?.name || scrap?.description || tender.title}
                </h2>
                {scrap?.category?.name && scrap?.description && scrap.description !== scrap.category.name && (
                  <p className="text-sm text-slate-500 mt-0.5">{scrap.description}</p>
                )}
              </div>
              {tender.description && (
                <p className="text-sm text-slate-600 leading-relaxed">{tender.description}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <InfoCard label="Quantity" value={`${Number(tender.quantityKg).toLocaleString()} kg`} />
                <InfoCard
                  label="Location"
                  value={tender.locationLabel || scrap?.locationLabel || "—"}
                  icon={<MapPin className="w-3 h-3" />}
                />
                {bidsVisible && (
                  <InfoCard
                    label="Bids Received"
                    value={`${tender.submissionCount ?? 0}`}
                    icon={<Users className="w-3 h-3" />}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Tender schedule */}
          <section className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-5">Tender Schedule</h3>
            <div>
              {timelineSteps.map((step, i) => (
                <TimelineItem
                  key={step.label}
                  label={step.label}
                  date={step.date}
                  done={passed(step.date)}
                  active={!passed(step.date) && (i === 0 || passed(timelineSteps[i - 1]?.date))}
                  last={i === timelineSteps.length - 1}
                />
              ))}
            </div>
          </section>

          {/* Terms & Conditions */}
          {tender.terms && (
            <section className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Terms & Conditions
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{tender.terms}</p>
            </section>
          )}

          {/* Tender documents */}
          <TenderDocumentsSection tenderId={tender.id} />

          {/* Issuing industry */}
          {scrap?.owner && (
            <section className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Issued By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                  {(scrap.owner.companyName || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{scrap.owner.companyName}</div>
                  {scrap.owner.businessType && (
                    <div className="text-xs text-slate-400 mt-0.5">{scrap.owner.businessType}</div>
                  )}
                </div>
              </div>
            </section>
          )}

        </div>

        {/* ─────────────── SIDEBAR COLUMN ─────────────── */}
        <div className="space-y-4">

          {/* Quick facts */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Quick Facts</h3>
            <FactRow label="Tender Ref" value={<span className="font-mono">{tender.ref}</span>} />
            <FactRow label="Quantity" value={`${Number(tender.quantityKg).toLocaleString()} kg`} />
            <FactRow label="Location" value={tender.locationLabel || scrap?.locationLabel || "—"} />
            {tender.publishedAt && <FactRow label="Published" value={fmtDateShort(tender.publishedAt)} />}
            <FactRow label="Opens" value={fmtDate(tender.opensAt)} highlight={isScheduled} />
            <FactRow label="Deadline" value={fmtDate(tender.closesAt)} highlight={isOpen} />
            {isOpen && tender.closesAt && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold pt-0.5 ${isClosingSoon(tender.closesAt) ? "text-orange-600" : "text-amber-600"}`}>
                <Clock className="w-3.5 h-3.5" /> {countdown(tender.closesAt)}
              </div>
            )}
          </section>

          {/* Scheduled — not yet open */}
          {isScheduled && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl p-4 text-sm text-center space-y-1">
              <Clock className="w-4 h-4 mx-auto text-indigo-400" />
              <p className="font-semibold">Not yet open</p>
              <p className="text-xs text-indigo-500">Opens for bids on</p>
              <p className="text-xs font-mono font-semibold">{fmtDate(tender.opensAt)}</p>
            </div>
          )}

          {/* Submit CTA — prominent when open and not yet submitted */}
          {canSubmit && (
            <button onClick={() => navigate(`/dealer/tenders/${tender.id}/submit`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
              <Shield className="w-4 h-4" /> Submit Sealed Offer
            </button>
          )}

          {/* Already submitted — cannot resubmit */}
          {mySubmission && isOpen && (
            <div className="text-center text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-200">
              You have already submitted an offer. Only one offer per tender is allowed.
            </div>
          )}

          {/* My submission status */}
          {mySubmission && (
            <section className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" /> My Submission
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${subCfg?.cls}`}>
                    {subCfg?.label}
                  </span>
                </div>
                <FactRow label="Price / kg" value={fmtCcy(mySubmission.pricePerKg)} />
                <FactRow label="Total Value" value={fmtCcy(mySubmission.totalValue)} />
                {mySubmission.paymentTerms && (
                  <FactRow label="Payment Terms" value={mySubmission.paymentTerms.replace(/_/g, " ")} />
                )}
                {mySubmission.note && (
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mt-1">{mySubmission.note}</div>
                )}
                {mySubmission.status === "SELECTED" && (
                  <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs pt-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Your offer was selected — you won!
                  </div>
                )}
                {mySubmission.status === "DISQUALIFIED" && mySubmission.disqualificationReason && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 mt-1">
                    Reason: {mySubmission.disqualificationReason}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Award & payment details for winning dealer */}
          {tender.award && mySubmission?.status === "SELECTED" && (
            <section className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <h3 className="font-semibold text-purple-900 text-sm mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" /> Award & Payment
              </h3>
              <div className="space-y-2.5">
                <FactRow label="Final Price / kg" value={fmtCcy(tender.award.finalPricePerKg)} />
                <FactRow label="Total Value" value={fmtCcy(tender.award.finalTotalValue)} />
                <FactRow label="Quantity" value={`${Number(tender.award.quantityKg).toLocaleString()} kg`} />
                {tender.award.paymentTerms && (
                  <FactRow label="Payment Terms" value={tender.award.paymentTerms.replace(/_/g, " ")} />
                )}
                <FactRow
                  label="Payment Due By"
                  value={fmtDateShort(tender.award.paymentDeadline)}
                  highlight={tender.award.paymentStatus !== "PAID"}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Payment Status</span>
                  <span className={`font-semibold ${tender.award.paymentStatus === "PAID" ? "text-emerald-700" : "text-amber-600"}`}>
                    {tender.award.paymentStatus === "PAID" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Terminal messages */}
          {tender.status === "CANCELLED" && !mySubmission && (
            <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-xl p-4 text-sm text-center">
              This tender has been cancelled.
            </div>
          )}
          {tender.status === "UNSUCCESSFUL" && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-4 text-sm text-center">
              No eligible submissions were received.
            </div>
          )}
          {tender.status === "CLOSED" && !mySubmission && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-4 text-sm text-center">
              This tender is closed for new submissions.
            </div>
          )}
          {tender.status === "UNDER_EVALUATION" && !mySubmission && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm text-center">
              This tender is under evaluation.
            </div>
          )}

          {/* Confidentiality note */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-400 flex gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Submitted offers are sealed. Competitor bid prices are never disclosed.
          </div>

        </div>
      </div>

    </div>
  );
}
