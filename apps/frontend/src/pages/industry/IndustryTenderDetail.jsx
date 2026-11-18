import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package, ChevronLeft, ChevronRight, ChevronDown, AlertCircle, CheckCircle2,
  Eye, Award, Ban, Loader2, RefreshCw,
  Paperclip, Upload, Trash2, Download, FileText, X, Users,
} from "lucide-react";
import ApiService from "../../core/services/api.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtCcy  = (n) => (n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—");
const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};
const deadlineCountdown = (dt) => {
  if (!dt) return null;
  const diff = new Date(dt) - new Date();
  if (diff <= 0) return "Deadline passed";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d left`;
  return `${h}h ${m}m left`;
};

// ── Status badges ─────────────────────────────────────────────────────────────

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

const SUBMISSION_STATUS_BADGE = {
  SUBMITTED:    { cls: "bg-blue-100 text-blue-700",       label: "Submitted"    },
  UNDER_REVIEW: { cls: "bg-amber-100 text-amber-700",     label: "Under Review" },
  ELIGIBLE:     { cls: "bg-emerald-100 text-emerald-700", label: "Eligible"     },
  DISQUALIFIED: { cls: "bg-red-100 text-red-700",         label: "Disqualified" },
  SELECTED:     { cls: "bg-purple-100 text-purple-700",   label: "Selected"     },
  NOT_SELECTED: { cls: "bg-slate-100 text-slate-500",     label: "Not Selected" },
};

const StatusBadge = ({ status, map = STATUS_BADGE, size = "sm" }) => {
  const b = map[status] ?? { cls: "bg-slate-100 text-slate-500", label: status };
  const sz = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return <span className={`inline-flex items-center rounded-full font-medium ${sz} ${b.cls}`}>{b.label}</span>;
};

// ── MIME icons ────────────────────────────────────────────────────────────────

const MIME_ICON = {
  "application/pdf": "📄",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📝",
  "application/vnd.ms-excel": "📊",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "image/jpeg": "🖼",
  "image/png": "🖼",
};

// ── Tender Documents Panel ────────────────────────────────────────────────────

const TenderDocumentsPanel = ({ tender, onUploaded }) => {
  const [docs, setDocs]               = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [deleting, setDeleting]       = useState(null);
  const fileRef = useRef(null);

  const loadDocs = useCallback(async () => {
    setDocsLoading(true);
    try {
      const res = await ApiService.getTenderDocuments(tender.id);
      setDocs(res.data?.data || []);
    } catch { /* non-fatal */ }
    finally { setDocsLoading(false); }
  }, [tender.id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!fileRef.current) fileRef.current = e.target;
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("document", file);
      await ApiService.uploadTenderDocument(tender.id, fd);
      await loadDocs();
      if (onUploaded) onUploaded();
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (docId) => {
    setDeleting(docId);
    try {
      await ApiService.deleteTenderDocument(tender.id, docId);
      setDocs((d) => d.filter((x) => x.id !== docId));
    } catch (err) {
      setUploadError(err.response?.data?.message || "Delete failed");
    } finally { setDeleting(null); }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await ApiService.downloadTenderDocument(tender.id, doc.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: doc.mimeType }));
      const a = document.createElement("a");
      a.href = url; a.download = doc.originalName; a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  const canUpload = ["DRAFT", "SCHEDULED"].includes(tender.status);

  return (
    <div>
      <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-slate-400" /> Documents
        <span className="text-xs text-slate-400 font-normal">({docs.length}/10)</span>
      </h3>

      {uploadError && (
        <div className="mb-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2 flex gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {uploadError}
        </div>
      )}

      {docsLoading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
        </div>
      ) : docs.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">No documents attached yet.</p>
      ) : (
        <div className="space-y-1.5 mb-3">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-sm shrink-0">{MIME_ICON[doc.mimeType] ?? "📎"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{doc.originalName}</p>
                <p className="text-[10px] text-slate-400">{fmtBytes(doc.fileSizeBytes)}</p>
              </div>
              <button onClick={() => handleDownload(doc)} title="Download"
                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
              {canUpload && (
                <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id} title="Delete"
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-40">
                  {deleting === doc.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canUpload && docs.length < 10 && (
        <label className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-dashed cursor-pointer transition-colors ${
          uploading
            ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
            : "border-indigo-300 text-indigo-600 hover:bg-indigo-50"
        }`}>
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
            : <><Upload className="w-3.5 h-3.5" /> Upload document (PDF, Word, Excel, Image — max 10 MB)</>}
          <input ref={fileRef} type="file" className="hidden" disabled={uploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleUpload} />
        </label>
      )}

      {!canUpload && (
        <p className="text-xs text-slate-400 italic">Documents are locked after publishing.</p>
      )}
    </div>
  );
};

