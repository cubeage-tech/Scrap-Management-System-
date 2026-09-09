import { useEffect, useState } from "react";
import { X, PackagePlus, Pencil } from "lucide-react";

import FormField from "../../common/FormField";
import SellingModeSelector from "./SellingModeSelector";
import { getScraps } from "../../../core/services/scrap.service";
import { createListing, updateListing } from "../../../core/services/listing.service";

const EMPTY_FORM = {
  scrapRecordId: "",
  sellingMode: "QUOTATION",
  quantityKg: "",
  expectedPricePerKg: "",
  closesAt: "",
};

// Backend fields:
// - POST /api/marketplace/listings (createListingSchema): scrapRecordId,
//   sellingMode, quantityKg, expectedPricePerKg, closesAt.
// - PATCH /api/marketplace/listings/:id (updateListingSchema): sellingMode,
//   quantityKg, expectedPricePerKg, closesAt — NOT scrapRecordId (immutable
//   once created), and only while the listing is still DRAFT.
// Auction-specific fields (startsAt/endsAt/startingPricePerKg/
// reservePricePerKg/minIncrement) are NOT sent — no endpoint exists yet
// (see plan doc Phase 7).
const CreateListingModal = ({ isOpen, mode = "create", listing, onClose, onSuccess }) => {
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [scraps, setScraps] = useState([]);
  const [scrapsLoading, setScrapsLoading] = useState(!isEdit);
  const [scrapsError, setScrapsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    Promise.resolve().then(() => {
      setFormData(
        isEdit
          ? {
              scrapRecordId: listing.scrapRecordId,
              sellingMode: listing.sellingMode,
              quantityKg: listing.quantityKg ?? "",
              expectedPricePerKg: listing.expectedPricePerKg ?? "",
              closesAt: listing.closesAt ? listing.closesAt.slice(0, 10) : "",
            }
          : EMPTY_FORM
      );
      setSubmitError(null);
      setFieldErrors({});
    });

    // Only Create needs the scrap picker — Edit can't change scrapRecordId.
    if (isEdit) return;

    Promise.resolve().then(() => {
      setScrapsLoading(true);
      setScrapsError(null);
    });

    getScraps()
      .then((body) => setScraps(body.data || []))
      .catch((err) => {
        console.error("Failed to load scrap inventory:", err);
        setScrapsError(err.response?.data?.message || "Failed to load scrap inventory.");
      })
      .finally(() => setScrapsLoading(false));
  }, [isOpen, isEdit, listing]);

  if (!isOpen) return null;

  const selectedScrap = isEdit
    ? listing?.scrapRecord
    : scraps.find((s) => s.id === formData.scrapRecordId) || null;

  const setField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    if (
      !isEdit &&
      selectedScrap &&
      Number(formData.quantityKg) > Number(selectedScrap.availableQuantityKg)
    ) {
      setFieldErrors({
        quantityKg: `Cannot exceed available quantity (${selectedScrap.availableQuantityKg} kg)`,
      });
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await updateListing(listing.id, {
          sellingMode: formData.sellingMode,
          quantityKg: Number(formData.quantityKg),
          expectedPricePerKg:
            formData.expectedPricePerKg !== "" ? Number(formData.expectedPricePerKg) : undefined,
          closesAt: formData.closesAt || undefined,
        });
      } else {
        await createListing({
          scrapRecordId: formData.scrapRecordId,
          sellingMode: formData.sellingMode,
          quantityKg: Number(formData.quantityKg),
          expectedPricePerKg:
            formData.expectedPricePerKg !== "" ? Number(formData.expectedPricePerKg) : undefined,
          closesAt: formData.closesAt || undefined,
        });
      }
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      setSubmitError(data?.message || `Failed to ${isEdit ? "update" : "create"} listing.`);

      if (Array.isArray(data?.errors)) {
        setFieldErrors(
          Object.fromEntries(data.errors.map((fe) => [fe.field, fe.message]))
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Pencil className="w-5 h-5 text-blue-600" />
            ) : (
              <PackagePlus className="w-5 h-5 text-blue-600" />
            )}
            <h3 className="font-bold text-lg text-slate-900">
              {isEdit ? "Edit Listing" : "Create Listing"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-left">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
              {submitError}
            </div>
          )}

          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scrap from Inventory *
              </label>
              {scrapsLoading ? (
                <div className="text-xs text-slate-400 py-2">Loading your scrap inventory...</div>
              ) : scrapsError ? (
                <div className="text-xs text-red-600 py-1">{scrapsError}</div>
              ) : scraps.length === 0 ? (
                <div className="text-xs text-slate-500 py-1">
                  No scrap in inventory yet — add scrap first from the Inventory page.
                </div>
              ) : (
                <select
                  required
                  value={formData.scrapRecordId}
                  onChange={setField("scrapRecordId")}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select scrap
                  </option>
                  {scraps.map((scrap) => (
                    <option key={scrap.id} value={scrap.id}>
                      {(scrap.description || scrap.category?.name || "Untitled")} —{" "}
                      {scrap.availableQuantityKg} kg available
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.scrapRecordId && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.scrapRecordId}</p>
              )}
            </div>
          )}

          {selectedScrap && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <div>
                <span className="text-slate-400 block">Category</span>
                <span className="font-medium text-slate-800">
                  {selectedScrap.category?.name || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Available</span>
                <span className="font-medium text-slate-800">
                  {selectedScrap.availableQuantityKg} kg
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Condition</span>
                <span className="font-medium text-slate-800">
                  {selectedScrap.condition || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Warehouse</span>
                <span className="font-medium text-slate-800">
                  {selectedScrap.locationLabel || "—"}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Mode *
            </label>
            <SellingModeSelector
              value={formData.sellingMode}
              onChange={(sellingMode) => setFormData((prev) => ({ ...prev, sellingMode }))}
            />
          </div>

          <div>
            <FormField
              label="Quantity to List (Kg) *"
              type="number"
              required
              placeholder="e.g. 300"
              value={formData.quantityKg}
              onChange={setField("quantityKg")}
            />
            {fieldErrors.quantityKg && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.quantityKg}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Expected Price / Kg (₹)"
              type="number"
              placeholder="e.g. 45"
              value={formData.expectedPricePerKg}
              onChange={setField("expectedPricePerKg")}
            />
            <FormField
              label="Closes At"
              type="date"
              value={formData.closesAt}
              onChange={setField("closesAt")}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting || (!isEdit && (scrapsLoading || !!scrapsError || scraps.length === 0))
              }
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListingModal;
