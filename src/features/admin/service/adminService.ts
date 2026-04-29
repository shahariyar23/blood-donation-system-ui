import Api from "../../../utilities/api";
import type { IReduxUser } from "../../../redux/slices/userSlice";
import type {
  AdminDashboardData,
  AdminMe,
  AdminReportsResponse,
  AdminUsersResponse,
  ApiEnvelope,
  AdminBloodRequestsResponse,
  AdminDonationsResponse,
  AdminVerificationsResponse,
  AdminSettings,
} from "../types/admin";

export interface AdminLoginPayload {
  identifier: string;
  password: string;
  location: {
    city: string;
    country: string;
    country_code: string;
    county: string;
    postcode: string;
    state: string;
    state_district: string;
    coordinates: {
      lat: number | null;
      lng: number | null;
    };
  };
}

interface AdminLoginData {
  user: IReduxUser;
  accessToken: string;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface AdminReportsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export interface UpdateCommunityFlagsPayload {
  action: "set" | "increment" | "decrement";
  value: number;
}

export interface ReviewReportPayload {
  status: "reviewed" | "dismissed";
  reviewNote?: string;
  banUser?: boolean;
}

export const adminLoginApi = async (payload: AdminLoginPayload) => {
  const res = await Api.post<ApiEnvelope<AdminLoginData>>(
    "/admin/auth/login",
    payload
  );
  return res.data;
};

export const getAdminMeApi = async () => {
  const res = await Api.get<ApiEnvelope<AdminMe>>("/admin/me");
  return res.data.data;
};

export const getAdminDashboardApi = async () => {
  const res = await Api.get<ApiEnvelope<AdminDashboardData>>("/admin/dashboard");
  return res.data.data;
};

export const getAdminUsersApi = async (query: AdminUsersQuery) => {
  const res = await Api.get<ApiEnvelope<AdminUsersResponse>>("/admin/users", {
    params: query,
  });
  return res.data.data;
};

export const getAdminReportsApi = async (query: AdminReportsQuery) => {
  const res = await Api.get<ApiEnvelope<AdminReportsResponse>>(
    "/admin/reports",
    { params: query }
  );
  return res.data.data;
};

export const updateAdminUserStatusApi = async (id: string, isActive: boolean) => {
  const res = await Api.patch<ApiEnvelope<{ _id: string; isActive: boolean }>>(
    `/admin/users/${id}/status`,
    { isActive }
  );
  return res.data;
};

export const verifyAdminDonorApi = async (id: string) => {
  const res = await Api.patch<ApiEnvelope<{ id: string; isDonorVerified: boolean }>>(
    `/admin/users/${id}/verify-donor`,
    {}
  );
  return res.data;
};

export const verifyAdminUserApi = async (id: string) => {
  const res = await Api.patch<ApiEnvelope<{ id: string; isVerified: boolean }>>(
    `/admin/users/${id}/verify-user`,
    {}
  );
  return res.data;
};

export const updateAdminCommunityFlagsApi = async (
  id: string,
  payload: UpdateCommunityFlagsPayload
) => {
  const res = await Api.patch<ApiEnvelope<{ id: string; communityFlags: number }>>(
    `/admin/users/${id}/community-flags`,
    payload
  );
  return res.data;
};

export const reviewAdminReportApi = async (id: string, payload: ReviewReportPayload) => {
  const res = await Api.patch<ApiEnvelope<{ _id: string; status: string }>>(
    `/admin/reports/${id}/review`,
    payload
  );
  return res.data;
};

export interface AdminBloodRequestsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export const getAdminBloodRequestsApi = async (query: AdminBloodRequestsQuery) => {
  const res = await Api.get<ApiEnvelope<AdminBloodRequestsResponse>>(
    "/admin/blood-requests",
    { params: query }
  );
  return res.data.data;
};

export interface AdminDonationsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export const getAdminDonationsApi = async (query: AdminDonationsQuery) => {
  const res = await Api.get<ApiEnvelope<AdminDonationsResponse>>("/admin/donations", {
    params: query,
  });
  return res.data.data;
};

export const getAdminDonationDetailsApi = async (id: string) => {
  const res = await Api.get<ApiEnvelope<any>>(`/admin/donations/${id}`);
  return res.data.data;
};

export interface AdminVerificationsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export const getAdminVerificationsApi = async (query: AdminVerificationsQuery) => {
  const res = await Api.get<ApiEnvelope<AdminVerificationsResponse>>("/admin/verifications", {
    params: query,
  });
  return res.data.data;
};

export const verifyAdminVerificationApi = async (id: string, payload: { status: string; notes?: string; approvedBy?: string }) => {
  const res = await Api.patch<ApiEnvelope<{ _id: string; status: string }>>(
    `/admin/verifications/${id}/verify`,
    payload
  );
  return res.data;
};

export const getAdminSettingsApi = async () => {
  const res = await Api.get<ApiEnvelope<AdminSettings>>("/admin/settings");
  return res.data.data;
};

export const updateAdminSettingsApi = async (payload: Partial<AdminSettings>) => {
  const res = await Api.patch<ApiEnvelope<AdminSettings>>("/admin/settings", payload);
  return res.data.data;
};