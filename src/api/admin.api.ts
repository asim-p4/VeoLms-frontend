import { api } from "../lib/axios";

export const adminApi = {
  getStats: () =>
    api.get("/admin/stats"),

  getStudents: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/students", { params }),

  getEnrollments: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/enrollments", { params }),

  // Courses
  createCourse: (data: any) =>
    api.post("/admin/courses", data),

  updateCourse: (id: string, data: any) =>
    api.patch(`/admin/courses/${id}`, data),

  deleteCourse: (id: string) =>
    api.delete(`/admin/courses/${id}`),

  // Sections
  createSection: (data: { courseId: string; title: string; order: number }) =>
    api.post("/admin/sections", data),

  updateSection: (id: string, data: any) =>
    api.patch(`/admin/sections/${id}`, data),

  deleteSection: (id: string) =>
    api.delete(`/admin/sections/${id}`),

  // Lessons
  createLesson: (data: any) =>
    api.post("/admin/lessons", data),

  updateLesson: (id: string, data: any) =>
    api.patch(`/admin/lessons/${id}`, data),

  deleteLesson: (id: string) =>
    api.delete(`/admin/lessons/${id}`),
};