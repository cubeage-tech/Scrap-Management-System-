import prisma from '../../core/lib/prisma.js';

export const getIndustryDashboardAnalytics = async (organisationId) => {
  const [
    scraps,
    listings,
    quotations,
    auctions,
    sales,
    notifications
  ] = await Promise.all([
    prisma.scrapRecord.findMany({
      where: { ownerId: organisationId },
      include: { category: true, listings: true }
    }),
    prisma.listing.findMany({
      where: { scrapRecord: { ownerId: organisationId } },
      include: { scrapRecord: { include: { category: true } }, quotations: true, auction: true }
    }),
    prisma.quotation.findMany({
      where: { listing: { scrapRecord: { ownerId: organisationId } } },
      include: { listing: { include: { scrapRecord: { include: { category: true } } } }, buyer: true }
    }),
    prisma.auction.findMany({
      where: { listing: { scrapRecord: { ownerId: organisationId } } },
      include: {
        listing: { include: { scrapRecord: { include: { category: true } } } },
        currentHighestBid: true,
        bids: { include: { bidder: { select: { companyName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.sale.findMany({
      where: { sellerId: organisationId },
      include: {
        listing: { include: { scrapRecord: { include: { category: true } } } },
        buyer: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.notification.findMany({
      where: { user: { organisationId } },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Format currency helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // 1. Scrap Metrics
  const totalScrapKg = scraps.reduce((sum, s) => sum + Number(s.totalQuantityKg || 0), 0);
  const availableStockKg = scraps.reduce((sum, s) => sum + Number(s.availableQuantityKg || 0), 0);
  const listedQuantityKg = scraps.reduce((sum, s) => sum + Number(s.listedQuantityKg || 0), 0);
  const soldQuantityKg = scraps.reduce((sum, s) => sum + Number(s.soldQuantityKg || 0), 0);
  const totalWeightMT = Number((totalScrapKg / 1000).toFixed(2));

  // 2. Listing Metrics
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === 'PUBLISHED').length;

  // 3. Auction & Tender Metrics
  const liveAuctionsCount = auctions.filter((a) => ['LIVE', 'EXTENDED'].includes(a.status)).length;
  const openTendersCount = listings.filter((l) => l.sellingMode === 'TENDER' && l.status === 'PUBLISHED').length;

  // 4. Quotation Metrics
  const pendingQuotations = quotations.filter((q) => q.status === 'SUBMITTED');
  const pendingQuotesCount = pendingQuotations.length;
  const pendingQuotesValue = pendingQuotations.reduce((sum, q) => sum + Number(q.totalValue || 0), 0);

  // 5. Sales & Financial Metrics
  const completedSales = sales.filter((s) => s.status === 'COMPLETED');
  const completedSalesCount = completedSales.length;

  const totalRevenue = sales
    .filter((s) => ['ACCEPTED', 'COMPLETED'].includes(s.status))
    .reduce((sum, s) => sum + Number(s.totalValue || 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todaysRevenue = sales
    .filter((s) => new Date(s.createdAt) >= startOfToday && ['ACCEPTED', 'COMPLETED'].includes(s.status))
    .reduce((sum, s) => sum + Number(s.totalValue || 0), 0);

  const totalCommission = sales.reduce((sum, s) => sum + Number(s.commissionAmount || 0), 0);

  // 6. Summary Stats Object
  const stats = {
    totalWeightMT,
    totalScrapValue: formatCurrency(totalRevenue || availableStockKg * 50),
    totalListings,
    todayListingsCount: listings.filter((l) => new Date(l.createdAt) >= startOfToday).length,
    liveAuctionsCount,
    openTendersCount,
    pendingQuotesCount,
    pendingQuotesValueDisplay: formatCurrency(pendingQuotesValue),
    completedSalesCount,
    todaysRevenueDisplay: formatCurrency(todaysRevenue),
    totalCommissionDisplay: formatCurrency(totalCommission)
  };

  // 7. Monthly Revenue & Volume Chart Data (Last 8 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const monthlyMap = {};

  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = monthNames[d.getMonth()];
    monthlyMap[label] = { month: label, revRaw: 0, volRaw: 0 };
  }

  sales.forEach((s) => {
    const date = new Date(s.createdAt);
    const label = monthNames[date.getMonth()];
    if (monthlyMap[label]) {
      monthlyMap[label].revRaw += Number(s.totalValue || 0);
      monthlyMap[label].volRaw += Number(s.quantityKg || 0);
    }
  });

  const monthlyOverview = Object.values(monthlyMap).map((m) => {
    const revLakhs = Number((m.revRaw / 100000).toFixed(1));
    const volMT = Number((m.volRaw / 1000).toFixed(1));
    return {
      month: m.month,
      rev: revLakhs > 0 ? Math.min(100, Math.round(revLakhs)) : 20,
      vol: volMT > 0 ? Math.min(100, Math.round(volMT)) : 15,
      rawRev: m.revRaw,
      rawVol: m.volRaw
    };
  });

  // 8. Material Mix (% Composition)
  const categoryMap = {};
  scraps.forEach((s) => {
    const catName = s.category?.name || "General";
    if (!categoryMap[catName]) categoryMap[catName] = 0;
    categoryMap[catName] += Number(s.availableQuantityKg || s.totalQuantityKg || 0);
  });

  const palette = ["#2563eb", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#64748b"];
  let catIndex = 0;
  const materialMix = Object.entries(categoryMap).map(([name, kg]) => {
    const percentage = totalScrapKg > 0 ? Math.round((kg / totalScrapKg) * 100) : 0;
    const color = palette[catIndex % palette.length];
    catIndex++;
    return { name, percentage, kg, color };
  });

  if (materialMix.length === 0) {
    materialMix.push({ name: "Steel", percentage: 100, kg: 0, color: "#2563eb" });
  }

  // 9. Stock Inventory List (Mapped for MaterialTable)
  const stockList = scraps.map((s) => {
    const activeListing = s.listings?.[0];
    const mode = activeListing?.sellingMode === "AUCTION"
      ? "Live Auction"
      : activeListing?.sellingMode === "TENDER"
      ? "Sealed Tender"
      : "B2B Marketplace";

    return {
      id: `SCRAP-${s.id.slice(0, 8).toUpperCase()}`,
      rawId: s.id,
      title: s.description || `${s.category?.name || "Scrap"} Inventory`,
      category: s.category?.name || "General",
      grade: s.condition || "Grade A",
      weight: `${(Number(s.availableQuantityKg || 0) / 1000).toFixed(1)} MT`,
      pricePerUnit: `₹${(Number(s.totalQuantityKg) > 0 ? 35000 : 0).toLocaleString("en-IN")}/MT`,
      totalValue: formatCurrency(Number(s.availableQuantityKg || 0) * 35),
      mode,
      status: s.status === "AVAILABLE" ? "Bidding Live" : s.status,
      biddersCount: 5,
      topBid: "₹35,000/MT",
      buyer: "Verified Buyer",
      dateAdded: new Date(s.createdAt).toLocaleDateString("en-IN")
    };
  });

  // 10. Recent Transactions List
  const transactions = sales.map((s) => ({
    id: `SAL-${s.id.slice(0, 6).toUpperCase()}`,
    rawId: s.id,
    material: s.listing?.scrapRecord?.category?.name || "Scrap Material",
    buyer: s.buyer?.companyName || "Verified Buyer",
    value: formatCurrency(s.totalValue),
    status: s.status === "COMPLETED" ? "Completed" : s.status === "ACCEPTED" ? "Pending" : "Cancelled"
  }));

  // 11. Live Auctions Widget List
  const auctionsWidget = auctions.map((a) => {
    const highestBid = a.currentHighestBid?.pricePerKg
      ? `₹${Number(a.currentHighestBid.pricePerKg).toLocaleString("en-IN")}`
      : `₹${Number(a.startingPricePerKg).toLocaleString("en-IN")}`;

    return {
      id: `AUC-${a.id.slice(0, 6).toUpperCase()}`,
      rawId: a.id,
      title: `${a.listing?.scrapRecord?.category?.name || "Scrap"} - ${(Number(a.listing?.quantityKg || 0) / 1000).toFixed(1)} MT`,
      status: a.status === "LIVE" ? "Live" : a.status === "SCHEDULED" ? "Scheduled" : "Completed",
      currentBid: highestBid,
      timer: "02:30:00",
      bids: `${a.bidCount || 0} bids · ${a.bids?.length || 0} bidders`
    };
  });

  return {
    stats,
    monthlyOverview,
    materialMix,
    stockList,
    transactions,
    auctionsWidget,
    recentNotifications: notifications
  };
};

