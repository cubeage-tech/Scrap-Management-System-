import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Shield, AlertCircle, CheckCircle2, Loader2,
  Package, Clock, MapPin, FileText, Upload, X, Info,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import { getStoredUser } from "../../core/services/storage.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtCcy = (n) => (n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—");

const PAYMENT_TERM_LABELS = {
  ADVANCE:  "Advance",
  ON_PICKUP: "On Pickup",
  DAYS_15:  "Net 15 Days",
  DAYS_30:  "Net 30 Days",
  DAYS_45:  "Net 45 Days",
};

const ALLOWED_EXTS = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png";

// ── Step indicator ────────────────────────────────────────────────────────────

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium">
      <div className={`flex items-center gap-1.5 ${step === "form" ? "text-indigo-600" : "text-slate-400"}`}>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "form" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
        Your Offer
      </div>
      <div className="w-6 h-px bg-slate-300" />
      <div className={`flex items-center gap-1.5 ${step === "review" ? "text-indigo-600" : "text-slate-400"}`}>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "review" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
        Review & Confirm
      </div>
    </div>
  );
}

// ── Tender summary banner ─────────────────────────────────────────────────────

function TenderBanner({ tender }) {
  const scrap = tender.scrapRecord;
  const category = scrap?.category?.name;
  const name = category || tender.title;
  const isClosingSoon = tender.closesAt && (new Date(tender.closesAt) - new Date()) < 24 * 3600000;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-indigo-400 font-semibold">{tender.ref}</span>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">Open</span>
          </div>
          <p className="font-bold text-indigo-900 mt-0.5 truncate">{name}</p>
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-indigo-600">
            <span>{Number(tender.quantityKg).toLocaleString()} kg</span>
            {(tender.locationLabel || scrap?.locationLabel) && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {tender.locationLabel || scrap.locationLabel}
              </span>
            )}
            <span className={`flex items-center gap-0.5 font-medium ${isClosingSoon ? "text-orange-600" : ""}`}>
              <Clock className="w-3 h-3" />
              Closes: {fmtDate(tender.closesAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DealerTenderSubmit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const fileRef = useRef(null);

  const [tender, setTender]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState(null);

  const [step, setStep]         = useState("form"); // "form" | "review" | "success"

  const [form, setForm] = useState({
    pricePerKg:   "",
    paymentTerms: "",
    note:         "",
  });
  const [file, setFile]         = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr]   = useState(null);
  const [_submissionId, setSubmissionId] = useState(null);
  const [docUploadErr, setDocUploadErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await ApiService.getTenderById(id);
      const t = res.data?.data;
      setTender(t);

      // Guard: must be OPEN
      if (t?.status !== "OPEN") {
        setLoadErr("This tender is not currently open for submissions.");
      }
      // Guard: already submitted
      if (t?.submissions?.[0]) {
        setLoadErr("You have already submitted an offer for this tender.");
      }
    } catch (err) {
      setLoadErr(err.response?.data?.message || "Failed to load tender details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = () => setFile(null);

  // Validate form → go to review
  const goToReview = (e) => {
    e.preventDefault();
    const price = Number(form.pricePerKg);
    if (!price || price <= 0) return;
    setSubmitErr(null);
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit offer, then upload doc if present
  const handleSubmit = async () => {
    if (!accepted) return;
    setSubmitting(true);
    setSubmitErr(null);
    setDocUploadErr(null);

    try {
      // Step 1: Submit the offer
      const res = await ApiService.submitTenderOffer(id, {
        pricePerKg:   Number(form.pricePerKg),
        paymentTerms: form.paymentTerms || undefined,
        note:         form.note         || undefined,
      });

      const sid = res.data?.data?.id;
      setSubmissionId(sid);

      // Step 2: Upload document if provided
      if (file && sid) {
        try {
          const fd = new FormData();
          fd.append("document", file);
          await ApiService.uploadSubmissionDocument(id, sid, fd);
        } catch (docErr) {
          setDocUploadErr(docErr.response?.data?.message || "Offer submitted — document upload failed.");
        }
      }

      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitErr(err.response?.data?.message || "Failed to submit offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = form.pricePerKg && tender?.quantityKg
    ? Number(form.pricePerKg) * Number(tender.quantityKg)
    : null;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading tender…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (loadErr || !tender) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <button onClick={() => navigate(`/dealer/tenders/${id}`)}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Tender
        </button>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-semibold">Cannot Submit Offer</p>
            <p className="mt-0.5">{loadErr || "Tender not found."}</p>
            <button onClick={() => navigate(`/dealer/tenders/${id}`)}
              className="mt-2 text-xs font-semibold text-amber-700 hover:underline">
              ← View tender details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-900">Offer Submitted</h2>
          <p className="text-sm text-emerald-700">
            Your sealed offer has been recorded. The industry will notify you once evaluation begins.
          </p>
          {docUploadErr && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg p-3 flex gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {docUploadErr}
            </div>
          )}
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-700 flex gap-2">
          <Shield className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
          Your price and terms are sealed and will not be visible until the evaluation phase begins.
        </div>
        <button onClick={() => navigate(`/dealer/tenders/${id}`)}
          className="w-full py-2.5 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
          ← Back to Tender Details
        </button>
      </div>
    );
  }

  // ── Step 2: Review & Confirm ──────────────────────────────────────────────────
  if (step === "review") {
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <button onClick={() => navigate(`/dealer/tenders/${id}`)}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Tender
          </button>
          <h1 className="text-xl font-bold text-slate-900">Submit Sealed Offer</h1>
          <p className="text-xs text-slate-500 mt-0.5">{tender.scrapRecord?.category?.name || tender.title}</p>
        </div>

        <StepDots step="review" />

        <TenderBanner tender={tender} />

        {/* Review summary */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Review Your Offer</h2>

          {currentUser?.organisation?.companyName && (
            <div className="bg-slate-50 rounded-lg p-3 text-xs">
              <span className="text-slate-400 block mb-0.5">Submitting As</span>
              <span className="font-semibold text-slate-800">{currentUser.organisation.companyName}</span>
              {currentUser.organisation.city && (
                <span className="text-slate-500 ml-2">{currentUser.organisation.city}</span>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Price / kg</span>
              <span className="font-bold text-slate-900">{fmtCcy(form.pricePerKg)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Estimated Total</span>
              <span className="font-semibold text-indigo-700">{totalValue != null ? fmtCcy(totalValue) : "—"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Quantity</span>
              <span className="font-medium text-slate-700">{Number(tender.quantityKg).toLocaleString()} kg</span>
            </div>
            {form.paymentTerms && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Payment Terms</span>
                <span className="font-medium text-slate-700">{PAYMENT_TERM_LABELS[form.paymentTerms] || form.paymentTerms}</span>
              </div>
            )}
            {form.note && (
              <div>
                <span className="text-slate-400 text-xs block mb-0.5">Note / Conditions</span>
                <p className="text-slate-600 text-xs bg-slate-50 rounded-lg p-2">{form.note}</p>
              </div>
            )}
            {file && (
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-600 truncate flex-1">{file.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          Once submitted, your offer cannot be modified. Only one offer per tender is allowed.
        </div>

        {/* Declaration */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="mt-0.5">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded" />
          </div>
          <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
            I have reviewed all tender details and terms. I confirm that the information in this offer is accurate and I accept all terms and conditions set by the issuing organisation.
          </span>
        </label>

        {submitErr && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {submitErr}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button onClick={() => setStep("form")} disabled={submitting}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
            ← Edit
          </button>
          <button onClick={handleSubmit} disabled={!accepted || submitting}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              : <><Shield className="w-4 h-4" /> Submit Sealed Offer</>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Form ──────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <button onClick={() => navigate(`/dealer/tenders/${id}`)}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Tender
        </button>
        <h1 className="text-xl font-bold text-slate-900">Submit Sealed Offer</h1>
        <p className="text-xs text-slate-500 mt-0.5">{tender.scrapRecord?.category?.name || tender.title}</p>
      </div>

      <StepDots step="form" />

      {/* Sealed bid notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-800 flex gap-2">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
        <div>
          <strong>Sealed offer:</strong> Your price will remain hidden from the industry and all other dealers until evaluation begins. You may only submit once per tender.
        </div>
      </div>

      <TenderBanner tender={tender} />

      <form onSubmit={goToReview} className="space-y-5">

        {/* Company details */}
        {(currentUser?.organisation?.companyName || currentUser?.contactName) && (
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Submitting As</div>
            <div className="font-semibold text-slate-800 text-sm">
              {currentUser.organisation?.companyName || currentUser.contactName}
            </div>
            {currentUser.organisation?.city && (
              <div className="text-xs text-slate-500 mt-0.5">{currentUser.organisation.city}</div>
            )}
            {currentUser.organisation?.gstNumber && (
              <div className="text-[10px] text-slate-400 mt-1 font-mono">GST: {currentUser.organisation.gstNumber}</div>
            )}
          </section>
        )}

        {/* Commercial offer */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Commercial Offer</div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Price / kg (₹) <span className="text-red-500">*</span>
            </label>
            <input
              required type="number" min="0.01" step="0.01"
              value={form.pricePerKg}
              onChange={set("pricePerKg")}
              placeholder="e.g. 52.50"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
            />
            {totalValue != null && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                Estimated total for {Number(tender.quantityKg).toLocaleString()} kg:
                <strong className="text-indigo-700 ml-0.5">{fmtCcy(totalValue)}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Terms <span className="text-red-500">*</span>
            </label>
            <select
              required value={form.paymentTerms} onChange={set("paymentTerms")}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none">
              <option value="" disabled>Select payment terms</option>
              {Object.entries(PAYMENT_TERM_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note / Conditions <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.note} onChange={set("note")} rows={3}
              placeholder="Any special conditions, pickup remarks, or additional information…"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* Document upload — Option B */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Tender Response Document</div>
            <p className="text-xs text-slate-500">
              Optionally attach your prepared tender response or supporting document. Accepted: PDF, Word, Excel, Image (max 10 MB).
            </p>
          </div>

          {file ? (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={removeFile}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-indigo-600 border border-dashed border-indigo-300 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Choose document to upload
              <input ref={fileRef} type="file" className="hidden" accept={ALLOWED_EXTS} onChange={handleFileChange} />
            </label>
          )}

          <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            The document is uploaded after your offer is submitted and linked to your submission.
          </div>
        </section>

        {/* Terms reference */}
        {tender.terms && (
          <section className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Tender Terms & Conditions</div>
            <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap line-clamp-6">{tender.terms}</p>
          </section>
        )}

        <button type="submit"
          className="w-full py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
          Review Offer →
        </button>
      </form>
    </div>
  );
}
