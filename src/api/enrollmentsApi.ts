import { api } from "../lib/axios";

export const enrollmentsApi = {
  enroll: (courseId: string) =>
    api.post("/enrollments", { courseId }),

  getMyCourses: () =>
    api.get("/me/courses"),
};