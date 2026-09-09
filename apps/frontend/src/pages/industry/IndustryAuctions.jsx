import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Clock,
  Gavel,
  IndianRupee,
  Trophy,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatusBadge from "../../components/common/StatusBadge";
import MaterialTable from "../../components/common/MaterialTable";
import { auctionResultsColumns } from "../../configs/tables/auctionResultsTable.config";

// --- Mock data ---
// Replace with API calls once the auction endpoints are ready.
// `endsInSec` / `durationSec` drive the countdown and the progress bar.
const initialLots = [
  {
    id: "AUC-2291",
    title: "Steel Turnings",
    weight: "48 MT",
    seller: "Bharat Steel Works",
    highestBid: 1284000,
    startingPrice: 1150000,
    increment: 5000,
    bidders: 14,
    endsInSec: 6138,
    durationSec: 13800,
    bids: [
      { bidder: "Shaikh Metals & Alloys", time: "12:41:08", amount: 1284000 },
      { bidder: "Verma Recycling Pvt. Ltd.", time: "12:39:52", amount: 1279000 },
      { bidder: "Metro Metals", time: "12:36:11", amount: 1272000 },
      { bidder: "Green Loop Recyclers", time: "12:31:44", amount: 1265000 },
      { bidder: "Shaikh Metals & Alloys", time: "12:28:03", amount: 1258000 },
    ],
  },
  {
    id: "AUC-2290",
    title: "Copper Scrap (Millberry)",
    weight: "12.5 MT",
    seller: "Tata Precision Forgings",
    highestBid: 761500,
    startingPrice: 690000,
    increment: 2500,
    bidders: 22,
    endsInSec: 1084,
    durationSec: 2880,
    bids: [
      { bidder: "Sanjay Metals Pvt. Ltd.", time: "12:44:20", amount: 761500 },
      { bidder: "National Scrap Corp", time: "12:40:02", amount: 759000 },
      { bidder: "Verma Recycling Pvt. Ltd.", time: "12:35:47", amount: 754000 },
    ],
  },
  {
    id: "AUC-2289",
    title: "Aluminium Extrusion 6063",
    weight: "21.2 MT",
    seller: "Ashok Auto Components",
    highestBid: 402000,
    startingPrice: 360000,
    increment: 2000,
    bidders: 9,
    endsInSec: 14815,
    durationSec: 39000,
    bids: [
      { bidder: "Metro Recyclers Pvt Ltd", time: "12:22:15", amount: 402000 },
      { bidder: "Green Loop Recyclers", time: "12:18:40", amount: 398000 },
    ],
  },
];

const results = [
  { id: "AUC-2284", title: "Brass Honey Scrap", weight: "6.8 MT", winner: "Sanjay Metals Pvt. Ltd.", reserve: 290000, final: 305000, closed: "24 Jul 2026", status: "Completed" },
  { id: "AUC-2283", title: "E-Waste PCB Assorted", weight: "4.4 MT", winner: "Green Loop Recyclers", reserve: 520000, final: 546000, closed: "23 Jul 2026", status: "Completed" },
  { id: "AUC-2282", title: "HDPE Plastic Regrind", weight: "33 MT", winner: "—", reserve: 160000, final: 145000, closed: "22 Jul 2026", status: "Rejected" },
  { id: "AUC-2281", title: "Rubber Tyre Scrap", weight: "40 MT", winner: "National Scrap Corp", reserve: 105000, final: 112000, closed: "21 Jul 2026", status: "Completed" },
  { id: "AUC-2280", title: "MS Steel HMS 1&2", weight: "45 MT", winner: "Metro Recyclers Pvt Ltd", reserve: 1680000, final: 1701000, closed: "19 Jul 2026", status: "Pending" },
];

const performanceData = [
  { name: "Feb", lots: 8, realised: 42 },
  { name: "Mar", lots: 11, realised: 55 },
  { name: "Apr", lots: 9, realised: 48 },
  { name: "May", lots: 14, realised: 68 },
  { name: "Jun", lots: 12, realised: 74 },
  { name: "Jul", lots: 16, realised: 89 },
];

const inr = new Intl.NumberFormat("en-IN");
const money = (value) => `₹${inr.format(value)}`;

const formatHMS = (totalSeconds) => {
  const s = Math.max(0, totalSeconds);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

const nextValidBid = (lot) => lot.highestBid + lot.increment;

// Recharts needs literal colour values, so the design tokens are referenced
// as CSS variables instead of Tailwind utility classes.
const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
};

const axisTick = { fill: "var(--muted-foreground)", fontSize: 10 };

// --- Reusable building blocks ---

