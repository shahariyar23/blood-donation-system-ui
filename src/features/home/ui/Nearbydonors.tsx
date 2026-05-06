import SectionContainer from "../../../shared/section-container/SectionContainer";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";

interface NearbyDonor {
  _id?: string;
  name: string;
  bloodType?: string;
  location?: {
    city?: string;
    displayName?: string;
  };
  distance?: string;
  lastDonationDate?: string | null;
  isAvailable?: boolean;
  totalDonations?: number;
  email?: string;
  phone?: string;
}

interface NearbyDonorsProps {
  donors?: NearbyDonor[];
  loading?: boolean;
  error?: string;
}

const fallbackDonors = [
  {
    name: "Rahim Uddin",
    bloodType: "O+",
    location: { city: "Mirpur, Dhaka", displayName: "Mirpur, Dhaka" },
    distance: "1.2 km",
    lastDonationDate: "3 months ago",
    isAvailable: true,
    totalDonations: 12,
  },
  {
    name: "Sumaiya Akter",
    bloodType: "A+",
    location: { city: "Dhanmondi, Dhaka", displayName: "Dhanmondi, Dhaka" },
    distance: "2.4 km",
    lastDonationDate: "4 months ago",
    isAvailable: true,
    totalDonations: 7,
  },
  {
    name: "Karim Hossain",
    bloodType: "B−",
    location: { city: "Gulshan, Dhaka", displayName: "Gulshan, Dhaka" },
    distance: "3.1 km",
    lastDonationDate: "6 months ago",
    isAvailable: true,
    totalDonations: 20,
  },
];

const NearbyDonors = ({ donors = [], loading = false, error }: NearbyDonorsProps) => {
  const displayDonors = donors && donors.length > 0 ? donors : fallbackDonors;

  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10 sm:mb-12">
          <SectionHeading
            title="Nearby Donors"
            description="Verified donors within 10 km of your location. Ready to help at a moment's notice."
            align="left"
          />
          <a
            href="/donors"
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
            Loading nearby donors...
          </div>
        ) : (
          <>
            {/* Donor cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {displayDonors.map((donor) => {
                const locationDisplay = donor.location?.displayName || donor.location?.city || "Location unknown";
                const bloodGroup = donor.bloodType || "Unknown";
                const lastDonated = donor.lastDonationDate || "No donation history";
                const donations = donor.totalDonations || 0;
                const available = donor.isAvailable !== false;

                return (
                  <div key={donor._id || donor.name} className="donor-card border border-gray-100">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-red-50 border-2 border-red-100 center-flex font-black text-primary text-base shrink-0">
                          {donor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark text-sm leading-tight">
                            {donor.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {locationDisplay}
                          </p>
                        </div>
                      </div>
                      {/* Blood badge */}
                      <span className="blood-badge shrink-0">{bloodGroup}</span>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
                      {donor.distance && (
                        <span className="flex items-center gap-1">
                          <Icons.LocationPin className="w-3 h-3 text-primary" />
                          {donor.distance}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Icons.Blood className="w-3 h-3 text-primary" />
                        {donations} donations
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Clock className="w-3 h-3" />
                        {lastDonated}
                      </span>
                    </div>

                    {/* Status + CTA */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xxs font-bold px-2.5 py-1 rounded-full
                          ${
                            available
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {available ? "✓ Available" : "Unavailable"}
                      </span>
                      <CustomButton
                        variant={available ? "primary" : "ghost"}
                        size="xs"
                        radius="lg"
                        disabled={!available}
                      >
                        Contact
                      </CustomButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </MainContainer>
    </SectionContainer>
  );
};

export default NearbyDonors;
