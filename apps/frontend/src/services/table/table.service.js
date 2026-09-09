// Generic, domain-agnostic REST helpers for server-side tables.
// Each dashboard/module binds its own endpoint and re-exports named
// functions (see src/configs/tables/*.config.js) — this file must never
// know about scrap lots, industries, buyers, etc.

import { apiGet, apiPost, apiPut, apiDelete } from "../../core/services/api.service";

// params: { page, pageSize, search, sorting, filters }
// expected response shape: { data: [], total, page, pageSize }
export const getTableData = (endpoint, params) => apiGet(endpoint, { params });

export const createTableData = (endpoint, payload) => apiPost(endpoint, payload);

export const updateTableData = (endpoint, id, payload) => apiPut(`${endpoint}/${id}`, payload);

export const deleteTableData = (endpoint, id) => apiDelete(`${endpoint}/${id}`);
