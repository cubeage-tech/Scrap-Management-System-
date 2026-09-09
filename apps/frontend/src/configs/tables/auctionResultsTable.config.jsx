// Industry Auctions "Results" tab — closed auctions table config.
// Still mock data (IndustryAuctions.jsx) — no auction backend exists yet.

import StatusBadge from "../../components/common/StatusBadge";

const RESULT_VARIANTS = { Completed: "success", Pending: "warning", Rejected: "danger" };

const inr = new Intl.NumberFormat("en-IN");
const money = (value) => `₹${inr.format(value)}`;

export const auctionResultsColumns = [
  {
    accessorKey: "title",
    header: "LOT",
    Cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-card-foreground">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.id} · {row.original.weight}
        </p>
      </div>
    ),
  },
  { accessorKey: "winner", header: "WINNER" },
  {
    accessorKey: "reserve",
    header: "RESERVE",
    Cell: ({ cell }) => money(cell.getValue()),
  },
  {
    accessorKey: "final",
    header: "FINAL PRICE",
    Cell: ({ row }) => (
      <span
        className={`font-semibold ${
          row.original.final >= row.original.reserve ? "text-success" : "text-destructive"
        }`}
      >
        {money(row.original.final)}
      </span>
    ),
  },
  { accessorKey: "closed", header: "CLOSED" },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "select",
    filterSelectOptions: Object.keys(RESULT_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue();
      return <StatusBadge label={status} variant={RESULT_VARIANTS[status]} />;
    },
  },
];
