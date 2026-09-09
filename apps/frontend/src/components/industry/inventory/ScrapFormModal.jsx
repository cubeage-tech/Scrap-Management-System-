import { useEffect, useState } from "react";
import { X, PackagePlus, Pencil } from "lucide-react";

import FormField from "../../common/FormField";
import ApiService from "../../../core/services/api.service";
import { createScrap, updateScrap } from "../../../core/services/scrap.service";

const EMPTY_FORM = {
  categoryId: "",
  totalQuantityKg: "",
  description: "",
  condition: "",
  locationLabel: "",
};

// Backend fields supported by POST/PUT /api/scrap (see scrap.validation.js):
// categoryId, totalQuantityKg, description, condition, locationLabel.
// listedQuantityKg/soldQuantityKg/availableQuantityKg/status are computed
// server-side and are never sent from this form.
const ScrapFormModal = ({ isOpen, mode, scrap, onClose, onSuccess }) => {
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    Promise.resolve().then(() => {
      setFormData(
        isEdit
          ? {
              categoryId: scrap.categoryId || scrap.category?.id || "",
              totalQuantityKg: scrap.totalQuantityKg ?? "",
              description: scrap.description || "",
              condition: scrap.condition || "",
              locationLabel: scrap.locationLabel || "",
            }
          : EMPTY_FORM
      );
      setSubmitError(null);
      setFieldErrors({});
      setCategoriesLoading(true);
      setCategoriesError(null);
    });

    // Categories: no backend list endpoint exists yet (GET /category is not
    // mounted anywhere in routes.js). This call is wired correctly per the
    // existing ApiService/ServerUrl pattern and will start working the
    // moment that endpoint exists — for now it degrades to an inline error.
    ApiService.getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setCategoriesError(
          err.response?.data?.message || "Categories are unavailable right now."
        );
      })
      .finally(() => setCategoriesLoading(false));
  }, [isOpen, isEdit, scrap]);

  if (!isOpen) return null;

  const setField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});
    setSubmitting(true);

    const payload = {
      categoryId: formData.categoryId,
      totalQuantityKg: Number(formData.totalQuantityKg),
      description: formData.description || undefined,
      condition: formData.condition || undefined,
      locationLabel: formData.locationLabel || undefined,
    };

    try {
      if (isEdit) {
        await updateScrap(scrap.id, payload);
      } else {
        await createScrap(payload);
      }
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      setSubmitError(data?.message || `Failed to ${isEdit ? "update" : "add"} scrap.`);

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

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Pencil className="w-5 h-5 text-blue-600" />
            ) : (
              <PackagePlus className="w-5 h-5 text-blue-600" />
            )}
            <h3 className="font-bold text-lg text-slate-900">
              {isEdit ? "Edit Scrap" : "Add Scrap"}
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            {categoriesLoading ? (
              <div className="text-xs text-slate-400 py-2">Loading categories...</div>
            ) : categoriesError ? (
              <div className="text-xs text-red-600 py-1">{categoriesError}</div>
            ) : (
              <select
                required
                value={formData.categoryId}
                onChange={setField("categoryId")}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.categoryId && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.categoryId}</p>
            )}
          </div>

          <div>
            <FormField
              label="Total Quantity (Kg) *"
              type="number"
              required
              placeholder="e.g. 500"
              value={formData.totalQuantityKg}
              onChange={setField("totalQuantityKg")}
            />
            {fieldErrors.totalQuantityKg && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.totalQuantityKg}</p>
            )}
          </div>

          <FormField
            label="Description"
            placeholder="e.g. Copper Scrap (Millberry)"
            value={formData.description}
            onChange={setField("description")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Condition"
              placeholder="e.g. Clean"
              value={formData.condition}
              onChange={setField("condition")}
            />
            <FormField
              label="Warehouse / Location"
              placeholder="e.g. Pune - Unit 2"
              value={formData.locationLabel}
              onChange={setField("locationLabel")}
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
              disabled={submitting || categoriesLoading || !!categoriesError}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Scrap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScrapFormModal;
