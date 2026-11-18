// Super Admin "Scrap Categories" table config. Still mock data
// (ScrapCategories.jsx manages `categories` as local state) — no backend
// category-management endpoint exists yet (only GET /category was built).

import StatusBadge from "../../components/common/StatusBadge";

const STATUS_VARIANTS = {
  Approved: "success",
  Pending: "warning",
};

export const scrapCategoriesColumns = [
  {
    accessorKey: "name",
    header: "CATEGORY",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-500">
          {row.original.code}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">{row.original.name}</div>
          <div className="text-xs text-slate-400">{row.original.id}</div>
        </div>
      </div>
    ),
  },
  { accessorKey: "materials", header: "MATERIALS" },
  {
    accessorKey: "stock",
    header: "LIVE STOCK",
    Cell: ({ row }) => (
      <>
        <span className="font-medium">{row.original.stock}</span>{" "}
        <span className="text-xs text-slate-500">{row.original.unit}</span>
      </>
    ),
  },
  { accessorKey: "value", header: "VALUE" },
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
  { accessorKey: "date", header: "DATE" },
];

export const scrapCategoriesTableConfig = {
  title: "Scrap Categories",
  columns: scrapCategoriesColumns,
  mobileHiddenColumns: ["value", "date"],
};
