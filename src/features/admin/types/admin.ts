export interface AdminNavItem {
  label: string;
  to: string;
}

export interface ApiEnvelope<T> {
  statusCode?: number;
  code?: number;
  success?: boolean;
  message: string;
  data: T;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalDonors: number;
  totalHospitals: number;
  activeUsers: number;
  pendingReports: number;
  totalReports: number;
  totalDonations: number;
  totalBloodRequests: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentUsers: AdminUser[];
  recentReports: AdminReport[];
}

export interface AdminPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  hospitalName?: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  role: "admin" | "donor" | "user" | "hospital";
  bloodType?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  isDonorVerified?: boolean;
  communityFlags?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDonorInfo {
  _id: string;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  lastDonationUnits: number | null;
}

export interface AdminUserDetails extends AdminUser {
  donorInfo?: AdminDonorInfo;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: AdminPagination;
}

export interface AdminHospitalAuditLog {
  action: string;
  performedBy?: string;
  performedAt?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

export interface AdminHospital {
  _id: string;
  hospitalName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  website?: string | null;
  licenseNumber: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  totalBedCapacity: number;
  bloodBankCapacity: number;
  isVerified: boolean;
  isActive: boolean;
  isDeleted?: boolean;
  address: string;
  location?: {
    area?: string;
    district?: string;
    division?: string;
    coordinates?: {
      type?: "Point" | string;
      coordinates?: [number, number] | number[];
    };
  };
  passwordResetToken?: string | null;
  passwordResetExpires?: string | null;
  refreshTokenHash?: string | null;
  refreshTokenExpiresAt?: string | null;
  auditLogs?: AdminHospitalAuditLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminHospitalsResponse {
  hospitals: AdminHospital[];
  pagination: AdminPagination;
}

export interface AdminReportUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminReport {
  _id: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed" | string;
  description?: string;
  reportedBy?: AdminReportUser;
  reportedUser?: AdminReportUser;
  reviewedBy?: AdminReportUser | null;
  reviewNote?: string;
  createdAt?: string;
}

export interface AdminReportsResponse {
  reports: AdminReport[];
  pagination: AdminPagination;
}

export interface AdminMe {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Admin additional types ---
export interface AdminBloodRequest {
  _id: string;
  hospital: {
    _id: string;
    hospitalName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: "normal" | "high" | "critical";
  reason?: string;
  patientName?: string;
  status: string;
  respondents?: number;
  fulfilledUnits?: number;
  createdAt?: string;
  expiresAt?: string;
}

export interface AdminBloodRequestsResponse {
  requests: AdminBloodRequest[];
  pagination: AdminPagination;
}

export interface AdminDonation {
  _id: string;
  donor: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    bloodType?: string;
  };
  hospital: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  requestedBy?: {
    _id: string;
    name: string;
    email?: string;
    totalReceived?: number;
  };
  bloodType: string;
  unitsCollected: number;
  donationDate: string | null;
  status: string;
  notes?: string;
}

export interface AdminDonationsResponse {
  donations: AdminDonation[];
  pagination: AdminPagination;
}

export interface AdminDonationDetails {
  _id: string;
  donor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    bloodType: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    avatar?: string | null;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    totalReceived: number;
    isVerified: boolean;
    isActive: boolean;
  };
  patientInfo: {
    name: string;
    address: string;
    phone: string;
    age: number | null;
    gender: string;
    reasonForBlood: string;
    medicalCondition: string;
    doctorName: string;
    doctorPhone: string;
  };
  hospital: {
    _id: string;
    user: string | null;
    profile: {
      _id: string;
      hospitalName: string;
      registrationNumber: string;
      email: string;
      phone: string;
      website: string;
      licenseNumber: string;
      adminName: string;
      adminEmail: string;
      adminPhone: string;
      totalBedCapacity: number;
      bloodBankCapacity: number;
      isVerified: boolean;
      isActive: boolean;
      address: string;
      location: {
        coordinates: {
          type: string;
          coordinates: [number, number];
        };
        area: string;
        district: string;
        division: string;
      };
    };
  };
  bloodType: string;
  unitsCollected: number;
  donationDate: string;
  status: string;
  notes: string;
  approvedBy: string | null;
  donorStats: {
    totalDonations: number;
  };
  hospitalStats: {
    totalReceived: number;
    totalDonationsReceived: number;
    totalUnitsReceived: number;
  };
}

export interface AdminVerification {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
    bloodType?: string;
    phone?: string;
  };
  documentType: string;
  documentUrl: string;
  status: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface AdminVerificationsResponse {
  verifications: AdminVerification[];
  pagination: AdminPagination;
}

export interface AdminSettings {
  systemSettings: {
    appName: string;
    version: string;
    maintenanceMode: boolean;
    donationEligibilityDays: number;
    autoEmailNotifications: boolean;
    emailNotificationDelay: number;
  };
  bloodBankSettings?: {
    minDonorsPerBank?: number;
    maxRequestsPerDay?: number;
    requestExpirationDays?: number;
  };
  userSettings?: {
    maxReportsPerDay?: number;
    minCommunityFlagsToBlock?: number;
    autoVerifyDonors?: boolean;
  };
}

