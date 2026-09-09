import StatusBadge from "../../components/common/StatusBadge";
import { getTableData, deleteTableData } from "../../services/table/table.service";

const MY_SCRAP_ENDPOINT = "/industry/my-scrap";

// Ready for real backend integration once this endpoint exists on the API.
// Not wired into myScrapTableConfig yet — MyScrap currently manages its
// inventory as local state, so the page passes `data` directly (client-side
// mode). Switch to server-side mode by wiring these into MyScrap's
// <MaterialTable fetchData={getMyScrapInventory} deleteData={deleteMyScrapInventory} />
// once the backend route is live.
export const getMyScrapInventory = (params) => getTableData(MY_SCRAP_ENDPOINT, params);
export const deleteMyScrapInventory = (id) => deleteTableData(MY_SCRAP_ENDPOINT, id);

const CATEGORY_VARIANTS = {
  Steel: "neutral",
  Copper: "warning",
  Aluminium: "info",
  Plastic: "purple",
  "Electronic Waste": "danger",
  Rubber: "neutral",
};

const CONDITION_VARIANTS = {
  "Grade A": "success",
  "Grade B": "warning",
  "Grade C": "danger",
};

const STATUS_VARIANTS = {
  Available: "success",
  "Partially Listed": "warning",
  "Fully Listed": "info",
  Sold: "neutral",
};

export const myScrapColumns = [
  {
    accessorKey: "material",
    header: "MATERIAL",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
          <img
            src={row.original.imageUrl}
            alt={row.original.material}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=150&auto=format&fit=crop&q=80";
            }}
          />
        </div>
        <div>
          <div className="font-bold text-slate-900 leading-snug">{row.original.material}</div>
          <div className="text-[10px] text-slate-400 font-mono font-medium">{row.original.id}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    filterVariant: "select",
    filterSelectOptions: Object.keys(CATEGORY_VARIANTS),
    Cell: ({ cell }) => {
      const category = cell.getValue();
      return <StatusBadge label={category} variant={CATEGORY_VARIANTS[category] || "neutral"} />;
    },
  },
  {
    accessorKey: "weightKg",
    header: "WEIGHT",
  },
  {
    accessorKey: "qtyUnit",
    header: "QTY / UNIT",
  },
  {
    accessorKey: "condition",
    header: "CONDITION",
    filterVariant: "select",
    filterSelectOptions: Object.keys(CONDITION_VARIANTS),
    Cell: ({ cell }) => {
      const condition = cell.getValue();
      return <StatusBadge label={condition} variant={CONDITION_VARIANTS[condition] || "neutral"} />;
    },
  },
  {
    accessorKey: "location",
    header: "LOCATION",
  },
  {
    accessorKey: "expPriceMT",
    header: "EXP. PRICE/MT",
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
];

export const myScrapTableConfig = {
  title: "Scrap Inventory",
  columns: myScrapColumns,
  mobileHiddenColumns: ["category", "condition", "location"],
};
