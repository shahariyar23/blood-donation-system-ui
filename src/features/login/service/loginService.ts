import api from "../../../utilities/api";
import { type IReduxUser } from "../../../redux/slices/userSlice";

// ── Types ──────────────────────────────────────────────────
export interface LoginPayload {
  identifier: string;
  password: string;
  location: object;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  data:{user: IReduxUser;
  accessToken: string;
  message: string;}
}

// ── API Calls ──────────────────────────────────────────────

// POST /api/auth/register
export const registerApi = async (data: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post("/auth/register", data);
  console.log(res.data)
  return res.data;
};

// POST /api/auth/login
export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// GET /api/auth/me
export const getAuthUserApi = async (): Promise<IReduxUser> => {
  const res = await api.get("/auth/me");
  return res.data.data;
};

// POST /api/auth/logout
export const logoutApi = async (): Promise<void> => {
  await api.post("/auth/logout");
};

// POST /api/auth/forgot-password
export const forgotPasswordApi = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

// POST /api/auth/reset-password
export const resetPasswordApi = async (token: string, password: string) => {
  const res = await api.post("/auth/reset-password", { token, password });
  return res.data;
};