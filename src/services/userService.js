import { apiRequest } from "./api";

export const getAllUsers = async () => {
  return apiRequest("/users/");
};

export const deleteUser = async (email) => {
  return apiRequest(`/users/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
};

export const getAdminDashboard = async () => {
  return apiRequest("/admin/dashboard");
};
