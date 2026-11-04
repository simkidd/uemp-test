import axios from "axios";
import Cookies from "js-cookie";
import { COOKIE_KEYS } from "@/constants/cookies.constants";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token from cookie
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = Cookies.get(COOKIE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth & automatic refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath.includes("/auth/") ||
        currentPath.includes("/login") ||
        currentPath.includes("/register") ||
        currentPath.includes("/verify/");

      if (
        isAuthPage ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login")
      ) {
        return Promise.reject(error);
      }

      const refreshToken = Cookies.get(COOKIE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        Cookies.remove(COOKIE_KEYS.AUTH_TOKEN);
        Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN);
        Cookies.remove(COOKIE_KEYS.USER);
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: updatedUser,
        } = response.data.data;

        Cookies.set(COOKIE_KEYS.AUTH_TOKEN, newAccessToken, { expires: 7, sameSite: "lax" });
        if (newRefreshToken) {
          Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, newRefreshToken, { expires: 30, sameSite: "lax" });
        }
        if (updatedUser) {
          Cookies.set(COOKIE_KEYS.USER, JSON.stringify(updatedUser), { expires: 7, sameSite: "lax" });
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        Cookies.remove(COOKIE_KEYS.AUTH_TOKEN);
        Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN);
        Cookies.remove(COOKIE_KEYS.USER);
        window.location.href = "/auth/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export * from "./api/index";
export default api;
