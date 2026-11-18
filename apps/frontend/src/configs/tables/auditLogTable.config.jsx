// Industry "Audit Register" (stock movement log) table config for
// IndustryInventory.jsx. No backend endpoint exists for this yet, so the
// page passes local mock data directly (client-side mode) — see
// IndustryInventory.jsx for the LOGS array.

export const auditLogColumns = [
  { accessorKey: "id", header: "LOG ID" },
  { accessorKey: "date", header: "DATE" },
  { accessorKey: "material", header: "MATERIAL" },
  {
    accessorKey: "type",
    header: "TYPE",
    filterVariant: "select",
    Cell: ({ row }) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${row.original.badgeClass}`}>
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "qty",
    header: "QTY",
    Cell: ({ row }) => (
      <span
        className={`font-semibold ${row.original.type === "Inward" ? "text-indigo-600" : "text-amber-600"}`}
      >
        {row.original.qty}
      </span>
    ),
  },
  { accessorKey: "ref", header: "REF" },
  { accessorKey: "operator", header: "OPERATOR" },
  {
    accessorKey: "status",
    header: "STATUS",
    Cell: ({ row }) => (
      <span className="text-emerald-600 font-medium">✓ {row.original.status}</span>
    ),
  },
];

export const auditLogTableConfig = {
  title: "Audit Register",
  columns: auditLogColumns,
  mobileHiddenColumns: ["ref", "operator"],
};
