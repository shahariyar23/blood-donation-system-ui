import Api from "../../../utilities/api";

interface ApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface CreateBloodRequestDto {
  patientName: string;
  bloodType: string;
  units: number;
  hospital: string;
  location: string;
  latitude?: string;
  longitude?: string;
  phone: string;
  urgency: string;
  neededBy: string; // ISO date
  notes?: string;
}

export interface UserBloodRequest {
  _id: string;
  patientInfo?: { name?: string };
  bloodType: string;
  units: number;
  hospital?: string;
  location?: { displayName?: string; city?: string } | string;
  createdAt: string;
  status: string;
  requestedBy?: { name?: string };
  notes?: string;
}

export interface GetUserRequestsResponse {
  requests: UserBloodRequest[];
  total?: number;
  page?: number;
  limit?: number;
}

export const createBloodRequest = async (payload: CreateBloodRequestDto) => {
  const res = await Api.post<ApiEnvelope<{ request: UserBloodRequest }>>(
    "/blood-requests",
    payload
  );
  return res.data.data;
};

export const getUserBloodRequests = async (params?: { page?: number; limit?: number; status?: string }) => {
  const res = await Api.get<ApiEnvelope<GetUserRequestsResponse>>(
    "/blood-requests",
    { params }
  );
  return res.data.data;
};

export const cancelBloodRequest = async (id: string) => {
  const res = await Api.patch<ApiEnvelope<{ success: boolean }>>(
    `/blood-requests/${id}/cancel`
  );
  return res.data.data;
};

export default {
  createBloodRequest,
  getUserBloodRequests,
  cancelBloodRequest,
};
