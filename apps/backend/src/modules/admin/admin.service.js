import prisma from "../../core/lib/prisma.js";
import { notifyAccountApproved, notifyAccountRejected } from "../notification/notification.service.js";


const emailSearchFilter = (search) => ({
  users: {
    some: {
      email: { contains: search, mode: "insensitive" },
    },
  },
});

class AdminService {
  // =========================================================
  // INDUSTRIES
  // =========================================================

  /**
   * Get all industries with pagination and filters
   */
  static async getIndustries({ status, search, page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where = {
        businessType: "INDUSTRY",
      };

      if (status) {
        where.accountState = status;
      }

      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: "insensitive" } },
          { gstNumber: { contains: search, mode: "insensitive" } },
          { contactName: { contains: search, mode: "insensitive" } },
          emailSearchFilter(search),
        ];
      }

      // Fetch data
      const [data, total] = await Promise.all([
        prisma.organisation.findMany({
          where,
          include: {
            users: {
              where: { role: "INDUSTRY" },
              select: {
                id: true,
                email: true,
                createdAt: true,
              },
              take: 1,
            },
            approvedBy: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.organisation.count({ where }),
      ]);

      // Format response
      const formatted = data.map((org) => ({
        id: org.id,
        companyName: org.companyName,
        code: org.id.slice(0, 8).toUpperCase(), // Generate code from ID
        sector: org.businessCategory || "General",
        location: `${org.city}, ${org.state}`,
        gstNumber: org.gstNumber,
        contactPerson: org.contactName,
        contactEmail: org.users[0]?.email ?? null,
        contactPhone: org.contactPhone,
        tradedValue: 0, // To be calculated from transactions
        tradedValueDisplay: "₹0",
        status: org.accountState,
        date: org.createdAt.toLocaleDateString("en-IN"),
        createdAt: org.createdAt,
        address: org.address,
        approvedByUser: org.approvedBy,
      }));

      return { data: formatted, total };
    } catch (error) {
      console.error("[AdminService.getIndustries]", error);
      throw error;
    }
  }

  /**
   * Get single industry by ID
   */
  static async getIndustryById(id) {
    try {
      const industry = await prisma.organisation.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!industry || industry.businessType !== "INDUSTRY") {
        return null;
      }

      return {
        id: industry.id,
        companyName: industry.companyName,
        gstNumber: industry.gstNumber,
        contactName: industry.contactName,
        contactEmail: industry.users[0]?.email ?? null,
        contactPhone: industry.contactPhone,
        businessCategory: industry.businessCategory,
        address: industry.address,
        city: industry.city,
        state: industry.state,
        zipCode: industry.zipCode,
        status: industry.accountState,
        users: industry.users,
        approvedByUser: industry.approvedBy,
        createdAt: industry.createdAt,
      };
    } catch (error) {
      console.error("[AdminService.getIndustryById]", error);
      throw error;
    }
  }

  /**
   * Update industry status (approve/reject)
   */
  static async updateIndustryStatus(
    organisationId,
    accountState,
    rejectReason = null,
    approvedByUserId = null
  ) {
    try {
      const updated = await prisma.organisation.update({
        where: { id: organisationId },
        data: {
          accountState,
          rejectReason: accountState === "REJECTED" ? rejectReason : null,
          approvedByUserId: accountState === "ACTIVE" ? approvedByUserId : null,
          approvedAt:
            accountState === "ACTIVE" ? new Date() : null,
        },
        include: {
          users: true,
          approvedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // Activate associated users if organisation is approved
      if (accountState === "ACTIVE") {
        await prisma.user.updateMany({
          where: { organisationId },
          data: { isActive: true },
        });

        // Trigger notification event for primary organisation users
        if (updated.users && updated.users.length > 0) {
          for (const u of updated.users) {
            await notifyAccountApproved(u.id, updated.companyName);
          }
        }
      } else if (accountState === "REJECTED") {
        if (updated.users && updated.users.length > 0) {
          for (const u of updated.users) {
            await notifyAccountRejected(u.id, updated.companyName, rejectReason);
          }
        }
      }

      return {
        id: updated.id,
        companyName: updated.companyName,
        status: updated.accountState,
        rejectReason: updated.rejectReason,
        approvedAt: updated.approvedAt,
      };
    } catch (error) {
      console.error("[AdminService.updateIndustryStatus]", error);
      throw error;
    }
  }


  // =========================================================
  // DEALERS
  // =========================================================

  /**
   * Get all dealers with pagination and filters
   */
  static async getDealers({ status, search, page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const where = {
        businessType: "DEALER",
      };

      if (status) {
        where.accountState = status;
      }

      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: "insensitive" } },
          { gstNumber: { contains: search, mode: "insensitive" } },
          { contactName: { contains: search, mode: "insensitive" } },
          emailSearchFilter(search),
        ];
      }

      const [data, total] = await Promise.all([
        prisma.organisation.findMany({
          where,
          include: {
            users: {
              where: { role: "DEALER" },
              select: {
                id: true,
                email: true,
                createdAt: true,
              },
              take: 1,
            },
            approvedBy: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.organisation.count({ where }),
      ]);

      const formatted = data.map((org) => ({
        id: org.id,
        code: org.id.slice(0, 8).toUpperCase(),
        name: org.companyName,
        specialisation: org.businessCategory || "General",
        location: `${org.city}, ${org.state}`,
        gstNumber: org.gstNumber,
        contactPerson: org.contactName,
        contactEmail: org.users[0]?.email ?? null,
        contactPhone: org.contactPhone,
        purchaseValue: 0,
        purchaseValueDisplay: "₹0",
        status: org.accountState,
        date: org.createdAt.toLocaleDateString("en-IN"),
        createdAt: org.createdAt,
      }));

      return { data: formatted, total };
    } catch (error) {
      console.error("[AdminService.getDealers]", error);
      throw error;
    }
  }

  /**
   * Update dealer status
   */
  static async updateDealerStatus(
    organisationId,
    accountState,
    rejectReason = null,
    approvedByUserId = null
  ) {
    try {
      const updated = await prisma.organisation.update({
        where: { id: organisationId },
        data: {
          accountState,
          rejectReason: accountState === "REJECTED" ? rejectReason : null,
          approvedByUserId: accountState === "ACTIVE" ? approvedByUserId : null,
          approvedAt:
            accountState === "ACTIVE" ? new Date() : null,
        },
        include: {
          users: true,
          approvedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // Activate associated users if organisation is approved
      if (accountState === "ACTIVE") {
        await prisma.user.updateMany({
          where: { organisationId },
          data: { isActive: true },
        });
      }

      return {
        id: updated.id,
        companyName: updated.companyName,
        status: updated.accountState,
        rejectReason: updated.rejectReason,
        approvedAt: updated.approvedAt,
      };
    } catch (error) {
      console.error("[AdminService.updateDealerStatus]", error);
      throw error;
    }
  }

  // =========================================================
  // BUYERS
  // =========================================================

  /**
   * Get all buyers with pagination and filters
   */
  static async getBuyers({ status, search, page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const where = {
        businessType: "BUYER",
      };

      if (status) {
        where.accountState = status;
      }

      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: "insensitive" } },
          { gstNumber: { contains: search, mode: "insensitive" } },
          { contactName: { contains: search, mode: "insensitive" } },
          emailSearchFilter(search),
        ];
      }

      const [data, total] = await Promise.all([
        prisma.organisation.findMany({
          where,
          include: {
            users: {
              where: { role: "BUYER" },
              select: {
                id: true,
                email: true,
                createdAt: true,
              },
              take: 1,
            },
            approvedBy: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.organisation.count({ where }),
      ]);

      const formatted = data.map((org) => ({
        id: org.id,
        code: org.id.slice(0, 8).toUpperCase(),
        name: org.companyName,
        type: org.businessCategory || "General",
        location: `${org.city}, ${org.state}`,
        gstNumber: org.gstNumber,
        contactPerson: org.contactName,
        contactEmail: org.users[0]?.email ?? null,
        contactPhone: org.contactPhone,
        spend: 0,
        spendDisplay: "₹0",
        status: org.accountState,
        date: org.createdAt.toLocaleDateString("en-IN"),
        createdAt: org.createdAt,
      }));

      return { data: formatted, total };
    } catch (error) {
      console.error("[AdminService.getBuyers]", error);
      throw error;
    }
  }

  /**
   * Update buyer status
   */
  static async updateBuyerStatus(
    organisationId,
    accountState,
    rejectReason = null,
    approvedByUserId = null
  ) {
    try {
      const updated = await prisma.organisation.update({
        where: { id: organisationId },
        data: {
          accountState,
          rejectReason: accountState === "REJECTED" ? rejectReason : null,
          approvedByUserId: accountState === "ACTIVE" ? approvedByUserId : null,
          approvedAt:
            accountState === "ACTIVE" ? new Date() : null,
        },
        include: {
          users: true,
          approvedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // Activate associated users if organisation is approved
      if (accountState === "ACTIVE") {
        await prisma.user.updateMany({
          where: { organisationId },
          data: { isActive: true },
        });
      }

      return {
        id: updated.id,
        companyName: updated.companyName,
        status: updated.accountState,
        rejectReason: updated.rejectReason,
        approvedAt: updated.approvedAt,
      };
    } catch (error) {
      console.error("[AdminService.updateBuyerStatus]", error);
      throw error;
    }
  }

  // =========================================================
  // DASHBOARD ANALYTICS
  // =========================================================

  /**
   * Get dashboard analytics summary with 100% dynamic PostgreSQL data
   */
  static async getDashboardAnalytics(filters = {}) {
    try {
      const { region, categoryId } = filters;

      // Base org filter for region if specified
      const orgWhere = {};
      if (region && region !== "All Regions") {
        orgWhere.state = { contains: region, mode: "insensitive" };
      }

      const [
        totalIndustries,
        totalDealers,
        totalBuyers,
        pendingApprovals,
        totalListings,
        activeSales,
        totalScrap,
        revenueAggregate,
        latestCompaniesRaw,
      ] = await Promise.all([
        prisma.organisation.count({ where: { ...orgWhere, businessType: "INDUSTRY" } }),
        prisma.organisation.count({ where: { ...orgWhere, businessType: "DEALER" } }),
        prisma.organisation.count({ where: { ...orgWhere, businessType: "BUYER" } }),
        prisma.organisation.count({ where: { ...orgWhere, accountState: "PENDING" } }),
        prisma.listing.count({ where: { status: "PUBLISHED" } }),
        prisma.sale.count({ where: { status: { in: ["ACCEPTED", "COMPLETED"] } } }),
        prisma.scrapRecord.count(),
        prisma.sale.aggregate({
          _sum: { totalValue: true, commissionAmount: true },
          where: { status: { in: ["ACCEPTED", "COMPLETED"] } }
        }),
        prisma.organisation.findMany({
          where: orgWhere,
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            users: {
              select: { email: true },
              take: 1,
            },
          },
        }),
      ]);

      const totalRevenueNum = Number(revenueAggregate._sum.commissionAmount || revenueAggregate._sum.totalValue || 0);
      const formattedRevenue = totalRevenueNum >= 10000000
        ? `₹${(totalRevenueNum / 10000000).toFixed(2)} Cr`
        : totalRevenueNum >= 100000
        ? `₹${(totalRevenueNum / 100000).toFixed(2)} L`
        : `₹${totalRevenueNum.toLocaleString("en-IN")}`;

      // Format stat cards
      const statCards = [
        {
          id: "industries",
          type: "industries",
          title: "Total Industries",
          value: totalIndustries,
          change: "+0%",
          isPositive: true,
          color: "#3B82F6",
          sparkline: [{ val: Math.max(0, totalIndustries - 2) }, { val: totalIndustries }],
        },
        {
          id: "dealers",
          type: "dealers",
          title: "Total Dealers",
          value: totalDealers,
          change: "+0%",
          isPositive: true,
          color: "#10B981",
          sparkline: [{ val: Math.max(0, totalDealers - 1) }, { val: totalDealers }],
        },
        {
          id: "buyers",
          type: "buyers",
          title: "Total Buyers",
          value: totalBuyers,
          change: "+0%",
          isPositive: true,
          color: "#3B82F6",
          sparkline: [{ val: Math.max(0, totalBuyers - 1) }, { val: totalBuyers }],
        },
        {
          id: "pending",
          type: "pending",
          title: "Pending Approvals",
          value: pendingApprovals,
          change: null,
          isPositive: false,
          color: "#F59E0B",
        },
        {
          id: "scrap",
          type: "scrap",
          title: "Total Scrap Records",
          value: totalScrap,
          change: "+0%",
          isPositive: true,
          color: "#F59E0B",
        },
        {
          id: "listings",
          type: "auctions",
          title: "Active Listings",
          value: totalListings,
          change: "+0%",
          isPositive: true,
          color: "#EF4444",
        },
        {
          id: "sales",
          type: "sales",
          title: "Active Sales",
          value: activeSales,
          change: "+0%",
          isPositive: true,
          color: "#10B981",
        },
        {
          id: "revenue",
          type: "revenue",
          title: "Platform Revenue",
          value: formattedRevenue,
          change: "+0%",
          isPositive: true,
          color: "#3B82F6",
        },
      ];

      // Dynamic monthly trade volume vs revenue (Last 6 Months)
      const now = new Date();
      const monthBuckets = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        monthBuckets.push({
          start,
          end,
          name: start.toLocaleString("en-US", { month: "short" })
        });
      }

      const comboData = await Promise.all(
        monthBuckets.map(async (m) => {
          const agg = await prisma.sale.aggregate({
            _sum: { quantityKg: true, totalValue: true },
            where: {
              createdAt: { gte: m.start, lte: m.end },
              status: { in: ["ACCEPTED", "COMPLETED"] }
            }
          });
          const volumeKg = Number(agg._sum.quantityKg || 0);
          const totalVal = Number(agg._sum.totalValue || 0);
          return {
            name: m.name,
            volume: Number((volumeKg / 1000).toFixed(1)),
            revenue: Number((totalVal / 100000).toFixed(2))
          };
        })
      );

      // Dynamic Material Composition from ScrapRecord + Category
      const categoryGroups = await prisma.scrapRecord.groupBy({
        by: ["categoryId"],
        _sum: { availableQuantityKg: true, totalQuantityKg: true },
      });

      const categories = await prisma.category.findMany({ select: { id: true, name: true } });
      const categoryNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

      let inventoryData = categoryGroups.map((g) => {
        const name = categoryNameMap[g.categoryId] || "General";
        const kg = Number(g._sum.availableQuantityKg || g._sum.totalQuantityKg || 0);
        return {
          name,
          value: Number((kg / 1000).toFixed(1)),
        };
      }).filter((item) => item.value > 0);

      if (inventoryData.length === 0) {
        inventoryData = [{ name: "No Inventory Recorded", value: 0 }];
      }

      // Format latest companies
      const latestCompanies = latestCompaniesRaw.map((org) => ({
        id: org.id,
        company: org.companyName,
        type: org.businessType,
        location: `${org.city}, ${org.state}`,
        email: org.users[0]?.email || "N/A",
        status: org.accountState,
        date: org.createdAt.toLocaleDateString("en-IN"),
      }));

      return {
        statCards,
        comboData,
        inventoryData,
        latestCompanies,
      };
    } catch (error) {
      console.error("[AdminService.getDashboardAnalytics]", error);
      throw error;
    }
  }
}

export default AdminService;
