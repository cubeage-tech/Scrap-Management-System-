// Dealer "Reports & Analytics" — Category-wise Performance table config.
// Still mock data (DealerReports.jsx) — no analytics backend exists yet.
// No `title` set since the page already renders its own <h2> heading above.

export const dealerCategoryPerformanceColumns = [
  {
    accessorKey: "category",
    header: "CATEGORY",
    Cell: ({ cell }) => <span className="font-semibold text-slate-800">{cell.getValue()}</span>,
  },
  { accessorKey: "listed", header: "TOTAL LISTED" },
  { accessorKey: "sold", header: "TOTAL SOLD" },
  { accessorKey: "price", header: "AVG. PRICE/MT" },
  {
    accessorKey: "revenue",
    header: "REVENUE",
    Cell: ({ cell }) => <span className="font-semibold text-slate-800">{cell.getValue()}</span>,
  },
  { accessorKey: "commission", header: "COMMISSION" },
  {
    accessorKey: "rate",
    header: "SELL-THROUGH RATE",
    Cell: ({ cell }) => {
      const rate = cell.getValue();
      return (
        <div className="flex items-center gap-3">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${rate}%` }} />
          </div>
          <span className="text-xs text-slate-500">{rate}%</span>
        </div>
      );
    },
  },
];
