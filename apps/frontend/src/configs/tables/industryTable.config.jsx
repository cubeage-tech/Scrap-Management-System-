import { Clock, CheckCircle2 } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import { getTableData, deleteTableData } from "../../services/table/table.service";

const SCRAP_INVENTORY_ENDPOINT = "/industry/scrap";

// Ready for real backend integration once this endpoint exists on the API.
// Not wired into industryTableConfig yet — IndustryDashboard currently
// manages its inventory as local state, so the integration passes `data`
// directly (client-side mode). Uncomment `fetchData`/`deleteData` below
// once the backend route is live to switch this table to server-side mode.
export const getScrapInventory = (params) => getTableData(SCRAP_INVENTORY_ENDPOINT, params);
export const deleteScrapInventory = (id) => deleteTableData(SCRAP_INVENTORY_ENDPOINT, id);

const STATUS_VARIANTS = {
  "Bidding Live": { variant: "warning", pulse: true },
  "Pending Quote": { variant: "purple", icon: Clock },
  Scheduled: { variant: "info" },
  "In Stock": { variant: "neutral" },
  Completed: { variant: "success", icon: CheckCircle2 },
  Cancelled: { variant: "danger" },
};

export const industryColumns = [
  {
    accessorKey: "title",
    header: "SCRAP LOT",
    Cell: ({ row }) => (
      <div>
        <div className="font-bold text-slate-900 text-sm">{row.original.title}</div>
        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
          <span className="font-mono text-blue-600 font-semibold">{row.original.id}</span>
          <span>&middot; Added {row.original.dateAdded}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    filterVariant: "select",
    filterSelectOptions: [
      "Ferrous Metal",
      "Non-Ferrous Metal",
      "Electrical & Cable",
      "Plastic & Rubber",
      "E-Scrap & Machinery",
    ],
  },
  {
    accessorKey: "grade",
    header: "GRADE",
    filterVariant: "select",
    filterSelectOptions: ["Grade A", "Grade B", "Grade C"],
  },
  {
    accessorKey: "weight",
    header: "WEIGHT",
  },
  {
    accessorKey: "pricePerUnit",
    header: "RESERVE PRICE",
  },
  {
    accessorKey: "totalValue",
    header: "TOTAL VALUE",
  },
  {
    accessorKey: "mode",
    header: "SALES MODE",
    filterVariant: "select",
    filterSelectOptions: ["Live Auction", "Sealed Tender", "B2B Marketplace"],
  },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "select",
    filterSelectOptions: Object.keys(STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue();
      const cfg = STATUS_VARIANTS[status] || {};
      return <StatusBadge label={status} {...cfg} />;
    },
  },
];

export const industryTableConfig = {
  title: "Scrap Inventory",
  columns: industryColumns,
  mobileHiddenColumns: ["grade", "pricePerUnit", "mode"],
};
