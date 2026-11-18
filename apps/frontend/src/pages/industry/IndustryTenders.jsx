import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Plus, ChevronRight, AlertCircle,
  Eye, Loader2, RefreshCw, Search, Upload, Trash2, Download, Paperclip, X,
  Award, CheckCircle2,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import { getScraps } from "../../core/services/scrap.service";

// ── Status helpers ────────────────────────────────────────────────────────────

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


const StatusBadge = ({ status, map = STATUS_BADGE, size = "sm" }) => {
  const b = map[status] ?? { cls: "bg-slate-100 text-slate-500", label: status };
  const sz = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return <span className={`inline-flex items-center rounded-full font-medium ${sz} ${b.cls}`}>{b.label}</span>;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtCcy  = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
const deadlineCountdown = (dt) => {
  if (!dt) return null;
  const diff = new Date(dt) - new Date();
  if (diff <= 0) return "Deadline passed";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d left`;
  return `${h}h ${m}m left`;
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "all",             label: "All" },
  { key: "OPEN",            label: "Open" },
  { key: "UNDER_EVALUATION", label: "Evaluating" },
  { key: "AWARDED",         label: "Awarded" },
  { key: "CANCELLED",       label: "Cancelled / Unsuccessful" },
];

// ── Create Tender Modal ───────────────────────────────────────────────────────

const CreateTenderModal = ({ isOpen, onClose, onSuccess }) => {
  const EMPTY = { scrapRecordId: "", quantityKg: "", reservePricePerKg: "", opensAt: "", closesAt: "", title: "", description: "", terms: "", locationLabel: "" };
  const [form, setForm]   = useState(EMPTY);
  const [scraps, setScraps] = useState([]);
  const [scrapsLoading, setScrapsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!isOpen) return; setForm(EMPTY); setError(null); setScrapsLoading(true); getScraps().then((r) => setScraps(r.data || [])).catch(() => {}).finally(() => setScrapsLoading(false)); }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const selectedScrap = scraps.find((s) => s.id === form.scrapRecordId);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.closesAt) { setError("Submission deadline is required"); return; }
    setSubmitting(true);
    try {
      await ApiService.createTender({
        scrapRecordId:    form.scrapRecordId,
        title:            form.title        || undefined,
        description:      form.description  || undefined,
        terms:            form.terms        || undefined,
        locationLabel:    form.locationLabel || undefined,
        quantityKg:       Number(form.quantityKg),
        reservePricePerKg: form.reservePricePerKg ? Number(form.reservePricePerKg) : undefined,
        opensAt:          form.opensAt  || undefined,
        closesAt:         form.closesAt,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tender");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" /> Create Tender
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800">
            <strong>Sealed tender:</strong> Dealers submit confidential offers before the deadline. All prices are hidden until you start evaluation. You then review and award the best offer.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scrap from Inventory *</label>
            {scrapsLoading ? (
              <div className="text-xs text-slate-400 py-2">Loading inventory…</div>
            ) : (
              <select required value={form.scrapRecordId} onChange={set("scrapRecordId")}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none">
                <option value="" disabled>Select scrap record</option>
                {scraps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.description || s.category?.name || "Untitled"} — {s.availableQuantityKg} kg available
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedScrap && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <div><span className="text-slate-400 block">Category</span><span className="font-medium">{selectedScrap.category?.name || "—"}</span></div>
              <div><span className="text-slate-400 block">Available</span><span className="font-medium">{selectedScrap.availableQuantityKg} kg</span></div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tender Title</label>
            <input value={form.title} onChange={set("title")} placeholder="Auto-generated from scrap if blank"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={2}
              placeholder="Brief description of the scrap material and tender purpose"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions</label>
            <textarea value={form.terms} onChange={set("terms")} rows={3}
              placeholder="Payment terms, pickup requirements, special conditions…"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Location</label>
            <input value={form.locationLabel} onChange={set("locationLabel")} placeholder="e.g. Plant Gate 3, Mumbai"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (kg) *</label>
              <input required type="number" min="1" value={form.quantityKg} onChange={set("quantityKg")}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reserve Price / kg (₹)</label>
              <input type="number" min="0" value={form.reservePricePerKg} onChange={set("reservePricePerKg")}
                placeholder="Minimum price (hidden)"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opens At</label>
              <input type="datetime-local" value={form.opensAt} onChange={set("opensAt")}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Closes At (Deadline) *</label>
              <input required type="datetime-local" value={form.closesAt} onChange={set("closesAt")}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors">
              {submitting ? "Creating…" : "Create Tender"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Tender Documents Panel (Industry side — in drawer) ────────────────────────

const MIME_ICON = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'image/jpeg': '🖼',
  'image/png': '🖼',
};

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

// eslint-disable-next-line no-unused-vars
const TenderDocumentsPanel = ({ tender, onUploaded }) => {
  const [docs, setDocs]       = useState([]);
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
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await ApiService.downloadTenderDocument(tender.id, doc.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: doc.mimeType }));
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* show nothing — download link error */ }
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
              <span className="text-sm shrink-0">{MIME_ICON[doc.mimeType] ?? '📎'}</span>
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
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
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
            : <><Upload className="w-3.5 h-3.5" /> Upload document (PDF, Word, Excel, Image — max 10 MB)</>
          }
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            disabled={uploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={handleUpload}
          />
        </label>
      )}

      {!canUpload && (
        <p className="text-xs text-slate-400 italic">Documents are locked after publishing.</p>
      )}
    </div>
  );
};

// ── Disqualify Dialog ─────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
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
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="pt-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <AlertCircle className="inline w-3.5 h-3.5 mr-1" />
            You are disqualifying <strong>{target.dealerName || "this dealer"}</strong>'s submission. They will be notified with this reason.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Disqualification *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="e.g. Payment terms do not meet requirements, incomplete documentation…"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none resize-none" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="button" disabled={!reason.trim() || loading} onClick={() => onConfirm(target.subId, reason.trim())}
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

// eslint-disable-next-line no-unused-vars
const AwardConfirmDialog = ({ target, tender, onClose, onConfirm, loading }) => {
  if (!target || !tender) return null;
  const { submission } = target;
  const reserveOk = !tender.reservePricePerKg || Number(submission.pricePerKg) >= Number(tender.reservePricePerKg);
  // eslint-disable-next-line react-hooks/purity
  const payDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" /> Confirm Award
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700"><X size={20} /></button>
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
                ? `Offer meets reserve price — ${fmtCcy(submission.pricePerKg)}/kg ≥ ${fmtCcy(tender.reservePricePerKg)}/kg`
                : `Offer below reserve price — ${fmtCcy(submission.pricePerKg)}/kg < ${fmtCcy(tender.reservePricePerKg)}/kg (award will be rejected by server)`
              }
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            This action is irreversible. All other submissions will be marked as not selected and both parties will be notified.
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="button" disabled={loading} onClick={() => onConfirm(target.subId)}
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

export default function IndustryTenders() {
  const navigate = useNavigate();

  const [tenders, setTenders]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [tab, setTab]               = useState("all");
  const [search, setSearch]         = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getTenders();
      setTenders(res.data?.data || []);
    } catch {
      setError("Failed to load tenders");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const filtered = tenders.filter((t) => {
    const matchTab = tab === "all" ? true
      : tab === "CANCELLED" ? ["CANCELLED", "UNSUCCESSFUL"].includes(t.status)
      : t.status === tab;
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.ref?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenders</h1>
          <p className="text-sm text-slate-500 mt-1">Sealed-bid tenders for your scrap inventory</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Tender
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",       val: tenders.length,                                       color: "text-slate-700" },
          { label: "Open",        val: tenders.filter((t) => t.status === "OPEN").length,     color: "text-emerald-600" },
          { label: "Evaluating",  val: tenders.filter((t) => t.status === "UNDER_EVALUATION").length, color: "text-blue-600" },
          { label: "Awarded",     val: tenders.filter((t) => t.status === "AWARDED").length,  color: "text-purple-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${color}`}>{val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                tab === t.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenders…"
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          <button onClick={load} className="ml-auto text-red-600 hover:underline flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">No tenders found</p>
          <p className="text-xs mt-1">Create your first tender to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">{t.ref}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="font-semibold text-slate-900 mt-1 truncate">{t.title}</p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>{Number(t.quantityKg).toLocaleString()} kg</span>
                    <span>{t.scrapRecord?.category?.name || "—"}</span>
                    {t.reservePricePerKg && <span>Reserve: {fmtCcy(t.reservePricePerKg)}/kg</span>}
                    <span>{t.submissionCount} submission{t.submissionCount !== 1 ? "s" : ""}</span>
                  </div>
                  {t.closesAt && (
                    <div className="text-xs text-slate-400 mt-1">
                      Deadline: {fmtDate(t.closesAt)}
                      {["OPEN", "CLOSED"].includes(t.status) && (
                        <span className={`ml-2 font-medium ${new Date(t.closesAt) < new Date() ? "text-red-500" : "text-amber-500"}`}>
                          ({deadlineCountdown(t.closesAt)})
                        </span>
                      )}
                    </div>
                  )}
                  {t.status === "DRAFT" && (
                    <div className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Not visible to dealers — publish to make it live
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.status === "DRAFT" && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await ApiService.publishTender(t.id);
                          load();
                        } catch (err) {
                          alert(err.response?.data?.message || "Publish failed");
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap">
                      <Eye className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}
                  <button onClick={() => navigate(`/industry/tenders/${t.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap">
                    Manage <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateTenderModal isOpen={showCreate} onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); load(); }} />

    </div>
  );
}
