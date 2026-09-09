// Industry "Material Movement & Logistics" table config for
// IndustryInventory.jsx. No backend endpoint exists for this yet, so the
// page passes local mock data directly (client-side mode) — see
// IndustryInventory.jsx for the MOVEMENTS array.

export const materialMovementColumns = [
  { accessorKey: "id", header: "TRANSFER ID" },
  { accessorKey: "material", header: "MATERIAL" },
  { accessorKey: "origin", header: "ORIGIN" },
  { accessorKey: "destination", header: "DESTINATION" },
  {
    accessorKey: "vehicle",
    header: "VEHICLE",
    Cell: ({ row }) => (
      <div>
        <div className="font-mono">{row.original.vehicle}</div>
        <div className="text-[10px] text-slate-400">{row.original.driver}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    filterVariant: "select",
    Cell: ({ row }) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${row.original.badgeClass}`}>
        {row.original.status}
      </span>
    ),
  },
  { accessorKey: "eta", header: "ETA" },
];

export const materialMovementTableConfig = {
  title: "Material Movement & Logistics",
  columns: materialMovementColumns,
  mobileHiddenColumns: ["origin", "destination"],
};
