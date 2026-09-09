import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Filter,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  AlertCircle,
  Plus,
  RotateCcw,
} from "lucide-react";

import MaterialTable from "../../components/common/MaterialTable";
import { dealersRegistryTableConfig } from "../../configs/tables/dealersRegistryTable.config";
import OnboardDealerModal from "../../components/superAdmin/OnboardDealerModal";
import DealerViewModal from "../../components/superAdmin/DealerViewModal";
import DealerEditModal from "../../components/superAdmin/DealerEditModal";
import { getDealers, updateDealerStatus } from "../../core/services/dealer.service";
import Loader from "../../components/common/Loader";

const STATUS_TO_BACKEND = {
  Approved: "ACTIVE",
  Pending: "PENDING",
  Rejected: "REJECTED",
};

const BACKEND_TO_STATUS = {
  ACTIVE: "Approved",
  PENDING: "Pending",
  REJECTED: "Rejected",
  SUSPENDED: "Rejected",
};

const getInitials = (name) => {
  const words = name.trim().split(" ");
  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase();
};

// --- Custom Sleek Dropdown Component ---
const CustomDropdown = ({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder = "Select...",
  className = "",
  menuAlign = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: value || placeholder,
    value,
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer select-none w-full"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          {selectedOption.dot && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dot}`} />
          )}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            menuAlign === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 z-50 min-w-[170px] w-full bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-xs animate-in fade-in zoom-in-95 duration-100 overflow-hidden`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.dot && (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const STATUS_FILTER_OPTIONS = [
  { value: "All statuses", label: "All statuses", dot: "bg-slate-400" },
  { value: "Approved", label: "Approved", dot: "bg-emerald-500" },
  { value: "Pending", label: "Pending", dot: "bg-amber-500" },
  { value: "Rejected", label: "Rejected", dot: "bg-rose-500" },
];

const SPECIALISATION_FILTER_OPTIONS = [
  { value: "All specialisations", label: "All Specialisations" },
  { value: "Ferrous & Non-Ferrous", label: "Ferrous & Non-Ferrous" },
  { value: "Ferrous", label: "Ferrous Metal" },
  { value: "Non-Ferrous", label: "Non-Ferrous Metal" },
  { value: "Polymer", label: "Polymer & Plastic" },
  { value: "E-Waste", label: "Electronic Waste" },
];

const LOCATION_FILTER_OPTIONS = [
  { value: "All locations", label: "All Regions" },
  { value: "MH", label: "Maharashtra (MH)" },
  { value: "DL", label: "Delhi (DL)" },
  { value: "GJ", label: "Gujarat (GJ)" },
  { value: "TS", label: "Telangana (TS)" },
  { value: "KA", label: "Karnataka (KA)" },
];

const Dealers = () => {
  // --- Data State ---
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Filter & Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [specialisationFilter, setSpecialisationFilter] = useState("All specialisations");
  const [stateFilter, setStateFilter] = useState("All locations");
  const [showExtendedFilters, setShowExtendedFilters] = useState(false);

  // --- Modals State ---
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [viewingDealer, setViewingDealer] = useState(null);
  const [editingDealer, setEditingDealer] = useState(null);

  // --- Toast Notification ---
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchDealers = async () => {
    try {
      setLoading(true);
      setError(null);

      const statusParam =
        statusFilter !== "All statuses" ? STATUS_TO_BACKEND[statusFilter] : undefined;

      const response = await getDealers({
        status: statusParam,
        search: searchQuery || undefined,
        page: 1,
        limit: 100,
      });

      if (response.data?.success) {
        const mapped = response.data.data.map((org) => ({
          id: org.id,
          code: org.code,
          initials: getInitials(org.name),
          name: org.name,
          specialisation: org.specialisation,
          location: org.location,
          purchaseValueRaw: org.purchaseValue,
          purchaseValue: org.purchaseValueDisplay,
          status: BACKEND_TO_STATUS[org.status] || org.status,
          date: org.date,
          contactPerson: org.contactPerson,
          email: org.contactEmail,
          phone: org.contactPhone,
          gstNumber: org.gstNumber,
        }));

        setDealers(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch dealers:", err);
      setError(err.response?.data?.message || "Failed to fetch dealers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dealers from the real admin endpoint
  useEffect(() => {
    Promise.resolve().then(fetchDealers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  // --- Filtering Logic ---
  // Status is already applied server-side; this narrows further on
  // specialisation/location/search without another round trip.
  const filteredDealers = useMemo(() => {
    return dealers.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.specialisation.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.contactPerson && item.contactPerson.toLowerCase().includes(q));

      const matchesSpec =
        specialisationFilter === "All specialisations" ||
        item.specialisation.toLowerCase().includes(specialisationFilter.toLowerCase());

      const matchesLocation =
        stateFilter === "All locations" || item.location.toLowerCase().includes(stateFilter.toLowerCase());

      return matchesSearch && matchesSpec && matchesLocation;
    });
  }, [dealers, searchQuery, specialisationFilter, stateFilter]);

  // Row selection state, adapted between MaterialTable's { [id]: true } shape
  // (used by Material React Table's built-in checkbox column) and the plain
  // `selectedIds` array that the rest of this page's bulk-action logic uses.
  const rowSelection = useMemo(
    () => Object.fromEntries(selectedIds.map((id) => [id, true])),
    [selectedIds]
  );

  const handleRowSelectionChange = (updaterOrValue) => {
    const nextSelection =
      typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    setSelectedIds(Object.keys(nextSelection).filter((id) => nextSelection[id]));
  };

  // --- CRUD Actions ---
  // No backend endpoint exists yet to onboard a dealer from the admin side,
  // so this stays local-only (same precedent as Buyers' invite modal).
  const handleAddDealer = (newDealer) => {
    setDealers((prev) => [newDealer, ...prev]);
    showToast(`Successfully onboarded ${newDealer.name} (${newDealer.code})!`);
  };

  // No backend endpoint exists yet to update arbitrary dealer fields, so
  // those stay local-only. Status IS backed by a real endpoint though, so a
  // status change made from this form is persisted for real instead of
  // silently being lost on refresh.
  const handleUpdateDealer = async (updated) => {
    const original = dealers.find((d) => d.id === updated.id);
    if (original && updated.status !== original.status) {
      try {
        await updateDealerStatus(updated.id, { accountState: STATUS_TO_BACKEND[updated.status] });
      } catch (err) {
        console.error("Failed to update dealer status:", err);
        alert(err.response?.data?.message || "Failed to update dealer status.");
        return;
      }
    }

    setDealers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Updated details for ${updated.name}`);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDealerStatus(id, { accountState: STATUS_TO_BACKEND[newStatus] });
      showToast(`Status updated to ${newStatus}`);
      fetchDealers();
    } catch (err) {
      console.error("Failed to update dealer status:", err);
      alert(err.response?.data?.message || "Failed to update dealer status.");
    }
  };

  const handleBulkStatus = async (status) => {
    try {
      await Promise.all(
        selectedIds.map((id) => updateDealerStatus(id, { accountState: STATUS_TO_BACKEND[status] }))
      );
      showToast(`Updated ${selectedIds.length} dealer(s) to ${status}`);
      setSelectedIds([]);
      fetchDealers();
    } catch (err) {
      console.error("Failed to update dealer status:", err);
      alert(err.response?.data?.message || "Failed to update selected dealers.");
    }
  };

  // --- CSV Export Functionality ---
  const handleExportCSV = () => {
    const exportData =
      selectedIds.length > 0
        ? dealers.filter((d) => selectedIds.includes(d.id))
        : filteredDealers;

    if (exportData.length === 0) {
      alert("No dealers to export.");
      return;
    }

    const headers = [
      "Dealer Code",
      "Dealer Name",
      "Specialisation",
      "Location",
      "Purchase Value (₹)",
      "Status",
      "Registration Date",
      "Contact Person",
      "Email",
      "Phone",
      "GST Number",
    ];

    const rows = exportData.map((d) => [
      `"${d.code || d.id}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.specialisation}"`,
      `"${d.location}"`,
      `"${d.purchaseValueRaw || d.purchaseValue}"`,
      `"${d.status}"`,
      `"${d.date}"`,
      `"${d.contactPerson || ""}"`,
      `"${d.email || ""}"`,
      `"${d.phone || ""}"`,
      `"${d.gstNumber || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Scrap_Dealers_Registry_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${exportData.length} dealer record(s) to CSV!`);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All statuses");
    setSpecialisationFilter("All specialisations");
    setStateFilter("All locations");
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "All statuses" ||
    specialisationFilter !== "All specialisations" ||
    stateFilter !== "All locations";

  return (
    <div className="space-y-5 font-sans pb-12 text-slate-800 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ================= 1. BREADCRUMBS ================= */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <span className="hover:text-slate-600 transition-colors cursor-pointer">
          SmartScrap AI
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="hover:text-slate-600 transition-colors cursor-pointer">
          Network
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-700 font-semibold">Scrap Dealers</span>
      </nav>

      {/* ================= 2. PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Scrap dealers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Verified dealers sourcing material through the platform.
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowExtendedFilters(!showExtendedFilters)}
            className={`px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              showExtendedFilters || hasActiveFilters
                ? "bg-slate-100 border-slate-300 text-slate-900 shadow-2xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOnboardModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard dealer</span>
          </button>
        </div>
      </div>

      {/* ================= 3. EXTENDED FILTER DRAWER (Collapsible) ================= */}
      {showExtendedFilters && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Advanced Network Filters
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Specialisation Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Specialisation
              </label>
              <CustomDropdown
                value={specialisationFilter}
                onChange={setSpecialisationFilter}
                options={SPECIALISATION_FILTER_OPTIONS}
                menuAlign="left"
              />
            </div>

            {/* Location / State Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Geographic Region
              </label>
              <CustomDropdown
                value={stateFilter}
                onChange={setStateFilter}
                options={LOCATION_FILTER_OPTIONS}
                menuAlign="left"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. BULK ACTIONS BAR (When items selected) ================= */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-950">
              {selectedIds.length} dealer{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-900 hover:bg-blue-100/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Selected
            </button>

            <button
              type="button"
              onClick={() => handleBulkStatus("Approved")}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>

            <button
              type="button"
              onClick={() => handleBulkStatus("Rejected")}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" /> Reject
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. SEARCH & FILTER BAR ================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input (Exact Figma placeholder and design) */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
        </div>

        {/* Right Controls: Custom Status Dropdown + Export Button */}
        <div className="flex items-center gap-2.5">
          {/* Custom Status Dropdown (Replacing native ugly select) */}
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            icon={Filter}
            className="min-w-[140px]"
            menuAlign="right"
          />

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ================= 6. DEALERS TABLE ================= */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
          <Loader />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">Error loading dealers</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchDealers}
            className="mt-3 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <MaterialTable
          config={dealersRegistryTableConfig}
          data={filteredDealers}
          getRowId={(row) => row.id}
          onView={(dealer) => setViewingDealer(dealer)}
          onEdit={(dealer) => setEditingDealer(dealer)}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
        />
      )}

      {/* ================= 7. MODALS ================= */}
      {isOnboardModalOpen && (
        <OnboardDealerModal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          onAddDealer={handleAddDealer}
          nextDealerCode={`DLR-22${dealers.length + 11}`}
        />
      )}

      {viewingDealer && (
        <DealerViewModal
          isOpen={Boolean(viewingDealer)}
          onClose={() => setViewingDealer(null)}
          dealer={viewingDealer}
          onEdit={(d) => setEditingDealer(d)}
          onStatusChange={handleStatusChange}
        />
      )}

      {editingDealer && (
        <DealerEditModal
          isOpen={Boolean(editingDealer)}
          onClose={() => setEditingDealer(null)}
          dealer={editingDealer}
          onUpdateDealer={handleUpdateDealer}
        />
      )}
    </div>
  );
};

export default Dealers;
