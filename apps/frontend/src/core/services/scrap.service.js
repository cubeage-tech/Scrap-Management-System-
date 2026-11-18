import ApiService from "./api.service";
import ServerUrl from "../constants/serverUrl.constant";

export const createScrap = async (data) => {
  const response = await ApiService.post(
    ServerUrl.API_CREATE_SCRAP,
    data
  );

  return response.data;
};

export const getScraps = async (params = {}) => {
  const response = await ApiService.get(
    ServerUrl.API_GET_SCRAPS,
    params
  );

  return response.data;
};

export const getScrapById = async (id) => {
  const response = await ApiService.get(
    ServerUrl.API_GET_SCRAP_BY_ID(id)
  );

  return response.data;
};

export const updateScrap = async (id, data) => {
  const response = await ApiService.put(
    ServerUrl.API_UPDATE_SCRAP(id),
    data
  );

  return response.data;
};

export const deleteScrap = async (id) => {
  const response = await ApiService.delete(
    ServerUrl.API_DELETE_SCRAP(id)
  );

  return response.data;
};