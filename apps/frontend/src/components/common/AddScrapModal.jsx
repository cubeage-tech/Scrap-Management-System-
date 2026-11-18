import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Save, CheckCircle2, Info } from "lucide-react";
import ApiService from "../../core/services/api.service";

const AddScrapModal = ({
  isOpen,
  onClose,
  onSuccess,
  role = "INDUSTRY",
  categories: propCategories = []
}) => {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState(propCategories);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    material: "",
    category: "",
    categoryId: "",
    weight: "",
    unit: "Tons",
    condition: "Grade A",
    location: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await ApiService.getCategories();
      if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const fetchedCats = res.data.data;
        setCategories(fetchedCats);
        setFormData((prev) => ({
          ...prev,
          category: prev.category || fetchedCats[0].name,
          categoryId: prev.categoryId || fetchedCats[0].id
        }));
      }
    } catch (err) {
      console.error("Failed to load categories in AddScrapModal:", err);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isOpen) fetchCategories(); }, [isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const catObj = categories.find((c) => c.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedId,
      category: catObj ? catObj.name : ""
    }));
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const total = selectedFiles.length + files.length;
    if (total > 5) {
      setFormError(`You can attach up to 5 images. You already have ${selectedFiles.length}.`);
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, { name: file.name, src: ev.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.material.trim()) {
      setFormError("Please enter the material name / description");
      return;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      setFormError("Please enter a valid weight quantity");
      return;
    }

    let finalCategoryId = formData.categoryId;
    if (!finalCategoryId && categories.length > 0) {
      finalCategoryId = categories[0].id;
    }

    if (!finalCategoryId) {
      setFormError("Please select a valid category from the dropdown.");
      return;
    }

    const rawQtyInput = parseFloat(formData.weight) || 0;
    const rawWeightKg = formData.unit === "Tons" ? rawQtyInput * 1000 : rawQtyInput;

    setIsSubmitting(true);

    try {
      const payload = {
        categoryId: finalCategoryId,
        description: formData.material.trim(),
        totalQuantityKg: rawWeightKg,
        condition: formData.condition || "Grade A",
        locationLabel: formData.location.trim() || (role === "DEALER" ? "Yard Storage" : "Factory Bay")
      };

      const res = await ApiService.createScrap(payload);

      if (res?.data?.success) {
        const newScrap = res.data.data;

        // Upload images if any were selected
        if (selectedFiles.length > 0) {
          try {
            const fd = new FormData();
            selectedFiles.forEach((f) => fd.append("images", f));
            await ApiService.uploadScrapImages(newScrap.id, fd);
          } catch (_) {
            // image upload failure is non-blocking; scrap was created
          }
        }

        if (onSuccess) onSuccess(newScrap);
        onClose();
      } else {
        setFormError(res?.data?.message || "Failed to create scrap inventory record.");
      }
    } catch (err) {
      console.error("Error submitting scrap record:", err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && backendErrors.length > 0) {
        setFormError(backendErrors[0].message);
      } else {
        setFormError(err?.response?.data?.message || "Failed to save scrap. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDealer = role === "DEALER";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-5 sm:p-7 flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200 text-left font-sans overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Add Scrap Inventory ({isDealer ? "Dealer Yard" : "Industry Plant"})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDealer
                  ? "Log scrap purchased or collected into your yard stock"
                  : "Log factory scrap output available for listing and sale"}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              isDealer
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            {isDealer ? "DEALER ROLE" : "INDUSTRY ROLE"}
          </span>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Scrap Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
              >
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="">Loading database categories...</option>
                )}
              </select>
            </div>

            {/* Material Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Material Description / Specification *
              </label>
              <input
                type="text"
                placeholder="e.g. MS Steel Heavy Melting Scrap (HMS 1&2)"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {/* Weight & Unit */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  placeholder="e.g. 25.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="kg">kg (Kilogram)</option>
                  <option value="Tons">Tons</option>
                </select>
              </div>
            </div>

            {/* Condition & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Material Condition / Grade
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="Grade A">Grade A (Premium / Clean)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Mixed / Unsorted)</option>
                  <option value="Clean">Clean</option>
                  <option value="Sorted">Sorted</option>
                  <option value="Baled">Baled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location / Yard Bay
                </label>
                <input
                  type="text"
                  placeholder={isDealer ? "e.g. Yard B - Section 4" : "e.g. Warehouse A - Bay 3"}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Image Attachment (Optional, up to 5) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Scrap Photos — Optional ({selectedFiles.length}/5)
              </label>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.src}
                        alt={img.name}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-medium">
                      {selectedFiles.length === 0 ? "Click to upload photos" : "Add more photos"}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP · max 5MB each · up to 5 photos</span>
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <p className="mt-1.5 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedFiles.length} photo{selectedFiles.length > 1 ? "s" : ""} ready to upload
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving to Database..." : "Save Scrap Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScrapModal;
