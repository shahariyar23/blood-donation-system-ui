import Api from "../../../utilities/api";

interface ApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// Blood Group Availability
export interface BloodGroupData {
  group: string;
  donors: number;
  available: boolean;
}

export interface BloodGroupAvailabilityResponse {
  location: string;
  bloodGroups: BloodGroupData[];
}

export const fetchBloodGroupAvailability = async (location?: string) => {
  const res = await Api.get<ApiEnvelope<BloodGroupAvailabilityResponse>>(
    "/blood-groups/availability",
    { params: { location } }
  );
  return res.data.data;
};

export const fetchHomeDonorGroups = async () => {
  const res = await Api.get<ApiEnvelope<BloodGroupData[]>>("/home/donors/groups");
  return res.data.data;
};

// Nearby Donors
export interface NearbyDonor {
  _id: string;
  name: string;
  bloodType: string;
  location: {
    city: string;
    displayName?: string;
  };
  distance?: string;
  lastDonationDate: string | null;
  isAvailable: boolean;
  totalDonations: number;
  email?: string;
  phone?: string;
}

export interface NearbyDonorsResponse {
  donors: NearbyDonor[];
  userLocation?: {
    lat: number;
    lng: number;
    city: string;
  };
}

export const fetchNearbyDonors = async (
  lat: number,
  lng: number,
  radius?: number,
  limit?: number
) => {
  const res = await Api.get<ApiEnvelope<NearbyDonorsResponse>>(
    "home/donors",
    { params: { lat, lng, radius, limit } }
  );
  return res.data.data;
};

export interface HomeDonor {
  _id: string;
  name: string;
  avatar: string | null;
  bloodType: string;
  location: {
    displayName?: string;
    road?: string;
    quarter?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    coordinates?: {
      lat?: number | null;
      lng?: number | null;
    };
  };
  createdAt: string;
  primarySocialLink: string | null;
  isAvailable: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  isDonorVerified: boolean;
  distanceKm: number | null;
}

export interface HomeDonorsResponse {
  donors: HomeDonor[];
}

export const fetchHomeDonors = async () => {
  const res = await Api.get<ApiEnvelope<HomeDonor[]>>("home/donors");
  return res.data.data;
};

// Latest Blood Requests
export interface BloodRequest {
  _id: string;
  requestedBy?: string | { name?: string };
  patientName?: string;
  bloodType: string;
  units: number;
  hospital?: string;
  location?: string | { city?: string; displayName?: string };
  latitude?: number | null;
  longitude?: number | null;
  locationDetails?: string | null;
  phone?: string;
  urgency?: string;
  neededBy?: string;
  expiresAt?: string;
  createdAt: string;
  status: string;
  respondedDonors?: string[];
  fulfilledBy?: string | null;
  isExpired?: boolean;
  notes?: string;
  agreeTerms?: boolean;
  updatedAt?: string;
  patientInfo?: {
    name?: string;
    address?: string;
    reasonForBlood?: string;
  };
}

export const fetchLatestBloodRequests = async (limit = 6, location?: string) => {
  const res = await Api.get<ApiEnvelope<BloodRequestsResponse>>(
    "/blood-requests/all",
    { params: { page: 1, limit, status: "active", location } }
  );
  return res.data.data.requests;
};

// Impact Stats
export interface ImpactStatsResponse {
  activeUsers: number;
  activeDonors: number;
  successfulDonations: number;
  collectedBloodRequests: number;
}

export const fetchImpactStats = async () => {
  const res = await Api.get<ApiEnvelope<ImpactStatsResponse>>(
    "/home/stats"
  );
  return res.data.data;
};

// Urgent Blood Request (for emergency banner)
export interface UrgentRequest {
  _id?: string;
  bloodType: string;
  requestedBy?: string | { name?: string };
  patientName?: string;
  hospital?: string;
  location?: string | { city?: string; displayName?: string };
  units: number;
  createdAt: string;
  status: string;
  patientInfo?: { name?: string };
}

export interface BloodRequestPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BloodRequestsResponse {
  requests: BloodRequest[];
  pagination: BloodRequestPagination;
}

export const fetchBloodRequest = async () => {
  const res = await Api.get<ApiEnvelope<BloodRequestsResponse>>(
    "/blood-requests"
  );
  return res.data.data;
};
