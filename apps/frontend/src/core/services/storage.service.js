import { STORAGE_KEYS } from '../constants/app.constant';

class StorageService {
  static getData(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return localStorage.getItem(key);
    }
  }

  static setData(key, value) {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static removeData(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}

// Convenience exports for backward compatibility
export const getToken = () => StorageService.getData(STORAGE_KEYS.AUTH_TOKEN);

export const setToken = (token) => StorageService.setData(STORAGE_KEYS.AUTH_TOKEN, token);

export const removeToken = () => StorageService.removeData(STORAGE_KEYS.AUTH_TOKEN);

export const getStoredUser = () => StorageService.getData(STORAGE_KEYS.AUTH_USER);

export const setStoredUser = (user) => StorageService.setData(STORAGE_KEYS.AUTH_USER, user);

export const removeStoredUser = () => StorageService.removeData(STORAGE_KEYS.AUTH_USER);

export const clearSession = () => {
  removeToken();
  removeStoredUser();
};

export default StorageService;
