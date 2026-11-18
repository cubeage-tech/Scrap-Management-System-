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
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Truck,
  PackageCheck,
  CalendarDays,
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
import ApiService from "../../core/services/api.service";

const inr = new Intl.NumberFormat("en-IN");
const money = (value) => `₹${inr.format(Number(value) || 0)}`;

const fmt = (totalSeconds) => {
  const s = Math.max(0, totalSeconds);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map((p) => String(p).padStart(2, "0"))
    .join(":");
};

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
};
const axisTick = { fill: "var(--muted-foreground)", fontSize: 10 };

// ── Reusable primitives ───────────────────────────────────────────────────────

const Panel = ({ className = "", children }) => (
  <div className={`rounded-xl border shadow-sm bg-card border-border ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, iconClass, note }) => (
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
    {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
  </Panel>
);

const Field = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-card-foreground truncate">{value}</p>
  </div>
);

// ── Bid-status badge ──────────────────────────────────────────────────────────

const BidStatusBadge = ({ status, isHighest }) => {
  if (isHighest) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">Highest</span>;
  const map = {
    OUTBID:    { cls: "bg-muted text-muted-foreground", label: "Outbid" },
    WINNING:   { cls: "bg-success/10 text-success border border-success/20", label: "Winning" },
    WON:       { cls: "bg-success/10 text-success border border-success/20", label: "Won" },
    LOST:      { cls: "bg-destructive/10 text-destructive border border-destructive/20", label: "Lost" },
    PLACED:    { cls: "bg-info/10 text-info border border-info/20", label: "Placed" },
    CANCELLED: { cls: "bg-muted text-muted-foreground", label: "Cancelled" },
  };
  const cfg = map[status] || map.PLACED;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.cls}`}>{cfg.label}</span>;
};

// ── Sale payment badge ────────────────────────────────────────────────────────

