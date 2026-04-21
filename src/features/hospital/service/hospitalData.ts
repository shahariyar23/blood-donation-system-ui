export type DonationStatus = "pending" | "approved" | "rejected";

export interface HospitalPatientInfo {
  name?: string;
  address?: string;
  phone?: string;
  age?: number | null;
  gender?: string;
  reasonForBlood?: string;
  medicalCondition?: string;
  doctorName?: string;
  doctorPhone?: string;
}

export interface HospitalDonationApi {
  _id: string;
  donorId: string;
  hospitalId: string;
  status: DonationStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  donatedAt?: string | null;
  bloodType: string;
  units: number;
  patientInfo?: HospitalPatientInfo | string | null;
  notes?: string | null;
  reportNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalDonation {
  id: string;
  donorId: string;
  hospitalId?: string;
  status: DonationStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  donatedAt?: string | null;
  bloodType: string;
  units: number;
  patientInfo?: HospitalPatientInfo | string | null;
  notes?: string | null;
  reportNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalDonationListResponse {
  donations: HospitalDonationApi[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HospitalDonorApi {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  gender?: string | null;
  bloodType?: string;
  isDonorVerified?: boolean;
  isAvailable?: boolean;
  totalDonations?: number;
  lastDonationDate?: string | null;
  nextAvailableAt?: string | null;
  primarySocialLink?: string | null;
  location?: {
    city?: string;
    displayName?: string;
  };
}

export interface HospitalDonor {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  bloodType: string;
  city: string;
  isDonorVerified: boolean;
  isAvailable: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  nextAvailableAt: string | null;
  primarySocialLink: string | null;
}

export interface HospitalDonorSearchResponse {
  donor: HospitalDonorApi | null;
}

export interface DonationRequestPatientInfo {
  name: string;
  address: string;
  phone: string;
  age: number | null;
  gender: string;
  reasonForBlood: string;
  medicalCondition?: string;
  doctorName?: string;
  doctorPhone?: string;
}

export interface DonationRequestRequestedBy {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface HospitalDonationRequestApi {
  _id: string;
  status: string;
  bloodType: string;
  units: number;
  patientInfo?: DonationRequestPatientInfo;
  requestedBy?: DonationRequestRequestedBy;
  notes?: string;
  createdAt?: string;
}

export interface HospitalDonationRequestSearchData {
  request: HospitalDonationRequestApi;
  matchedUser?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  donor: HospitalDonorApi;
  hospitalId: string;
}

export const mapDonation = (donation: HospitalDonationApi): HospitalDonation => ({
  id: donation._id,
  donorId: donation.donorId,
  hospitalId: donation.hospitalId,
  status: donation.status,
  approvedBy: donation.approvedBy ?? null,
  approvedAt: donation.approvedAt ?? null,
  donatedAt: donation.donatedAt ?? null,
  bloodType: donation.bloodType,
  units: donation.units,
  patientInfo: donation.patientInfo ?? null,
  notes: donation.notes ?? null,
  reportNote: donation.reportNote ?? null,
  createdAt: donation.createdAt,
  updatedAt: donation.updatedAt,
});

export const formatPatientInfo = (
  patientInfo?: HospitalPatientInfo | string | null
): string => {
  if (!patientInfo) return "Patient info pending";
  if (typeof patientInfo === "string") return patientInfo;

  const parts = [
    patientInfo.name && `Name: ${patientInfo.name}`,
    patientInfo.address && `Address: ${patientInfo.address}`,
    patientInfo.phone && `Phone: ${patientInfo.phone}`,
    patientInfo.reasonForBlood && `Reason: ${patientInfo.reasonForBlood}`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "Patient info pending";
};

export const mapHospitalDonor = (donor: HospitalDonorApi): HospitalDonor => ({
  id: donor.id,
  name: donor.name,
  email: donor.email,
  phone: donor.phone,
  gender: donor.gender ?? "N/A",
  bloodType: donor.bloodType ?? "-",
  city: donor.location?.city ?? donor.location?.displayName ?? "Unknown",
  isDonorVerified: Boolean(donor.isDonorVerified),
  isAvailable: Boolean(donor.isAvailable),
  totalDonations: donor.totalDonations ?? 0,
  lastDonationDate: donor.lastDonationDate ?? null,
  nextAvailableAt: donor.nextAvailableAt ?? null,
  primarySocialLink: donor.primarySocialLink ?? null,
});

export const statusStyles: Record<DonationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
};
