import ApiService from "./api.service";
import ServerUrl from "../constants/serverUrl.constant";

/**
 * Get Buyers
 * GET /api/admin/buyers
 */
export const getBuyers = (params = {}) => {
  return ApiService.get(
    ServerUrl.API_GET_BUYERS,
    params
  );
};

/**
 * Update Buyer Status
 * PATCH /api/admin/buyers/:id/status
 */
export const updateBuyerStatus = (id, data) => {
  return ApiService.patch(
    ServerUrl.API_UPDATE_BUYER_STATUS(id),
    data
  );
};