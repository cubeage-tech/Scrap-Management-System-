import {
  Box,
  Gavel,
  Trophy,
  Truck,
  IndianRupee,
  Search,
  ArrowUpRight,
} from "lucide-react";

const DealerDashboard = () => {
  const stats = [
    {
      title: "Available Scrap",
      value: "1,842 MT",
      change: "+94 MT",
      subtitle: "new today",
      icon: Box,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Live Auctions",
      value: "6",
      change: "2",
      subtitle: "closing in 1 hr",
      icon: Gavel,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
    },
    {
      title: "Current Bids",
      value: "11",
      change: "+3",
      subtitle: "",
      icon: Trophy,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "Won Auctions",
      value: "27",
      change: "+4",
      subtitle: "this quarter",
      icon: Trophy,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "Purchased Materials",
      value: "612 MT",
      change: "-9.2%",
      subtitle: "",
      icon: Truck,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Spend (MTD)",
      value: "₹64.8 L",
      change: "+5.6%",
      subtitle: "",
      icon: IndianRupee,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  const auctions = [
    {
      name: "Steel Turnings",
      id: "AUC-2291",
      quantity: "48 MT",
      bidders: "14 bidders",
      bid: "₹12,84,000",
      start: "₹11,50,000",
      time: "01:42:18",
      progress: "48%",
      status: "Live Auction",
      live: true,
    },
    {
      name: "Copper Scrap (Millberry)",
      id: "AUC-2292",
      quantity: "15 MT",
      bidders: "22 bidders",
      bid: "₹7,61,500",
      start: "₹7,00,000",
      time: "00:18:04",
      progress: "42%",
      status: "Live Auction",
      live: true,
    },
    {
      name: "Aluminium Extrusion 6063",
      id: "AUC-2289",
      quantity: "21.2 MT",
      bidders: "9 bidders",
      bid: "₹4,02,000",
      start: "₹3,60,000",
      time: "04:06:55",
      progress: "48%",
      status: "Live Auction",
      live: true,
    },
    {
      name: "E-Waste PCB Assorted",
      id: "AUC-2288",
      quantity: "4.4 MT",
      bidders: "17 bidders",
      bid: "₹5,46,000",
      start: "₹4,80,000",
      time: "Ended",
      progress: "57%",
      status: "Auction Ended",
      live: false,
    },
  ];

  const transactions = [
    {
      name: "E-Waste PCB Assorted",
      id: "ORD-5521",
      quantity: "4.4 MT",
      date: "26 Jul 2026",
      amount: "₹5,46,000",
      payment: "Paid",
      status: "Completed",
    },
    {
      name: "Rubber Tyre Scrap",
      id: "ORD-5520",
      quantity: "2 MT",
      date: "24 Jul 2026",
      amount: "₹1,12,000",
      payment: "Paid",
      status: "Completed",
    },
    {
      name: "Kraft Paper Waste",
      id: "ORD-5519",
      quantity: "5 MT",
      date: "23 Jul 2026",
      amount: "₹78,000",
      payment: "Pending",
      status: "Pending",
    },
    {
      name: "Steel Turnings",
      id: "ORD-5518",
      quantity: "30 MT",
      date: "21 Jul 2026",
      amount: "₹8,12,000",
      payment: "Paid",
      status: "Approved",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 sm:p-5 lg:p-6">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
            <span>SmartScrap AI</span>
            <span>›</span>
            <span>Scrap Dealer</span>
            <span>›</span>
            <span className="text-slate-500">Dashboard</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Shaikh Metals & Alloys
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Scrap pipeline, bidding activity and fulfilment status.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
            My bids
          </button>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
            Join live auction
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {stat.title}
                </span>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </h2>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-medium text-emerald-600">
                    {stat.change}
                  </span>
                  {stat.subtitle && (
                    <span className="text-slate-500">{stat.subtitle}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auctions + Performance */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        {/* Live Auctions */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Live auctions you're bidding on
            </h2>
          </div>

          <div>
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="border-b border-slate-100 px-4 py-3 last:border-b-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      {auction.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {auction.id} · {auction.quantity} · {auction.bidders}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        {auction.bid}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        start {auction.start}
                      </p>
                    </div>

                    <span
                      className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${
                        auction.live
                          ? "bg-rose-50 text-rose-500"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {auction.live && (
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                      )}
                      {auction.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: auction.progress }}
                    />
                  </div>

                  <span className="w-14 text-right text-xs text-slate-500">
                    {auction.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auction Performance */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Auction performance
            </h2>
            <p className="mt-1 text-xs text-slate-500">Closed lots vs spend</p>
          </div>

          <div className="p-4">
            <div className="h-[250px]">
              <svg
                viewBox="0 0 420 220"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                {[30, 70, 110, 150, 190].map((y) => (
                  <line
                    key={y}
                    x1="25"
                    y1={y}
                    x2="410"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 4"
                  />
                ))}

                <polyline
                  points="25,135 80,125 135,105 190,115 245,80 300,65 355,45 410,28"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <polyline
                  points="25,155 80,150 135,135 190,145 245,125 300,118 355,112 410,98"
                  fill="none"
                  stroke="#d69e2e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {[
                  ["Jan", 25],
                  ["Feb", 80],
                  ["Mar", 135],
                  ["Apr", 190],
                  ["May", 245],
                  ["Jun", 300],
                  ["Jul", 355],
                ].map(([month, x]) => (
                  <text
                    key={month}
                    x={x}
                    y="215"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#64748b"
                  >
                    {month}
                  </text>
                ))}
              </svg>
            </div>

            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Auctions closed
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Revenue (₹L)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Recent transactions
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {transaction.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {transaction.id} · {transaction.quantity} ·{" "}
                  {transaction.date}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:justify-end">
                <span className="font-semibold text-slate-800">
                  {transaction.amount}
                </span>

                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    transaction.payment === "Paid"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {transaction.payment}
                </span>

                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    transaction.status === "Completed"
                      ? "bg-emerald-50 text-emerald-600"
                      : transaction.status === "Approved"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;