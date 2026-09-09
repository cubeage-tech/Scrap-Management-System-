import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, ChevronRight } from "lucide-react";

import MaterialTable from "../../components/common/MaterialTable";
import { adminTableConfig } from "../../configs/tables/adminTable.config";
import ApiService from "../../core/services/api.service";
import Loader from "../../components/common/Loader";
import IndustryOnboardModal from "./industries/IndustryOnboardModal";
import IndustryViewModal from "./industries/IndustryViewModal";
import IndustryEditModal from "./industries/IndustryEditModal";
import { updateIndustryStatus } from "../../core/services/industry.service";

const STATUS_TO_BACKEND = {
  Approved: "ACTIVE",
  Pending: "PENDING",
  Rejected: "REJECTED",
};

const EMPTY_FORM = {
  companyName: "",
  sector: "Automobile",
  location: "",
  tradedValue: "",
  status: "Approved",
  contactPerson: "",
  email: "",
  phone: "",
  gstNumber: "",
};

const getInitials = (name) => {
  const words = name.trim().split(" ");
  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase();
};

export default function Industries() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  // Modal States
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(null);

  // Form State
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetched once in full; MaterialTable owns search/filter/sort/pagination
      // client-side from here on, so there's no need to re-fetch on those.
      const response = await ApiService.getIndustries({

        limit: 1000,
      });

      if (response.data?.success) {
        // Map backend response to frontend format
        const mappedIndustries = response.data.data.map((org) => ({
          id: org.id,
          initials: getInitials(org.companyName),
          companyName: org.companyName,
          code: org.code,
          sector: org.sector,
          location: org.location,
          tradedValue: org.tradedValue || 0,
          tradedValueDisplay: org.tradedValueDisplay || "₹0",
          status: org.status === "ACTIVE" ? "Approved" : org.status === "PENDING" ? "Pending" : "Rejected",
          date: new Date(org.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          contactPerson: org.contactPerson,
          email: org.contactEmail,
          phone: org.contactPhone,
          gstNumber: org.gstNumber,
          createdAt: org.createdAt,
          address: org.address,
        }));

        setIndustries(mappedIndustries);
      }
    } catch (err) {
      console.error("Failed to fetch industries:", err);
      setError(err.response?.data?.message || "Failed to fetch industries");
    } finally {
      setLoading(false);
    }
  };

  // Fetch industries data from API
  useEffect(() => {
    Promise.resolve().then(fetchIndustries);
  }, []);

  // Row selection state, adapted between MaterialTable's { [id]: true } shape
  // (used by Material React Table's built-in checkbox column) and the plain
  // `selectedRows` array that CSV export scoping uses.
  const rowSelection = useMemo(
    () => Object.fromEntries(selectedRows.map((id) => [id, true])),
    [selectedRows]
  );

  const handleRowSelectionChange = (updaterOrValue) => {
    const nextSelection =
      typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    setSelectedRows(Object.keys(nextSelection).filter((id) => nextSelection[id]));
  };

  // Export to CSV
  const handleExport = () => {
    const dataToExport =
      selectedRows.length > 0
        ? industries.filter((item) => selectedRows.includes(item.id))
        : industries;

    const headers = [
      "ID",
      "Company Name",
      "Code",
      "Sector",
      "Location",
      "Traded Value",
      "Status",
      "Date",
      "Contact Person",
      "Email",
      "Phone",
      "GST Number",
    ];

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((row) =>
        [
          `"${row.id}"`,
          `"${row.companyName}"`,
          `"${row.code}"`,
          `"${row.sector}"`,
          `"${row.location}"`,
          `"${row.tradedValueDisplay}"`,
          `"${row.status}"`,
          `"${row.date}"`,
          `"${row.contactPerson || ""}"`,
          `"${row.email || ""}"`,
          `"${row.phone || ""}"`,
          `"${row.gstNumber || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Industries_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form submission: Onboard / Add
  const handleAddIndustry = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.location) return;

    try {
      // No onboard endpoint exists on the backend yet, so this stays local-only.
      const rawVal = parseFloat(formData.tradedValue) || 0;

      const newIndustry = {
        id: String(Date.now()),
        initials: getInitials(formData.companyName),
        companyName: formData.companyName,
        code: "IND-" + (1043 + industries.length),
        sector: formData.sector,
        location: formData.location,
        tradedValue: rawVal,
        tradedValueDisplay: "₹" + rawVal.toLocaleString("en-IN"),
        status: formData.status,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        gstNumber: formData.gstNumber,
      };

      setIndustries([newIndustry, ...industries]);
      setIsOnboardModalOpen(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      console.error("Failed to add industry:", err);
      setError("Failed to onboard industry");
    }
  };

  // Form submission: Edit — no backend endpoint exists yet for arbitrary
  // field edits, so those stay local-only. Status IS backed by a real
  // endpoint though, so a status change made from this form is persisted
  // for real instead of silently being lost on refresh.
  const handleEditIndustry = async (e) => {
    e.preventDefault();
    if (!activeIndustry) return;

    const rawVal = parseFloat(formData.tradedValue) || activeIndustry.tradedValue;
    const formattedVal =
      typeof formData.tradedValue === "string" && formData.tradedValue.startsWith("₹")
        ? formData.tradedValue
        : "₹" + rawVal.toLocaleString("en-IN");

    if (formData.status !== activeIndustry.status) {
      try {
        await updateIndustryStatus(activeIndustry.id, {
          accountState: STATUS_TO_BACKEND[formData.status],
        });
      } catch (err) {
        console.error("Failed to update industry status:", err);
        alert(err.response?.data?.message || "Failed to update industry status.");
        return;
      }
    }

    setIndustries((prev) =>
      prev.map((item) =>
        item.id === activeIndustry.id
          ? {
              ...item,
              companyName: formData.companyName,
              sector: formData.sector,
              location: formData.location,
              tradedValue: rawVal,
              tradedValueDisplay: formattedVal,
              status: formData.status,
              contactPerson: formData.contactPerson,
              email: formData.email,
              phone: formData.phone,
              gstNumber: formData.gstNumber,
            }
          : item
      )
    );

    setIsEditModalOpen(false);
    setActiveIndustry(null);
  };

  // Approve/Reject/Set-Pending — wired to the real admin status endpoint.
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateIndustryStatus(id, { accountState: STATUS_TO_BACKEND[newStatus] });
      setIndustries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setActiveIndustry((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error("Failed to update industry status:", err);
      alert(err.response?.data?.message || "Failed to update industry status.");
    }
  };

  const openEditModal = (industry) => {
    setActiveIndustry(industry);
    setFormData({
      companyName: industry.companyName,
      sector: industry.sector,
      location: industry.location,
      tradedValue: industry.tradedValue,
      status: industry.status,
      contactPerson: industry.contactPerson || "",
      email: industry.email || "",
      phone: industry.phone || "",
      gstNumber: industry.gstNumber || "",
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans text-foreground">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ================= BREADCRUMBS ================= */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-normal">
          <Link to="/admin/dashboard" className="hover:text-foreground transition-colors">
            SmartScrap AI
          </Link>
          <ChevronRight size={14} className="text-muted-foreground/70" />
          <span className="text-foreground font-semibold">Industries</span>
        </nav>

        {/* ================= HEADER & ACTIONS ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Industries
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-normal">
              Registered manufacturing plants and their trade volume.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              title="Export to CSV"
            >
              <Download size={16} className="text-muted-foreground" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData(EMPTY_FORM);
                setIsOnboardModalOpen(true);
              }}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>Onboard industry</span>
            </button>
          </div>
        </div>

        {/* ================= INDUSTRIES TABLE ================= */}
        {/* Search, per-column filtering, sorting, and pagination are all
            handled natively by MaterialTable (see adminTable.config.jsx) —
            no need to duplicate that logic here. */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">
            <p className="font-semibold">Error loading industries</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              type="button"
              onClick={fetchIndustries}
              className="mt-3 px-4 py-2 text-sm font-semibold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
            >
              Try Again
            </button>
          </div>
        ) : (
          <MaterialTable
            config={adminTableConfig}
            data={industries}
            getRowId={(row) => row.id}
            onView={(industry) => {
              setActiveIndustry(industry);
              setIsViewModalOpen(true);
            }}
            onEdit={openEditModal}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={handleRowSelectionChange}
          />
        )}
      </div>

      <IndustryOnboardModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddIndustry}
      />

      <IndustryViewModal
        isOpen={isViewModalOpen}
        industry={activeIndustry}
        onClose={() => setIsViewModalOpen(false)}
        onStatusChange={handleStatusChange}
      />

      <IndustryEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditIndustry}
      />
    </div>
  );
}
