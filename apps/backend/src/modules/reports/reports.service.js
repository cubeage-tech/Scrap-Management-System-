import prisma from '../../core/lib/prisma.js';

// 1. Industry Reports
export const getIndustryReports = async (organisationId) => {
  const [scraps, sales] = await Promise.all([
    prisma.scrapRecord.findMany({
      where: { ownerId: organisationId },
      include: { category: true }
    }),
    prisma.sale.findMany({
      where: { sellerId: organisationId },
      include: { listing: { include: { scrapRecord: { include: { category: true } } } }, buyer: true }
    })
  ]);

  const totalScrapKg = scraps.reduce((sum, s) => sum + Number(s.totalQuantityKg || 0), 0);
  const totalListedKg = scraps.reduce((sum, s) => sum + Number(s.listedQuantityKg || 0), 0);
  const totalSoldKg = scraps.reduce((sum, s) => sum + Number(s.soldQuantityKg || 0), 0);
  const availableStockKg = scraps.reduce((sum, s) => sum + Number(s.availableQuantityKg || 0), 0);

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
  const totalSalesCount = sales.length;

  const categoryMap = {};
  sales.forEach((s) => {
    const catName = s.listing?.scrapRecord?.category?.name || 'Uncategorized';
    if (!categoryMap[catName]) {
      categoryMap[catName] = { category: catName, soldKg: 0, revenue: 0, count: 0 };
    }
    categoryMap[catName].soldKg += Number(s.quantityKg || 0);
    categoryMap[catName].revenue += Number(s.totalValue || 0);
    categoryMap[catName].count += 1;
  });

  return {
    kpis: {
      totalScrapKg,
      totalListedKg,
      totalSoldKg,
      availableStockKg,
      totalRevenue,
      totalSalesCount
    },
    categoryPerformance: Object.values(categoryMap),
    salesHistory: sales.map((s) => ({
      id: s.id,
      buyerName: s.buyer?.companyName || 'N/A',
      quantityKg: Number(s.quantityKg),
      pricePerKg: Number(s.pricePerKg),
      totalValue: Number(s.totalValue),
      completedAt: s.completedAt || s.createdAt
    }))
  };
};

// 2. Dealer Reports
export const getDealerReports = async (organisationId) => {
  const [purchases, sales, inventory] = await Promise.all([
    prisma.sale.findMany({
      where: { buyerId: organisationId },
      include: { listing: { include: { scrapRecord: { include: { category: true } } } }, seller: true }
    }),
    prisma.sale.findMany({
      where: { sellerId: organisationId },
      include: { listing: { include: { scrapRecord: { include: { category: true } } } }, buyer: true }
    }),
    prisma.scrapRecord.findMany({
      where: { ownerId: organisationId },
      include: { category: true }
    })
  ]);

  const totalProcurementCost = purchases.reduce((sum, p) => sum + Number(p.totalValue || 0), 0);
  const totalPurchasedKg = purchases.reduce((sum, p) => sum + Number(p.quantityKg || 0), 0);

  const totalSalesRevenue = sales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
  const totalSoldKg = sales.reduce((sum, s) => sum + Number(s.quantityKg || 0), 0);

  const grossProfit = totalSalesRevenue - totalProcurementCost;
  const marginPercent = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(2) : 0;

  const currentStockKg = inventory.reduce((sum, i) => sum + Number(i.availableQuantityKg || 0), 0);

  const categoryMap = {};
  inventory.forEach((i) => {
    const catName = i.category?.name || 'General';
    if (!categoryMap[catName]) {
      categoryMap[catName] = { category: catName, listedKg: 0, soldKg: 0, availableKg: 0 };
    }
    categoryMap[catName].listedKg += Number(i.listedQuantityKg || 0);
    categoryMap[catName].soldKg += Number(i.soldQuantityKg || 0);
    categoryMap[catName].availableKg += Number(i.availableQuantityKg || 0);
  });

  return {
    kpis: {
      totalProcurementCost,
      totalPurchasedKg,
      totalSalesRevenue,
      totalSoldKg,
      grossProfit,
      marginPercent: Number(marginPercent),
      currentStockKg
    },
    categoryPerformance: Object.values(categoryMap),
    purchases: purchases.map((p) => ({
      id: p.id,
      sellerName: p.seller?.companyName,
      quantityKg: Number(p.quantityKg),
      totalValue: Number(p.totalValue),
      createdAt: p.createdAt
    })),
    sales: sales.map((s) => ({
      id: s.id,
      buyerName: s.buyer?.companyName,
      quantityKg: Number(s.quantityKg),
      totalValue: Number(s.totalValue),
      createdAt: s.createdAt
    }))
  };
};

