// Industry "My Listings" table config. Column shape matches the REAL
// backend response from GET /api/marketplace/listings (listing.service.js
// -> prisma.listing.findMany, include: { scrapRecord: { category } }).
//
// Backend fields actually available (see prisma/schema.prisma Listing
// model and core/utils/validation.js): id, scrapRecordId, sellingMode,
// quantityKg, expectedPricePerKg, closesAt, status, publishedAt, closedAt,
// createdByUserId, createdAt, updatedAt, scrapRecord{category,...}.
//
// There is no dedicated "material name" or "unit" field — same convention
// as stockInventoryTable.config.jsx (Material falls back to category name;
// quantities are always Kg).

import StatusBadge from "../../components/common/StatusBadge";
import { formatScrapDate as formatDate } from "./stockInventoryTable.config";

// ListingStatus enum (prisma/schema.prisma)
export const LISTING_STATUS_VARIANTS = {
  DRAFT: "neutral",
  PUBLISHED: "info",
  BIDDING_CLOSED: "warning",
  OFFER_ACCEPTED: "success",
  COMPLETED: "success",
  EXPIRED: "danger",
  CANCELLED: "danger",
};

export const SELLING_MODE_VARIANTS = {
  QUOTATION: "info",
  AUCTION: "purple",
  TENDER: "neutral",
};

export const listingColumns = [
  {
    accessorKey: "scrapRecord.description",
    header: "MATERIAL",
    Cell: ({ row }) => {
      const scrap = row.original.scrapRecord;
      return (
        <div>
          <div className="font-semibold text-slate-900">
            {scrap?.description || scrap?.category?.name || "Untitled"}
          </div>
          {scrap?.description && scrap?.category?.name && (
            <div className="text-[11px] text-slate-400">{scrap.category.name}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "scrapRecord.category.name",
    header: "CATEGORY",
    Cell: ({ row }) => row.original.scrapRecord?.category?.name || "—",
  },
  {
    accessorKey: "quantityKg",
    header: "QUANTITY",
    Cell: ({ cell }) => `${cell.getValue()} kg`,
  },
  {
    accessorKey: "scrapRecord.locationLabel",
    header: "WAREHOUSE",
    Cell: ({ row }) => row.original.scrapRecord?.locationLabel || "—",
  },
  {
    accessorKey: "scrapRecord.condition",
    header: "CONDITION",
    Cell: ({ row }) => row.original.scrapRecord?.condition || "—",
  },
  {
    accessorKey: "sellingMode",
    header: "SELLING MODE",
    filterVariant: "select",
    filterSelectOptions: Object.keys(SELLING_MODE_VARIANTS),
    Cell: ({ cell }) => {
      const mode = cell.getValue();
      return <StatusBadge label={mode} variant={SELLING_MODE_VARIANTS[mode] || "neutral"} />;
    },
  },
  {
    accessorKey: "expectedPricePerKg",
    header: "PRICE / KG",
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value != null ? `₹${value}` : "—";
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "select",
    filterSelectOptions: Object.keys(LISTING_STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue();
      return <StatusBadge label={status} variant={LISTING_STATUS_VARIANTS[status] || "neutral"} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "CREATED",
    Cell: ({ cell }) => formatDate(cell.getValue()),
  },
];

export const listingTableConfig = {
  title: "My Listings",
  columns: listingColumns,
  mobileHiddenColumns: ["scrapRecord.category.name", "scrapRecord.condition", "createdAt"],
};
