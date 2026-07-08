import { api } from "../lib/axios";

export const paymentsApi = {
  createIntent: (courseId: string) =>
    api.post("/payments/create-intent", { courseId }),
};