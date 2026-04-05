import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../service/useRegister";
import { useLocation } from "../../../hooks/useLocation";
import type { RegisterFormData } from "../service/register.type";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Health" },
  { id: 3, label: "Location" },
  { id: 4, label: "Socials" },
];

const getPasswordStrength = (val: string) => {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ["#E74C3C", "#E67E22", "#F1C40F", "#1D9E75"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return { score, color: colors[score - 1] || "", label: labels[score - 1] || "" };
};

export default function RegisterPage() {
  const navigate = useNavigate();
const { register, loading } = useRegister();
const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const { getLocation, loading: detectingLocation, helper: locationHelper } = useLocation();


  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bloodType: "",
    gender: "",
    age: "",
    weight: "",
    dateOfBirth: "",
    location: {
      displayName: "",
      road: "",
      quarter: "",
      suburb: "",
      city: "",
      county: "",
      state_district: "",
      state: "",
      postcode: "",
      country: "",
      country_code: "",
      coordinates: { lat: null, lng: null },
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const setLocation = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const setSocial = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim()) errs.name = "Name is required";
      if (!form.email.trim()) errs.email = "Email is required";
      if (!form.phone.trim()) errs.phone = "Phone is required";
      if (!form.password) errs.password = "Password is required";
      else if (form.password.length < 8) errs.password = "Min 8 characters";
      else if (!/[A-Z]/.test(form.password)) errs.password = "Include an uppercase letter";
      else if (!/[0-9]/.test(form.password)) errs.password = "Include a number";
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    }
    if (s === 2) {
      if (!form.bloodType) errs.bloodType = "Select your blood type";
      if (!form.gender) errs.gender = "Select your gender";
      if (!form.age) errs.age = "Age is required";
      else if (Number(form.age) < 18 || Number(form.age) > 65)
        errs.age = "Must be 18–65";
      if (form.weight && Number(form.weight) < 50)
        errs.weight = "Minimum 50 kg";
    }
    if (s === 3) {
      if (!form.location.city.trim()) errs.city = "City is required";
      if (!form.location.country.trim()) errs.country = "Country is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(4, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

const handleDetectLocation = async () => {
  const result = await getLocation();
  if (!result) return;
  const { latitude, longitude, displayName, details } = result;
  setForm((prev) => ({
    ...prev,
    location: {
      ...prev.location,
      displayName,
      road:           details.road           || "",
      quarter:        details.quarter        || "",
      city:           details.city || details.town || details.village || "",
      county:         details.county         || "",
      state_district: details.state_district || "",
      state:          details.state          || "",
      postcode:       details.postcode       || "",
      country:        details.country        || "",
      country_code:   (details.country_code  || "").toUpperCase(),
      coordinates: { lat: latitude, lng: longitude },
    },
  }));
};

  const handleSubmit = async () => {
  if (!validateStep(4)) return;

  const loadingToast = toast.loading("Creating account...");

  try {
    const locationResult = await getLocation();
    if (locationResult) {
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          displayName: locationResult.displayName,
          road: locationResult.details.road || "",
          quarter: locationResult.details.quarter || "",
          city: locationResult.details.city || locationResult.details.town || locationResult.details.village || "",
          county: locationResult.details.county || "",
          state_district: locationResult.details.state_district || "",
          state: locationResult.details.state || "",
          postcode: locationResult.details.postcode || "",
          country: locationResult.details.country || "",
          country_code: (locationResult.details.country_code || "").toUpperCase(),
          coordinates: { lat: locationResult.latitude, lng: locationResult.longitude },
        },
      }));
    }

    const data = await register(form);
    console.log(data);

    toast.success("Account created! Please log in.", { id: loadingToast });
    navigate("/login");
  } catch (err: any) {
    console.log(err)
    const message = err.response?.data?.data?.message || err.message || "Registration failed";
    toast.error(message, { id: loadingToast });
    setErrors({ submit: message });
  }
};

  const strength = getPasswordStrength(form.password);

  return (
    <div style={styles.page}>
      {/* ── LEFT PANEL ── */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          {/* Logo */}
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <span style={styles.logoText}>BloodConnect</span>
          </div>

          {/* Hero */}
          <div style={styles.hero}>
            <div style={styles.heroTag}>Donor Registration</div>
            <h1 style={styles.heroTitle}>
              Give the gift<br />
              of life.{" "}
              <span style={{ color: "rgba(255,255,255,0.45)" }}>
                One drop<br />at a time.
              </span>
            </h1>
            <p style={styles.heroDesc}>
              Join thousands of verified donors making a real difference in
              their communities every day.
            </p>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            {[
              { num: "12K+", label: "Active donors" },
              { num: "98%", label: "Match success" },
              { num: "64", label: "Districts covered" },
              { num: "3min", label: "Avg response" },
            ].map((s) => (
              <div key={s.label} style={styles.statCard}>
                <div style={styles.statNum}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={styles.right}>
        <div style={styles.rightInner}>
          {/* Header */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={styles.formTitle}>Create your account</h2>
            <p style={styles.formSub}>
              Already a donor?{" "}
              <Link to="/login" style={styles.link}>
                Sign in here
              </Link>
            </p>
          </div>

          {/* Step indicator */}
          <div style={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: s.id <= step ? "pointer" : "default",
                  }}
                  onClick={() => s.id < step && setStep(s.id)}
                >
                  <div
                    style={{
                      ...styles.stepNum,
                      background:
                        s.id < step ? "#1D9E75" : s.id === step ? "#C0392B" : "#F0EDE8",
                      color:
                        s.id < step || s.id === step ? "white" : "#888",
                      borderColor:
                        s.id < step ? "#1D9E75" : s.id === step ? "#C0392B" : "#DDD",
                    }}
                  >
                    {s.id < step ? "✓" : s.id}
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: s.id === step ? "#1A1A1A" : "#999",
                      fontWeight: s.id === step ? 500 : 400,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: "1px", background: "#E8E2DA", margin: "0 10px" }} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Personal details</div>

              <div style={styles.grid2}>
                <Field label="Full name" error={errors.name}>
                  <input
                    style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Mostak Ahmed"
                  />
                </Field>
                <Field label="Phone number" error={errors.phone}>
                  <input
                    style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="01712345678"
                  />
                </Field>
              </div>

              <Field label="Email address" error={errors.email}>
                <input
                  style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="mostak@gmail.com"
                />
              </Field>

              <div style={styles.grid2}>
                <Field label="Password" error={errors.password}>
                  <input
                    style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Min 8 characters"
                  />
                  {form.password && (
                    <>
                      <div style={{ display: "flex", gap: "3px", marginTop: "6px" }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: "3px",
                              borderRadius: "2px",
                              background: i <= strength.score ? strength.color : "#E8E2DA",
                              transition: "background 0.2s",
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: "11px", color: strength.color, marginTop: "3px" }}>
                        {strength.label}
                      </div>
                    </>
                  )}
                </Field>
                <Field label="Confirm password" error={errors.confirmPassword}>
                  <input
                    style={{ ...styles.input, ...(errors.confirmPassword ? styles.inputError : {}) }}
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                  />
                </Field>
              </div>

              <NavBtns onNext={next} showBack={false} />
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Health information</div>

              <Field label="Blood type" error={errors.bloodType}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                  {BLOOD_TYPES.map((bt) => (
                    <button
                      key={bt}
                      onClick={() => set("bloodType", bt)}
                      style={{
                        ...styles.selectBtn,
                        background: form.bloodType === bt ? "#C0392B" : "#F7F5F2",
                        color: form.bloodType === bt ? "white" : "#666",
                        borderColor: form.bloodType === bt ? "#C0392B" : "#E8E2DA",
                      }}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Gender" error={errors.gender}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      onClick={() => set("gender", g)}
                      style={{
                        ...styles.selectBtn,
                        background: form.gender === g ? "#C0392B" : "#F7F5F2",
                        color: form.gender === g ? "white" : "#666",
                        borderColor: form.gender === g ? "#C0392B" : "#E8E2DA",
                        textTransform: "capitalize",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>

              <div style={styles.grid3}>
                <Field label="Age" error={errors.age}>
                  <input
                    style={{ ...styles.input, ...(errors.age ? styles.inputError : {}) }}
                    type="number"
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    placeholder="25"
                    min={18}
                    max={65}
                  />
                  <span style={styles.hint}>18–65 years</span>
                </Field>
                <Field label="Weight (kg)" error={errors.weight}>
                  <input
                    style={{ ...styles.input, ...(errors.weight ? styles.inputError : {}) }}
                    type="number"
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    placeholder="65"
                    min={50}
                  />
                  <span style={styles.hint}>Min 50 kg</span>
                </Field>
                <Field label="Date of birth">
                  <input
                    style={styles.input}
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                </Field>
              </div>

              <NavBtns onNext={next} onBack={back} />
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Your location</div>

              <button
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                style={styles.detectBtn}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
                {locationHelper}
              </button>

              {errors.location && (
                <p style={{ color: "#C0392B", fontSize: "12px", marginBottom: "8px" }}>
                  {errors.location}
                </p>
              )}

              <div style={styles.grid2}>
                <Field label="City / Town" error={errors.city}>
                  <input
                    style={{ ...styles.input, ...(errors.city ? styles.inputError : {}) }}
                    value={form.location.city}
                    onChange={(e) => setLocation("city", e.target.value)}
                    placeholder="Dhaka"
                  />
                </Field>
                <Field label="State / Division">
                  <input
                    style={styles.input}
                    value={form.location.state}
                    onChange={(e) => setLocation("state", e.target.value)}
                    placeholder="Dhaka Division"
                  />
                </Field>
                <Field label="District">
                  <input
                    style={styles.input}
                    value={form.location.state_district}
                    onChange={(e) => setLocation("state_district", e.target.value)}
                    placeholder="Dhaka District"
                  />
                </Field>
                <Field label="County">
                  <input
                    style={styles.input}
                    value={form.location.county}
                    onChange={(e) => setLocation("county", e.target.value)}
                    placeholder="County"
                  />
                </Field>
                <Field label="Country" error={errors.country}>
                  <input
                    style={{ ...styles.input, ...(errors.country ? styles.inputError : {}) }}
                    value={form.location.country}
                    onChange={(e) => setLocation("country", e.target.value)}
                    placeholder="Bangladesh"
                  />
                </Field>
                <Field label="Postcode">
                  <input
                    style={styles.input}
                    value={form.location.postcode}
                    onChange={(e) => setLocation("postcode", e.target.value)}
                    placeholder="1207"
                  />
                </Field>
                <Field label="Latitude">
                  <input
                    style={styles.input}
                    type="number"
                    step="any"
                    value={form.location.coordinates.lat ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: {
                            ...prev.location.coordinates,
                            lat: e.target.value ? Number(e.target.value) : null,
                          },
                        },
                      }))
                    }
                    placeholder="23.8103"
                  />
                </Field>
                <Field label="Longitude">
                  <input
                    style={styles.input}
                    type="number"
                    step="any"
                    value={form.location.coordinates.lng ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: {
                            ...prev.location.coordinates,
                            lng: e.target.value ? Number(e.target.value) : null,
                          },
                        },
                      }))
                    }
                    placeholder="90.4125"
                  />
                </Field>
              </div>

              <NavBtns onNext={next} onBack={back} />
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
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
                      style={styles.socialInput}
                      value={(form.socialLinks as any)[key]}
                      onChange={(e) => setSocial(key, e.target.value)}
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
                onNext={handleSubmit}
                onBack={back}
                nextLabel={loading ? "Creating account..." : "Create account"}
                disabled={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

function NavBtns({
  onNext,
  onBack,
  nextLabel = "Continue →",
  showBack = true,
  disabled = false,
}: {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
      {showBack && onBack && (
        <button onClick={onBack} style={styles.btnBack}>
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        style={{ ...styles.btnNext, opacity: disabled ? 0.7 : 1 }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gridTemplateColumns: "1fr 1.15fr",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    background: "#7B1E1E",
    backgroundImage: "linear-gradient(135deg, #922B21 0%, #7B1E1E 60%, #5D1515 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "3rem",
    position: "relative",
    overflow: "hidden",
  },
  leftInner: {
    display: "flex",
    flexDirection: "column",
    gap: "3rem",
    position: "relative",
    zIndex: 1,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "20px",
    color: "white",
    fontWeight: 700,
  },
  hero: { maxWidth: "340px" },
  heroTag: {
    display: "inline-block",
    background: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.8)",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    padding: "6px 12px",
    borderRadius: "20px",
    marginBottom: "1.2rem",
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.4rem",
    lineHeight: 1.2,
    color: "white",
    fontWeight: 700,
    marginBottom: "1rem",
  },
  heroDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "15px",
    lineHeight: 1.7,
    fontWeight: 300,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  statCard: {
    background: "rgba(255,255,255,0.07)",
    border: "0.5px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "0.9rem 1.1rem",
  },
  statNum: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "white",
    fontFamily: "'Playfair Display', serif",
  },
  statLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    marginTop: "2px",
  },
  right: {
    background: "#FAFAF8",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "2.5rem",
  },
  rightInner: {
    maxWidth: "520px",
    width: "100%",
    margin: "0 auto",
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.9rem",
    fontWeight: 700,
    color: "#1A1A1A",
    marginBottom: "4px",
  },
  formSub: {
    color: "#888",
    fontSize: "14px",
  },
  link: {
    color: "#C0392B",
    textDecoration: "none",
    fontWeight: 500,
  },
  steps: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1.8rem",
  },
  stepNum: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 500,
    border: "1.5px solid",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  section: {
    animation: "fadeIn 0.25s ease",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: "#C0392B",
    marginBottom: "1rem",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "14px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#777",
    letterSpacing: "0.3px",
  },
  input: {
    width: "100%",
    height: "40px",
    padding: "0 12px",
    background: "#F7F5F2",
    border: "1px solid #E8E2DA",
    borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    color: "#1A1A1A",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  errorText: {
    fontSize: "11px",
    color: "#C0392B",
  },
  hint: {
    fontSize: "11px",
    color: "#999",
    marginTop: "2px",
  },
  selectBtn: {
    height: "40px",
    border: "1px solid",
    borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  detectBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#FADBD8",
    border: "1px solid #F5A9A3",
    borderRadius: "8px",
    padding: "0 16px",
    height: "36px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    fontWeight: 500,
    color: "#C0392B",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  socialField: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #E8E2DA",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#F7F5F2",
    marginTop: "5px",
  },
  socialPrefix: {
    padding: "0 12px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#888",
    borderRight: "1px solid #E8E2DA",
    background: "white",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  socialInput: {
    border: "none",
    borderRadius: "0",
    height: "40px",
    background: "transparent",
    flex: 1,
    padding: "0 12px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    color: "#1A1A1A",
    outline: "none",
    width: "100%",
  },
  infoBox: {
    background: "#FEF9F0",
    border: "1px solid #F9C74F",
    borderRadius: "10px",
    padding: "12px 14px",
    marginTop: "1rem",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  btnBack: {
    height: "44px",
    padding: "0 20px",
    border: "1px solid #E8E2DA",
    borderRadius: "10px",
    background: "transparent",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    color: "#888",
    cursor: "pointer",
  },
  btnNext: {
    flex: 1,
    height: "44px",
    background: "#C0392B",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
};