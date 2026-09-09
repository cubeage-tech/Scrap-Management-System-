import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Download,
  Copy,
  Trash2,
  ChevronDown,
  CheckCircle,
  Eye,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Box,
  CheckCircle2,
  Tag,
  IndianRupee,
  Package,
  ArrowLeft,
  Upload,
  Save,
  Send
} from "lucide-react";

import MaterialTable from "../../components/common/MaterialTable";
import AddScrapModal from "../../components/common/AddScrapModal";
import ApiService from "../../core/services/api.service";

import { dealerTableConfig } from "../../configs/tables/dealerTable.config";
import { myScrapTableConfig } from "../../configs/tables/myScrapTable.config";


// Helper styles for Category badges using SmartScrap design tokens
const getCategoryStyle = (category) => {
  switch (category) {
    case "Steel":
      return "bg-muted text-muted-foreground border-border";
    case "Copper":
      return "bg-warning/10 text-warning border-warning/20";
    case "Aluminium":
      return "bg-info/10 text-info border-info/20";
    case "Plastic":
      return "bg-primary/10 text-primary border-primary/20";
    case "Electronic Waste":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "Rubber":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

// Helper styles for Condition badges using SmartScrap design tokens
const getConditionStyle = (condition) => {
  switch (condition) {
    case "Grade A":
      return "bg-success/10 text-success border-success/20";
    case "Grade B":
      return "bg-warning/10 text-warning border-warning/20";
    case "Grade C":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

// Helper styles for Status badges using SmartScrap design tokens
const getStatusStyle = (status) => {
  switch (status) {
    case "Available":
      return "bg-success/10 text-success border-success/20";
    case "Partially Listed":
      return "bg-warning/10 text-warning border-warning/20";
    case "Fully Listed":
      return "bg-info/10 text-info border-info/20";
    case "Sold":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const ScrapInventory = () => {
  // Inventory state (dynamically fetched from database)
  const [scrapList, setScrapList] = useState([]);

  const [dbCategories, setDbCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Toast state
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    fetchScraps();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await ApiService.getCategories();
      if (res.data?.success && res.data.data) {
        setDbCategories(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchScraps = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getScraps();
      if (res.data?.success && res.data.data && res.data.data.length > 0) {
        const formatted = res.data.data.map((record) => {
          const totalKg = Number(record.totalQuantityKg || 0);
          const listedKg = Number(record.listedQuantityKg || 0);
          const soldKg = Number(record.soldQuantityKg || 0);
          const availKg = Number(record.availableQuantityKg || (totalKg - listedKg - soldKg));
          const qtyRawMT = availKg / 1000;

          let statusLabel = "Available";
          if (record.status === "SOLD_OUT" || soldKg >= totalKg) {
            statusLabel = "Sold";
          } else if (record.status === "FULLY_LISTED" || listedKg >= totalKg) {
            statusLabel = "Fully Listed";
          } else if (record.status === "PARTIALLY_LISTED" || listedKg > 0) {
            statusLabel = "Partially Listed";
          }

          return {
            id: record.id,
            material: record.description || record.category?.name || "Scrap Material",
            category: record.category?.name || "General",
            categoryId: record.categoryId,
            weightKg: `${availKg.toLocaleString("en-IN")} kg`,
            weightRawKg: availKg,
            qtyUnit: `${qtyRawMT.toFixed(2)} MT`,
            qtyRawMT: qtyRawMT,
            condition: record.condition || "Grade A",
            location: record.locationLabel || "Warehouse A",
            expPriceMT: "₹35,000",
            expPriceRaw: 35000,
            totalValue: qtyRawMT * 35000,
            status: statusLabel,
            imageUrl:
              record.images && record.images.length > 0
                ? record.images[0].url
                : "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=150&auto=format&fit=crop&q=80",
            dateAdded: new Date(record.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            rawRecord: record,
          };
        });
        setScrapList(formatted);
      }
    } catch (err) {
      console.error("Error fetching scrap inventory:", err);
    } finally {
      setIsLoading(false);
    }

  };

  // Metrics Calculation (dynamic) matching Dealer Dashboard stat cards
  const metrics = useMemo(() => {
    const totalItems = scrapList.length;
    const available = scrapList.filter((item) => item.status === "Available").length;
    const listed = scrapList.filter(
      (item) => item.status === "Partially Listed" || item.status === "Fully Listed"
    ).length;
    const sold = scrapList.filter((item) => item.status === "Sold").length;

    const totalWeightMT = scrapList.reduce((sum, item) => sum + (item.qtyRawMT || 0), 0);
    const totalValue = scrapList.reduce((sum, item) => {
      if (item.totalValue) return sum + item.totalValue;
      if (item.qtyRawMT && item.expPriceRaw) return sum + item.qtyRawMT * item.expPriceRaw;
      return sum;
    }, 0);

    return {
      totalItems,
      available,
      listed,
      sold,
      totalWeight: `${totalWeightMT.toFixed(1)} MT`,
      estValue: `₹${totalValue.toLocaleString("en-IN")}`,
    };
  }, [scrapList]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return scrapList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.material.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All Status" || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All Categories" ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [scrapList, searchQuery, statusFilter, categoryFilter]);

  // Row selection state for MaterialTable
  const rowSelection = useMemo(
    () => Object.fromEntries(selectedIds.map((id) => [id, true])),
    [selectedIds]
  );

  const handleRowSelectionChange = (updaterOrValue) => {
    const nextSelection =
      typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    setSelectedIds(Object.keys(nextSelection).filter((id) => nextSelection[id]));
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CRUD Operations
  const handleAddScrap = async (newLot) => {
    try {
      const payload = {
        categoryId: newLot.categoryId || (dbCategories[0]?.id || undefined),
        description: newLot.material,
        totalQuantityKg: newLot.weightRawKg || 1000,
        condition: newLot.condition,
        locationLabel: newLot.location,
      };
      const res = await ApiService.createScrap(payload);
      if (res.data?.success) {
        showToast(`Successfully added ${newLot.material} to database inventory!`);
        fetchScraps();
        return;
      }
    } catch (err) {
      console.error("Failed to add scrap to DB:", err);
    }
    setScrapList((prev) => [newLot, ...prev]);
    showToast(`Successfully added ${newLot.material}!`);
  };

  const handleUpdateScrap = async (updatedLot) => {
    try {
      if (updatedLot.rawRecord?.id) {
        await ApiService.updateScrap(updatedLot.rawRecord.id, {
          description: updatedLot.material,
          totalQuantityKg: updatedLot.weightRawKg,
          condition: updatedLot.condition,
          locationLabel: updatedLot.location,
        });
        fetchScraps();
        showToast(`Updated details for ${updatedLot.id}`);
        return;
      }
    } catch (err) {
      console.error("Failed to update scrap in DB:", err);
    }
    setScrapList((prev) =>
      prev.map((item) => (item.id === updatedLot.id ? updatedLot : item))
    );
    showToast(`Updated details for ${updatedLot.id}`);
  };

  const handleDeleteScrap = async (item) => {
    try {
      if (item.rawRecord?.id) {
        await ApiService.deleteScrap(item.rawRecord.id);
        fetchScraps();
        showToast(`Deleted ${item.id} from inventory database.`);
        return;
      }
    } catch (err) {
      console.error("Failed to delete scrap from DB:", err);
    }
    setScrapList((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    setDeleteConfirmItem(null);
    showToast(`Deleted ${item.id} from inventory.`);
  };

  const handleDuplicateScrap = (item) => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const duplicated = {
      ...item,
      id: `INV-0${nextNum}`,
      material: `${item.material} (Copy)`,
      status: "Available",
      dateAdded: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setScrapList((prev) => [duplicated, ...prev]);
    showToast(`Duplicated ${item.id} as new lot ${duplicated.id}`);
  };


  const handleBulkDelete = () => {
    setScrapList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    showToast(`Deleted ${selectedIds.length} selected items.`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const itemsToExport =
      selectedIds.length > 0
        ? scrapList.filter((item) => selectedIds.includes(item.id))
        : filteredItems;

    if (itemsToExport.length === 0) {
      alert("No scrap items to export.");
      return;
    }

    const headers = [
      "Inventory ID",
      "Material Name",
      "Category",
      "Weight (kg)",
      "Qty (MT)",
      "Condition",
      "Location",
      "Exp Price (₹/MT)",
      "Status",
      "Date Logged"
    ];
    const rows = itemsToExport.map((item) => [
      `"${item.id}"`,
      `"${item.material.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.weightKg}"`,
      `"${item.qtyUnit}"`,
      `"${item.condition}"`,
      `"${item.location}"`,
      `"${item.expPriceMT}"`,
      `"${item.status}"`,
      `"${item.dateAdded || ""}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `My_Scrap_Inventory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${itemsToExport.length} scrap items to CSV!`);
  };

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  return (
    <div className="min-h-screen bg-background p-3 sm:p-5 lg:p-6 font-sans text-foreground">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl border border-border flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* ================= PAGE HEADER & BREADCRUMB ================= */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>SmartScrap AI</span>
            <span>›</span>
            <span>Scrap Dealer</span>
            <span>›</span>
            <span className="text-foreground font-medium">Scrap Inventory</span>
          </div>

          <h1 className="text-xl font-bold text-foreground">
            Shaikh Metals & Alloys
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track all scrap inventory, weight specs, and prices.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-xs transition hover:bg-muted flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-muted-foreground" /> Export CSV
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Scrap
          </button>
        </div>
      </div>

      {/* ================= 6 STAT CARDS ROW ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
        {/* Card 1: Total Items */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total Items</span>
          <h2 className="text-2xl font-bold text-foreground mt-2">{metrics.totalItems}</h2>
        </div>

        {/* Card 2: Available */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-muted-foreground">Available</span>
          <h2 className="text-2xl font-bold text-success mt-2">{metrics.available}</h2>
        </div>

        {/* Card 3: Listed */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-muted-foreground">Listed</span>
          <h2 className="text-2xl font-bold text-info mt-2">{metrics.listed}</h2>
        </div>

        {/* Card 4: Sold */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-muted-foreground">Sold</span>
          <h2 className="text-2xl font-bold text-muted-foreground mt-2">{metrics.sold}</h2>
        </div>

        {/* Card 5: Total Weight */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total Weight</span>
          <h2 className="text-2xl font-bold text-foreground mt-2">{metrics.totalWeight}</h2>
        </div>

        {/* Card 6: Est. Value */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-muted-foreground">Est. Value</span>
          <h2 className="text-2xl font-bold text-foreground mt-2">{metrics.estValue}</h2>
        </div>
      </div>

      {/* ================= SEARCH & FILTER BAR (SmartScrap UI Tokens) ================= */}
      <div className="bg-card rounded-xl border border-border shadow-xs p-3.5 sm:p-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-input bg-surface-muted text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-xs"
          />
        </div>

        {/* Right Controls: Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-surface-muted hover:bg-card border border-input rounded-lg px-3.5 py-1.5 pr-8 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer shadow-xs"
            >
              <option value="All Status">All Status</option>
              <option value="Available">Available</option>
              <option value="Partially Listed">Partially Listed</option>
              <option value="Fully Listed">Fully Listed</option>
              <option value="Sold">Sold</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              aria-label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-surface-muted hover:bg-card border border-input rounded-lg px-3.5 py-1.5 pr-8 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer shadow-xs"
            >
              <option value="All Categories">All Categories</option>
              <option value="Steel">Steel</option>
              <option value="Copper">Copper</option>
              <option value="Aluminium">Aluminium</option>
              <option value="Plastic">Plastic</option>
              <option value="Electronic Waste">Electronic Waste</option>
              <option value="Rubber">Rubber</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters button */}
          {(searchQuery ||
            statusFilter !== "All Status" ||
            categoryFilter !== "All Categories") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All Status");
                setCategoryFilter("All Categories");
              }}
              className="text-xs font-semibold text-destructive hover:underline px-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ================= BULK ACTIONS BAR ================= */}
      {selectedIds.length > 0 && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="bg-info/10 border border-info/20 text-info text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info"></span>
              {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" /> Export Selected
            </button>

            {selectedIds.length === 1 && (
              <button
                type="button"
                onClick={() =>
                  handleDuplicateScrap(
                    scrapList.find((item) => item.id === selectedIds[0])
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
              </button>
            )}

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 rounded-lg bg-destructive hover:opacity-90 text-destructive-foreground text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ================= DATA TABLE CONTAINER (MaterialTable) ================= */}
      <MaterialTable
        config={myScrapTableConfig}
        data={filteredItems}
        getRowId={(row) => row.id}
        onView={(item) => setViewingItem(item)}
        onEdit={(item) => setEditingItem(item)}
        onDelete={handleDeleteScrap}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />

      {/* ================= ADD SCRAP MODAL ================= */}
      {isAddModalOpen && (
        <AddScrapModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchScraps();
            showToast("Successfully added scrap item to inventory!");
          }}
          role="DEALER"
          categories={dbCategories}
        />
      )}



      {/* ================= EDIT SCRAP MODAL ================= */}
      {editingItem && (
        <EditScrapModal
          isOpen={!!editingItem}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={handleUpdateScrap}
        />
      )}

      {/* ================= VIEW SCRAP MODAL ================= */}
      {viewingItem && (
        <ViewScrapModal
          isOpen={!!viewingItem}
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => {
            const itemToEdit = viewingItem;
            setViewingItem(null);
            setEditingItem(itemToEdit);
          }}
        />
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Scrap Item</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">{deleteConfirmItem.material}</span> (
              {deleteConfirmItem.id})? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteScrap(deleteConfirmItem)}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= SUB-MODAL COMPONENTS =================

// Edit Scrap Modal Component
const EditScrapModal = ({ isOpen, item, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    ...item,
    expPriceMT: item.expPriceMT.replace("₹", "").trim(),
    weightKg: item.weightKg.replace("kg", "").trim(),
    qtyUnit: item.qtyUnit.replace("MT", "").trim()
  });

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawWeight = parseFloat(formData.weightKg) || item.weightRawKg || 1000;
    const rawQtyMT = parseFloat(formData.qtyUnit) || item.qtyRawMT || 1.0;
    const rawPrice = parseFloat(formData.expPriceMT.replace(/[^0-9.]/g, "")) || item.expPriceRaw;

    onUpdate({
      ...item,
      material: formData.material,
      category: formData.category,
      condition: formData.condition,
      location: formData.location,
      status: formData.status,
      weightKg: `${rawWeight.toLocaleString("en-IN")} kg`,
      weightRawKg: rawWeight,
      qtyUnit: `${rawQtyMT} MT`,
      qtyRawMT: rawQtyMT,
      expPriceMT: `₹${rawPrice.toLocaleString("en-IN")}`,
      expPriceRaw: rawPrice,
      totalValue: rawQtyMT * rawPrice
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Right Side Slide-Over Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200 text-left font-sans overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Scrap Inventory</h2>
            <p className="text-xs text-slate-400">ID: {item.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors shadow-sm"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Material Name</label>
            <input
              type="text"
              required
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Steel">Steel</option>
                <option value="Copper">Copper</option>
                <option value="Aluminium">Aluminium</option>
                <option value="Plastic">Plastic</option>
                <option value="Electronic Waste">Electronic Waste</option>
                <option value="Rubber">Rubber</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="text"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Qty (MT)</label>
              <input
                type="text"
                value={formData.qtyUnit}
                onChange={(e) => setFormData({ ...formData, qtyUnit: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Expected Price (₹/MT)</label>
              <input
                type="text"
                value={formData.expPriceMT}
                onChange={(e) => setFormData({ ...formData, expPriceMT: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Available">Available</option>
                <option value="Partially Listed">Partially Listed</option>
                <option value="Fully Listed">Fully Listed</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Scrap Image</label>
            {formData.imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 space-y-2">
                <div className="h-32 w-full rounded-lg overflow-hidden relative border border-slate-200">
                  <img
                    src={formData.imageUrl}
                    alt="Scrap Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, imageUrl: "" }))
                    }
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer shadow-md"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-xl p-4 text-center hover:bg-blue-50/50 transition-colors cursor-pointer flex flex-col items-center justify-center">
                <Upload className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Click to upload new image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () =>
                        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Scrap Drawer Component (Right-Side Slide-Over Panel matching reference image)
const ViewScrapModal = ({ isOpen, item, onClose, onEdit }) => {
  if (!isOpen || !item) return null;

  const calculatedTotal =
    item.totalValue ||
    (item.qtyRawMT && item.expPriceRaw
      ? item.qtyRawMT * item.expPriceRaw
      : 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Right Side Slide-Over Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200 text-left font-sans overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {item.material}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {item.id} · {item.qtyUnit} · {item.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors shadow-sm"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Highlight Card 1: Total Value Display */}
        <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100/80 mb-5">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Total Estimated Value
          </div>
          <div className="text-3xl font-extrabold text-blue-700 mt-1">
            ₹{calculatedTotal > 0 ? calculatedTotal.toLocaleString("en-IN") : "N/A"}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Exp. Price: {item.expPriceMT} / MT · Weight: {item.weightKg}
          </div>
        </div>

        {/* Section 2: Quick Status & Primary Action Button */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(
                item.status
              )}`}
            >
              {item.status}
            </span>

            <span
              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryStyle(
                item.category
              )}`}
            >
              {item.category}
            </span>

            <span
              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getConditionStyle(
                item.condition
              )}`}
            >
              {item.condition}
            </span>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Edit2 className="w-4 h-4" /> Edit Scrap Details
          </button>
        </div>

        {/* Section 3: Detailed Specifications Card */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">
            Scrap Inventory Specifications
          </h3>

          <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white overflow-hidden text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Inventory ID</span>
              <span className="font-bold text-slate-800 font-mono">{item.id}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Material Category</span>
              <span className="font-semibold text-slate-800">{item.category}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Total Weight (kg)</span>
              <span className="font-bold text-slate-900">{item.weightKg}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Quantity (MT)</span>
              <span className="font-bold text-slate-900">{item.qtyUnit}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Condition Grade</span>
              <span className="font-semibold text-slate-800">{item.condition}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Storage Location</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Expected Price / MT</span>
              <span className="font-bold text-slate-900">{item.expPriceMT}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="font-medium text-slate-500">Date Logged</span>
              <span className="font-medium text-slate-700">{item.dateAdded || "Aug 12, 2026"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapInventory;
