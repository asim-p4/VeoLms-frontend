// api/lessons.api.ts

import { api } from "../lib/axios";

export const lessonsApi = {
  watch: (lessonId: string) =>
    api.get(`/lessons/${lessonId}/watch`),
};