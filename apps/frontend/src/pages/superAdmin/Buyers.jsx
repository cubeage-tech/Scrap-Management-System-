import { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronDown,
  X,
  Check,
  Ban,
} from "lucide-react";

import MaterialTable from "../../components/common/MaterialTable";
import { buyersRegistryTableConfig } from "../../configs/tables/buyersRegistryTable.config";
import {getBuyers, updateBuyerStatus} from "../../core/services/buyer.service";
import Loader from "../../components/common/Loader";

const STATUSES = ["All statuses", "Approved", "Pending", "Rejected", "Suspended"];
const TYPES = ["All types", "Recycler", "Steel Plant", "Plastics", "Refinery", "Paper", "General"];

const STATUS_TO_BACKEND = {
  Approved: "ACTIVE",
  Pending: "PENDING",
  Rejected: "REJECTED",
  Suspended: "SUSPENDED",
};

const BACKEND_TO_STATUS = {
  ACTIVE: "Approved",
  PENDING: "Pending",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

const money = (val) => `₹${Number(val).toLocaleString("en-IN")}`;

const getInitials = (name) => {
  const words = name.trim().split(" ");
  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase();
};

const Buyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Top Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "All statuses",
    type: "All types",
    location: "All locations",
    min: "",
    max: "",
  });

  // Selection State
  const [selected, setSelected] = useState([]);

  // Modals
  const [viewBuyer, setViewBuyer] = useState(null);
  const [editBuyer, setEditBuyer] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    type: "Recycler",
    location: "",
    spend: "",
    status: "Pending",
  });

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      setError(null);

      const statusParam =
        filters.status !== "All statuses" ? STATUS_TO_BACKEND[filters.status] : undefined;

      const response = await getBuyers({
        status: statusParam,
        search: search || undefined,
        page,
        limit: 10,
      });

      if (response.data?.success) {
        const mapped = response.data.data.map((org) => ({
          id: org.id,
          initials: getInitials(org.name),
          name: org.name,
          code: org.code,
          type: org.type,
          location: org.location,
          gstNumber: org.gstNumber,
          contactPerson: org.contactPerson,
          email: org.contactEmail,
          phone: org.contactPhone,
          spend: org.spend || 0,
          spendDisplay: org.spendDisplay || "₹0",
          status: BACKEND_TO_STATUS[org.status] || org.status,
          date: new Date(org.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          createdAt: org.createdAt,
        }));

        setBuyers(mapped);
        setTotalRecords(response.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch buyers:", err);
      setError(err.response?.data?.message || "Failed to fetch buyers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch buyers from the real admin endpoint
  useEffect(() => {
    Promise.resolve().then(fetchBuyers);
  }, [page, filters.status, search]);

  // Dynamic Location List
  const locationsList = useMemo(() => {
    return ["All locations", ...new Set(buyers.map((b) => b.location))];
  }, [buyers]);

  // Search / secondary filter logic (status is already applied server-side;
  // this narrows further on type/location/spend without another round trip)
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    return buyers.filter((buyer) => {
      const matchesSearch =
        !query ||
        `${buyer.name} ${buyer.code} ${buyer.type} ${buyer.location}`
          .toLowerCase()
          .includes(query);

      const matchesType = filters.type === "All types" || buyer.type === filters.type;

      const matchesLocation =
        filters.location === "All locations" || buyer.location === filters.location;

      const matchesMin = !filters.min || buyer.spend >= Number(filters.min);
      const matchesMax = !filters.max || buyer.spend <= Number(filters.max);

      return matchesSearch && matchesType && matchesLocation && matchesMin && matchesMax;
    });
  }, [buyers, search, filters]);

  // Row selection state, adapted between MaterialTable's { [id]: true } shape
  // and the plain `selected` array used by the bulk-action bar.
  const rowSelection = useMemo(
    () => Object.fromEntries(selected.map((id) => [id, true])),
    [selected]
  );

  const handleRowSelectionChange = (updaterOrValue) => {
    const next = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    setSelected(Object.keys(next).filter((id) => next[id]));
  };

  // Bulk actions — wired to the real approve/reject endpoint
  const handleApproveSelected = async () => {
    try {
      await Promise.all(
        selected.map((id) => updateBuyerStatus(id, { accountState: "ACTIVE" }))
      );
      setSelected([]);
      fetchBuyers();
    } catch (err) {
      console.error("Failed to approve buyers:", err);
      alert(err.response?.data?.message || "Failed to approve selected buyers.");
    }
  };

  const handleRejectSelected = async () => {
    try {
      await Promise.all(
        selected.map((id) => updateBuyerStatus(id, { accountState: "REJECTED" }))
      );
      setSelected([]);
      fetchBuyers();
    } catch (err) {
      console.error("Failed to reject buyers:", err);
      alert(err.response?.data?.message || "Failed to reject selected buyers.");
    }
  };

  const handleExportSelected = () => {
    alert(`Exporting ${selected.length} selected buyers...`);
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      status: "All statuses",
      type: "All types",
      location: "All locations",
      min: "",
      max: "",
    });
  };

  // Edit modal save — no backend endpoint exists yet to update arbitrary
  // buyer org fields, so those stay local-only. Status IS backed by a real
  // endpoint though, so a status change made from this form is persisted
  // for real instead of silently being lost on refresh.
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editBuyer) return;

    const original = buyers.find((b) => b.id === editBuyer.id);
    if (original && editBuyer.status !== original.status) {
      try {
        await updateBuyerStatus(editBuyer.id, {
          accountState: STATUS_TO_BACKEND[editBuyer.status],
        });
      } catch (err) {
        console.error("Failed to update buyer status:", err);
        alert(err.response?.data?.message || "Failed to update buyer status.");
        return;
      }
    }

    setBuyers((prev) => prev.map((b) => (b.id === editBuyer.id ? editBuyer : b)));
    setEditBuyer(null);
  };

  // Invite modal — no backend endpoint exists yet to onboard a buyer from
  // the admin side, so this stays local-only (same as before).
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    const newBuyer = {
      id: `local-${Date.now()}`,
      name: inviteForm.name,
      initials: getInitials(inviteForm.name),
      type: inviteForm.type,
      location: inviteForm.location || "Mumbai, MH",
      spend: Number(inviteForm.spend) || 0,
      spendDisplay: money(Number(inviteForm.spend) || 0),
      status: inviteForm.status,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setBuyers([newBuyer, ...buyers]);
    setShowInviteModal(false);
    setInviteForm({ name: "", email: "", type: "Recycler", location: "", spend: "", status: "Pending" });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]";
      case "Pending":
        return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
      case "Rejected":
        return "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]";
      case "Suspended":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-5 lg:p-6 text-slate-800 font-sans">

      {/* BREADCRUMB */}
      <div className="flex items-center text-xs text-slate-400 gap-1.5 mb-2">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span>Network</span>
        <span>›</span>
        <span className="text-slate-800 font-medium">Buyers</span>
      </div>

      {/* HEADER TITLE & TOP BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Buyers</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Recyclers and consumers purchasing scrap on the platform.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm ${
              showFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <span>+ Invite buyer</span>
          </button>
        </div>
      </div>

      {/* EXPANDABLE TOP FILTER PANEL */}
      {showFilters && (
        <div className="mb-5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end transition-all">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white outline-none focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white outline-none focus:border-blue-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white outline-none focus:border-blue-500"
            >
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Min Spend</label>
            <input
              type="number"
              placeholder="₹ Minimum"
              value={filters.min}
              onChange={(e) => setFilters({ ...filters, min: e.target.value })}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Max Spend</label>
            <input
              type="number"
              placeholder="₹ Maximum"
              value={filters.max}
              onChange={(e) => setFilters({ ...filters, max: e.target.value })}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <button
              onClick={clearFilters}
              className="h-9 px-3 text-xs sm:text-sm text-blue-600 hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* FLOATING SELECTION ACTION BAR */}
      {selected.length > 0 && (
        <div className="mb-4 px-3 sm:px-4 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl sm:rounded-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all">
          <div className="flex items-center space-x-2 pl-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
            <span className="text-xs sm:text-sm font-bold text-[#1E3A8A]">
              {selected.length} {selected.length === 1 ? "buyer" : "buyers"} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportSelected}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-[#BFDBFE] text-[#1D4ED8] rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>

            <button
              onClick={handleApproveSelected}
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>

            <button
              onClick={handleRejectSelected}
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              onClick={() => setSelected([])}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-t-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full sm:w-auto appearance-none pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <SlidersHorizontal className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => alert("Exporting buyer list...")}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-semibold">Error loading buyers</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchBuyers}
                className="mt-3 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <MaterialTable
            config={buyersRegistryTableConfig}
            data={filteredData}
            getRowId={(row) => row.id}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={handleRowSelectionChange}
            onView={(buyer) => setViewBuyer(buyer)}
            onEdit={(buyer) => setEditBuyer(buyer)}
          />
        )}
      </div>

      {/* VIEW BUYER INFO POPUP MODAL */}
      {viewBuyer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Buyer Details</h3>
              <button onClick={() => setViewBuyer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-xs text-slate-400">Buyer Name</p>
                <p className="font-semibold text-slate-800 mt-0.5">{viewBuyer.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Buyer ID</p>
                <p className="font-mono text-slate-800 mt-0.5">{viewBuyer.code}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Type</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewBuyer.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Location</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewBuyer.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">GST Number</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewBuyer.gstNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Contact Person</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewBuyer.contactPerson || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewBuyer.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewBuyer.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Spend</p>
                <p className="font-semibold text-slate-900 mt-0.5">{viewBuyer.spendDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Date Joined</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewBuyer.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusBadge(viewBuyer.status)}`}>
                  {viewBuyer.status}
                </span>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewBuyer(null)}
                className="px-4 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#1D4ED8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BUYER POPUP MODAL */}
      {editBuyer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Edit Buyer</h3>
              <button onClick={() => setEditBuyer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer Name</label>
                <input
                  type="text"
                  value={editBuyer.name}
                  onChange={(e) => setEditBuyer({ ...editBuyer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={editBuyer.type}
                  onChange={(e) => setEditBuyer({ ...editBuyer, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500 bg-white"
                >
                  {TYPES.slice(1).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editBuyer.location}
                  onChange={(e) => setEditBuyer({ ...editBuyer, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Spend (₹)</label>
                <input
                  type="number"
                  value={editBuyer.spend}
                  onChange={(e) => setEditBuyer({ ...editBuyer, spend: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editBuyer.status}
                  onChange={(e) => setEditBuyer({ ...editBuyer, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500 bg-white"
                >
                  {STATUSES.slice(1).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditBuyer(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE BUYER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Invite New Buyer</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Recycling Ltd."
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email ID</label>
                <input
                  type="email"
                  required
                  placeholder="buyer@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={inviteForm.type}
                  onChange={(e) => setInviteForm({ ...inviteForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500 bg-white"
                >
                  {TYPES.slice(1).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad, GJ"
                  value={inviteForm.location}
                  onChange={(e) => setInviteForm({ ...inviteForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Spend (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={inviteForm.spend}
                  onChange={(e) => setInviteForm({ ...inviteForm, spend: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Buyers;
