import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";


const bloodGroups = [
  { group: "A+",  donors: 142, available: true },
  { group: "A−",  donors: 38,  available: true },
  { group: "B+",  donors: 189, available: true },
  { group: "B−",  donors: 12,  available: false },
  { group: "O+",  donors: 210, available: true },
  { group: "O−",  donors: 9,   available: false },
  { group: "AB+", donors: 67,  available: true },
  { group: "AB−", donors: 5,   available: false },
];

const BloodGroupAvailability = () => {
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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {bloodGroups.map(({ group, donors, available }) => (
            <div
              key={group}
              className={`donor-card flex flex-col items-center text-center border-2 cursor-pointer
                hover:-translate-y-1
                ${available
                  ? "border-red-100 hover:border-primary"
                  : "border-gray-100 opacity-60"
                }`}
            >
              {/* Drop icon */}
              <span className={`text-3xl mb-2 ${available ? "text-primary" : "text-gray-300"}`}>
                <Icons.Blood/>
              </span>

              {/* Group label */}
              <h3
                className={`font-serif text-2xl font-black mb-1
                  ${available ? "text-dark" : "text-gray-400"}`}
              >
                {group}
              </h3>

              {/* Count */}
              <p className={`text-xs font-semibold mb-2 ${available ? "text-primary" : "text-gray-400"}`}>
                {donors} donors
              </p>

              {/* Status badge */}
              <span
                className={`text-xxs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full
                  ${available
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
            Can't find your blood group? Register as a donor and help close the gap.
          </p>
          <CustomButton variant="primary" size="md" radius="full">
            Register as Donor
          </CustomButton>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default BloodGroupAvailability;