import Api from "../../../utilities/api";
import type { IReduxHospital } from "../../../redux/slices/hospitalSlice";

export interface HospitalLoginPayload {
  email: string;
  password: string;
}

export interface HospitalForgotPasswordPayload {
  email: string;
}

export interface HospitalResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface HospitalRegisterPayload {
  hospitalName: string;
  registrationNumber: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;
  address: string;
  location: {
    area: string;
    district: string;
    division: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  website?: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  totalBedCapacity: number;
  bloodBankCapacity: number;
}

export interface HospitalChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface HospitalLoginResponse {
  hospital: IReduxHospital;
  accessToken: string;
}

interface MessageOnlyResponse {
  message: string;
}

interface ApiEnvelope<T> {
  code?: number;
  statusCode?: number;
  message: string;
  data: T;
}

export const hospitalLoginApi = async (
  payload: HospitalLoginPayload
): Promise<HospitalLoginResponse> => {
  const res = await Api.post<ApiEnvelope<HospitalLoginResponse>>(
    "/hospital/auth/login",
    payload
  );
  return res.data.data;
};

export const hospitalForgotPasswordApi = async (
  payload: HospitalForgotPasswordPayload
): Promise<MessageOnlyResponse> => {
  const res = await Api.post<ApiEnvelope<Record<string, never>>>(
    "/hospital/auth/forgot-password",
    payload
  );
  return { message: res.data.message };
};

export const hospitalResetPasswordApi = async (
  payload: HospitalResetPasswordPayload
): Promise<MessageOnlyResponse> => {
  const res = await Api.post<ApiEnvelope<Record<string, never>>>(
    "/hospital/auth/reset-password",
    payload
  );
  return { message: res.data.message };
};

export const hospitalRegisterApi = async (
  payload: HospitalRegisterPayload
) => {
  const res = await Api.post<ApiEnvelope<{ hospital: IReduxHospital }>>(
    "/hospital/auth/register",
    payload
  );
  return res.data.data;
};

export const hospitalChangePasswordApi = async (
  payload: HospitalChangePasswordPayload
): Promise<MessageOnlyResponse> => {
  const res = await Api.post<ApiEnvelope<Record<string, never>>>(
    "/hospital/auth/change-password",
    payload
  );
  return { message: res.data.message };
};

export const hospitalLogoutApi = async (): Promise<MessageOnlyResponse> => {
  const res = await Api.post<ApiEnvelope<Record<string, never>>>("/auth/logout");
  return { message: res.data.message || "Logged out successfully" };
};
