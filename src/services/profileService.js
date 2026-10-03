import { apiRequest } from "./api";

export const getProfile = async () => {
  return apiRequest("/users/me");
};

export const updateProfile = async (profileData) => {
  return apiRequest("/users/me", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};
