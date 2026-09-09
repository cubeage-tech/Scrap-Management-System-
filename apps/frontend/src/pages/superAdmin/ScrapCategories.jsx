import { useMemo, useState, useEffect } from "react";
import { Download, Plus, X, Info } from "lucide-react";

import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import { scrapCategoriesTableConfig } from "../../configs/tables/scrapCategoriesTable.config";

const ScrapCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [newCategory, setNewCategory] = useState({
    name: "",
    materials: "",
    status: "Active",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Use ApiService static method to fetch active categories
      const res = await ApiService.getCategories();
      if (res?.data?.success && res.data.data) {
        const mapped = res.data.data.map((cat, index) => ({
          id: cat.id,
          code: cat.name ? cat.name.slice(0, 2).toUpperCase() : `C${index + 1}`,
          name: cat.name,
          materials: cat.description || "Industrial Scrap",
          stock: "Live",
          unit: "",
          value: "—",
          status: cat.isActive ? "Approved" : "Disabled",
          date: new Date(cat.createdAt || Date.now()).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Row selection state
  const rowSelection = useMemo(
    () => Object.fromEntries(selected.map((id) => [id, true])),
    [selected]
  );

  const handleRowSelectionChange = (updaterOrValue) => {
    const next = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    setSelected(Object.keys(next).filter((id) => next[id]));
  };

  const handleDelete = async (category) => {
    try {
      await ApiService.deleteCategory(category.id);
      setCategories((previous) => previous.filter((c) => c.id !== category.id));
      setSelected((previous) => previous.filter((id) => id !== category.id));
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert(err?.response?.data?.message || "Failed to delete category");
    }
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!newCategory.name.trim()) {
      setErrorMessage("Please enter a category name");
      return;
    }

    try {
      const res = await ApiService.createCategory({
        name: newCategory.name.trim(),
        isActive: newCategory.status === "Approved" || newCategory.status === "Active"
      });

      if (res?.data?.success) {
        await fetchCategories();
        setNewCategory({
          name: "",
          materials: "",
          status: "Active",
        });
        setShowAddModal(false);
      } else {
        setErrorMessage(res?.data?.message || "Failed to create category");
      }
    } catch (err) {
      console.error("Error creating category:", err);
      setErrorMessage(err?.response?.data?.message || "Failed to create category");
    }
  };

  const handleExport = () => {
    const dataToExport =
      selected.length > 0
        ? categories.filter((category) => selected.includes(category.id))
        : categories;

    const headers = [
      "Category",
      "Code",
      "Materials",
      "Status",
      "Date",
    ];

    const rows = dataToExport.map((category) => [
      category.name,
      category.code,
      category.materials,
      category.status,
      category.date,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "scrap-categories.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full w-full bg-[#f8fafc] px-3 py-4 sm:px-5 lg:px-6 lg:py-5 text-left font-sans">
      {/* Breadcrumb */}
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span>Operations</span>
        <span>›</span>
        <span className="font-medium text-slate-600">
          Scrap Categories
        </span>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
            Scrap categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Master category taxonomy stored in database and used across Industry & Dealer inventory.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={handleExport}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 sm:flex-none cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-blue-700 sm:flex-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add category
          </button>
        </div>
      </div>

      <MaterialTable
        config={scrapCategoriesTableConfig}
        data={categories}
        getRowId={(row) => row.id}
        onDelete={handleDelete}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Add New Category
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Create a new master category saved in the database for Industry and Dealer inventory.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Category Name *
                </label>

                <input
                  required
                  value={newCategory.name}
                  onChange={(event) =>
                    setNewCategory((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Copper Scrap, Steel Scrap, Glass Waste"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Status
                </label>

                <select
                  value={newCategory.status}
                  onChange={(event) =>
                    setNewCategory((previous) => ({
                      ...previous,
                      status: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Active">Active (Approved)</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapCategories;
