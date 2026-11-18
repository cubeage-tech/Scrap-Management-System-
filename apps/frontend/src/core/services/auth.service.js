import ApiService from "./api.service";

export const login = (credentials) =>
  ApiService.login(credentials).then((res) => res.data.data);

export const signup = (formData) => {
  const { confirmPassword: _cp, ...payload } = formData;

  return ApiService.signup(payload);
};

export const logout = () => {
  return ApiService.logout();
};