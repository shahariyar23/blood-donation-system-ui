import { useState } from "react";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import BuildInLoader from "../../../shared/loader/BuildInLoader";
import { Icons } from "../../../shared/icons/Icons";

const allDonors = [
  {
    name: "Rahim Uddin",
    bloodGroup: "O+",
    location: "Mirpur, Dhaka",
    distance: "1.2 km",
    lastDonated: "3 months ago",
    available: true,
    donations: 12,
  },
  {
    name: "Sumaiya Akter",
    bloodGroup: "A+",
    location: "Dhanmondi, Dhaka",
    distance: "2.4 km",
    lastDonated: "4 months ago",
    available: true,
    donations: 7,
  },
  {
    name: "Karim Hossain",
    bloodGroup: "B−",
    location: "Gulshan, Dhaka",
    distance: "3.1 km",
    lastDonated: "6 months ago",
    available: true,
    donations: 20,
  },
  {
    name: "Nusrat Jahan",
    bloodGroup: "AB+",
    location: "Banani, Dhaka",
    distance: "4.5 km",
    lastDonated: "2 months ago",
    available: false,
    donations: 5,
  },
  {
    name: "Imran Khan",
    bloodGroup: "O−",
    location: "Uttara, Dhaka",
    distance: "5.0 km",
    lastDonated: "5 months ago",
    available: true,
    donations: 15,
  },
  {
    name: "Fatema Begum",
    bloodGroup: "B+",
    location: "Mohammadpur, Dhaka",
    distance: "5.8 km",
    lastDonated: "7 months ago",
    available: true,
    donations: 9,
  },
];

const NearbyDonors = () => {
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState(allDonors.slice(0, 3));

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setDonors(allDonors);
      setLoading(false);
    }, 1000);
  };

  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10 sm:mb-12">
          <SectionHeading
            title="Nearby Donors"
            description="Verified donors within 10 km of Dhaka. Ready to help at a moment's notice."
            align="left"
          />
          <a
            href="/donors"
            className="shrink-0 text-sm font-semibold text-primary border border-red-200 hover:border-primary hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-300"
          >
            View All →
          </a>
        </div>

        {/* Donor cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {donors.map((donor) => (
            <div key={donor.name} className="donor-card border border-gray-100">
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
                      {donor.location}
                    </p>
                  </div>
                </div>
                {/* Blood badge */}
                <span className="blood-badge shrink-0">{donor.bloodGroup}</span>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Icons.LocationPin className="w-3 h-3 text-primary" />
                  {donor.distance}
                </span>
                <span className="flex items-center gap-1">
                  <Icons.Blood className="w-3 h-3 text-primary" />
                  {donor.donations} donations
                </span>
                <span className="flex items-center gap-1">
                  <Icons.Clock className="w-3 h-3" />
                  {donor.lastDonated}
                </span>
              </div>

              {/* Status + CTA */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xxs font-bold px-2.5 py-1 rounded-full
                    ${
                      donor.available
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {donor.available ? "✓ Available" : "Unavailable"}
                </span>
                <CustomButton
                  variant={donor.available ? "primary" : "ghost"}
                  size="xs"
                  radius="lg"
                  disabled={!donor.available}
                >
                  Contact
                </CustomButton>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        {donors.length < allDonors.length && (
          <div className="mt-8 center-flex flex-col gap-4">
            {loading ? (
              <BuildInLoader />
            ) : (
              <CustomButton
                variant="outline"
                size="md"
                radius="full"
                onClick={handleLoadMore}
              >
                Load More Donors
              </CustomButton>
            )}
          </div>
        )}
      </MainContainer>
    </SectionContainer>
  );
};

export default NearbyDonors;
