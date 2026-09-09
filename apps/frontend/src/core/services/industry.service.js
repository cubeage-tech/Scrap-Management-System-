import ApiService from "./api.service";
import ServerUrl from "../constants/serverUrl.constant";

/**
 * Get Industries
 * GET /api/admin/industries
 */
export const getIndustries = (params = {}) => {
  return ApiService.get(
    ServerUrl.API_GET_INDUSTRIES,
    params
  );
};

/**
 * Update Industry Status
 * PATCH /api/admin/industries/:id/status
 */
export const updateIndustryStatus = (id, data) => {
  return ApiService.patch(
    ServerUrl.API_UPDATE_INDUSTRY_STATUS(id),
    data
  );
};
