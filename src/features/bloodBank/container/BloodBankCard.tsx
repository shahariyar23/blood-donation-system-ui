import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import { availabilityConfig, type BloodBank } from "../service/bloodBankData";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

interface BloodBankCardProps {
  bank:            BloodBank;
  highlightGroup?: string; // highlight searched blood type
}

// Star rating display
const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-3 h-3 ${star <= Math.round(rating) ? "text-primary" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-xs text-gray-500 ml-0.5">{rating}</span>
  </div>
);

const BloodBankCard = ({ bank, highlightGroup = "All" }: BloodBankCardProps) => {
  return (
    <div className={`donor-card hover:-translate-y-1 transition-all duration-300
      flex flex-col h-full
      ${!bank.isOpen ? "bg-red-50" : "bg-white"}`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Icon — red tint when closed */}
          <div className={`w-11 h-11 rounded-xs center-flex shrink-0
            ${bank.isOpen ? "bg-primary/10" : "bg-primary/15"}`}>
            <Icons.Hospital className="!w-5 !h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-dark text-sm leading-snug line-clamp-2">
              {bank.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{bank.area}</p>
          </div>
        </div>

        {/* Open/Closed badge */}
        <span className={`shrink-0 text-xxs font-bold px-2.5 py-1 rounded-full
          ${bank.isOpen
            ? "bg-green-100 text-green-700"
            : "bg-primary/10 text-primary"
          }`}>
          {bank.isOpen ? "● Open" : "● Closed"}
        </span>
      </div>

      {/* Meta row — grid ensures consistent layout regardless of content length */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Icons.Location className=" text-primary shrink-0" />
          {bank.distance} km
        </span>
        <span className="flex items-center gap-1">
          <Icons.Clock className=" shrink-0" />
          {bank.hours}
        </span>
        <span className="flex items-center gap-1">
          <Icons.Blood className="text-primary shrink-0" />
          {bank.totalUnits} units
        </span>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <Stars rating={bank.rating} />
      </div>

      {/* Blood availability grid */}
      <div className="mb-4">
        <p className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-2">
          Availability
        </p>
        <div className="grid grid-cols-4 gap-1">
          {BLOOD_GROUPS.map((group) => {
            const status = bank.availability[group] ?? "unavailable";
            const config = availabilityConfig[status];
            const isHighlighted = highlightGroup !== "All" && highlightGroup === group;
            return (
              <div
                key={group}
                className={`text-center py-1 rounded-xs transition-all duration-200
                  ${config.color}
                  ${isHighlighted ? "ring-2 ring-primary ring-offset-1 scale-105" : ""}`}
              >
                <p className="text-xxs font-black">{group}</p>
                <p className="text-xxs font-medium">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-gray-400 flex items-start gap-1.5 mb-4">
        <Icons.LocationPin className=" text-primary shrink-0 mt-0.5" />
        {bank.address}
      </p>

      {/* CTA buttons — mt-auto pushes to bottom regardless of card height */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Row 1 */}
        <div className="flex gap-2">
          <CustomButton
            variant="primary"
            size="xs"
            radius="xs"
            leftIcon={<Icons.Phone />}
            className="flex-1"
          >
            Call Now
          </CustomButton>
          <CustomButton
            variant="outline"
            size="xs"
            radius="xs"
            leftIcon={<Icons.Mail />}
            className="flex-1"
          >
            Email
          </CustomButton>
        </div>

        {/* Row 2 — full width */}
        <CustomButton
          variant="outline"
          size="xs"
          radius="xs"
          fullWidth
          leftIcon={<Icons.Location />}
        >
          Get Directions
        </CustomButton>
      </div>
    </div>
  );
};

export default BloodBankCard;