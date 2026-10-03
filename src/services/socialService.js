import { apiRequest } from "./api";

export const getAccounts = async () => {
  return apiRequest("/social-accounts/");
};

export const getSocialAccounts = async () => {
  return apiRequest("/social-accounts/");
};

export const connectAccount = async (platform, username) => {
  return apiRequest("/social-accounts/connect", {
    method: "POST",
    body: JSON.stringify({ platform, username }),
  });
};

export const deleteAccount = async (id) => {
  return apiRequest(`/social-accounts/${id}`, {
    method: "DELETE",
  });
};
