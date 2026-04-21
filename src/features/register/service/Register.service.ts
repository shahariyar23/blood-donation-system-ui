import Api from "../../../utilities/api";
import type { RegisterFormData, RegisterPayload } from "./register.type";

// ── Social URL helper ───────────────────────────────────
const buildSocialUrl = (value: string, baseUrl: string): string | null => {
  if (!value.trim()) return null;
  const v = value.trim();
  if (v.includes(".com/") || v.includes(".com")) {
    return v.startsWith("http") ? v : `https://${v}`;
  }
  return `${baseUrl}/${v}`;
};

const uploadAvatar = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await Api.post("/auth/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data?.avatarUrl ?? data?.avatarUrl ?? null;
};

// ── API call ────────────────────────────────────────────
export const registerApi = async (form: RegisterFormData) => {
  const { avatar, ...rest } = form;
  const avatarUrl = avatar ? await uploadAvatar(avatar) : null;
  const payload: RegisterPayload = {
    ...rest,
    isAvailable: rest.role === "donor" ? rest.isAvailable : undefined,
    age:         rest.age    ? Number(rest.age)    : null,
    weight:      rest.weight ? Number(rest.weight) : null,
    dateOfBirth: rest.dateOfBirth || null,
    totalDonations: rest.totalDonations ? Number(rest.totalDonations) : undefined,
    lastDonationDate: rest.lastDonationDate || null,
    socialLinks: {
      facebook:  buildSocialUrl(rest.socialLinks.facebook,  "https://facebook.com"),  // ← here
      instagram: buildSocialUrl(rest.socialLinks.instagram, "https://instagram.com"), // ← here
      twitter:   buildSocialUrl(rest.socialLinks.twitter,   "https://x.com"),         // ← here
    },
  };
  if (avatarUrl) {
    payload.avatar = avatarUrl;
  }
// console.log(payload)
 const { data } = await Api.post("/auth/register", payload);
 return data;
};