import ApiService from "./api.service";
import ServerUrl from "../constants/serverUrl.constant";

export const createQuotation = async (data) => {
  const response = await ApiService.post(
    ServerUrl.API_CREATE_QUOTATION,
    data
  );

  return response.data;
};

export const getQuotations = async (params = {}) => {
  const response = await ApiService.get(
    ServerUrl.API_GET_QUOTATIONS,
    params
  );

  return response.data;
};

export const getQuotationById = async (id) => {
  const response = await ApiService.get(
    ServerUrl.API_GET_QUOTATION_BY_ID(id)
  );

  return response.data;
};

export const acceptQuotation = async (id) => {
  const response = await ApiService.patch(
    ServerUrl.API_ACCEPT_QUOTATION(id)
  );

  return response.data;
};

export const rejectQuotation = async (id) => {
  const response = await ApiService.patch(
    ServerUrl.API_REJECT_QUOTATION(id)
  );

  return response.data;
};

export const withdrawQuotation = async (id) => {
  const response = await ApiService.patch(
    ServerUrl.API_WITHDRAW_QUOTATION(id)
  );

  return response.data;
};
