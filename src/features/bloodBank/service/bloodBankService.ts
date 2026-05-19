import Api from "../../../utilities/api";
import type { ApiEnvelope } from "../../admin/types/admin";
import type { BloodBank } from "./bloodBankData";

export type BloodBankAvailability = "high" | "medium" | "low" | "unavailable";

export interface BloodBankSearchResult {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  email: string;
  website: string | null;
  rating: number;
  availability: Record<string, BloodBankAvailability>;
  latitude: number | null;
  longitude: number | null;
  raw?: {
    area?: string;
    distance_km?: number;
    is_open?: boolean;
    operating_hours?: string;
    total_units?: number;
    [key: string]: unknown;
  };
  source?: {
    name: string;
    label: string;
    priority: number;
  };
}

export interface BloodBankSearchResponse {
  isVisible: boolean;
  isMaintenance: boolean;
  message: string;
  sectionTitle: string;
  notice: string;
  allowedBloodGroups: string[];
  maxResults: number;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  results: BloodBankSearchResult[];
  sources?: Array<{
    name: string;
    label: string;
    priority: number;
    status: string;
  }>;
}

export interface BloodBankSearchQuery {
  bloodType?: string;
  district?: string;
  page?: number;
  limit?: number;
}

export const searchBloodBanksApi = async (query: BloodBankSearchQuery) => {
  const res = await Api.get<ApiEnvelope<BloodBankSearchResponse>>("/blood-banks/search", {
    params: query,
  });
  return res.data.data;
};

export const mapSearchResultToBloodBank = (result: BloodBankSearchResult): BloodBank => ({
  id: result.id,
  name: result.name,
  address: result.address,
  area: result.raw?.area ?? result.district,
  district: result.district,
  phone: result.phone,
  email: result.email,
  website: result.website,
  distance: Number(result.raw?.distance_km ?? 0),
  isOpen: Boolean(result.raw?.is_open ?? true),
  hours: String(result.raw?.operating_hours ?? "N/A"),
  rating: Number(result.rating ?? 0),
  totalUnits: Number(result.raw?.total_units ?? 0),
  availability: result.availability,
  source: result.source,
  latitude: result.latitude,
  longitude: result.longitude,
});
