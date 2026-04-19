import Api from "../../../utilities/api";
import type {
  DonationStatus,
  HospitalDonationApi,
  HospitalDonationListResponse,
  HospitalDonorListResponse,
} from "./hospitalData";

interface HospitalDonationListParams {
  status?: DonationStatus;
  page?: number;
  limit?: number;
}

interface HospitalDonorListParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface ApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export const fetchHospitalDonations = async (
  params: HospitalDonationListParams
): Promise<HospitalDonationListResponse> => {
  const res = await Api.get<ApiEnvelope<HospitalDonationListResponse>>(
    "/hospital/donations",
    { params }
  );
  return res.data.data;
};

export const approveHospitalDonation = async (id: string) => {
  const res = await Api.patch<ApiEnvelope<HospitalDonationApi>>(
    `/hospital/donations/${id}/approve`
  );
  return res.data.data;
};

export const rejectHospitalDonation = async (id: string, reportNote: string) => {
  const res = await Api.patch<ApiEnvelope<HospitalDonationApi>>(
    `/hospital/donations/${id}/reject`,
    { reportNote }
  );
  return res.data.data;
};

export interface HospitalCreateDonationPayload {
  donorId: string;
  bloodType: string;
  units: number;
  patientInfo?: string;
  notes?: string;
}

export const createHospitalDonation = async (
  payload: HospitalCreateDonationPayload
) => {
  const res = await Api.post<ApiEnvelope<HospitalDonationApi>>(
    "/hospital/donations",
    payload
  );
  return res.data.data;
};

export const fetchHospitalDonors = async (
  params: HospitalDonorListParams
): Promise<HospitalDonorListResponse> => {
  const res = await Api.get<ApiEnvelope<HospitalDonorListResponse>>("/users", {
    params: {
      role: "donor",
      ...params,
    },
  });
  return res.data.data;
};
