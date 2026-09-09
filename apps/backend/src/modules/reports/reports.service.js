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
  const [organisations, sales, listings] = await Promise.all([
    prisma.organisation.findMany(),
    prisma.sale.findMany({
      include: { seller: true, buyer: true, listing: { include: { scrapRecord: { include: { category: true } } } } }
    }),
    prisma.listing.findMany()
  ]);

  const totalGMV = sales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
  const totalCommissionEarned = sales.reduce((sum, s) => sum + Number(s.commissionAmount || 0), 0);

  const industryCount = organisations.filter((o) => o.businessType === 'INDUSTRY').length;
  const dealerCount = organisations.filter((o) => o.businessType === 'DEALER').length;
  const buyerCount = organisations.filter((o) => o.businessType === 'BUYER').length;
  const pendingApprovalsCount = organisations.filter((o) => o.accountState === 'PENDING').length;

  const industryToDealerSales = sales.filter((s) => s.seller?.businessType === 'INDUSTRY' && s.buyer?.businessType === 'DEALER');
  const dealerToBuyerSales = sales.filter((s) => s.seller?.businessType === 'DEALER' && s.buyer?.businessType === 'BUYER');

  return {
    kpis: {
      totalGMV,
      totalCommissionEarned,
      totalTransactions: sales.length,
      totalListings: listings.length,
      industryCount,
      dealerCount,
      buyerCount,
      pendingApprovalsCount
    },
    transactionSplit: {
      industryToDealer: {
        count: industryToDealerSales.length,
        volume: industryToDealerSales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0)
      },
      dealerToBuyer: {
        count: dealerToBuyerSales.length,
        volume: dealerToBuyerSales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0)
      }
    },
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