const Panel = ({ className = "", children }) => (
  <div className={`rounded-xl border shadow-sm bg-card border-border ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, iconClass, change, isPositive, note }) => (
  <Panel className="p-4 transition-shadow md:p-5 hover:shadow-md">
    <div className="flex items-start justify-between gap-3 mb-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {Icon && (
        <div className={`flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-lg ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>

    <p className="text-2xl font-bold text-card-foreground md:text-3xl">{value}</p>

    {(change || note) && (
      <p className="flex items-center gap-1.5 mt-2 text-xs">
        {change && (
          <span className={`font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? "↗" : "↘"} {change}
          </span>
        )}
        {note && <span className="text-muted-foreground">{note}</span>}
      </p>
    )}
  </Panel>
);

const Field = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-card-foreground truncate">{value}</p>
  </div>
);

const BidHighlight = ({ lot, remaining, showNextBid = false }) => (
  <div className="p-3 rounded-lg bg-primary/10">
    <p className="text-xs font-medium text-primary">Current highest bid</p>
    <p className="text-xl font-bold text-primary md:text-2xl">{money(lot.highestBid)}</p>
    {showNextBid && (
      <p className="mt-1 text-xs text-muted-foreground">
        Next valid bid {money(nextValidBid(lot))} · Ends in {formatHMS(remaining)}
      </p>
    )}
  </div>
);

const AuctionCard = ({ lot, remaining, onEnter }) => {
  const closed = remaining <= 0;
  const progress = Math.min(100, ((lot.durationSec - remaining) / lot.durationSec) * 100);

  return (
    <Panel className="flex flex-col gap-4 p-4 transition-shadow md:p-5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-card-foreground truncate">{lot.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {lot.id} · {lot.weight}
          </p>
        </div>
        <StatusBadge
          label={closed ? "Closed" : "Live Auction"}
          variant={closed ? "neutral" : "danger"}
          pulse={!closed}
        />
      </div>

      <BidHighlight lot={lot} remaining={remaining} />

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label="Starting price" value={money(lot.startingPrice)} />
        <Field label="Bid increment" value={money(lot.increment)} />
        <Field label="Total bidders" value={lot.bidders} />
        <Field label="Seller" value={lot.seller} />
      </div>

      <div>
        <p
          className={`flex items-center gap-1.5 mb-2 text-xs font-semibold ${
            closed ? "text-muted-foreground" : "text-destructive"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {closed ? "Auction closed" : `Ends in ${formatHMS(remaining)}`}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={onEnter}
        disabled={closed}
        className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-opacity bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {closed ? "Auction closed" : "Enter live auction"}
      </button>
    </Panel>
  );
};

const TABS = ["Live auctions", "Results", "Performance"];

const IndustryAuctions = () => {
  const [lots, setLots] = useState(initialLots);
  const [tab, setTab] = useState(TABS[0]);
  const [openId, setOpenId] = useState(null);
  const [bidInput, setBidInput] = useState("");
  const [bidError, setBidError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  // Single ticker drives every countdown and progress bar on the page.
  useEffect(() => {
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingFor = (lot) => Math.max(0, lot.endsInSec - elapsed);

  const openLot = useMemo(
    () => lots.find((lot) => lot.id === openId) ?? null,
    [lots, openId]
  );

  const openDrawer = (lot) => {
    setOpenId(lot.id);
    setBidInput(String(nextValidBid(lot)));
    setBidError("");
  };

  const closeDrawer = () => setOpenId(null);

  useEffect(() => {
    if (!openId) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openId]);

  const placeBid = () => {
    const amount = Number(bidInput);
    const minimum = nextValidBid(openLot);

    if (!Number.isFinite(amount) || amount < minimum) {
      setBidError(`Enter ${money(minimum)} or more.`);
      return;
    }

    const time = new Date().toLocaleTimeString("en-GB", { hour12: false });

    setLots((current) =>
      current.map((lot) =>
        lot.id !== openLot.id
          ? lot
          : {
              ...lot,
              highestBid: amount,
              bidders: lot.bidders + 1,
              bids: [{ bidder: "Your organisation", time, amount }, ...lot.bids],
            }
      )
    );
    setBidError("");
  };

  const stats = [
    { title: "Live Auctions", value: lots.filter((lot) => remainingFor(lot) > 0).length, icon: Gavel, iconClass: "bg-destructive/10 text-destructive", note: "2 closing in 1 hr" },
    { title: "Total Bidders", value: lots.reduce((sum, lot) => sum + lot.bidders, 0), icon: Users, iconClass: "bg-info/10 text-info", change: "+18", isPositive: true },
    { title: "Highest Bid Today", value: "₹12.84 L", icon: TrendingUp, iconClass: "bg-success/10 text-success", change: "+11.6%", isPositive: true },
    { title: "Lots Won", value: 27, icon: Trophy, iconClass: "bg-warning/10 text-warning", change: "+4", isPositive: true },
  ];

  const performanceStats = [
    { title: "Realisation vs reserve", value: "+8.4%", icon: IndianRupee, iconClass: "bg-success/10 text-success", change: "+1.2%", isPositive: true },
    { title: "Sell-through rate", value: "82%", icon: Gavel, iconClass: "bg-primary/10 text-primary", change: "+5%", isPositive: true },
    { title: "Avg. bidders per lot", value: "11.3", icon: Users, iconClass: "bg-info/10 text-info", change: "-0.4", isPositive: false },
  ];

  return (
    <section>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
        <span>SmartScrap AI</span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-foreground">Auctions</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Auctions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time bidding across all verified industrial scrap lots.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setTab("Results")}
            className="px-4 py-2 text-sm font-semibold rounded-lg border shadow-sm transition-colors bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
          >
            Auction history
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-opacity bg-primary text-primary-foreground hover:opacity-90"
          >
            Create auction
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-6 overflow-x-auto rounded-lg w-fit max-w-full bg-muted">
        {TABS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors ${
              tab === label
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "Live auctions" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {lots.map((lot) => (
            <AuctionCard
              key={lot.id}
              lot={lot}
              remaining={remainingFor(lot)}
              onEnter={() => openDrawer(lot)}
            />
          ))}
        </div>
      )}

      {tab === "Results" && (
        <Panel className="overflow-hidden">
          <div className="p-4 md:px-6">
            <h2 className="text-base font-bold text-card-foreground">Closed auctions</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Settled lots with winning bidder and final realised value.
            </p>
          </div>

          <div className="border-t border-border">
            <MaterialTable
              columns={auctionResultsColumns}
              data={results}
              getRowId={(row) => row.id}
            />
          </div>
        </Panel>
      )}

      {tab === "Performance" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {performanceStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <Panel className="p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-card-foreground">Auction performance</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Lots closed and realised value (₹ Lakhs) by month.
              </p>
            </div>

            <div className="h-[280px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={axisTick} width={40} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={axisTick}
                    tickFormatter={(value) => `₹${value}L`}
                    width={50}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="lots"
                    name="Lots closed"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="realised"
                    name="Realised (₹ L)"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}

      {/* Live auction drawer */}
      {openLot && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${openLot.title} live auction`}
            className="relative flex flex-col w-full h-full overflow-y-auto shadow-xl bg-card sm:max-w-md"
          >
            <div className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-card-foreground truncate">
                  {openLot.title}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {openLot.id} · {openLot.weight} · {openLot.seller}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close auction panel"
                className="flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-lg transition-opacity bg-primary text-primary-foreground hover:opacity-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-5 px-5 pb-6">
              <BidHighlight lot={openLot} remaining={remainingFor(openLot)} showNextBid />

              <div>
                <label
                  htmlFor="bid-amount"
                  className="block mb-2 text-sm font-semibold text-card-foreground"
                >
                  Your bid (₹)
                </label>
                <input
                  id="bid-amount"
                  type="number"
                  inputMode="numeric"
                  min={nextValidBid(openLot)}
                  step={openLot.increment}
                  value={bidInput}
                  onChange={(event) => setBidInput(event.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border outline-none bg-surface-muted border-input text-foreground focus:ring-2 focus:ring-ring"
                />
                {bidError && (
                  <p className="p-2 mt-2 text-xs rounded-lg bg-destructive/10 text-destructive">
                    {bidError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={placeBid}
                disabled={remainingFor(openLot) <= 0}
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-opacity bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {remainingFor(openLot) <= 0 ? "Auction closed" : "Place bid"}
              </button>

              <div>
                <h3 className="mb-2 text-sm font-bold text-card-foreground">Bid history</h3>

                <div className="rounded-lg border border-border">
                  {openLot.bids.map((bid, index) => (
                    <div
                      key={`${bid.time}-${bid.amount}`}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-border last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-card-foreground truncate">
                          {bid.bidder}
                        </p>
                        <p className="text-xs text-muted-foreground">{bid.time}</p>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold text-card-foreground">
                          {money(bid.amount)}
                        </span>
                        <StatusBadge
                          label={index === 0 ? "Approved" : "Cancelled"}
                          variant={index === 0 ? "success" : "neutral"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

export default IndustryAuctions;
