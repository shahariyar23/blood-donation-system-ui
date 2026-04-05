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

// ── API call ────────────────────────────────────────────
export const registerApi = async (form: RegisterFormData) => {
  const payload: RegisterPayload = {
    ...form,
    age:         form.age    ? Number(form.age)    : null,
    weight:      form.weight ? Number(form.weight) : null,
    dateOfBirth: form.dateOfBirth || null,
    socialLinks: {
      facebook:  buildSocialUrl(form.socialLinks.facebook,  "https://facebook.com"),  // ← here
      instagram: buildSocialUrl(form.socialLinks.instagram, "https://instagram.com"), // ← here
      twitter:   buildSocialUrl(form.socialLinks.twitter,   "https://x.com"),         // ← here
    },
  };

  const { data } = await Api.post("/auth/register", payload);
  return data;
};