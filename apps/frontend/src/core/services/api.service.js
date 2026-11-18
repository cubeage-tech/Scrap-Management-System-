import ApiInterceptor from "./interceptor.service";
import ServerUrl from "../constants/serverUrl.constant";

class ApiService {
  static axiosInstance = ApiInterceptor.init();

  // =========================================================
  // AUTH
  // =========================================================

  static login(data) {
    return this.axiosInstance.post(
      ServerUrl.API_LOGIN,
      data
    );
  }

  static signup(data) {
    return this.axiosInstance.post(
      ServerUrl.API_SIGNUP,
      data
    );
  }

  static logout() {
    return this.axiosInstance.post(
      ServerUrl.API_LOGOUT
    );
  }

  static forgotPassword(email) {
    return this.axiosInstance.post(ServerUrl.API_FORGOT_PASSWORD, { email });
  }

  static resetPassword(token, password) {
    return this.axiosInstance.post(ServerUrl.API_RESET_PASSWORD, { token, password });
  }

  // Alias for backward compatibility
  static apiPost(url, data) {
    return this.post(url, data);
  }

  // =========================================================
  // SCRAP INVENTORY
  // =========================================================

  /**
   * Create Scrap
   * POST /api/scrap
   */
  static createScrap(data) {
    return this.axiosInstance.post(
      ServerUrl.API_CREATE_SCRAP,
      data
    );
  }

  /**
   * Get Scrap List
   * GET /api/scrap
   */
  static getScraps(params = {}) {
    return this.axiosInstance.get(
      ServerUrl.API_GET_SCRAPS,
      {
        params,
      }
    );
  }

  /**
   * Get Scrap By ID
   * GET /api/scrap/:id
   */
  static getScrapById(id) {
    return this.axiosInstance.get(
      ServerUrl.API_GET_SCRAP_BY_ID(id)
    );
  }

  /**
   * Update Scrap
   * PATCH /api/scrap/:id
   */
  static updateScrap(id, data) {
    return this.axiosInstance.patch(
      ServerUrl.API_UPDATE_SCRAP(id),
      data
    );
  }

  /**
   * Delete Scrap
   * DELETE /api/scrap/:id
   */
  static deleteScrap(id) {
    return this.axiosInstance.delete(
      ServerUrl.API_DELETE_SCRAP(id)
    );
  }

  static uploadScrapImages(id, formData) {
    return this.axiosInstance.post(
      ServerUrl.API_UPLOAD_SCRAP_IMAGES(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }

  static deleteScrapImage(id, imageId) {
    return this.axiosInstance.delete(
      ServerUrl.API_DELETE_SCRAP_IMAGE(id, imageId)
    );
  }

  /**
   * Category Management
   */
  static createCategory(data) {
    return this.axiosInstance.post(
      ServerUrl.API_CREATE_CATEGORY,
      data
    );
  }

  static updateCategory(id, data) {
    return this.axiosInstance.patch(
      ServerUrl.API_UPDATE_CATEGORY(id),
      data
    );
  }

  static deleteCategory(id) {
    return this.axiosInstance.delete(
      ServerUrl.API_DELETE_CATEGORY(id)
    );
  }


  // =========================================================
  // ADMIN MANAGEMENT
  // =========================================================

  /**
   * Get Industries List
   * GET /api/admin/industries
   */
  static getIndustries(params = {}) {
    return this.axiosInstance.get(
      ServerUrl.API_GET_INDUSTRIES,
      { params }
    );
  }

  /**
   * Get Industry By ID
   * GET /api/admin/industries/:id
   */
  static getIndustryById(id) {
    return this.axiosInstance.get(
      ServerUrl.API_GET_INDUSTRY_BY_ID(id)
    );
  }

  /**
   * Update Industry Status
   * PATCH /api/admin/industries/:id/status
   */
  static updateIndustryStatus(id, data) {
    return this.axiosInstance.patch(
      ServerUrl.API_UPDATE_INDUSTRY_STATUS(id),
      data
    );
  }

  /**
   * Get Dealers List
   * GET /api/admin/dealers
   */
  static getDealers(params = {}) {
    return this.axiosInstance.get(
      ServerUrl.API_GET_DEALERS,
      { params }
    );
  }

  /**
   * Update Dealer Status
   * PATCH /api/admin/dealers/:id/status
   */
  static updateDealerStatus(id, data) {
    return this.axiosInstance.patch(
      ServerUrl.API_UPDATE_DEALER_STATUS(id),
      data
    );
  }

  // =========================================================
  // MARKETPLACE LISTINGS
  // =========================================================

  static getListings(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_LISTINGS, { params });
  }

  static getListingById(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_LISTING_BY_ID(id));
  }

  static createListing(data) {
    return this.axiosInstance.post(ServerUrl.API_CREATE_LISTING, data);
  }

