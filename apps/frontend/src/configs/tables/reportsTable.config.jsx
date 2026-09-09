import { Building2 } from "lucide-react";

// Super Admin "Reports & analytics" page table configs (Inventory and
// Industry performance tabs). Still mock data — no analytics backend exists
// yet. No `title` set on either config since the surrounding page already
// renders its own <h2> heading above each table.

export const inventoryReportColumns = [
  { accessorKey: "category", header: "CATEGORY" },
  {
    accessorKey: "stock",
    header: "CURRENT STOCK",
    Cell: ({ cell }) => `${cell.getValue().toLocaleString()} MT`,
  },
  {
    accessorKey: "capacity",
    header: "CAPACITY",
    Cell: ({ cell }) => `${cell.getValue().toLocaleString()} MT`,
  },
  {
    accessorKey: "turnaround",
    header: "AVG. TURNAROUND",
    Cell: ({ cell }) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
        {cell.getValue()}
      </span>
    ),
  },
  {
    id: "occupancy",
    header: "OCCUPANCY",
    accessorFn: (row) => Math.round((row.stock / row.capacity) * 100),
    Cell: ({ getValue }) => {
      const pct = getValue();
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{pct}%</span>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    },
  },
];

export const industryPerformanceColumns = [
  {
    accessorKey: "name",
    header: "INDUSTRY SECTOR",
    Cell: ({ cell }) => (
      <span className="font-medium text-foreground inline-flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary" />
        {cell.getValue()}
      </span>
    ),
  },
  {
    accessorKey: "volume",
    header: "VOLUME DISPATCHED",
    Cell: ({ cell }) => `${cell.getValue().toLocaleString()} MT`,
  },
  { accessorKey: "value", header: "GROSS REALIZED VALUE" },
  {
    accessorKey: "fulfillment",
    header: "FULFILLMENT SCORE",
    Cell: ({ cell }) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
        {cell.getValue()}
      </span>
    ),
  },
];