// ── Disqualify Dialog ─────────────────────────────────────────────────────────

const DisqualifyDialog = ({ target, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (target) setReason(""); }, [target]);
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">Disqualify Submission</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="pt-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <AlertCircle className="inline w-3.5 h-3.5 mr-1" />
            You are disqualifying <strong>{target.dealerName || "this dealer"}</strong>'s submission.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="e.g. Payment terms do not meet requirements…"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none resize-none" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button disabled={!reason.trim() || loading} onClick={() => onConfirm(target.subId, reason.trim())}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors">
              {loading ? "Disqualifying…" : "Disqualify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Award Confirm Dialog ──────────────────────────────────────────────────────

const AwardConfirmDialog = ({ target, tender, onClose, onConfirm, loading }) => {
  // eslint-disable-next-line react-hooks/purity
  const payDeadline = useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), []);
  if (!target || !tender) return null;
  const { submission } = target;
  const reserveOk = !tender.reservePricePerKg || Number(submission.pricePerKg) >= Number(tender.reservePricePerKg);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" /> Confirm Award
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">Award Summary</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400 block">Tender Ref</span><span className="font-mono font-medium text-slate-800">{tender.ref}</span></div>
              <div><span className="text-slate-400 block">Dealer</span><span className="font-medium text-slate-800">{submission.dealer?.companyName || "—"}</span></div>
              <div><span className="text-slate-400 block">Price / kg</span><span className="font-semibold text-purple-700">{fmtCcy(submission.pricePerKg)}</span></div>
              <div><span className="text-slate-400 block">Total Value</span><span className="font-semibold text-purple-700">{fmtCcy(submission.totalValue)}</span></div>
              <div><span className="text-slate-400 block">Quantity</span><span className="font-medium text-slate-800">{Number(tender.quantityKg).toLocaleString()} kg</span></div>
              <div><span className="text-slate-400 block">Payment Terms</span><span className="font-medium text-slate-800">{submission.paymentTerms?.replace(/_/g, " ") || "—"}</span></div>
              <div className="col-span-2"><span className="text-slate-400 block">Payment Deadline</span><span className="font-medium text-slate-800">{payDeadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
            </div>
          </div>
          {tender.reservePricePerKg != null && (
            <div className={`rounded-xl p-3 text-xs flex items-center gap-2 ${reserveOk ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {reserveOk ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {reserveOk
                ? `Offer meets reserve — ${fmtCcy(submission.pricePerKg)}/kg ≥ ${fmtCcy(tender.reservePricePerKg)}/kg`
                : `Below reserve — ${fmtCcy(submission.pricePerKg)}/kg < ${fmtCcy(tender.reservePricePerKg)}/kg`}
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            This action is irreversible. All other submissions will be marked not selected.
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button disabled={loading} onClick={() => onConfirm(target.subId)}
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Awarding…</> : <><Award className="w-4 h-4" /> Confirm Award</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function IndustryTenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tender, setTender]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState(null);
  const [awardingId, setAwardingId]       = useState(null);
  const [disqualifyTarget, setDisqualifyTarget] = useState(null);
  const [awardTarget, setAwardTarget]           = useState(null);
  const [subDocsMap, setSubDocsMap]             = useState({});
  const [subDocsLoading, setSubDocsLoading]     = useState({});
  const [evalNoteMap, setEvalNoteMap]           = useState({});
  const [savingNote, setSavingNote]             = useState(null);
  const [expandedSubs, setExpandedSubs]         = useState(new Set());
  const submissionsRef = useRef(null);

  const loadTender = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getTenderById(id);
      setTender(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tender");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTender(); }, [loadTender]);

  const refreshTender = useCallback(async () => {
    try {
      const res = await ApiService.getTenderById(id);
      setTender(res.data?.data);
    } catch { /* silent — keep stale data */ }
  }, [id]);

  const doAction = async (fn, onDone) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await fn();
      if (onDone) onDone(); else await refreshTender();
    } catch (err) {
      setActionError(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const publish      = () => doAction(() => ApiService.publishTender(id));
  const startEval    = () => doAction(() => ApiService.startTenderEvaluation(id));
  const cancelTender = () => doAction(() => ApiService.cancelTender(id), () => navigate("/industry/tenders"));

  const award = (submissionId) => {
    const sub = tender.submissions?.find((s) => s.id === submissionId);
    setAwardTarget({ subId: submissionId, submission: sub });
  };
  const confirmAward = (submissionId) => {
    setAwardingId(submissionId);
    doAction(() => ApiService.awardTender(id, submissionId))
      .finally(() => { setAwardingId(null); setAwardTarget(null); });
  };
  const confirmDisqualify = (subId, reason) => {
    doAction(() => ApiService.updateTenderSubmission(id, subId, {
      status: "DISQUALIFIED",
      disqualificationReason: reason,
    })).finally(() => setDisqualifyTarget(null));
  };
  const setSubmissionStatus = (subId, status) =>
    doAction(() => ApiService.updateTenderSubmission(id, subId, { status }));

  const toggleSubDocs = async (subId) => {
    if (subDocsMap[subId]) { setSubDocsMap((p) => ({ ...p, [subId]: null })); return; }
    setSubDocsLoading((p) => ({ ...p, [subId]: true }));
    try {
      const res = await ApiService.listSubmissionDocuments(id, subId);
      setSubDocsMap((p) => ({ ...p, [subId]: res.data?.data || [] }));
    } catch { setSubDocsMap((p) => ({ ...p, [subId]: [] })); }
    finally { setSubDocsLoading((p) => ({ ...p, [subId]: false })); }
  };

  const downloadSubDoc = async (subId, doc) => {
    try {
      const res = await ApiService.downloadSubmissionDocument(id, subId, doc.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: doc.mimeType }));
      const a = document.createElement("a"); a.href = url; a.download = doc.originalName; a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  const toggleExpandSub = (subId) =>
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId); else next.add(subId);
      return next;
    });

  const saveEvalNote = async (subId) => {
    const note = evalNoteMap[subId] ?? "";
    setSavingNote(subId);
    try {
      await ApiService.updateTenderSubmission(id, subId, { evaluationNote: note });
      await refreshTender();
      setEvalNoteMap((p) => ({ ...p, [subId]: undefined }));
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save note");
    } finally { setSavingNote(null); }
  };

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading && !tender) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error && !tender) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-12">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadTender}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            <button onClick={() => navigate("/industry/tenders")}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Tenders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Breadcrumb + back */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <button onClick={() => navigate("/industry/tenders")}
          className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium">
          <ChevronLeft className="w-3.5 h-3.5" /> Tenders
        </button>
        <span>/</span>
        <span className="text-slate-500 truncate max-w-[200px]">{tender?.title || "Loading…"}</span>
      </div>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {tender && <StatusBadge status={tender.status} />}
            {tender && <span className="text-xs font-mono text-slate-400">{tender.ref}</span>}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{tender?.title}</h1>
          {tender?.description && (
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{tender.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={loadTender} disabled={loading} title="Refresh"
            className="p-2 text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-lg transition-colors disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => navigate("/industry/tenders")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {actionError}
        </div>
      )}

      {/* Submission summary strip */}
      {tender && tender.status !== "DRAFT" && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{tender.submissionCount ?? 0}</div>
              <div className="text-xs text-slate-500">Dealer Submission{tender.submissionCount !== 1 ? "s" : ""}</div>
            </div>
          </div>
          {(tender.uniqueDealerCount ?? 0) > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{tender.uniqueDealerCount}</div>
                <div className="text-xs text-slate-500">Unique Dealer{tender.uniqueDealerCount !== 1 ? "s" : ""}</div>
              </div>
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={() => submissionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              View Dealer Submissions <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main 2-column grid (left: details; right: submissions) */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* ── LEFT: Tender details ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Overview card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 text-sm mb-4">Tender Overview</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-slate-400">Category</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{tender?.scrapRecord?.category?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Quantity</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{tender ? `${Number(tender.quantityKg).toLocaleString()} kg` : "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Reserve Price</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{tender?.reservePricePerKg ? `${fmtCcy(tender.reservePricePerKg)}/kg` : "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Location</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{tender?.locationLabel || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Opens</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{fmtDate(tender?.opensAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Deadline</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {fmtDate(tender?.closesAt)}
                  {tender?.closesAt && ["OPEN", "CLOSED"].includes(tender.status) && (
                    <span className={`ml-1 font-semibold ${new Date(tender.closesAt) < new Date() ? "text-red-500" : "text-amber-500"}`}>
                      ({deadlineCountdown(tender.closesAt)})
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Submissions</dt>
                <dd className="font-bold text-indigo-600 mt-0.5">{tender?.submissionCount ?? 0}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Unique Dealers</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{tender?.uniqueDealerCount ?? 0}</dd>
              </div>
            </dl>

            {tender?.terms && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <dt className="text-xs text-slate-400 mb-1">Terms &amp; Conditions</dt>
                <dd className="text-xs text-slate-600 whitespace-pre-line">{tender.terms}</dd>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 text-sm mb-4">Actions</h2>
            <div className="flex flex-wrap gap-2">
              {tender?.status === "DRAFT" && (
                <button onClick={publish} disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors">
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                  Publish Tender
                </button>
              )}
              {["OPEN", "CLOSED"].includes(tender?.status) && (
                <button onClick={startEval} disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                  Start Evaluation
                </button>
              )}
              {tender && !["AWARDED", "CANCELLED", "UNSUCCESSFUL"].includes(tender.status) && (
                <button onClick={cancelTender} disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition-colors">
                  <Ban className="w-3.5 h-3.5" /> Cancel Tender
                </button>
              )}
              {tender && ["AWARDED", "CANCELLED", "UNSUCCESSFUL"].includes(tender.status) && (
                <p className="text-xs text-slate-400 italic">No further actions available.</p>
              )}
            </div>
          </div>

          {/* Documents */}
          {tender && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <TenderDocumentsPanel tender={tender} onUploaded={refreshTender} />
            </div>
          )}

          {/* Award summary */}
          {tender?.status === "AWARDED" && tender?.award && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <h3 className="font-semibold text-purple-900 text-sm mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Award Summary
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-purple-600">Winner</dt><dd className="font-medium text-purple-900 mt-0.5">{tender.award.dealer?.companyName}</dd></div>
                <div><dt className="text-purple-600">Price/kg</dt><dd className="font-semibold text-purple-900 mt-0.5">{fmtCcy(tender.award.finalPricePerKg)}</dd></div>
                <div><dt className="text-purple-600">Total Value</dt><dd className="font-semibold text-purple-900 mt-0.5">{fmtCcy(tender.award.finalTotalValue)}</dd></div>
                <div><dt className="text-purple-600">Payment Due</dt><dd className="font-medium text-purple-900 mt-0.5">{fmtDate(tender.award.paymentDeadline)}</dd></div>
              </dl>
            </div>
          )}
        </div>

        {/* ── RIGHT: Submissions ──────────────────────────────────────────── */}
        <div ref={submissionsRef} className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5">

            {/* Sealed preview (OPEN / CLOSED / SCHEDULED) */}
            {tender && ["OPEN", "CLOSED", "SCHEDULED"].includes(tender.status) && (
              <>
                <h2 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  Sealed Submissions
                  <span className="text-xs font-normal text-slate-400">({tender.submissions?.length || 0})</span>
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4 flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Offer prices are sealed until you start evaluation. Dealer names are shown for reference only.
                </div>
                {!tender.submissions?.length ? (
                  <div className="text-center py-10 text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm font-medium">No submissions yet</p>
                    <p className="text-xs mt-1">Dealers will appear here once they submit offers.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tender.submissions.map((s) => (
                      <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-lg text-xs overflow-hidden">
                        <div className="px-3 py-2.5 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 truncate">{s.dealer?.companyName || "—"}</div>
                            <div className="text-slate-400 text-[10px] flex flex-wrap items-center gap-x-2 mt-0.5">
                              <span className="font-mono">SUB-{s.id.slice(0, 8).toUpperCase()}</span>
                              {s.dealer?.city && <span>· {s.dealer.city}</span>}
                              {s.submittedAt && <span>· {fmtDate(s.submittedAt)}</span>}
                            </div>
                          </div>
                          <span className="text-slate-300 font-mono text-[10px] shrink-0">Sealed</span>
                          <StatusBadge status={s.status} map={SUBMISSION_STATUS_BADGE} size="xs" />
                          <button
                            onClick={() => toggleExpandSub(s.id)}
                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded hover:bg-indigo-100 transition-colors shrink-0">
                            Details {expandedSubs.has(s.id) ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                        {expandedSubs.has(s.id) && (
                          <div className="border-t border-slate-200 px-3 py-3 bg-white space-y-2.5">
                            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Submission Details</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                              <div>
                                <span className="text-slate-400 block">Reference</span>
                                <span className="font-mono font-medium text-slate-700">SUB-{s.id.slice(0, 8).toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Submitted</span>
                                <span className="text-slate-700">{fmtDate(s.submittedAt)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Company</span>
                                <span className="text-slate-700">{s.dealer?.companyName || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">City</span>
                                <span className="text-slate-700">{s.dealer?.city || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Offer Price</span>
                                <span className="text-slate-300 italic">Sealed until evaluation</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Payment Terms</span>
                                <span className="text-slate-700">{s.paymentTerms ? s.paymentTerms.replace(/_/g, " ") : "—"}</span>
                              </div>
                            </div>
                            {s.note && (
                              <div className="pt-2 border-t border-slate-100 text-[10px]">
                                <span className="text-slate-400 block mb-0.5">Dealer Note</span>
                                <span className="text-slate-700 italic">{s.note}</span>
                              </div>
                            )}
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-amber-600">
                              <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                              Offer price and uploaded documents are visible after you start evaluation.
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Evaluation table (UNDER_EVALUATION / AWARDED / UNSUCCESSFUL / CANCELLED) */}
            {tender && ["UNDER_EVALUATION", "AWARDED", "UNSUCCESSFUL", "CANCELLED"].includes(tender.status) && (
              <>
                <h2 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  Dealer Submissions
                  <span className="text-xs font-normal text-slate-400">({tender.submissions?.length || 0})</span>
                </h2>
                {!tender.submissions?.length ? (
                  <div className="text-center py-10 text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm font-medium">No submissions received</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tender.submissions.map((s) => (
                      <div key={s.id} className={`rounded-xl border text-xs ${
                        s.status === "SELECTED"     ? "border-purple-200 bg-purple-50" :
                        s.status === "DISQUALIFIED" ? "border-red-100 bg-red-50/40" :
                        s.status === "ELIGIBLE"     ? "border-emerald-200 bg-emerald-50/40" :
                        "border-slate-200 bg-white"
                      }`}>
                        {/* Main info row */}
                        <div className="p-3 flex flex-wrap gap-x-5 gap-y-2 items-start">
                          <div className="min-w-[140px]">
                            <div className="font-semibold text-slate-800">{s.dealer?.companyName || "—"}</div>
                            <div className="text-slate-400 text-[10px] mt-0.5 space-x-1">
                              <span className="font-mono">SUB-{s.id.slice(0, 8).toUpperCase()}</span>
                              {s.dealer?.city && <span>· {s.dealer.city}</span>}
                            </div>
                            {s.submittedAt && (
                              <div className="text-slate-400 text-[10px] mt-0.5">{fmtDate(s.submittedAt)}</div>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-400">Price/kg</span>
                            <div className="font-bold text-slate-800 mt-0.5">
                              {s.pricePerKg != null ? fmtCcy(s.pricePerKg) : <span className="text-slate-300">Sealed</span>}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Total</span>
                            <div className="font-medium text-slate-700 mt-0.5">{s.totalValue != null ? fmtCcy(s.totalValue) : "—"}</div>
                          </div>
                          {s.paymentTerms && (
                            <div>
                              <span className="text-slate-400">Terms</span>
                              <div className="text-slate-600 mt-0.5">{s.paymentTerms.replace(/_/g, " ")}</div>
                            </div>
                          )}
                          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={s.status} map={SUBMISSION_STATUS_BADGE} size="xs" />
                            <button
                              onClick={() => {
                                const opening = !expandedSubs.has(s.id);
                                toggleExpandSub(s.id);
                                if (opening && !subDocsMap[s.id] && !subDocsLoading[s.id]) {
                                  toggleSubDocs(s.id);
                                }
                              }}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 rounded hover:bg-indigo-100 transition-colors">
                              {expandedSubs.has(s.id) ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                              Details
                            </button>
                          </div>
                        </div>

                        {/* Evaluation note display */}
                        {s.evaluationNote && evalNoteMap[s.id] === undefined && (
                          <div className="px-3 pb-2 text-[10px] text-slate-500 italic">
                            Note: {s.evaluationNote}
                          </div>
                        )}

                        {/* Action bar (evaluation phase only) */}
                        {tender.status === "UNDER_EVALUATION" && (
                          <div className="border-t border-slate-100 px-3 py-2 flex flex-wrap gap-1.5 items-center">
                            {s.status !== "ELIGIBLE" && s.status !== "SELECTED" && (
                              <button onClick={() => setSubmissionStatus(s.id, "ELIGIBLE")}
                                disabled={actionLoading}
                                className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 disabled:opacity-50">
                                Mark Eligible
                              </button>
                            )}
                            {s.status !== "DISQUALIFIED" && s.status !== "SELECTED" && (
                              <button onClick={() => setDisqualifyTarget({ subId: s.id, dealerName: s.dealer?.companyName })}
                                disabled={actionLoading}
                                className="px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50">
                                Disqualify
                              </button>
                            )}
                            {s.status !== "DISQUALIFIED" && s.status !== "SELECTED" && (
                              <button onClick={() => award(s.id)}
                                disabled={actionLoading || !!awardingId}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-0.5">
                                {awardingId === s.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Award className="w-2.5 h-2.5" />}
                                Award
                              </button>
                            )}
                            {s.status === "SELECTED" && (
                              <span className="text-[10px] font-semibold text-purple-700 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Winner
                              </span>
                            )}
                            {/* Evaluation note input */}
                            <div className="ml-auto flex items-center gap-1">
                              <input
                                value={evalNoteMap[s.id] ?? s.evaluationNote ?? ""}
                                onChange={(e) => setEvalNoteMap((p) => ({ ...p, [s.id]: e.target.value }))}
                                placeholder="Evaluation note…"
                                className="px-2 py-0.5 text-[10px] border border-slate-200 rounded bg-white w-36 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                              {evalNoteMap[s.id] !== undefined && (
                                <button onClick={() => saveEvalNote(s.id)} disabled={savingNote === s.id}
                                  className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50">
                                  {savingNote === s.id ? "…" : "Save"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dealer note */}
                        {s.note && (
                          <div className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-500">
                            <span className="font-medium text-slate-600">Dealer note:</span> {s.note}
                          </div>
                        )}

                        {/* Disqualification reason */}
                        {s.status === "DISQUALIFIED" && s.disqualificationReason && (
                          <div className="border-t border-red-100 px-3 py-2 text-[10px] text-red-600">
                            Reason: {s.disqualificationReason}
                          </div>
                        )}

                        {/* Inline Details expansion */}
                        {expandedSubs.has(s.id) && (
                          <div className="border-t border-slate-100 px-3 py-3 bg-slate-50/50 space-y-3">
                            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Submission Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[10px]">
                              <div>
                                <span className="text-slate-400 block">Reference</span>
                                <span className="font-mono font-medium text-slate-700">SUB-{s.id.slice(0, 8).toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Submitted</span>
                                <span className="text-slate-700">{fmtDate(s.submittedAt)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Company</span>
                                <span className="text-slate-700">{s.dealer?.companyName || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">City</span>
                                <span className="text-slate-700">{s.dealer?.city || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Offer Price</span>
                                <span className="font-semibold text-slate-800">{s.pricePerKg != null ? fmtCcy(s.pricePerKg) : "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Total Value</span>
                                <span className="font-semibold text-slate-800">{s.totalValue != null ? fmtCcy(s.totalValue) : "—"}</span>
                              </div>
                            </div>

                            {/* Dealer note in details */}
                            {s.note && (
                              <div className="text-[10px]">
                                <span className="text-slate-400 block mb-0.5">Dealer Note</span>
                                <span className="text-slate-700 italic">{s.note}</span>
                              </div>
                            )}

                            {/* Documents */}
                            <div>
                              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                <Paperclip className="w-2.5 h-2.5" /> Submission Documents
                              </div>
                              {subDocsLoading[s.id] ? (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Loading documents…
                                </div>
                              ) : !subDocsMap[s.id] || subDocsMap[s.id].length === 0 ? (
                                <p className="text-[10px] text-slate-400">No documents uploaded with this submission.</p>
                              ) : (
                                <div className="space-y-1">
                                  {subDocsMap[s.id].map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded px-2 py-1.5">
                                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="text-[10px] text-slate-700 flex-1 truncate">{doc.originalName}</span>
                                      <span className="text-[10px] text-slate-400 shrink-0">{fmtBytes(doc.fileSizeBytes)}</span>
                                      <button onClick={() => downloadSubDoc(s.id, doc)} title="Download"
                                        className="p-0.5 text-indigo-500 hover:text-indigo-700 transition-colors">
                                        <Download className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Draft — no submissions section */}
            {tender?.status === "DRAFT" && (
              <div className="text-center py-10 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                <p className="text-sm font-medium">Tender is a draft</p>
                <p className="text-xs mt-1">Publish the tender to allow dealers to submit offers.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Dialogs */}
      <DisqualifyDialog
        target={disqualifyTarget}
        onClose={() => setDisqualifyTarget(null)}
        onConfirm={confirmDisqualify}
        loading={actionLoading}
      />
      <AwardConfirmDialog
        target={awardTarget}
        tender={tender}
        onClose={() => setAwardTarget(null)}
        onConfirm={confirmAward}
        loading={actionLoading && !!awardingId}
      />
    </div>
  );
}
