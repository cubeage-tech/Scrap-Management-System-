// Server-side pattern template for the Dealer marketplace listings table.
// No existing Dealer table UI to preserve yet, so this demonstrates the
// full fetchData/createData/updateData/deleteData wiring for whenever the
// Dealer marketplace page is built.

import StatusBadge from "../../components/common/StatusBadge";
import {
  getTableData,
  createTableData,
  updateTableData,
  deleteTableData,
} from "../../services/table/table.service";

const DEALER_LISTINGS_ENDPOINT = "/dealer/marketplace/listings";

export const getDealerListings = (params) => getTableData(DEALER_LISTINGS_ENDPOINT, params);
export const createDealerListing = (payload) => createTableData(DEALER_LISTINGS_ENDPOINT, payload);
export const updateDealerListing = (id, payload) =>
  updateTableData(DEALER_LISTINGS_ENDPOINT, id, payload);
export const deleteDealerListing = (id) => deleteTableData(DEALER_LISTINGS_ENDPOINT, id);

const STATUS_VARIANTS = {
  Available: { variant: "success" },
  Reserved: { variant: "warning" },
  Sold: { variant: "neutral" },
};

export const dealerColumns = [
  { accessorKey: "lotId", header: "LOT ID" },
  { accessorKey: "material", header: "MATERIAL" },
  {
    accessorKey: "category",
    header: "CATEGORY",
    filterVariant: "select",
    filterSelectOptions: ["Ferrous Metal", "Non-Ferrous Metal", "Plastic", "E-Waste"],
  },
  {
    accessorKey: "quantityMT",
    header: "QUANTITY (MT)",
    filterVariant: "range",
  },
  {
    accessorKey: "pricePerMT",
    header: "PRICE / MT",
    filterVariant: "range",
  },
  {
    accessorKey: "postedDate",
    header: "POSTED",
    filterVariant: "date",
  },
  { accessorKey: "seller", header: "SELLER" },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "select",
    filterSelectOptions: Object.keys(STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue();
      return <StatusBadge label={status} {...(STATUS_VARIANTS[status] || {})} />;
    },
  },
];

export const dealerTableConfig = {
  title: "Marketplace Listings",
  columns: dealerColumns,
  fetchData: getDealerListings,
  createData: createDealerListing,
  updateData: updateDealerListing,
  deleteData: deleteDealerListing,
  mobileHiddenColumns: ["category", "postedDate", "seller"],
};
