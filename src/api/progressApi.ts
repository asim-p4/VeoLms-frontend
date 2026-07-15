import { api } from "../lib/axios";

export const progressApi = {
  getOverall: () =>
    api.get("/me/progress"),

  getByCourse: (courseId: string) =>
    api.get(`/progress/${courseId}`),

  save: (data: {
    courseId: string;
    lessonId: string;
    watchedSeconds: number;
    completed?: boolean;
  }) => api.post("/progress", data),

  getRecent: () =>
    api.get("/me/recently-watched"),
};