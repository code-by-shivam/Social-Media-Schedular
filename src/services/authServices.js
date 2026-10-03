import { apiRequest, removeToken, setToken, toApiRole } from "./api";

export const login = async (email, password) => {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(data.access_token);
  return data;
};

export const register = async (name, email, password, role = "Content Creator") => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role: toApiRole(role),
    }),
  });
};

export const logout = async () => {
  removeToken();
};
