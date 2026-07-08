import { api } from "../lib/axios";

export const coursesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    sort?: string;
    search?: string;
  }) => api.get("/courses", { params }),

  getFeatured: () =>
    api.get("/courses/featured"),

  getBySlug: (slug: string) =>
    api.get(`/courses/${slug}`),

  search: (query: string) =>
    api.get("/courses/search", { params: { q: query } }),
};