// Super Admin "Industries" management table config. Column shape matches
// Industries.jsx's actual local data (companyName/code/sector/location/
// tradedValue/status/date) rather than a future backend response — update
// this alongside the page once a real /admin/industries endpoint exists.

import StatusBadge from "../../components/common/StatusBadge";
import {
  getTableData,
  updateTableData,
  deleteTableData,
} from "../../services/table/table.service";

const ADMIN_INDUSTRIES_ENDPOINT = "/admin/industries";

// Ready for real backend integration once this endpoint exists on the API.
// Not wired into adminTableConfig yet — Industries currently manages its
// registry as local state, so the page passes `data` directly (client-side
// mode). Switch to server-side mode by wiring these into Industries'
// <MaterialTable fetchData={getIndustries} deleteData={deleteIndustry} />
// once the backend route is live.
export const getIndustries = (params) => getTableData(ADMIN_INDUSTRIES_ENDPOINT, params);
export const updateIndustry = (id, payload) =>
  updateTableData(ADMIN_INDUSTRIES_ENDPOINT, id, payload);
export const deleteIndustry = (id) => deleteTableData(ADMIN_INDUSTRIES_ENDPOINT, id);

const SECTOR_OPTIONS = [
  "Automobile",
  "Steel Plant",
  "Electronics",
  "Plastics",
  "Textile",
  "Manufacturing",
];

export const STATUS_VARIANTS = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

export const adminColumns = [
  {
    accessorKey: "companyName",
    header: "COMPANY",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
          {row.original.initials}
        </div>
        <div>
          <div className="font-bold text-foreground leading-tight">{row.original.companyName}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{row.original.code}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "sector",
    header: "SECTOR",
    filterVariant: "select",
    filterSelectOptions: SECTOR_OPTIONS,
  },
  {
    accessorKey: "location",
    header: "LOCATION",
  },
  {
    accessorKey: "tradedValue",
    header: "TRADED VALUE",
    Cell: ({ row }) => row.original.tradedValueDisplay,
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

export const adminTableConfig = {
  title: "Industries",
  columns: adminColumns,
  mobileHiddenColumns: ["sector", "location", "date"],
};
