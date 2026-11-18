// Buyer "Reports & analytics" — Industry performance / Buyer performance table
// configs. Still mock data (BuyerReports.jsx) — no reporting backend exists yet.

import StatusBadge from "../../components/common/StatusBadge";

export const REPORT_STATUS_VARIANTS = {
  Completed: "success",
  Pending: "warning",
  Rejected: "danger",
  Active: "info",
};

const idColumn = (header) => ({
  accessorKey: "id",
  header,
  Cell: ({ cell }) => <span className="font-semibold text-card-foreground">{cell.getValue()}</span>,
});

const statusColumn = {
  accessorKey: "status",
  header: "STATUS",
  filterVariant: "select",
  filterSelectOptions: Object.keys(REPORT_STATUS_VARIANTS),
  Cell: ({ cell }) => {
    const status = cell.getValue();
    return <StatusBadge label={status} variant={REPORT_STATUS_VARIANTS[status]} />;
  },
};

export const industryPerformanceColumns = [
  idColumn("INDUSTRY"),
  { id: "lots", header: "LOTS", accessorFn: (row) => row.cells[0] },
  { id: "volume", header: "VOLUME", accessorFn: (row) => row.cells[1] },
  { id: "realised", header: "REALISED", accessorFn: (row) => row.cells[2] },
  { id: "fulfilment", header: "FULFILMENT", accessorFn: (row) => row.cells[3] },
  statusColumn,
];

export const buyerPerformanceColumns = [
  idColumn("BUYER"),
  { id: "orders", header: "ORDERS", accessorFn: (row) => row.cells[0] },
  { id: "volume", header: "VOLUME", accessorFn: (row) => row.cells[1] },
  { id: "spend", header: "SPEND", accessorFn: (row) => row.cells[2] },
  { id: "onTimePayment", header: "ON-TIME PAYMENT", accessorFn: (row) => row.cells[3] },
  statusColumn,
];