const SalePaymentBadge = ({ status }) => {
  const map = {
    PENDING_PAYMENT:    { cls: "bg-warning/10 text-warning border border-warning/20", icon: <Clock className="w-3 h-3" />, label: "Payment Pending" },
    PAYMENT_PROCESSING: { cls: "bg-info/10 text-info border border-info/20", icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Processing" },
    COMPLETED:          { cls: "bg-success/10 text-success border border-success/20", icon: <CheckCircle className="w-3 h-3" />, label: "Payment Received" },
    CANCELLED:          { cls: "bg-destructive/10 text-destructive border border-destructive/20", icon: <XCircle className="w-3 h-3" />, label: "Cancelled" },
    REFUNDED:           { cls: "bg-muted text-muted-foreground", icon: <RefreshCw className="w-3 h-3" />, label: "Refunded" },
  };
  const cfg = map[status] || map.PENDING_PAYMENT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

// ── Auction summary card ──────────────────────────────────────────────────────

const AuctionCard = ({ lot, remaining, onManage }) => {
  const closed = ['CLOSED_WITH_WINNER', 'CLOSED_NO_WINNER', 'CANCELLED'].includes(lot.status);
  const progress = Math.min(100, Math.max(0, ((lot.durationSec - remaining) / (lot.durationSec || 1)) * 100));

  return (
    <Panel className="flex flex-col gap-4 p-4 transition-shadow md:p-5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-card-foreground truncate">{lot.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{lot.id} · {lot.weight}</p>
        </div>
        <StatusBadge
          label={closed ? (lot.status === 'CLOSED_WITH_WINNER' ? "Awarded" : lot.status === 'CANCELLED' ? "Cancelled" : "No Winner") : "Live"}
          variant={closed ? (lot.status === 'CLOSED_WITH_WINNER' ? "success" : "neutral") : "danger"}
          pulse={!closed}
        />
      </div>

      <div className="p-3 rounded-lg bg-primary/10">
        <p className="text-xs font-medium text-primary">Current highest bid</p>
        <p className="text-xl font-bold text-primary md:text-2xl">{money(lot.highestBid)}<span className="text-xs font-normal text-muted-foreground">/kg</span></p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label="Starting price" value={`${money(lot.startingPrice)}/kg`} />
        <Field label="Bid increment" value={`${money(lot.increment)}/kg`} />
        <Field label="Unique bidders" value={lot.bidderCount} />
        <Field label="Total bids" value={lot.totalBids} />
      </div>

      {!closed && (
        <div>
          <p className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-destructive">
            <Clock className="w-3.5 h-3.5" />
            Ends in {fmt(remaining)}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onManage}
        className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-opacity bg-primary text-primary-foreground hover:opacity-90"
      >
        {closed ? "View result" : "Manage auction"}
      </button>
    </Panel>
  );
};

const TABS = ["Live auctions", "Results", "Performance"];

const IndustryAuctions = () => {
  const [lots, setLots] = useState([]);
  const [scheduledAuctions, setScheduledAuctions] = useState([]);
  const [closedResults, setClosedResults] = useState([]);
  const [rawAuctions, setRawAuctions] = useState([]);
  const [tab, setTab] = useState(TABS[0]);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Management drawer state
  const [managedAuction, setManagedAuction] = useState(null); // full auction detail from API
  const [managedLoading, setManagedLoading] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [closeError, setCloseError] = useState("");

  // Delivery state
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAuctions();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        const fetched = res.data.data;
        setRawAuctions(fetched);

        const liveList = [], closedList = [], scheduledList = [];

        fetched.forEach((a) => {
          const endsAtTime = new Date(a.endsAt).getTime();
          const startsAtTime = new Date(a.startsAt).getTime();
          const nowTime = Date.now();
          const endsInSec = Math.max(0, Math.floor((endsAtTime - nowTime) / 1000));
          const durationSec = Math.max(3600, Math.floor((endsAtTime - startsAtTime) / 1000));

          const highestBidVal = a.currentHighestBid?.pricePerKg
            ? Number(a.currentHighestBid.pricePerKg)
            : Number(a.startingPricePerKg);

          const isClosed = ['CLOSED_WITH_WINNER', 'CLOSED_NO_WINNER', 'CANCELLED'].includes(a.status);

          const lot = {
            id: `AUC-${a.id.slice(0, 6).toUpperCase()}`,
            rawId: a.id,
            title: a.listing?.scrapRecord?.description || a.listing?.scrapRecord?.category?.name || "Scrap Auction Lot",
            weight: `${(Number(a.listing?.quantityKg || 0) / 1000).toFixed(1)} Tons`,
            seller: a.listing?.scrapRecord?.owner?.companyName || "",
            highestBid: highestBidVal,
            startingPrice: Number(a.startingPricePerKg || 0),
            reservePrice: Number(a.reservePricePerKg || a.startingPricePerKg || 0),
            increment: Number(a.minIncrement || 1),
            bidderCount: a.bidderCount || 0,
            totalBids: a.bidCount || a.bids?.length || 0,
            endsInSec,
            durationSec,
            status: a.status,
          };

          if (isClosed) {
            const winnerName = a.winningBid?.bidder?.companyName || (a.currentHighestBid?.bidder?.companyName || "—");
            const finalVal = a.winningBid?.totalValue
              ? Number(a.winningBid.totalValue)
              : (a.currentHighestBid?.totalValue ? Number(a.currentHighestBid.totalValue) : 0);

            closedList.push({
              id: lot.id,
              title: lot.title,
              weight: lot.weight,
              winner: winnerName,
              reserve: Number(a.reservePricePerKg || a.startingPricePerKg || 0) * Number(a.listing?.quantityKg || 0),
              final: finalVal,
              closed: new Date(a.closedAt || a.endsAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              status: a.status === 'CLOSED_WITH_WINNER' ? 'Completed' : a.status === 'CANCELLED' ? 'Rejected' : 'No Winner',
            });
          } else if (a.status === 'SCHEDULED') {
            scheduledList.push(lot);
          } else {
            liveList.push(lot);
          }
        });

        setLots(liveList);
        setScheduledAuctions(scheduledList);
        setClosedResults(closedList);
      }
    } catch (err) {
      console.error("Error fetching auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAuctions(); }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingFor = (lot) => Math.max(0, lot.endsInSec - elapsed);

  // ── Management drawer ─────────────────────────────────────────────────────

  const openManagement = async (auctionId) => {
    setManagedAuction(null);
    setCloseError("");
    setManagedLoading(true);
    try {
      const res = await ApiService.getAuctionById(auctionId);
      if (res?.data?.success) setManagedAuction(res.data.data);
    } catch (err) {
      console.error("Failed to load auction detail:", err);
    } finally {
      setManagedLoading(false);
    }
  };

  const closeManagement = () => { setManagedAuction(null); setCloseError(""); setDeliveryError(""); };

  const handleDeliveryUpdate = async (saleId, deliveryStatus) => {
    setDeliveryLoading(true);
    setDeliveryError("");
    try {
      const body = { deliveryStatus };
      if (deliveryStatus === 'IN_TRANSIT' && expectedDelivery) body.expectedDelivery = expectedDelivery;
      await ApiService.updateSaleDelivery(saleId, body);
      await openManagement(managedAuction.id);
      setExpectedDelivery("");
    } catch (err) {
      setDeliveryError(err.response?.data?.message || "Failed to update delivery status");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleStartAuction = async (auctionId) => {
    setStartingId(auctionId);
    try {
      await ApiService.startAuction(auctionId);
      await fetchAuctions();
    } catch (err) {
      console.error("Failed to start auction:", err);
    } finally {
      setStartingId(null);
    }
  };

  const handleCloseAuction = async (auctionId) => {
    setClosingId(auctionId);
    setCloseError("");
    try {
      await ApiService.closeAuction(auctionId);
      await fetchAuctions();
      await openManagement(auctionId); // refresh management panel with winner data
    } catch (err) {
      setCloseError(err.response?.data?.message || "Failed to close auction");
    } finally {
      setClosingId(null);
    }
  };

  // ── Escape key ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!managedAuction) return;
    const handler = (e) => e.key === "Escape" && closeManagement();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [managedAuction]);

  // ── Aggregations ──────────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeLots = useMemo(() => lots.filter((lot) => remainingFor(lot) > 0), [lots, elapsed]);

  const totalBidsCount = useMemo(() => rawAuctions.reduce((s, a) => s + (a.bidCount || a.bids?.length || 0), 0), [rawAuctions]);

  const maxHighestBid = useMemo(() => {
    let max = 0;
    rawAuctions.forEach((a) => {
      const v = a.currentHighestBid?.pricePerKg ? Number(a.currentHighestBid.pricePerKg) : 0;
      if (v > max) max = v;
    });
    return max;
  }, [rawAuctions]);

  const wonCount = useMemo(() => closedResults.filter((r) => r.status === "Completed").length, [closedResults]);

  const stats = [
    { title: "Live Auctions", value: activeLots.length, icon: Gavel, iconClass: "bg-destructive/10 text-destructive", note: `${scheduledAuctions.length} scheduled` },
    { title: "Total Bids", value: totalBidsCount, icon: Users, iconClass: "bg-info/10 text-info", note: "Across all auctions" },
    { title: "Highest Bid", value: maxHighestBid > 0 ? money(maxHighestBid) : "₹0", icon: TrendingUp, iconClass: "bg-success/10 text-success", note: "Per kg" },
    { title: "Auctions Awarded", value: wonCount, icon: Trophy, iconClass: "bg-warning/10 text-warning", note: "Closed with winner" },
  ];

  const performanceStats = useMemo(() => {
    let totalReserve = 0, totalFinal = 0;
    closedResults.forEach((r) => { totalReserve += r.reserve || 0; totalFinal += r.final || 0; });
    const realisation = totalReserve > 0 ? (((totalFinal - totalReserve) / totalReserve) * 100).toFixed(1) : "0.0";
    const sellThrough = rawAuctions.length > 0 ? Math.round((closedResults.length / rawAuctions.length) * 100) : 0;
    const avgBidders = rawAuctions.length > 0 ? (totalBidsCount / rawAuctions.length).toFixed(1) : "0.0";
    return [
      { title: "Realisation vs reserve", value: `${Number(realisation) >= 0 ? "+" : ""}${realisation}%`, icon: IndianRupee, iconClass: "bg-success/10 text-success" },
      { title: "Sell-through rate", value: `${sellThrough}%`, icon: Gavel, iconClass: "bg-primary/10 text-primary" },
      { title: "Avg. bids per lot", value: avgBidders, icon: Users, iconClass: "bg-info/10 text-info" },
    ];
  }, [closedResults, rawAuctions, totalBidsCount]);

  const performanceData = useMemo(() => {
    const map = {};
    rawAuctions.forEach((a) => {
      const month = new Date(a.startsAt || 0).toLocaleString("default", { month: "short" });
      if (!map[month]) map[month] = { name: month, lots: 0, realised: 0 };
      map[month].lots += 1;
      const amt = a.winningBid?.totalValue ? Number(a.winningBid.totalValue) : (a.currentHighestBid?.totalValue ? Number(a.currentHighestBid.totalValue) : 0);
      map[month].realised += amt / 100000;
    });
    const data = Object.values(map);
    return data.length === 0 ? [{ name: new Date().toLocaleString("default", { month: "short" }), lots: 0, realised: 0 }] : data;
  }, [rawAuctions]);

  return (
    <section>
      <nav className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
        <span>SmartScrap AI</span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-foreground">Auctions</span>
      </nav>

      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">My Auctions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your live auctions, review bids and close for winner selection.</p>
        </div>
        <button type="button" onClick={() => setTab("Results")} className="self-start px-4 py-2 text-sm font-semibold rounded-lg border shadow-sm transition-colors bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground">
          Auction history
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="flex gap-1 p-1 mb-6 overflow-x-auto rounded-lg w-fit max-w-full bg-muted">
        {TABS.map((label) => (
          <button key={label} type="button" onClick={() => setTab(label)}
            className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors ${tab === label ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Live auctions tab ── */}
      {tab === "Live auctions" && (
        <>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading auctions…</div>
          ) : (
            <>
              {/* Scheduled */}
              {scheduledAuctions.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Scheduled — Start to accept bids</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {scheduledAuctions.map((lot) => (
                      <Panel key={lot.id} className="p-4 flex flex-col gap-3 border-amber-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-card-foreground truncate">{lot.title}</h3>
                            <p className="text-xs text-muted-foreground">{lot.id} · {lot.weight}</p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">SCHEDULED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><p className="text-muted-foreground">Starting price</p><p className="font-semibold">{money(lot.startingPrice)}/kg</p></div>
                          <div><p className="text-muted-foreground">Bid increment</p><p className="font-semibold">{money(lot.increment)}/kg</p></div>
                        </div>
                        <button type="button" onClick={() => handleStartAuction(lot.rawId)} disabled={startingId === lot.rawId}
                          className="w-full py-2 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-60">
                          {startingId === lot.rawId ? "Starting…" : "Start Auction"}
                        </button>
                      </Panel>
                    ))}
                  </div>
                </div>
              )}

              {/* Live */}
              {lots.length === 0 && scheduledAuctions.length === 0 ? (
                <Panel className="p-8 text-center text-muted-foreground">
                  <Gavel className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-foreground">No Active Auctions</p>
                  <p className="text-xs mt-1">Create an auction listing to get started.</p>
                </Panel>
              ) : lots.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {lots.map((lot) => (
                    <AuctionCard key={lot.id} lot={lot} remaining={remainingFor(lot)} onManage={() => openManagement(lot.rawId)} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </>
      )}

      {/* ── Results tab ── */}
      {tab === "Results" && (
        <Panel className="overflow-hidden">
          <div className="p-4 md:px-6">
            <h2 className="text-base font-bold text-card-foreground">Closed auctions</h2>
            <p className="mt-1 text-xs text-muted-foreground">Settled lots with winning bidder and final realised value.</p>
          </div>
          <div className="border-t border-border">
            {closedResults.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No closed auction history available.</div>
            ) : (
              <MaterialTable columns={auctionResultsColumns} data={closedResults} getRowId={(row) => row.id} />
            )}
          </div>
        </Panel>
      )}

      {/* ── Performance tab ── */}
      {tab === "Performance" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {performanceStats.map((s) => <StatCard key={s.title} {...s} />)}
          </div>
          <Panel className="p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-card-foreground">Auction performance</h2>
              <p className="mt-1 text-xs text-muted-foreground">Lots closed and realised value (₹ Lakhs) by month.</p>
            </div>
            <div className="h-[280px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={axisTick} width={40} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(v) => `₹${v}L`} width={50} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} />
                  <Bar yAxisId="left" dataKey="lots" name="Lots closed" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Line yAxisId="right" type="monotone" dataKey="realised" name="Realised (₹ L)" stroke="var(--chart-3)" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}

      {/* ── Manage Auction drawer ── */}
      {(managedLoading || managedAuction) && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-foreground/40" onClick={closeManagement} aria-hidden="true" />

          <aside role="dialog" aria-modal="true" className="relative flex flex-col w-full h-full overflow-y-auto shadow-xl bg-card sm:max-w-lg">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-border">
              <div className="min-w-0">
                {managedAuction && (
                  <>
                    <p className="text-xs font-mono text-muted-foreground">AUC-{managedAuction.id.slice(0, 6).toUpperCase()}</p>
                    <h2 className="text-lg font-bold text-card-foreground truncate">
                      {managedAuction.listing?.scrapRecord?.description || managedAuction.listing?.scrapRecord?.category?.name || "Auction Lot"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(Number(managedAuction.listing?.quantityKg || 0) / 1000).toFixed(1)} Tons ·
                      {managedAuction.listing?.scrapRecord?.owner?.companyName}
                    </p>
                  </>
                )}
                {managedLoading && <p className="text-sm text-muted-foreground">Loading auction details…</p>}
              </div>
              <button type="button" onClick={closeManagement} aria-label="Close"
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
                <X className="w-4 h-4" />
              </button>
            </div>

            {managedLoading && (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {managedAuction && (
              <div className="flex flex-col gap-5 p-5">
                {/* Status + current bid */}
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge
                    label={managedAuction.status === 'LIVE' ? 'Live' : managedAuction.status === 'EXTENDED' ? 'Extended' : managedAuction.status === 'CLOSED_WITH_WINNER' ? 'Awarded' : managedAuction.status === 'CLOSED_NO_WINNER' ? 'No Winner' : managedAuction.status}
                    variant={['LIVE', 'EXTENDED'].includes(managedAuction.status) ? 'danger' : managedAuction.status === 'CLOSED_WITH_WINNER' ? 'success' : 'neutral'}
                    pulse={['LIVE', 'EXTENDED'].includes(managedAuction.status)}
                  />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Bidders / Total bids</p>
                    <p className="text-sm font-bold text-card-foreground">{managedAuction.bidderCount} unique · {managedAuction.bidCount} bids</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-xs font-medium text-primary">
                    {['CLOSED_WITH_WINNER', 'CLOSED_NO_WINNER'].includes(managedAuction.status) ? 'Final highest bid' : 'Current highest bid'}
                  </p>
                  {managedAuction.currentHighestBid ? (
                    <>
                      <p className="text-2xl font-bold text-primary">
                        {money(managedAuction.currentHighestBid.pricePerKg)}<span className="text-xs font-normal text-muted-foreground">/kg</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">by {managedAuction.currentHighestBid.bidder?.companyName}</p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-primary">No bids yet</p>
                  )}
                </div>

                {/* Winner info (for closed with winner) */}
                {managedAuction.status === 'CLOSED_WITH_WINNER' && managedAuction.winningBid && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-success" />
                      <p className="text-sm font-bold text-success">Auction Awarded</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Winner</p>
                        <p className="font-semibold text-card-foreground">{managedAuction.winningBid.bidder?.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Winning bid</p>
                        <p className="font-semibold text-card-foreground">{money(managedAuction.winningBid.pricePerKg)}/kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total value</p>
                        <p className="font-semibold text-card-foreground">{money(managedAuction.winningBid.totalValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Payment status</p>
                        {managedAuction.sale ? (
                          <SalePaymentBadge status={managedAuction.sale.status} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery tracking — shown after payment is completed */}
                {managedAuction.status === 'CLOSED_WITH_WINNER' && managedAuction.sale?.status === 'COMPLETED' && (() => {
                  const ds = managedAuction.sale.deliveryStatus || 'AWAITING_DISPATCH';
                  return (
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" />
                        <p className="text-sm font-bold text-card-foreground">Delivery Tracking</p>
                        <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ds === 'DELIVERED'         ? 'bg-success/10 text-success border-success/20' :
                          ds === 'IN_TRANSIT'        ? 'bg-info/10 text-info border-info/20' :
                          'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          {ds === 'DELIVERED' ? 'Delivered' : ds === 'IN_TRANSIT' ? 'In Transit' : 'Awaiting Dispatch'}
                        </span>
                      </div>

                      {managedAuction.sale.deliveredAt && (
                        <div className="flex items-center gap-2 text-xs text-success">
                          <PackageCheck className="w-3.5 h-3.5" />
                          Delivered on {new Date(managedAuction.sale.deliveredAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </div>
                      )}
                      {managedAuction.sale.expectedDelivery && ds !== 'DELIVERED' && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Expected: {new Date(managedAuction.sale.expectedDelivery).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </div>
                      )}

                      {deliveryError && (
                        <p className="text-xs font-semibold text-destructive bg-destructive/10 rounded-lg p-2">{deliveryError}</p>
                      )}

                      {ds === 'AWAITING_DISPATCH' && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Expected delivery date (optional)</label>
                          <input
                            type="date"
                            value={expectedDelivery}
                            onChange={(e) => setExpectedDelivery(e.target.value)}
                            min={new Date().toISOString().slice(0, 10)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <button type="button"
                            onClick={() => handleDeliveryUpdate(managedAuction.sale.id, 'IN_TRANSIT')}
                            disabled={deliveryLoading}
                            className="w-full py-2 text-sm font-bold rounded-lg bg-info text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                            {deliveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                            Mark as Dispatched
                          </button>
                        </div>
                      )}

                      {ds === 'IN_TRANSIT' && (
                        <button type="button"
                          onClick={() => handleDeliveryUpdate(managedAuction.sale.id, 'DELIVERED')}
                          disabled={deliveryLoading}
                          className="w-full py-2 text-sm font-bold rounded-lg bg-success text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                          {deliveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                          Confirm Delivery Received
                        </button>
                      )}

                      {ds === 'DELIVERED' && (
                        <div className="flex items-center gap-2 text-sm text-success font-semibold">
                          <CheckCircle className="w-4 h-4" /> Scrap has been delivered — now visible in Sales tab.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* No-winner info */}
                {managedAuction.status === 'CLOSED_NO_WINNER' && (
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-warning">No qualifying bids</p>
                      <p className="text-xs text-muted-foreground mt-0.5">The auction closed without any bids meeting the reserve price.</p>
                    </div>
                  </div>
                )}

                {/* Close auction action */}
                {['LIVE', 'EXTENDED'].includes(managedAuction.status) && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm font-semibold text-card-foreground mb-1">Close & Award Auction</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Closes bidding immediately. The highest valid bid wins. This action cannot be undone.
                    </p>
                    {closeError && (
                      <p className="text-xs font-semibold text-destructive bg-destructive/10 rounded-lg p-2 mb-3">{closeError}</p>
                    )}
                    <button type="button"
                      onClick={() => handleCloseAuction(managedAuction.id)}
                      disabled={closingId === managedAuction.id}
                      className="w-full py-2.5 text-sm font-bold rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                      {closingId === managedAuction.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Closing…</>
                      ) : (
                        "Close Auction & Select Winner"
                      )}
                    </button>
                  </div>
                )}

                {/* Bid history table */}
                <div>
                  <h3 className="text-sm font-bold text-card-foreground mb-3">
                    Bid History ({managedAuction.bids?.length || 0} bids)
                  </h3>
                  {!managedAuction.bids || managedAuction.bids.length === 0 ? (
                    <div className="rounded-lg border border-border py-6 text-center text-sm text-muted-foreground">
                      No bids placed yet.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">#</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Dealer</th>
                            <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Bid/kg</th>
                            <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Total</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Time</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {managedAuction.bids.map((bid, i) => (
                            <tr key={bid.id || i} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                              <td className="px-3 py-2.5 text-muted-foreground font-mono">{bid.sequence ?? i + 1}</td>
                              <td className="px-3 py-2.5 font-semibold text-card-foreground">
                                {bid.bidder?.companyName || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-right font-semibold text-card-foreground tabular-nums">
                                {money(bid.pricePerKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums">
                                {money(bid.totalValue)}
                              </td>
                              <td className="px-3 py-2.5 text-muted-foreground">
                                {new Date(bid.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <BidStatusBadge status={bid.status} isHighest={bid.id === managedAuction.currentHighestBidId && !['CLOSED_WITH_WINNER','CLOSED_NO_WINNER'].includes(managedAuction.status)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Auction timing */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Started at" value={new Date(managedAuction.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />
                  <Field label="Ends / Ended at" value={new Date(managedAuction.endsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />
                  <Field label="Starting price" value={`${money(managedAuction.startingPricePerKg)}/kg`} />
                  <Field label="Min increment" value={`${money(managedAuction.minIncrement)}/kg`} />
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
};

export default IndustryAuctions;
