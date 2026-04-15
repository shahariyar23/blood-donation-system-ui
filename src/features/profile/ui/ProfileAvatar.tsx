import { profileStyles as s } from "../service/ProfileStyle";
import ProfileBadge from "./ProfileBadge";

interface ProfileAvatarProps {
  name:            string;
  avatar?:         string;
  bloodType:       string;
  totalDonations:  number;
  isAvailable:     boolean;
  isDonorVerified: boolean;
  onUpload:        () => void;
}

export default function ProfileAvatar({
  name,
  avatar,
  bloodType,
  totalDonations,
  isAvailable,
  isDonorVerified,
  onUpload,
}: ProfileAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={s.avatarSection}>
      {/* avatar */}
      <div style={s.avatarWrapper}>
        {avatar ? (
          <img src={avatar} alt={name} style={s.avatar} />
        ) : (
          <div style={s.avatarPlaceholder}>{initials}</div>
        )}
        <button
          type="button"
          onClick={onUpload}
          style={s.avatarUploadBtn}
          title="Change photo"
        >
          ✎
        </button>
      </div>

      {/* info */}
      <div style={s.avatarInfo}>
        <h2 style={s.avatarName}>{name}</h2>
        <p style={s.avatarMeta}>
          {bloodType && `${bloodType} donor · `}
          {totalDonations} donation{totalDonations !== 1 ? "s" : ""}
        </p>
        <div style={s.badgeRow}>
          {isDonorVerified && (
            <ProfileBadge label="Verified donor" color="green" icon="✓" />
          )}
          <ProfileBadge
            label={isAvailable ? "Available" : "Unavailable"}
            color={isAvailable ? "green" : "gray"}
            icon={isAvailable ? "●" : "○"}
          />
          {bloodType && (
            <ProfileBadge label={bloodType} color="red" icon="🩸" />
          )}
        </div>
      </div>
    </div>
  );
}