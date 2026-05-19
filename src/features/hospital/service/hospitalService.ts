import Api from "../../../utilities/api";
import type {
  DonationStatus,
  HospitalDonationApi,
  HospitalDonationListResponse,
  HospitalDonationRequestSearchData,
  HospitalIdentifierSuggestionsResponse,
} from "./hospitalData";

interface HospitalDonationListParams {
  status?: DonationStatus;
  page?: number;
  limit?: number;
  search?: string;
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
  const res = await Api.patch<
    ApiEnvelope<{
      donor?: {
        status?: DonationStatus;
        approvalDate?: string | null;
      };
    }>
  >(
    `/hospital/donations/${id}/approve`,
    {
      remarks: "Approved from hospital dashboard",
    }
  );

  return {
    _id: id,
    donorId: id,
    hospitalId: "",
    status: res.data.data?.donor?.status ?? "approved",
    approvedAt: res.data.data?.donor?.approvalDate ?? new Date().toISOString(),
    bloodType: "",
    units: 0,
  } as HospitalDonationApi;
};

export const rejectHospitalDonation = async (id: string, reportNote: string) => {
  const res = await Api.patch<
    ApiEnvelope<{
      donor?: {
        status?: DonationStatus;
      };
    }>
  >(
    `/hospital/donations/${id}/reject`,
    {
      reason: reportNote || "Rejected by hospital",
      remarks: reportNote || undefined,
    }
  );

  return {
    _id: id,
    donorId: id,
    hospitalId: "",
    status: res.data.data?.donor?.status ?? "rejected",
    reportNote: reportNote || "Rejected by hospital",
    bloodType: "",
    units: 0,
  } as HospitalDonationApi;
};

export interface HospitalCreateDonationPayload {
  donorId: string;
  requesterId: string;
  bloodType: string;
  units: number;
  patientInfo?: {
    name: string;
    address: string;
    phone: string;
    reasonForBlood: string;
  };
  notes?: string;
}

export const createHospitalDonation = async (
  payload: HospitalCreateDonationPayload
) => {
  const res = await Api.post("/hospital/donations", {
    donorId: payload.donorId,
    requesterId: payload.requesterId,
    bloodType: payload.bloodType,
    units: payload.units,
    patientInfo: payload.patientInfo,
    notes: payload.notes,
  });
  return res.data?.data;
};

export const fetchHospitalDonorByIdentifier = async (
  identifier: string
): Promise<HospitalDonationRequestSearchData> => {
  const res = await Api.post<ApiEnvelope<HospitalDonationRequestSearchData>>(
    "/hospital/donations/search-request",
    {
      identifier,
    }
  );
  return res.data.data;
};

export const fetchHospitalIdentifierSuggestions = async (query: string) => {
  const res = await Api.get<ApiEnvelope<HospitalIdentifierSuggestionsResponse>>(
    "/hospital/donations/search-suggestions",
    {
      params: { q: query },
    }
  );
  return res.data.data.suggestions ?? [];
};
