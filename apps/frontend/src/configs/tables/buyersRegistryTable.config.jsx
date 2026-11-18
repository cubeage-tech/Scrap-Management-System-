// Super Admin "Buyers" management table config. Column shape matches the
// mapped response of GET /admin/buyers (see Buyers.jsx's fetchBuyers).

import StatusBadge from "../../components/common/StatusBadge";

const TYPE_OPTIONS = ["Recycler", "Steel Plant", "Plastics", "Refinery", "Paper", "General"];

const STATUS_VARIANTS = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
  Suspended: "neutral",
};

export const buyersRegistryColumns = [
  {
    accessorKey: "name",
    header: "BUYER",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
          {row.original.initials || "BY"}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{row.original.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.original.code}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "TYPE",
    filterVariant: "select",
    filterSelectOptions: TYPE_OPTIONS,
  },
  {
    accessorKey: "location",
    header: "LOCATION",
  },
  {
    accessorKey: "spend",
    header: "SPEND",
    Cell: ({ row }) => row.original.spendDisplay,
  },
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
  {
    accessorKey: "date",
    header: "DATE",
  },
];

export const buyersRegistryTableConfig = {
  title: "Buyers",
  columns: buyersRegistryColumns,
  mobileHiddenColumns: ["type", "location", "date"],
};
