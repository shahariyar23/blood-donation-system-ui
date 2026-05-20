import { useEffect, useState } from "react";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { fetchHomeDonorGroups } from "../service/homeApi";
import { Link } from "react-router-dom";

interface BloodGroupData {
  group: string;
  donors: number;
  available: boolean;
}

interface BloodGroupAvailabilityProps {
  bloodGroups?: BloodGroupData[];
  loading?: boolean;
  error?: string;
}

const BloodGroupAvailability = ({
  bloodGroups = [],
  loading = false,
  error,
}: BloodGroupAvailabilityProps) => {
  const [apiBloodGroups, setApiBloodGroups] = useState<BloodGroupData[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBloodGroups = async () => {
      setApiLoading(true);
      setApiError("");

      try {
        const result = await fetchHomeDonorGroups();
        if (!mounted) return;
        setApiBloodGroups(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!mounted) return;
        setApiError(
          err instanceof Error
            ? err.message
            : "Failed to load blood group availability",
        );
      } finally {
        if (mounted) {
          setApiLoading(false);
        }
      }
    };

    void loadBloodGroups();

    return () => {
      mounted = false;
    };
  }, []);

  const displayBloodGroups =
    Array.isArray(apiBloodGroups) && apiBloodGroups.length > 0
      ? apiBloodGroups
      : Array.isArray(bloodGroups)
      ? bloodGroups
      : [];
  const loadingState = loading || apiLoading;
  const errorState = error || apiError;

  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading */}
        <SectionHeading
          title="Blood Group Availability"
          description="Real-time donor count across all blood groups in your area. Tap a card to find available donors instantly."
          align="left"
          className="mb-10 sm:mb-14"
        />

        {/* Error State */}
        {errorState && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              background: "#fee",
              border: "1px solid #c0392b",
              borderRadius: "0.5rem",
              color: "#c0392b",
              fontSize: "0.875rem",
            }}
          >
            {errorState}
          </div>
        )}

        {/* Loading State */}
        {loadingState ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#888",
            }}
          >
            Loading blood group data...
          </div>
        ) : displayBloodGroups.length > 0 ? (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
              {displayBloodGroups.map(({ group, donors, available }) => (
                <div
                  key={group}
                  className={`donor-card flex flex-col items-center text-center border-2 cursor-pointer
                    hover:-translate-y-1
                    ${
                      available
                        ? "border-red-100 hover:border-primary"
                        : "border-gray-100 opacity-60"
                    }`}
                >
                  {/* Drop icon */}
                  <span
                    className={`text-3xl mb-2 ${available ? "text-primary" : "text-gray-300"}`}
                  >
                    <Icons.Blood />
                  </span>

                  {/* Group label */}
                  <h3
                    className={`font-serif text-2xl font-black mb-1
                      ${available ? "text-dark" : "text-gray-400"}`}
                  >
                    {group}
                  </h3>

                  {/* Count */}
                  <p
                    className={`text-xs font-semibold mb-2 ${available ? "text-primary" : "text-gray-400"}`}
                  >
                    {donors} donors
                  </p>

                  {/* Status badge */}
                  <span
                    className={`text-xxs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full
                      ${
                        available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-primary"
                      }`}
                  >
                    {available ? "Available" : "Urgent Need"}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Can't find your blood group? Register as a donor and help close
                the gap.
              </p>
              <CustomButton variant="primary" size="md" radius="full">
                <Link to="register">Register as Donor</Link>
              </CustomButton>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center text-gray-600 shadow-sm">
            Blood group availability data is not available right now.
          </div>
        )}
      </MainContainer>
    </SectionContainer>
  );
};

export default BloodGroupAvailability;
