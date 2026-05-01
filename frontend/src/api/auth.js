import api from "./axios";

export const login = (data) => api.post("/users/login", data);
export const verifyOtp = (data) => api.post("/users/verify2fa", data);
/** @deprecated use verifyOtp */
export const verifyTwoFactor = verifyOtp;
export const signup = (data) => api.post("/users/signup", data);
export const logout = () => api.get("/users/logout");
export const forgotPassword = (email) =>
  api.post("/users/forgotPassword", { email });
export const resetPassword = (token, data) =>
  api.patch(`/users/resetPassword/${token}`, data);
export const getMe = () => api.get("/users/me");
export const updateMe = (data) =>
  api.patch("/users/updateMe", data, {
    headers:
      data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
export const updatePassword = (data) =>
  api.patch("/users/updateMyPassword", data);
export const getAllUsers = () => api.get("/users");
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
