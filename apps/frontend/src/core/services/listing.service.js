import ApiService from "./api.service";
import ServerUrl from "../constants/serverUrl.constant";

export const createListing = async (data) => {
  const response = await ApiService.post(
    ServerUrl.API_CREATE_LISTING,
    data
  );

  return response.data;
};

export const getListings = async (params = {}) => {
  const response = await ApiService.get(
    ServerUrl.API_GET_LISTINGS,
    params
  );

  return response.data;
};

export const getListingById = async (id) => {
  const response = await ApiService.get(
    ServerUrl.API_GET_LISTING_BY_ID(id)
  );

  return response.data;
};

export const updateListing = async (id, data) => {
  const response = await ApiService.patch(
    ServerUrl.API_UPDATE_LISTING(id),
    data
  );

  return response.data;
};

export const publishListing = async (id) => {
  const response = await ApiService.patch(
    ServerUrl.API_PUBLISH_LISTING(id)
  );

  return response.data;
};

export const cancelListing = async (id) => {
  const response = await ApiService.delete(
    ServerUrl.API_DELETE_LISTING(id)
  );

  return response.data;
};
