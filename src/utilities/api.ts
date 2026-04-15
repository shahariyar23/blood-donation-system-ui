import axios from "axios";
import Path from "./paths";
import { store } from "../redux/store";
import { setToken, clearUser } from "../redux/slices/userSlice";

const Api = axios.create({
  baseURL: Path.api,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ────────────────────────────────────
// Auto-attach access token from Redux to every request
Api.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token;
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
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    // skip refresh endpoint itself
    if (
      !originalRequest ||
      requestUrl.includes("/auth/refresh-token") ||
      shouldBypassAuthRecovery
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
         const res = await Api.post("/auth/refresh-token"); 
        const newToken = res.data.data.accessToken; // <--- NEW LINE
 
        store.dispatch(setToken(newToken)); 
 
        originalRequest.headers.Authorization = `Bearer ${newToken}`; 
        return Api(originalRequest); 
      } catch {
        store.dispatch(clearUser());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default Api;
