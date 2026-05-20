import { useEffect, useState } from "react";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { Icons } from "../../../shared/icons/Icons";
import { Link } from "react-router-dom";
import { fetchHomeDonors, type HomeDonor } from "../service/homeApi";

interface NearbyDonor {
  _id?: string;
  name: string;
  bloodType?: string;
  location?: {
    displayName?: string;
    road?: string;
    quarter?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
  };
  distance?: string;
  lastDonationDate?: string | null;
  isAvailable?: boolean;
  totalDonations?: number;
  avatar?: string | null;
  primarySocialLink?: string | null;
  isDonorVerified?: boolean;
  distanceKm?: number | null;
}

interface NearbyDonorsProps {
  donors?: NearbyDonor[];
  loading?: boolean;
  error?: string;
}

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "No donation history";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No donation history";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

const buildLocation = (location?: NearbyDonor["location"]) => {
  if (!location) return "Location unknown";

  const parts = [location.road, location.quarter || location.city, location.displayName]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Location unknown";
};

const NearbyDonors = ({ donors = [], loading = false, error }: NearbyDonorsProps) => {
  const [apiDonors, setApiDonors] = useState<NearbyDonor[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const loadDonors = async () => {
      setApiLoading(true);
      setApiError("");

      try {
        const result = await fetchHomeDonors();
        if (!mounted) return;

        const mappedDonors: NearbyDonor[] = result.map((donor: HomeDonor) => ({
          _id: donor._id,
          name: donor.name,
          bloodType: donor.bloodType,
          location: {
            displayName: donor.location?.displayName,
            road: donor.location?.road,
            quarter: donor.location?.quarter,
            suburb: donor.location?.suburb,
            city: donor.location?.city,
            county: donor.location?.county,
            state_district: donor.location?.state_district,
            state: donor.location?.state,
          },
          distance: donor.distanceKm != null ? `${donor.distanceKm.toFixed(1)} km` : undefined,
          lastDonationDate: donor.lastDonationDate,
          isAvailable: donor.isAvailable,
          totalDonations: donor.totalDonations,
          avatar: donor.avatar,
          primarySocialLink: donor.primarySocialLink,
          isDonorVerified: donor.isDonorVerified,
          distanceKm: donor.distanceKm,
        }));

        setApiDonors(mappedDonors);
      } catch (err) {
        if (!mounted) return;
        setApiError(err instanceof Error ? err.message : "Failed to load nearby donors");
      } finally {
        if (mounted) {
          setApiLoading(false);
        }
      }
    };

    void loadDonors();

    return () => {
      mounted = false;
    };
  }, []);

  const displayDonors =
    Array.isArray(apiDonors) && apiDonors.length > 0
      ? apiDonors
      : Array.isArray(donors)
      ? donors
      : [];
  const loadingState = loading || apiLoading;
  const errorState = error || apiError;

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
          <Link
            to="/find-donor"
            className="shrink-0 text-sm font-semibold text-primary border border-red-200 hover:border-primary hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-300"
          >
            View All →
          </Link>
        </div>

        {/* Error State */}
        {errorState && (
          <div style={{ 
            padding: "1rem", 
            marginBottom: "1rem", 
            background: "#fee", 
            border: "1px solid #c0392b", 
            borderRadius: "0.5rem",
            color: "#c0392b",
            fontSize: "0.875rem"
          }}>
            {errorState}
          </div>
        )}

        {/* Loading State */}
        {loadingState ? (
          <div style={{ 
            padding: "2rem", 
            textAlign: "center", 
            color: "#888" 
          }}>
            Loading nearby donors...
          </div>
        ) : displayDonors.length > 0 ? (
          <>
            {/* Donor cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {displayDonors.map((donor) => {
                const locationDisplay = buildLocation(donor.location);
                const bloodGroup = donor.bloodType || "Unknown";
                const lastDonated = formatRelativeTime(donor.lastDonationDate);
                const donations = donor.totalDonations || 0;
                const available = donor.isAvailable !== false;
                const verified = donor.isDonorVerified !== false;

                return (
                  <div key={donor._id || donor.name} className="donor-card border border-gray-100">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {donor.avatar ? (
                          <img
                            src={donor.avatar}
                            alt={donor.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-red-100 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-red-50 border-2 border-red-100 center-flex font-black text-primary text-base shrink-0">
                            {donor.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-dark text-sm leading-tight">
                            {donor.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {locationDisplay}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xxs font-semibold">
                            <span className={`${verified ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"} px-2 py-0.5 rounded-full`}>
                              {verified ? "Verified donor" : "Unverified"}
                            </span>
                            {donor.primarySocialLink && (
                              <a
                                href={donor.primarySocialLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                Social link
                              </a>
                            )}
                          </div>
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
                      {donor.distanceKm != null && !donor.distance && (
                        <span className="flex items-center gap-1">
                          <Icons.LocationPin className="w-3 h-3 text-primary" />
                          {donor.distanceKm.toFixed(1)} km
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
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center text-gray-600 shadow-sm">
            No nearby donors are available right now.
          </div>
        )}
      </MainContainer>
    </SectionContainer>
  );
};

export default NearbyDonors;
