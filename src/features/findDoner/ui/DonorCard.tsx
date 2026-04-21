import { useState } from "react";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import type { Donor } from "../service/Donordata";
import DonorDetailsModal from "./DonorDetailsModal";

interface DonorCardProps {
  donor: Donor;
}

const DonorCard = ({ donor }: DonorCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div
        className="donor-card hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
      >

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-100
            center-flex font-black text-primary text-lg shrink-0 overflow-hidden">
            {donor?.avatar ? (
              <img
                src={donor.avatar}
                alt={donor.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              donor.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-dark text-sm leading-tight">
                {donor.name}
              </h3>
              {donor.isDonorVerified && (
                <Icons.Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{donor.location}</p>
          </div>
        </div>

        {/* Blood badge */}
        <span className="blood-badge shrink-0">{donor.bloodType}</span>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Icons.Location className="w-3 h-3 text-primary" />
          {donor.distance} km
        </span>
        <span className="flex items-center gap-1">
          <Icons.Blood className="w-3 h-3 text-primary" />
          {donor.totalDonations} donations
        </span>
        <span className="flex items-center gap-1">
          <Icons.Clock className="w-3 h-3" />
          {donor.lastDonation}
        </span>
      </div>

      {/* Status + CTA */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xxs font-bold px-2.5 py-1 rounded-full
            ${donor.isAvailable
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
            }`}
        >
          {donor.isAvailable ? "✓ Available" : "Unavailable"}
        </span>

        <CustomButton
          variant={donor.isAvailable ? "primary" : "ghost"}
          size="xs"
          radius="lg"
          disabled={!donor.isAvailable || !donor.primarySocialLink}
          leftIcon={<Icons.Phone className="w-3 h-3" />}
          onClick={(e) => {
            e.stopPropagation();
            if (donor.primarySocialLink) {
              window.open(donor.primarySocialLink, "_blank", "noopener,noreferrer");
            }
          }}
        >
          Contact
        </CustomButton>
      </div>
      </div>

      <DonorDetailsModal donor={donor} isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default DonorCard;