export type DonationStatus = "pending" | "approved" | "rejected";

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
  patientInfo?: string | null;
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
  patientInfo?: string | null;
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
  _id: string;
  name: string;
  email: string;
  phone: string;
  bloodType?: string;
  role?: string;
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
  bloodType: string;
  city: string;
}

export interface HospitalDonorListResponse {
  users: HospitalDonorApi[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

export const mapHospitalDonor = (donor: HospitalDonorApi): HospitalDonor => ({
  id: donor._id,
  name: donor.name,
  email: donor.email,
  phone: donor.phone,
  bloodType: donor.bloodType ?? "-",
  city: donor.location?.city ?? donor.location?.displayName ?? "Unknown",
});

export const statusStyles: Record<DonationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
};
