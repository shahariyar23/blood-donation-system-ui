import Api from "../../../utilities/api";

export interface DonationItem {
  status: "approved" | "pending" | "completed" | "rejected" | "cancelled" | "request";
  bloodType: string;
  units: number;
  date: string;
  // donation type fields
  patientName?: string;
  hospitalName?: string;
  reasonForBlood?: string;
  // request type fields
  requestedBy?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DonorHistoryResponse {
  _id: string;
  totalReceived: number;
  nextAvailableAt: Date;
  isAvailable: boolean;
  isDonorVerified: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  donationHistory: DonationItem[];
  pagination: Pagination;
}

export const fetchDonorHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<DonorHistoryResponse> => {
  const response = await Api.get(`/users/my-donation/${userId}`, {
    params: { page, limit },
  });
  return response.data.data;
};