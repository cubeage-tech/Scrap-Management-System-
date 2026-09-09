import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Save, CheckCircle2, Box, Info } from "lucide-react";
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

  const [formData, setFormData] = useState({
    material: "",
    category: "",
    categoryId: "",
    weight: "",
    unit: "MT", // "MT" or "kg"
    condition: "Grade A",
    location: "",
    expPriceMT: "",
    imageUrl: ""
  });

  // Fetch categories if not passed via props
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      if (!formData.categoryId && propCategories[0]) {
        setFormData((prev) => ({
          ...prev,
          category: propCategories[0].name,
          categoryId: propCategories[0].id
        }));
      }
    } else {
      fetchCategories();
    }
  }, [propCategories, isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await ApiService.getCategories();
      if (res?.data?.success && res.data.data) {
        const fetchedCats = res.data.data;
        setCategories(fetchedCats);
        if (fetchedCats.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({
            ...prev,
            category: fetchedCats[0].name,
            categoryId: fetchedCats[0].id
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load categories in AddScrapModal:", err);
    }
  };

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const selectedVal = e.target.value;
    const catObj = categories.find(
      (c) => c.id === selectedVal || c.name.toLowerCase() === selectedVal.toLowerCase()
    );
    setFormData((prev) => ({
      ...prev,
      categoryId: catObj?.id || selectedVal,
      category: catObj?.name || selectedVal
    }));
  };


  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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

    const rawQtyInput = parseFloat(formData.weight) || 0;
    const rawWeightKg = formData.unit === "MT" ? rawQtyInput * 1000 : rawQtyInput;

    setIsSubmitting(true);

    try {
      const payload = {
        categoryId: formData.categoryId || (categories[0]?.id || undefined),
        description: formData.material.trim(),
        totalQuantityKg: rawWeightKg,
        condition: formData.condition || "Grade A",
        locationLabel: formData.location.trim() || (role === "DEALER" ? "Yard Storage" : "Factory Bay")
      };

      const res = await ApiService.createScrap(payload);

      if (res?.data?.success) {
        if (onSuccess) {
          onSuccess(res.data.data);
        }
        onClose();
      } else {
        setFormError(res?.data?.message || "Failed to create scrap inventory record.");
      }
    } catch (err) {
      console.error("Error submitting scrap record:", err);
      setFormError(err?.response?.data?.message || "Failed to save scrap. Please try again.");
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
                value={formData.categoryId || formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
              >
                {/* Standard categories */}
                {["Steel", "Copper", "Aluminium", "Plastic", "Electronic Waste", "Rubber", "Paper", "Textile", "Ferrous", "Non-Ferrous", "Machinery"].map((catName) => {
                  const dbMatch = categories?.find((c) => c.name.toLowerCase() === catName.toLowerCase());
                  return (
                    <option key={catName} value={dbMatch ? dbMatch.id : catName}>
                      {catName}
                    </option>
                  );
                })}
                {/* Any additional custom database categories */}
                {categories?.filter((cat) => 
                  !["steel", "copper", "aluminium", "plastic", "electronic waste", "rubber", "paper", "textile", "ferrous", "non-ferrous", "machinery"].includes(cat.name.toLowerCase())
                ).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
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
                  <option value="MT">MT (Metric Ton)</option>
                  <option value="kg">kg (Kilogram)</option>
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

            {/* Image Attachment (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Scrap Photo (Optional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {formData.imageUrl ? (
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Photo Attached
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-medium">Click to upload photo</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>
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