// 3. Buyer Reports
export const getBuyerReports = async (organisationId) => {
  const [quotations, purchases] = await Promise.all([
    prisma.quotation.findMany({
      where: { buyerId: organisationId },
      include: { listing: { include: { scrapRecord: { include: { category: true } } } } }
    }),
    prisma.sale.findMany({
      where: { buyerId: organisationId },
      include: { listing: { include: { scrapRecord: { include: { category: true } } } }, seller: true }
    })
  ]);

  const totalProcurementSpend = purchases.reduce((sum, p) => sum + Number(p.totalValue || 0), 0);
  const totalVolumeBoughtKg = purchases.reduce((sum, p) => sum + Number(p.quantityKg || 0), 0);

  const totalQuotationsCount = quotations.length;
  const acceptedCount = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const rejectedCount = quotations.filter((q) => q.status === 'REJECTED').length;
  const submittedCount = quotations.filter((q) => q.status === 'SUBMITTED').length;

  return {
    kpis: {
      totalProcurementSpend,
      totalVolumeBoughtKg,
      totalQuotationsCount,
      acceptedCount,
      rejectedCount,
      submittedCount
    },
    quotationsHistory: quotations.map((q) => ({
      id: q.id,
      pricePerKg: Number(q.pricePerKg),
      quantityKg: Number(q.quantityKg),
      totalValue: Number(q.totalValue),
      status: q.status,
      category: q.listing?.scrapRecord?.category?.name || 'General',
      createdAt: q.createdAt
    })),
    purchasesHistory: purchases.map((p) => ({
      id: p.id,
      sellerName: p.seller?.companyName,
      quantityKg: Number(p.quantityKg),
      pricePerKg: Number(p.pricePerKg),
      totalValue: Number(p.totalValue),
      completedAt: p.completedAt || p.createdAt
    }))
  };
};

