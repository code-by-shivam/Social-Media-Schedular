import { apiRequest } from "./api";

export const getPreferences = async () => {
  return apiRequest("/users/me/preferences");
};

export const updatePreferences = async (preferences) => {
  return apiRequest("/users/me/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
};

export const changePassword = async (passwordData) => {
  return apiRequest("/users/me/password", {
    method: "PUT",
    body: JSON.stringify(passwordData),
  });
};

export const getPermissions = async () => {
  return apiRequest("/users/me/permissions");
};

export const deleteAccount = async () => {
  return apiRequest("/users/me", {
    method: "DELETE",
  });
};
