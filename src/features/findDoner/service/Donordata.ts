// ── Types ─────────────────────────────────────────────
export interface Donor {
  id: string;
  name: string;
  bloodType: string;
  location: string;
  distance: number;
  lastDonation: string;
  totalDonations: number;
  isAvailable: boolean;
  isDonorVerified: boolean;
  avatar?: string;
  primarySocialLink?: string,
}

export interface ApiDonor {
  _id: string;
  name: string;
  avatar?: string;
  bloodType: string;
  location?: {
    displayName?: string;
    city: string;
    coordinates?: { lat?: number | null; lng?: number | null };
  };
  createdAt?: string;
  isAvailable?: boolean;
  totalDonations?: number;
  lastDonationDate?: string | null;
  isDonorVerified?: boolean;
  distanceKm?: number;
  primarySocialLink?: string;
}

export interface DonorSearchResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    donors: ApiDonor[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export type SortBy = "distance" | "donations";

export interface FilterState {
  bloodType: string;
  location: string;
  distance: number;
  sortBy: SortBy;
  availableOnly: boolean;
  verifiedOnly: boolean;
}

// ── Constants ──────────────────────────────────────────
export const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const DISTANCE_OPTIONS = [5, 10, 20, 30];

export const SORT_OPTIONS = [
  { label: "Nearest First",  value: "distance"  },
  { label: "Most Donations", value: "donations" },
];

export const DEFAULT_FILTERS: FilterState = {
  bloodType:     "All",
  location:      "",
  distance:      10,
  sortBy:        "distance",
  availableOnly: false,
  verifiedOnly:  false,
};

const formatDonationDate = (value?: string | null): string => {
  if (!value) return "No donation yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No donation yet";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const mapApiDonorToDonor = (donor: ApiDonor): Donor => ({
  id: donor._id,
  name: donor.name,
  bloodType: donor.bloodType,
  location: donor.location?.city
    ?? donor.location?.displayName
    ?? "Unknown location",
  distance: typeof donor.distanceKm === "number"
    ? Number(donor.distanceKm.toFixed(1))
    : 0,
  lastDonation: formatDonationDate(donor.lastDonationDate),
  totalDonations: donor.totalDonations ?? 0,
  isAvailable: Boolean(donor.isAvailable),
  isDonorVerified: Boolean(donor.isDonorVerified),
  avatar: donor.avatar,
  primarySocialLink: donor?.primarySocialLink,
});