// Industry "Current stock" table config for IndustryInventory.jsx.
// Column shape matches the REAL backend response from GET /api/scrap
// (scrap.service.js -> prisma.scrapRecord.findMany, include: { category: true }).
//
// Backend fields actually available (see prisma/schema.prisma ScrapRecord
// and core/utils/validation.js): id, categoryId, category{id,name},
// description, condition, locationLabel, totalQuantityKg, listedQuantityKg,
// soldQuantityKg, availableQuantityKg, status, createdAt, updatedAt.
//
// There is no dedicated "material name" or "unit" field on the backend —
// see the field-mapping notes below.

import StatusBadge from "../../components/common/StatusBadge";

// ScrapStatus enum (prisma/schema.prisma) — this is Scrap Inventory status,
// NOT Marketplace/Listing/Auction status (Pending/Published/Live Auction/
// etc. belong to the Listing model and aren't returned by GET /scrap).
export const SCRAP_STATUS_VARIANTS = {
  AVAILABLE: "success",
  PARTIALLY_LISTED: "warning",
  FULLY_LISTED: "info",
  SOLD_OUT: "neutral",
};

export const formatScrapDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const stockInventoryColumns = [
  {
    // No dedicated "material name" field exists on ScrapRecord — this shows
    // `description` (free-text, set by the user) as the primary label,
    // falling back to the category name when no description was entered.
    accessorKey: "description",
    header: "MATERIAL",
    Cell: ({ row }) => (
      <div>
        <div className="font-semibold text-slate-900">
          {row.original.description || row.original.category?.name || "Untitled"}
        </div>
        {row.original.description && row.original.category?.name && (
          <div className="text-[11px] text-slate-400">{row.original.category.name}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category.name",
    header: "CATEGORY",
    Cell: ({ row }) => row.original.category?.name || "—",
  },
  {
    // Quantities are always expressed in Kg on the backend (field name is
    // literally `totalQuantityKg`) — there's no separate configurable unit.
    accessorKey: "totalQuantityKg",
    header: "QUANTITY",
    Cell: ({ row }) => (
      <div>
        <div className="font-semibold text-slate-900">{row.original.totalQuantityKg} kg</div>
        {Number(row.original.availableQuantityKg) !== Number(row.original.totalQuantityKg) && (
          <div className="text-[11px] text-slate-400">
            {row.original.availableQuantityKg} kg available
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "locationLabel",
    header: "WAREHOUSE / LOCATION",
    Cell: ({ cell }) => cell.getValue() || "—",
  },
  {
    accessorKey: "condition",
    header: "CONDITION",
    Cell: ({ cell }) => cell.getValue() || "—",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "select",
    filterSelectOptions: Object.keys(SCRAP_STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue();
      return <StatusBadge label={status} variant={SCRAP_STATUS_VARIANTS[status] || "neutral"} />;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "LAST UPDATED",
    Cell: ({ cell }) => formatScrapDate(cell.getValue()),
  },
];

export const stockInventoryTableConfig = {
  title: "Current stock",
  columns: stockInventoryColumns,
  mobileHiddenColumns: ["category.name", "condition", "updatedAt"],
};
