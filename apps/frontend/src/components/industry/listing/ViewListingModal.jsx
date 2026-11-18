import { useEffect, useState } from "react";
import { X, Check, Ban } from "lucide-react";

import StatusBadge from "../../common/StatusBadge";
import Loader from "../../common/Loader";
import { getListingById, publishListing } from "../../../core/services/listing.service";
import { getQuotations, acceptQuotation, rejectQuotation } from "../../../core/services/quotation.service";
import { LISTING_STATUS_VARIANTS } from "../../../configs/tables/listingTable.config";
import { formatScrapDate as formatDate } from "../../../configs/tables/stockInventoryTable.config";

const QUOTATION_STATUS_VARIANTS = {
  SUBMITTED: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "neutral",
  WITHDRAWN: "neutral",
};

const Field = ({ label, value }) => (
  <div>
    <span className="text-[11px] text-slate-400 font-semibold block uppercase">{label}</span>
    <span className="font-medium text-slate-800">{value ?? "—"}</span>
  </div>
);

const ViewListingModal = ({ isOpen, listingId, onClose, onChanged }) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [quotationsError, setQuotationsError] = useState(null);

  const [publishing, setPublishing] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchListing = () => {
    setLoading(true);
    setError(null);
    return getListingById(listingId)
      .then((body) => setListing(body.data))
      .catch((err) => {
        console.error("Failed to fetch listing:", err);
        setError(err.response?.data?.message || "Failed to load listing details.");
      })
      .finally(() => setLoading(false));
  };

  const fetchQuotations = () => {
    setQuotationsLoading(true);
    setQuotationsError(null);
    return getQuotations({ listingId })
      .then((body) => setQuotations(body.data || []))
      .catch((err) => {
        console.error("Failed to fetch quotations:", err);
        setQuotationsError(err.response?.data?.message || "Failed to load quotations.");
      })
      .finally(() => setQuotationsLoading(false));
  };

  useEffect(() => {
    if (!isOpen || !listingId) return;
    Promise.resolve().then(fetchListing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, listingId]);

  useEffect(() => {
    if (!isOpen || !listing || listing.sellingMode !== "QUOTATION") return;
    Promise.resolve().then(fetchQuotations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, listing?.id, listing?.sellingMode]);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setPublishing(true);
    setActionError(null);
    try {
      await publishListing(listingId);
      await fetchListing();
      onChanged?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to publish listing.");
    } finally {
      setPublishing(false);
    }
  };

  const handleQuotationAction = async (quotationId, action) => {
    setActioningId(quotationId);
    setActionError(null);
    try {
      if (action === "accept") {
        await acceptQuotation(quotationId);
      } else {
        await rejectQuotation(quotationId);
      }
      await Promise.all([fetchQuotations(), fetchListing()]);
      onChanged?.();
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${action} quotation.`);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">Listing Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="py-6 text-sm text-red-600">{error}</div>
        ) : (
          listing && (
            <>
              {actionError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
                  {actionError}
                </div>
              )}

              <div className="py-5 grid grid-cols-2 gap-4 text-sm">
                <Field label="Material" value={listing.scrapRecord?.description || listing.scrapRecord?.category?.name} />
                <Field label="Category" value={listing.scrapRecord?.category?.name} />
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge
                      label={listing.status}
                      variant={LISTING_STATUS_VARIANTS[listing.status] || "neutral"}
                    />
                  </div>
                </div>
                <Field label="Selling Mode" value={listing.sellingMode} />
                <Field label="Quantity" value={`${listing.quantityKg} kg`} />
                <Field
                  label="Expected Price / Kg"
                  value={listing.expectedPricePerKg != null ? `₹${listing.expectedPricePerKg}` : null}
                />
                <Field label="Warehouse" value={listing.scrapRecord?.locationLabel} />
                <Field label="Condition" value={listing.scrapRecord?.condition} />
                <Field label="Closes At" value={listing.closesAt ? formatDate(listing.closesAt) : null} />
                <Field label="Created" value={formatDate(listing.createdAt)} />
              </div>

              {listing.status === "DRAFT" && (
                <div className="pb-4 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {publishing ? "Publishing..." : "Publish Listing"}
                  </button>
                </div>
              )}

              {listing.sellingMode === "QUOTATION" && (
                <div className="pt-4">
                  <h4 className="font-semibold text-sm text-slate-900 mb-3">Quotations</h4>

                  {quotationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader />
                    </div>
                  ) : quotationsError ? (
                    <div className="text-xs text-red-600">{quotationsError}</div>
                  ) : quotations.length === 0 ? (
                    <div className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                      No quotations submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quotations.map((q) => (
                        <div
                          key={q.id}
                          className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3"
                        >
                          <div className="text-xs">
                            <div className="font-semibold text-slate-900">
                              {q.buyer?.companyName || "Unknown buyer"}
                            </div>
                            <div className="text-slate-500 mt-0.5">
                              ₹{q.pricePerKg}/kg × {q.quantityKg} kg = ₹{q.totalValue}
                            </div>
                            {q.validUntil && (
                              <div className="text-slate-400 mt-0.5">
                                Valid until {formatDate(q.validUntil)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge
                              label={q.status}
                              variant={QUOTATION_STATUS_VARIANTS[q.status] || "neutral"}
                            />

                            {q.status === "SUBMITTED" && (
                              <>
                                <button
                                  type="button"
                                  disabled={actioningId === q.id}
                                  onClick={() => handleQuotationAction(q.id, "accept")}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                                  title="Accept"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  disabled={actioningId === q.id}
                                  onClick={() => handleQuotationAction(q.id, "reject")}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                                  title="Reject"
                                >
                                  <Ban size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewListingModal;
