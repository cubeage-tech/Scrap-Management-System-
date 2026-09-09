import StatusBadge from "../../components/common/StatusBadge";
import { getTableData, deleteTableData } from "../../services/table/table.service";

const DEALERS_REGISTRY_ENDPOINT = "/admin/dealers";

// Ready for real backend integration once this endpoint exists on the API.
// Not wired into dealersRegistryTableConfig yet — Dealers currently manages
// its registry as local state, so the page passes `data` directly
// (client-side mode). Switch to server-side mode by wiring these into
// Dealers' <MaterialTable fetchData={getDealersRegistry} deleteData={deleteDealersRegistry} />
// once the backend route is live.
export const getDealersRegistry = (params) => getTableData(DEALERS_REGISTRY_ENDPOINT, params);
export const deleteDealersRegistry = (id) => deleteTableData(DEALERS_REGISTRY_ENDPOINT, id);

const SPECIALISATION_OPTIONS = [
  "Ferrous & Non-Ferrous",
  "Ferrous",
  "Non-Ferrous",
  "Polymer",
  "E-Waste",
];

const STATUS_VARIANTS = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

export const dealersRegistryColumns = [
  {
    accessorKey: "name",
    header: "DEALER",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
          {row.original.initials || "DL"}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{row.original.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.original.code}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "specialisation",
    header: "SPECIALISATION",
    filterVariant: "select",
    filterSelectOptions: SPECIALISATION_OPTIONS,
  },
  {
    accessorKey: "location",
    header: "LOCATION",
  },
  {
    accessorKey: "purchaseValueRaw",
    header: "PURCHASE VALUE",
    Cell: ({ row }) => row.original.purchaseValue,
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

export const dealersRegistryTableConfig = {
  title: "Scrap Dealers",
  columns: dealersRegistryColumns,
  mobileHiddenColumns: ["specialisation", "location", "date"],
};