// 4. Admin Reports
export const getAdminReports = async () => {
  const [organisations, sales, listings, scrapRecords, auctions] = await Promise.all([
    prisma.organisation.findMany({
      include: {
        users: { select: { email: true } }
      }
    }),
    prisma.sale.findMany({
      include: {
        seller: true,
        buyer: true,
        listing: {
          include: {
            scrapRecord: {
              include: { category: true }
            }
          }
        }
      }
    }),
    prisma.listing.findMany({
      include: { scrapRecord: { include: { category: true } } }
    }),
    prisma.scrapRecord.findMany({
      include: { category: true }
    }),
    prisma.auction.findMany({
      include: { listing: { include: { scrapRecord: { include: { category: true } } } }, bids: true }
    })
  ]);

  // Helper formatters
  const formatRupees = (amount) => {
    const num = Number(amount || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // 1. KPI Summary Cards
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
  const totalVolumeKg = sales.reduce((sum, s) => sum + Number(s.quantityKg || 0), 0);
  const totalVolumeMT = Math.round(totalVolumeKg / 1000);

  // Realized auction % (winning bid / starting or reserve price)
  let auctionRealisationAvg = 100;
  if (auctions.length > 0) {
    const validAuctions = auctions.filter((a) => Number(a.startingPricePerKg || 0) > 0);
    if (validAuctions.length > 0) {
      const sumPercent = validAuctions.reduce((sum, a) => {
        const start = Number(a.startingPricePerKg);
        const bids = a.bids || [];
        const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => Number(b.pricePerKg || 0))) : start;
        return sum + ((highestBid / start) * 100);
      }, 0);
      auctionRealisationAvg = Math.round(sumPercent / validAuctions.length);
    }
  }

  const activeBuyersCount = organisations.filter(
    (o) => o.businessType === "BUYER" && o.accountState === "ACTIVE"
  ).length;

  const kpis = {
    revenueYTD: formatRupees(totalRevenue),
    revenueYTDRaw: totalRevenue,
    volumeTradedMT: `${totalVolumeMT.toLocaleString("en-IN")} MT`,
    volumeTradedRaw: totalVolumeKg,
    auctionRealisationPct: `${auctionRealisationAvg}%`,
    activeBuyersCount: activeBuyersCount
  };

  // 2. Sales Analytics Tab Data (Last 7 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const salesDataMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = monthNames[d.getMonth()];
    salesDataMap[label] = { month: label, raw: 0, value: 0 };
  }

  sales.forEach((s) => {
    const date = new Date(s.createdAt);
    const label = monthNames[date.getMonth()];
    if (salesDataMap[label]) {
      salesDataMap[label].raw += Number(s.totalValue || 0);
    }
  });

  const salesData = Object.values(salesDataMap).map((m) => ({
    month: m.month,
    raw: m.raw,
    value: Number((m.raw / 100000).toFixed(1))
  }));

  // Top Selling Materials (Grouped by Category Name)
  const catSalesMap = {};
  sales.forEach((s) => {
    const catName = s.listing?.scrapRecord?.category?.name || "General Scrap";
    if (!catSalesMap[catName]) {
      catSalesMap[catName] = { name: catName, totalKg: 0, totalRev: 0 };
    }
    catSalesMap[catName].totalKg += Number(s.quantityKg || 0);
    catSalesMap[catName].totalRev += Number(s.totalValue || 0);
  });

  const topMaterialsData = Object.values(catSalesMap)
    .sort((a, b) => b.totalKg - a.totalKg)
    .slice(0, 5)
    .map((c) => {
      const mt = Math.round(c.totalKg / 1000);
      return {
        name: c.name,
        value: mt,
        volume: `${mt} MT`,
        revenue: formatRupees(c.totalRev)
      };
    });

  // 3. Inventory Tab Data
  const invCatMap = {};
  scrapRecords.forEach((sr) => {
    const catName = sr.category?.name || "General Scrap";
    if (!invCatMap[catName]) {
      invCatMap[catName] = { category: catName, stockKg: 0, totalKg: 0 };
    }
    invCatMap[catName].stockKg += Number(sr.availableQuantityKg || 0);
    invCatMap[catName].totalKg += Number(sr.totalQuantityKg || 0);
  });

  const inventoryData = Object.values(invCatMap).map((ic) => ({
    category: ic.category,
    stock: Math.round(ic.stockKg / 1000),
    capacity: Math.max(Math.round(ic.totalKg / 1000), Math.round(ic.stockKg / 1000) + 500),
    turnaround: "10-14 days"
  }));

  // 4. Auction Tab Data
  const auctionMonthlyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = monthNames[d.getMonth()];
    auctionMonthlyMap[label] = { month: label, listedLots: 0, soldLots: 0, realisationSum: 0 };
  }

  auctions.forEach((a) => {
    const d = new Date(a.createdAt);
    const label = monthNames[d.getMonth()];
    if (auctionMonthlyMap[label]) {
      auctionMonthlyMap[label].listedLots += 1;
      if (a.status === "CLOSED_WITH_WINNER" || a.winningBidId) {
        auctionMonthlyMap[label].soldLots += 1;
      }
      const start = Number(a.startingPricePerKg || 1);
      const bids = a.bids || [];
      const highest = bids.length > 0 ? Math.max(...bids.map((b) => Number(b.pricePerKg || 0))) : start;
      auctionMonthlyMap[label].realisationSum += Math.round((highest / start) * 100);
    }
  });

  const auctionPerformanceData = Object.values(auctionMonthlyMap).map((am) => ({
    month: am.month,
    listedLots: am.listedLots,
    soldLots: am.soldLots,
    realization: am.listedLots > 0 ? Math.round(am.realisationSum / am.listedLots) : 100
  }));

  // 5. Revenue Tab Data — calculated from actual listing sellingMode
  const channelMap = {
    QUOTATION: { channel: "Spot Market (Quotation)", rev: 0 },
    AUCTION:   { channel: "Forward Auctions", rev: 0 },
    TENDER:    { channel: "Tenders", rev: 0 }
  };
  sales.forEach((s) => {
    const mode = s.listing?.sellingMode || "QUOTATION";
    if (channelMap[mode]) channelMap[mode].rev += Number(s.totalValue || 0);
  });
  const revenueBreakdownData = Object.values(channelMap).map((c) => ({
    channel: c.channel,
    amount: Number((c.rev / 10000000).toFixed(1)),
    percentage: totalRevenue > 0 ? `${((c.rev / totalRevenue) * 100).toFixed(1)}%` : "0.0%"
  }));

  // 6. Industry Performance Data — grouped by company (businessCategory not in schema)
  const industryOrgs = organisations.filter((o) => o.businessType === "INDUSTRY");
  const industryPerfMap = {};
  industryOrgs.forEach((org) => {
    industryPerfMap[org.id] = { name: org.companyName, volumeKg: 0, totalVal: 0, count: 1 };
  });

  sales.forEach((s) => {
    if (s.seller?.businessType === "INDUSTRY" && industryPerfMap[s.seller.id]) {
      industryPerfMap[s.seller.id].volumeKg += Number(s.quantityKg || 0);
      industryPerfMap[s.seller.id].totalVal += Number(s.totalValue || 0);
    }
  });

  const industryPerformanceData = Object.values(industryPerfMap)
    .sort((a, b) => b.totalVal - a.totalVal)
    .slice(0, 10)
    .map((ip) => ({
      name: ip.name,
      volume: Math.round(ip.volumeKg / 1000),
      value: formatRupees(ip.totalVal),
      fulfillment: "—"
    }));

  // 7. Buyer Performance Data — grouped by company (businessCategory not in schema)
  const buyerOrgs = organisations.filter((o) => o.businessType === "BUYER");
  const buyerPerfMap = {};
  buyerOrgs.forEach((org) => {
    buyerPerfMap[org.id] = { tier: org.companyName, count: 1, totalSpend: 0 };
  });

  sales.forEach((s) => {
    if (s.buyer?.businessType === "BUYER" && buyerPerfMap[s.buyer.id]) {
      buyerPerfMap[s.buyer.id].totalSpend += Number(s.totalValue || 0);
    }
  });

  const buyerPerformanceData = Object.values(buyerPerfMap)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10)
    .map((bp) => ({
      tier: bp.tier,
      count: bp.count,
      avgSpend: formatRupees(bp.totalSpend),
      repeatRate: "—"
    }));

  return {
    kpis,
    salesData,
    topMaterialsData,
    inventoryData,
    auctionPerformanceData,
    revenueBreakdownData,
    industryPerformanceData,
    buyerPerformanceData,
    recentSales: sales.slice(-10).map((s) => ({
      id: s.id,
      seller: s.seller?.companyName,
      buyer: s.buyer?.companyName,
      totalValue: Number(s.totalValue),
      commissionAmount: Number(s.commissionAmount || 0),
      createdAt: s.createdAt
    }))
  };
};

