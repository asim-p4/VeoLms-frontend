import { api } from "../lib/axios";

export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/signup", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),

  refresh: () => api.post("/auth/refresh"),
};
