import type { RegisterFormData } from "../service/register.type";
import { NavBtns } from "./NextBtn";
import { styles } from "./style";

export function StepSocials({
  form,
  errors,
  loading,
  setSocial,
  setFieldRef,
  handleInputKeyDown,
  onSubmit,
  onBack,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  loading: boolean;
  setSocial: (field: string, value: string) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>
        Social links{" "}
        <span style={{ fontSize: "11px", textTransform: "none", letterSpacing: 0, color: "#999", fontWeight: 400 }}>
          (optional)
        </span>
      </div>

      {[
        { key: "facebook", prefix: "facebook.com/", placeholder: "yourprofile" },
        { key: "instagram", prefix: "instagram.com/", placeholder: "yourhandle" },
        { key: "twitter", prefix: "x.com/", placeholder: "yourhandle" },
      ].map(({ key, prefix, placeholder }) => (
        <div key={key} style={{ marginBottom: "12px" }}>
          <label style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <div style={styles.socialField}>
            <span style={styles.socialPrefix}>{prefix}</span>
            <input
              ref={setFieldRef(key)}
              name={key}
              style={styles.socialInput}
              value={(form.socialLinks as any)[key]}
              onChange={(e) => setSocial(key, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, key)}
              placeholder={placeholder}
            />
          </div>
        </div>
      ))}

      <div style={styles.infoBox}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="2" style={{ flexShrink: 0, marginTop: "1px" }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ fontSize: "12px", color: "#633806", lineHeight: 1.6, margin: 0 }}>
          Your information is protected. Only your name, blood type, and
          availability are shown to those searching for donors.
        </p>
      </div>

      {errors.submit && (
        <p style={{ color: "#C0392B", fontSize: "13px", marginTop: "10px" }}>
          {errors.submit}
        </p>
      )}

      <NavBtns
        onNext={onSubmit}
        onBack={onBack}
        nextLabel={loading ? "Creating account..." : "Create account"}
        disabled={loading}
      />
    </div>
  );
}