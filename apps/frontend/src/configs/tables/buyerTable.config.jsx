// Server-side pattern template for the Buyer purchase-history table.
// No existing Buyer table UI to preserve yet — demonstrates the read-only
// (fetchData only, no create/update/delete) shape of the same pattern.

import StatusBadge from "../../components/common/StatusBadge";
import { getTableData } from "../../services/table/table.service";

const BUYER_ORDERS_ENDPOINT = "/buyer/orders";

export const getBuyerOrders = (params) => getTableData(BUYER_ORDERS_ENDPOINT, params);

const STATUS_VARIANTS = {
  Delivered: { variant: "success" },
  "In Transit": { variant: "info" },
  Processing: { variant: "warning" },
  Cancelled: { variant: "danger" },
};

export const buyerColumns = [
  { accessorKey: "orderId", header: "ORDER ID" },
  { accessorKey: "material", header: "MATERIAL" },
  { accessorKey: "seller", header: "SELLER" },
  {
    accessorKey: "quantityMT",
    header: "QUANTITY (MT)",
    filterVariant: "range",
  },
  {
    accessorKey: "amount",
    header: "AMOUNT",
    filterVariant: "range",
  },
  {
    accessorKey: "purchaseDate",
    header: "PURCHASE DATE",
    filterVariant: "date-range",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "multi-select",
    filterSelectOptions: Object.keys(STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue();
      return <StatusBadge label={status} {...(STATUS_VARIANTS[status] || {})} />;
    },
  },
];

export const buyerTableConfig = {
  title: "My Purchases",
  columns: buyerColumns,
  fetchData: getBuyerOrders,
  mobileHiddenColumns: ["seller", "amount", "purchaseDate"],
};
