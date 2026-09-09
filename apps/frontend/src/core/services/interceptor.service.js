import axios from "axios";
import StorageService from "./storage.service";
import { APPLICATION_CONSTANTS } from "../constants/app.constant";

function resolveBaseURL() {
  const url = import.meta.env.VITE_API_URL;

  if (!url) {
    const message =
      "[API] VITE_API_URL is not configured.";

    if (import.meta.env.PROD) {
      throw new Error(message);
    }

    console.error(message);

    return "http://localhost:3000/api";
  }

  return url;
}

function decodeJwtPayload(token) {
  try {
    const base64 = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  // 60 second safety buffer
  return Date.now() / 1000 > payload.exp - 60;
}

function clearAuthAndRedirect() {
  StorageService.removeData(
    APPLICATION_CONSTANTS.STORAGE.TOKEN
  );

  StorageService.removeData(
    APPLICATION_CONSTANTS.STORAGE.USER_DETAILS
  );

  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

class ApiInterceptor {
  static axiosReference = axios.create({
    baseURL: resolveBaseURL(),
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  static initialized = false;

  static init() {
    if (this.initialized) {
      return this.axiosReference;
    }

    // =======================================================
    // REQUEST INTERCEPTOR
    // =======================================================

    this.axiosReference.interceptors.request.use(
      (config) => {
        const token = StorageService.getData(
          APPLICATION_CONSTANTS.STORAGE.TOKEN
        );

        if (token) {
          if (isTokenExpired(token)) {
            clearAuthAndRedirect();

            return Promise.reject(
              new Error(
                "Session expired. Please login again."
              )
            );
          }

          config.headers.Authorization =
            `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // =======================================================
    // RESPONSE INTERCEPTOR
    // =======================================================

    this.axiosReference.interceptors.response.use(
      (response) => response,

      (error) => {
        if (error.response?.status === 401) {
          clearAuthAndRedirect();
        }

        if (!error.response) {
          console.error(
            "[API] Network error:",
            error.message
          );
        }

        return Promise.reject(error);
      }
    );

    this.initialized = true;

    return this.axiosReference;
  }
}

export default ApiInterceptor;