import ApiService from "./api.service";
import ServerUrl from "../constants/serverUrl.constant";

/**
 * Get Dealers
 * GET /api/admin/dealers
 */
export const getDealers = (params = {}) => {
  return ApiService.get(
    ServerUrl.API_GET_DEALERS,
    params
  );
};

/**
 * Update Dealer Status
 * PATCH /api/admin/dealers/:id/status
 */
export const updateDealerStatus = (id, data) => {
  return ApiService.patch(
    ServerUrl.API_UPDATE_DEALER_STATUS(id),
    data
  );
};
