// Industry Dashboard "Recent Transactions" widget table config. Still mock
// data (IndustryDashboard.jsx) — no Sale/transaction backend exists yet
// (accepting a quotation doesn't create a Sale record on the backend).
// No `title` set since the page renders its own <h2> heading above.

import StatusBadge from "../../components/common/StatusBadge";

const STATUS_VARIANTS = {
  Completed: "success",
  Pending: "warning",
  Cancelled: "danger",
};

export const recentTransactionsColumns = [
  {
    accessorKey: "id",
    header: "SALE ID",
    Cell: ({ cell }) => <span className="font-semibold text-slate-800">{cell.getValue()}</span>,
  },
  {
    accessorKey: "material",
    header: "MATERIAL",
    Cell: ({ cell }) => <span className="font-bold text-slate-900">{cell.getValue()}</span>,
  },
  { accessorKey: "buyer", header: "BUYER" },
  {
    accessorKey: "value",
    header: "VALUE",
    Cell: ({ cell }) => <span className="font-extrabold text-slate-900">{cell.getValue()}</span>,
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