  static publishListing(id) {
    return this.axiosInstance.patch(ServerUrl.API_PUBLISH_LISTING(id));
  }

  // =========================================================
  // MARKETPLACE QUOTATIONS
  // =========================================================

  static getQuotations(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_QUOTATIONS, { params });
  }

  static getQuotationById(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_QUOTATION_BY_ID(id));
  }

  static createQuotation(data) {
    return this.axiosInstance.post(ServerUrl.API_CREATE_QUOTATION, data);
  }

  static acceptQuotation(id) {
    return this.axiosInstance.patch(ServerUrl.API_ACCEPT_QUOTATION(id));
  }

  static rejectQuotation(id) {
    return this.axiosInstance.patch(ServerUrl.API_REJECT_QUOTATION(id));
  }

  static withdrawQuotation(id) {
    return this.axiosInstance.patch(ServerUrl.API_WITHDRAW_QUOTATION(id));
  }

  // =========================================================
  // INDUSTRY DASHBOARD
  // =========================================================

  static getIndustryDashboard() {
    return this.axiosInstance.get(ServerUrl.API_INDUSTRY_DASHBOARD);
  }

  // =========================================================
  // SALES ORDERS
  // =========================================================

  static getSales(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_SALES, { params });
  }

  static getSaleById(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_SALE_BY_ID(id));
  }

  static updateSaleStatus(id, status) {
    return this.axiosInstance.patch(ServerUrl.API_UPDATE_SALE_STATUS(id), { status });
  }

  static completeSale(id) {
    return this.axiosInstance.post(ServerUrl.API_COMPLETE_SALE(id));
  }

  static updateSaleDelivery(id, data) {
    return this.axiosInstance.patch(ServerUrl.API_UPDATE_SALE_DELIVERY(id), data);
  }

  // =========================================================
  // AUCTION LIFECYCLE
  // =========================================================

  static getAuctions(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_AUCTIONS, { params });
  }

  static getAuctionById(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_AUCTION_BY_ID(id));
  }

  static createAuction(data) {
    return this.axiosInstance.post(ServerUrl.API_CREATE_AUCTION, data);
  }

  static startAuction(id) {
    return this.axiosInstance.patch(ServerUrl.API_START_AUCTION(id));
  }

  static closeAuction(id) {
    return this.axiosInstance.patch(ServerUrl.API_CLOSE_AUCTION(id));
  }

  static placeBid(id, data) {
    return this.axiosInstance.post(ServerUrl.API_PLACE_BID(id), data);
  }

  // =========================================================
  // ADMIN DASHBOARD
  // =========================================================

  static getAdminDashboard() {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_DASHBOARD);
  }

  // =========================================================
  // IMPORT SALE & REPORTS
  // =========================================================


  static importSaleToInventory(saleId) {
    return this.axiosInstance.post(
      ServerUrl.API_IMPORT_SALE_TO_INVENTORY(saleId)
    );
  }

  static getIndustryReports(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_INDUSTRY_REPORTS, { params });
  }

  static getDealerReports(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_DEALER_REPORTS, { params });
  }

  static getBuyerReports(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_BUYER_REPORTS, { params });
  }

  static getAdminReports(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_ADMIN_REPORTS, { params });
  }

  // =========================================================
  // CATEGORY

  // =========================================================

  static getCategories(params = {}) {
    return this.axiosInstance.get(
      ServerUrl.API_GET_CATEGORIES,
      {
        params,
      }
    );
  }

  static getCategoryById(id) {
    return this.axiosInstance.get(
      ServerUrl.API_GET_CATEGORY_BY_ID(id)
    );
  }

  // =========================================================
  // PAYMENTS
  // =========================================================

  static initiatePayment(saleId) {
    return this.axiosInstance.post(ServerUrl.API_INITIATE_PAYMENT, { saleId });
  }

  static verifyPayment(saleId, paymentId) {
    return this.axiosInstance.post(ServerUrl.API_VERIFY_PAYMENT, { saleId, paymentId });
  }

  static getPaymentBySale(saleId) {
    return this.axiosInstance.get(ServerUrl.API_GET_PAYMENT_BY_SALE(saleId));
  }

  // =========================================================
  // LISTING EXTRA ACTIONS
  // =========================================================

  static cancelAuction(auctionId) {
    return this.axiosInstance.patch(ServerUrl.API_CANCEL_AUCTION(auctionId));
  }

  static getMyBids() {
    return this.axiosInstance.get(ServerUrl.API_GET_MY_BIDS);
  }

  // =========================================================
  // TENDERS
  // =========================================================

  static getTenders(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_TENDERS, { params });
  }

  static getTenderById(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_TENDER_BY_ID(id));
  }

  static createTender(data) {
    return this.axiosInstance.post(ServerUrl.API_CREATE_TENDER, data);
  }

  static updateTender(id, data) {
    return this.axiosInstance.patch(ServerUrl.API_UPDATE_TENDER(id), data);
  }

  static publishTender(id) {
    return this.axiosInstance.post(ServerUrl.API_PUBLISH_TENDER(id));
  }

  static startTenderEvaluation(id) {
    return this.axiosInstance.post(ServerUrl.API_START_TENDER_EVALUATION(id));
  }

  static updateTenderSubmission(id, submissionId, data) {
    return this.axiosInstance.patch(ServerUrl.API_UPDATE_TENDER_SUBMISSION(id, submissionId), data);
  }

  static awardTender(id, submissionId) {
    return this.axiosInstance.post(ServerUrl.API_AWARD_TENDER(id), { submissionId });
  }

  static cancelTender(id) {
    return this.axiosInstance.patch(ServerUrl.API_CANCEL_TENDER(id));
  }

  static getTenderSubmissions(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_TENDER_SUBMISSIONS(id));
  }

  // Award workflow
  static getMyTenderAwards() {
    return this.axiosInstance.get(ServerUrl.API_GET_MY_TENDER_AWARDS);
  }

  static getTenderAward(tenderId) {
    return this.axiosInstance.get(ServerUrl.API_GET_TENDER_AWARD(tenderId));
  }

  static initiateAwardPayment(tenderId) {
    return this.axiosInstance.post(ServerUrl.API_INITIATE_AWARD_PAYMENT(tenderId));
  }

  static verifyAwardPayment(tenderId) {
    return this.axiosInstance.post(ServerUrl.API_VERIFY_AWARD_PAYMENT(tenderId));
  }

  static confirmAwardTransfer(tenderId, data) {
    return this.axiosInstance.post(ServerUrl.API_CONFIRM_AWARD_TRANSFER(tenderId), data);
  }

  static importAwardToInventory(tenderId) {
    return this.axiosInstance.post(ServerUrl.API_IMPORT_AWARD_TO_INVENTORY(tenderId));
  }

  static getMyTenderSubmission(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_MY_TENDER_SUBMISSION(id));
  }

  static submitTenderOffer(id, data) {
    return this.axiosInstance.post(ServerUrl.API_SUBMIT_TENDER_OFFER(id), data);
  }

  static getTenderDocuments(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_TENDER_DOCUMENTS(id));
  }

  static uploadTenderDocument(id, formData) {
    return this.axiosInstance.post(ServerUrl.API_UPLOAD_TENDER_DOCUMENT(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  static downloadTenderDocument(id, docId) {
    return this.axiosInstance.get(ServerUrl.API_DOWNLOAD_TENDER_DOCUMENT(id, docId), {
      responseType: 'blob',
    });
  }

  static deleteTenderDocument(id, docId) {
    return this.axiosInstance.delete(ServerUrl.API_DELETE_TENDER_DOCUMENT(id, docId));
  }

  static uploadSubmissionDocument(id, submissionId, formData) {
    return this.axiosInstance.post(ServerUrl.API_UPLOAD_SUBMISSION_DOCUMENT(id, submissionId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  static listSubmissionDocuments(id, submissionId) {
    return this.axiosInstance.get(ServerUrl.API_LIST_SUBMISSION_DOCUMENTS(id, submissionId));
  }

  static downloadSubmissionDocument(id, submissionId, docId) {
    return this.axiosInstance.get(ServerUrl.API_DOWNLOAD_SUBMISSION_DOCUMENT(id, submissionId, docId), {
      responseType: 'blob',
    });
  }

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  static getNotifications(params = {}) {
    return this.axiosInstance.get(ServerUrl.API_GET_NOTIFICATIONS, { params });
  }

  static markNotificationRead(id) {
    return this.axiosInstance.patch(ServerUrl.API_MARK_NOTIFICATION_READ(id));
  }

  static markAllNotificationsRead() {
    return this.axiosInstance.patch(`${ServerUrl.API_MODULE_NOTIFICATION}/read-all`);
  }

  // =========================================================
  // GENERIC METHODS
  // =========================================================

  static get(url, params = {}) {
    return this.axiosInstance.get(url, {
      params,
    });
  }

  static post(url, data) {
    return this.axiosInstance.post(
      url,
      data
    );
  }

  static put(url, data) {
    return this.axiosInstance.put(
      url,
      data
    );
  }

  static patch(url, data) {
    return this.axiosInstance.patch(
      url,
      data
    );
  }

  static delete(url) {
    return this.axiosInstance.delete(url);
  }
}

// Export convenience functions for backward compatibility
export const apiGet = (url, config = {}) => ApiService.get(url, config.params);
export const apiPost = (url, data) => ApiService.post(url, data);
export const apiPut = (url, data) => ApiService.put(url, data);
export const apiPatch = (url, data) => ApiService.patch(url, data);
export const apiDelete = (url) => ApiService.delete(url);

export default ApiService;