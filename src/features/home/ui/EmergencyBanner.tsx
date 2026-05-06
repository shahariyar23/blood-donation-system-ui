import MainContainer from "../../../shared/main-container/MainContainer";

interface UrgentRequest {
  _id?: string;
  bloodType?: string;
  patientInfo?: {
    name?: string;
  };
  hospital?: string;
  patientName?: string;
  requestedBy?: {
    name?: string;
  } | string;
  units?: number;
  createdAt?: string;
  location?: string | {
    city?: string;
    displayName?: string;
  };
}

interface EmergencyBannerProps {
  urgentRequest?: UrgentRequest;
}

const EmergencyBanner = ({ urgentRequest }: EmergencyBannerProps) => {
  // If no urgent request provided, show default banner
  if (!urgentRequest) {
    return (
      <div className="bg-primary text-white py-3">
        <MainContainer>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            {/* Left — pulse + message */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <p className="text-xs sm:text-sm font-semibold leading-snug">
                🚨 <span className="font-bold">URGENT:</span> B− blood needed at
                Dhaka Medical College Hospital — Contact immediately!
              </p>
            </div>

            {/* Right — CTA */}
            <a
              href="#requests"
              className="shrink-0 bg-white text-primary font-bold text-xs px-4 py-1.5 rounded-full hover:bg-red-50 transition-all duration-300"
            >
              Respond Now →
            </a>
          </div>
        </MainContainer>
      </div>
    );
  }

  // Show urgent request banner
  const bloodType = urgentRequest.bloodType || "Unknown";
  const hospital = urgentRequest.hospital || "Unknown Hospital";
  const units = urgentRequest.units || 1;

  return (
    <div className="bg-primary text-white py-3">
      <MainContainer>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          {/* Left — pulse + message */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <p className="text-xs sm:text-sm font-semibold leading-snug">
              🚨 <span className="font-bold">URGENT:</span> {bloodType} blood ({units} unit{units > 1 ? "s" : ""}) needed at{" "}
              {hospital} — Contact immediately!
            </p>
          </div>

          {/* Right — CTA */}
          <a
            href="#requests"
            className="shrink-0 bg-white text-primary font-bold text-xs px-4 py-1.5 rounded-full hover:bg-red-50 transition-all duration-300"
          >
            Respond Now →
          </a>
        </div>
      </MainContainer>
    </div>
  );
};

export default EmergencyBanner;