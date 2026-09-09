import prisma from "../../core/lib/prisma.js";

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
   * Get dashboard analytics summary
   */
  static async getDashboardAnalytics() {
    try {
      const [
        totalIndustries,
        totalDealers,
        totalBuyers,
        pendingApprovals,
        totalListings,
        activeSales,
        totalScrap,
        latestCompaniesRaw,
      ] = await Promise.all([
        prisma.organisation.count({ where: { businessType: "INDUSTRY" } }),
        prisma.organisation.count({ where: { businessType: "DEALER" } }),
        prisma.organisation.count({ where: { businessType: "BUYER" } }),
        prisma.organisation.count({ where: { accountState: "PENDING" } }),
        prisma.listing.count({ where: { status: "PUBLISHED" } }),
        prisma.sale.count({ where: { status: "ACCEPTED" } }),
        prisma.scrapRecord.count(),
        prisma.organisation.findMany({
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

      // Format stat cards
      const statCards = [
        {
          id: "industries",
          type: "industries",
          title: "Total Industries",
          value: totalIndustries,
          change: "+8.2%",
          isPositive: true,
          color: "#3B82F6",
          sparkline: [
            { val: 120 },
            { val: 135 },
            { val: 142 },
            { val: 155 },
            { val: totalIndustries },
          ],
        },
        {
          id: "dealers",
          type: "dealers",
          title: "Total Dealers",
          value: totalDealers,
          change: "+5.4%",
          isPositive: true,
          color: "#10B981",
          sparkline: [
            { val: 80 },
            { val: 85 },
            { val: 92 },
            { val: 98 },
            { val: totalDealers },
          ],
        },
        {
          id: "buyers",
          type: "buyers",
          title: "Total Buyers",
          value: totalBuyers,
          change: "+12.1%",
          isPositive: true,
          color: "#3B82F6",
          sparkline: [
            { val: 45 },
            { val: 52 },
            { val: 58 },
            { val: 62 },
            { val: totalBuyers },
          ],
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
          change: "+15.3%",
          isPositive: true,
          color: "#F59E0B",
        },
        {
          id: "listings",
          type: "auctions",
          title: "Active Listings",
          value: totalListings,
          change: "+9.7%",
          isPositive: true,
          color: "#EF4444",
        },
        {
          id: "sales",
          type: "sales",
          title: "Active Sales",
          value: activeSales,
          change: "+18.2%",
          isPositive: true,
          color: "#10B981",
        },
        {
          id: "revenue",
          type: "revenue",
          title: "Platform Revenue",
          value: "₹0",
          change: "+0%",
          isPositive: true,
          color: "#3B82F6",
        },
      ];

      // Format combo chart data (mock data for now)
      const comboData = [
        { name: "Mar", volume: 240, revenue: 12 },
        { name: "Apr", volume: 310, revenue: 18 },
        { name: "May", volume: 280, revenue: 15 },
        { name: "Jun", volume: 350, revenue: 22 },
        { name: "Jul", volume: 420, revenue: 28 },
        { name: "Aug", volume: 390, revenue: 25 },
        { name: "Sep", volume: 450, revenue: 32 },
      ];

      // Format inventory data (mock data for now)
      const inventoryData = [
        { name: "Steel", value: 450 },
        { name: "Aluminum", value: 280 },
        { name: "Copper", value: 180 },
        { name: "Plastic", value: 120 },
        { name: "Other", value: 90 },
      ];

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
