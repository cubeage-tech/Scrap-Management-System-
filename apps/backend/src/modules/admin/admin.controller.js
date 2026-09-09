import AdminService from "./admin.service.js";

class AdminController {
  // =========================================================
  // INDUSTRIES
  // =========================================================

  /**
   * Get all industries (signup users with INDUSTRY role)
   * GET /admin/industries
   */
  static async getIndustries(req, res) {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;

      const industries = await AdminService.getIndustries({
        status,
        search,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        data: industries.data,
        total: industries.total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (error) {
      console.error("[AdminController.getIndustries]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch industries",
        error: error.message,
      });
    }
  }

  /**
   * Get single industry by ID
   * GET /admin/industries/:id
   */
  static async getIndustryById(req, res) {
    try {
      const { id } = req.params;

      const industry = await AdminService.getIndustryById(id);

      if (!industry) {
        return res.status(404).json({
          success: false,
          message: "Industry not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: industry,
      });
    } catch (error) {
      console.error("[AdminController.getIndustryById]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch industry",
        error: error.message,
      });
    }
  }

  /**
   * Approve/Reject industry
   * PATCH /admin/industries/:id/status
   */
  static async updateIndustryStatus(req, res) {
    try {
      const { id } = req.params;
      const { accountState, rejectReason } = req.body;

      // Validate status
      const validStates = ["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"];
      if (!validStates.includes(accountState)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStates.join(", ")}`,
        });
      }

      const updatedIndustry = await AdminService.updateIndustryStatus(
        id,
        accountState,
        rejectReason,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: `Industry ${accountState.toLowerCase()} successfully`,
        data: updatedIndustry,
      });
    } catch (error) {
      console.error("[AdminController.updateIndustryStatus]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update industry status",
        error: error.message,
      });
    }
  }

  // =========================================================
  // DEALERS
  // =========================================================

  /**
   * Get all dealers (signup users with DEALER role)
   * GET /admin/dealers
   */
  static async getDealers(req, res) {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;

      const dealers = await AdminService.getDealers({
        status,
        search,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        data: dealers.data,
        total: dealers.total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (error) {
      console.error("[AdminController.getDealers]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dealers",
        error: error.message,
      });
    }
  }

  /**
   * Approve/Reject dealer
   * PATCH /admin/dealers/:id/status
   */
  static async updateDealerStatus(req, res) {
    try {
      const { id } = req.params;
      const { accountState, rejectReason } = req.body;

      const validStates = ["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"];
      if (!validStates.includes(accountState)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStates.join(", ")}`,
        });
      }

      const updatedDealer = await AdminService.updateDealerStatus(
        id,
        accountState,
        rejectReason,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: `Dealer ${accountState.toLowerCase()} successfully`,
        data: updatedDealer,
      });
    } catch (error) {
      console.error("[AdminController.updateDealerStatus]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update dealer status",
        error: error.message,
      });
    }
  }

  // =========================================================
  // BUYERS
  // =========================================================

  /**
   * Get all buyers (signup users with BUYER role)
   * GET /admin/buyers
   */
  static async getBuyers(req, res) {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;

      const buyers = await AdminService.getBuyers({
        status,
        search,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        data: buyers.data,
        total: buyers.total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (error) {
      console.error("[AdminController.getBuyers]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch buyers",
        error: error.message,
      });
    }
  }

  /**
   * Approve/Reject buyer
   * PATCH /admin/buyers/:id/status
   */
  static async updateBuyerStatus(req, res) {
    try {
      const { id } = req.params;
      const { accountState, rejectReason } = req.body;

      const validStates = ["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"];
      if (!validStates.includes(accountState)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStates.join(", ")}`,
        });
      }

      const updatedBuyer = await AdminService.updateBuyerStatus(
        id,
        accountState,
        rejectReason,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: `Buyer ${accountState.toLowerCase()} successfully`,
        data: updatedBuyer,
      });
    } catch (error) {
      console.error("[AdminController.updateBuyerStatus]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update buyer status",
        error: error.message,
      });
    }
  }

  // =========================================================
  // DASHBOARD ANALYTICS
  // =========================================================

  /**
   * Get dashboard analytics data
   * GET /admin/dashboard
   */
  static async getDashboardAnalytics(req, res) {
    try {
      const analytics = await AdminService.getDashboardAnalytics();

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("[AdminController.getDashboardAnalytics]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard analytics",
        error: error.message,
      });
    }
  }
}

export default AdminController;
