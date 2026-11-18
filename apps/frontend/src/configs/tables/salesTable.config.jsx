import StatusBadge from "../../components/common/StatusBadge";

const PAYMENT_STATUS_VARIANTS = {
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
  Processing: "info",
};

const FULFILLMENT_STATUS_VARIANTS = {
  Completed: "success",
  InTransit: "info",
  Scheduled: "warning",
  PendingPickup: "neutral",
};

const SALE_TYPE_COLORS = {
  Tender:    "bg-purple-50 text-purple-700 border border-purple-200",
  Quotation: "bg-blue-50 text-blue-700 border border-blue-200",
};

export const salesTableColumns = [
  {
    accessorKey: "orderId",
    header: "ORDER ID",
    Cell: ({ row }) => (
      <div>
        <div className="font-bold text-slate-900 leading-snug font-mono">{row.original.orderId}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${SALE_TYPE_COLORS[row.original.saleType] || SALE_TYPE_COLORS.Quotation}`}>
            {row.original.saleType || "Quotation"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{row.original.date}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "buyerName",
    header: "BUYER COMPANY",
    Cell: ({ row }) => (
      <div>
        <div className="font-semibold text-slate-800">{row.original.buyerName}</div>
        <div className="text-[11px] text-slate-400">{row.original.location || "Industrial Hub"}</div>
      </div>
    ),
  },
  {
    accessorKey: "material",
    header: "MATERIAL / CATEGORY",
    Cell: ({ row }) => (
      <div>
        <div className="font-semibold text-slate-900">{row.original.material}</div>
        <div className="text-[11px] text-slate-500 font-medium">{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "QUANTITY",
    Cell: ({ row }) => (
      <span className="font-bold text-slate-800">{row.original.quantity}</span>
    ),
  },
  {
    accessorKey: "totalValue",
    header: "TOTAL AMOUNT",
    Cell: ({ row }) => (
      <span className="font-extrabold text-slate-900">{row.original.totalValue}</span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "PAYMENT",
    filterVariant: "select",
    filterSelectOptions: Object.keys(PAYMENT_STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue() || "Paid";
      return <StatusBadge label={status} variant={PAYMENT_STATUS_VARIANTS[status] || "neutral"} />;
    },
  },
  {
    accessorKey: "fulfillmentStatus",
    header: "FULFILLMENT",
    filterVariant: "select",
    filterSelectOptions: Object.keys(FULFILLMENT_STATUS_VARIANTS),
    Cell: ({ cell }) => {
      const status = cell.getValue() || "Completed";
      return <StatusBadge label={status} variant={FULFILLMENT_STATUS_VARIANTS[status] || "neutral"} />;
    },
  },
];

export const salesTableConfig = {
  title: "Sales Orders",
  columns: salesTableColumns,
  mobileHiddenColumns: ["location", "fulfillmentStatus"],
};

