import axios from "axios";
import Path from "./paths";
import { store } from "../redux/store";
import { setToken, clearUser } from "../redux/slices/userSlice";
import {
  clearHospital,
  setAuthHospital,
  setHospitalToken,
} from "../redux/slices/hospitalSlice";

const Api = axios.create({
  baseURL: Path.api,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

const RefreshApi = axios.create({
  baseURL: Path.api,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

// ── Request Interceptor ────────────────────────────────────
// Auto-attach access token from Redux to every request
Api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const requestUrl = String(config.url ?? "");
    const isHospitalApi =
      requestUrl.startsWith("/hospital") ||
      requestUrl.startsWith("/donor") ||
      requestUrl.startsWith("/blood");

    const token = isHospitalApi
      ? state.hospital.token || state.user.token
      : state.user.token || state.hospital.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────
// If 401 → try refresh token → retry original request
Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";
    const shouldBypassAuthRecovery =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/admin/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password") ||
      requestUrl.includes("/hospital/auth/login") ||
      requestUrl.includes("/hospital/auth/register") ||
      requestUrl.includes("/hospital/auth/forgot-password") ||
      requestUrl.includes("/hospital/auth/reset-password");

    const isHospitalApi =
      requestUrl.startsWith("/hospital") ||
      requestUrl.startsWith("/donor") ||
      requestUrl.startsWith("/blood");

    // skip refresh endpoint itself
    if (
      !originalRequest ||
      requestUrl.includes("/auth/refresh-token") ||
      requestUrl.includes("/hospital/auth/refresh-token") ||
      shouldBypassAuthRecovery
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          const refreshPath = isHospitalApi
            ? "/hospital/auth/refresh-token"
            : "/auth/refresh-token";

          refreshPromise = RefreshApi.post(refreshPath).then((res) => {
            if (isHospitalApi && res?.data?.data?.hospital) {
              store.dispatch(setAuthHospital(res.data.data.hospital));
            }
            const newToken = res?.data?.data?.accessToken;
            if (!newToken) {
              throw new Error("Missing access token from refresh response");
            }
            return newToken;
          });
        }

        const newToken = await refreshPromise;
        refreshPromise = null;

        if (isHospitalApi) {
          store.dispatch(setHospitalToken(newToken));
        } else {
          store.dispatch(setToken(newToken));
        }

        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        };

        return Api(originalRequest);
      } catch {
        refreshPromise = null;
        if (isHospitalApi) {
          store.dispatch(clearHospital());
        } else {
          store.dispatch(clearUser());
        }
      }
    }

    return Promise.reject(error);
  }
);

export default Api;
