import { useNavigate } from "react-router-dom";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

interface BloodRequest {
  _id?: string;
  patientName?: string;
  bloodType?: string;
  patientInfo?: {
    name?: string;
    address?: string;
  };
  units?: number;
  createdAt?: string;
  status?: string;
  hospital?: string;
  requestedBy?: {
    name?: string;
    type?: string;
  } | string;
  location?: {
    city?: string;
    displayName?: string;
  } | string;
  urgency?: string;
}

interface LatestBloodRequestsProps {
  requests?: BloodRequest[];
  loading?: boolean;
  error?: string;
}

// Helper function to calculate relative time
const getRelativeTime = (dateString?: string): string => {
  if (!dateString) return "Unknown time";
  
  const now = new Date();
  const createdDate = new Date(dateString);
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// Helper function to check if request is urgent (created within 60 minutes)
const isUrgent = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  
  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  return diffMins <= 60;
};

const normalizeRequest = (req: BloodRequest) => {
  const requestedByName = typeof req.requestedBy === "string" ? undefined : req.requestedBy?.name;
  const locationText = typeof req.location === "string"
    ? req.location
    : req.location?.displayName || req.location?.city;
  const patientName = req.patientInfo?.name || req.patientName || requestedByName || "Unknown";
  const bloodType = req.bloodType || "Unknown";
  const hospital = req.hospital || requestedByName || "Blood request";
  const location = locationText || req.patientInfo?.address || "Location unavailable";
  const units = req.units || 1;
  const postedAt = getRelativeTime(req.createdAt);
  const urgency = req.urgency || (isUrgent(req.createdAt) ? "urgent" : null);

  return {
    patientName,
    bloodType,
    hospital,
    location,
    units,
    postedAt,
    urgency,
  };
};

const LatestBloodRequests = ({ requests = [], loading = false, error }: LatestBloodRequestsProps) => {
  const navigate = useNavigate();
  const displayRequests = requests && requests.length > 0 ? requests : [];
  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading row */}
        <div
          id="requests"
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10 sm:mb-12"
        >
          <SectionHeading
            title="Latest Blood Requests"
            description="Active requests from hospitals and families across Bangladesh."
            align="left"
          />
          <a
            href="/requests"
            className="shrink-0 text-sm font-semibold text-primary border border-red-200 hover:border-primary hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-300"
          >
            View All →
          </a>
        </div>

        {/* Error State */}
        {error && (
          <div style={{ 
            padding: "1rem", 
            marginBottom: "1rem", 
            background: "#fee", 
            border: "1px solid #c0392b", 
            borderRadius: "0.5rem",
            color: "#c0392b",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ 
            padding: "2rem", 
            textAlign: "center", 
            color: "#888" 
          }}>
            Loading blood requests...
          </div>
        ) : (
          <>
            {/* Request cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {displayRequests?.map((req) => {
                const normalized = normalizeRequest(req);

                return (
                  <div
                    key={req._id || normalized.patientName}
                    className={`donor-card border-2 transition-all duration-300 ${
                      normalized.urgency?.toLowerCase() === "critical"
                        ? "border-red-400 bg-red-50"
                        : normalized.urgency
                        ? "border-orange-200"
                        : "border-gray-100"
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Blood group box */}
                        <div className="w-12 h-12 rounded-xl bg-primary center-flex text-white font-black text-sm shrink-0">
                          {normalized.bloodType}
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark text-sm leading-tight">
                            {normalized.patientName}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {normalized.hospital}
                          </p>
                        </div>
                      </div>

                      {/* Urgency badge */}
                      {normalized.urgency && (
                        <span className={`shrink-0 flex items-center gap-1 text-xxs font-black uppercase tracking-wide px-2 py-1 rounded-full ${
                          normalized.urgency.toLowerCase() === "critical"
                            ? "bg-red-200 text-red-700"
                            : "bg-orange-100 text-orange-600"
                        }`}>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                          </span>
                          {normalized.urgency}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Icons.LocationPin className="w-3 h-3 text-primary" />
                        {normalized.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Blood className="w-3 h-3 text-primary" />
                        {normalized.units} unit{normalized.units > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Clock className="w-3 h-3" />
                        {normalized.postedAt}
                      </span>
                    </div>

                    {/* CTA */}
                    <CustomButton variant="primary" size="sm" radius="lg" fullWidth>
                      I Can Donate
                    </CustomButton>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Post Request banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-xl border-2 border-dashed border-red-200 bg-red-50 text-center">
          <h3 className="font-serif text-lg font-bold text-dark mb-1">
            Need Blood Urgently?
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            Post a request and reach hundreds of nearby donors instantly.
          </p>
          <CustomButton onClick={() => navigate('/request')} variant="primary" size="md" radius="full">
            Post a Blood Request
          </CustomButton>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default LatestBloodRequests;
