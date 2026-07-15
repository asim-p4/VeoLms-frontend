/**
 * @fileoverview Axios HTTP Client Configuration
 * Pre-configured axios instance with:
 * - Automatic access token injection via request interceptor
 * - Silent 401 → token refresh → request retry via response interceptor
 * - Concurrent refresh queue: if multiple requests 401 simultaneously,
 *   only ONE refresh call is made; all others wait and retry with the new token.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

/** Base API URL — defaults to localhost in development */
let SERVER_API_URL = import.meta.env.SERVER_API_URI || "http://localhost:5000/api";

// Automatically append /api if the user provided the base domain without it in production
if (SERVER_API_URL && !SERVER_API_URL.endsWith('/api')) {
  SERVER_API_URL = `${SERVER_API_URL.replace(/\/$/, '')}/api`;
}

/**
 * Main axios instance used throughout the app.
 * withCredentials: true is required so the browser sends
 * the HttpOnly refreshToken cookie on cross-origin requests.
 */
export const api = axios.create({
  baseURL: SERVER_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 60s to allow Render free tier to wake up from sleep
});

// --- Concurrent Refresh Queue ---
// If multiple API requests 401 at the same time (e.g. on page load), we only
// want ONE refresh request to go out. All others queue up and resolve/reject
// together once the single refresh completes.

/** Whether a refresh call is currently in flight */
let isRefreshing = false;

/** Queue of { resolve, reject } callbacks waiting for the refresh to complete */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

/**
 * Drain the failed-request queue once a refresh attempt finishes.
 * @param error - Pass an error to reject all queued requests (refresh failed)
 * @param token - Pass the new token to resolve all queued requests (refresh succeeded)
 */
function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

/**
 * Request interceptor: attach the in-memory access token as a Bearer header.
 * The token lives in Zustand (not localStorage) so it's cleared on tab close.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor: silently refresh tokens on 401 Unauthorized.
 *
 * FLOW FOR SINGLE 401:
 * 1. API call fails with 401 (access token expired)
 * 2. Interceptor calls /auth/refresh using the HttpOnly cookie
 * 3. New access token is stored in Zustand
 * 4. Original failed request is retried automatically
 *
 * FLOW FOR CONCURRENT 401s (e.g. checkAuth + another request):
 * 1. First 401 → sets isRefreshing = true, calls /auth/refresh
 * 2. Second 401 → isRefreshing is already true, adds itself to failedQueue
 * 3. When refresh completes → processQueue() retries all queued requests
 *
 * GUARD: The refresh endpoint itself is never intercepted to prevent recursion.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh");
    const isUnauthorized = error.response?.status === 401;

    // Pass through errors for the refresh endpoint or already-retried requests
    if (!isUnauthorized || originalRequest._retry || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request to retry later
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark this request as retried and start the refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use raw axios (not the `api` instance) to bypass this interceptor
      const { data } = await axios.post(
        `${SERVER_API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newAccessToken = data.data.accessToken;

      // Store new token in memory and drain the queue
      useAuthStore.getState().setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      // Retry the original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh token is invalid/expired — reject all queued requests and clear state
      processQueue(refreshError, null);
      // Clear auth state without making another API call (logout API would also fail)
      useAuthStore.setState({ user: null, accessToken: null });
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
