import { useRef } from "react";
import { profileStyles as s } from "../service/ProfileStyle";
import ProfileBadge from "./ProfileBadge";
import { getAvatarUrl } from "../service/profileService";

interface ProfileAvatarProps {
  name: string;
  avatar?: string;
  bloodType: string;
  role: string;
  totalDonations: number;
  totalReceived: number;
  isAvailable: boolean;
  isDonorVerified: boolean;
  uploading?: boolean;
  onUpload: (file: File) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ProfileAvatar({
  name,
  avatar,
  bloodType,
  role,
  totalDonations,
  totalReceived,
  isAvailable,
  isDonorVerified,
  uploading = false,
  onUpload,
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDonor = role === "donor";
  const donationLabel = `${totalDonations} donation${totalDonations !== 1 ? "s" : ""}`;
  const receivedLabel = `${totalReceived} received`;
  const metaText = isDonor
    ? `${donationLabel}${totalReceived > 0 ? ` - ${receivedLabel}` : ""}`
    : receivedLabel;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatarUrl = getAvatarUrl(avatar);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    onUpload(file);
  };

  return (
    <div style={s.avatarSection}>
      <div style={s.avatarWrapper}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} style={s.avatar} />
        ) : (
          <div style={s.avatarPlaceholder}>{initials}</div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            ...s.avatarUploadBtn,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.75 : 1,
          }}
          title={uploading ? "Uploading photo" : "Change photo"}
        >
          {uploading ? "..." : "✎"}
        </button>
      </div>

      <div style={s.avatarInfo}>
        <h2 style={s.avatarName}>{name}</h2>
        <p style={s.avatarMeta}>
          {bloodType && `${bloodType}${isDonor ? " donor" : ""} - `}
          {metaText}
        </p>
        <div style={s.badgeRow}>
          {isDonor && isDonorVerified && (
            <ProfileBadge label="Verified donor" color="green" icon="✓" />
          )}
          {isDonor && (
            <ProfileBadge
              label={isAvailable ? "Available" : "Unavailable"}
              color={isAvailable ? "green" : "gray"}
              icon={isAvailable ? "●" : "○"}
            />
          )}
          {bloodType && (
            <ProfileBadge label={bloodType} color="red" icon="🩸" />
          )}
        </div>
      </div>
    </div>
  );
}
