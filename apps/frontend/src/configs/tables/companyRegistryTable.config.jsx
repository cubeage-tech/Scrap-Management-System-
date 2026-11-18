// Super Admin Dashboard "Company Registry" widget table config.
// Column shape matches the dashboard's mock `latestCompanies` data
// (fetchDashboardData in SuperAdminDashboard.jsx) — replace alongside that
// mock function once a real analytics/dashboard endpoint exists.

import StatusBadge from "../../components/common/StatusBadge";

const STATUS_VARIANTS = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

export const companyRegistryColumns = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "name",
    header: "COMPANY",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-[#011C6B] font-bold text-xs">
          {row.original.initials}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{row.original.name}</p>
          <p className="text-xs text-gray-500">{row.original.location}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "role", header: "ROLE", filterVariant: "select" },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "select",
    filterSelectOptions: Object.keys(STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue();
      return <StatusBadge label={status} variant={STATUS_VARIANTS[status] || "neutral"} />;
    },
  },
];

export const companyRegistryTableConfig = {
  title: "Company Registry",
  columns: companyRegistryColumns,
  mobileHiddenColumns: ["role"],
};
