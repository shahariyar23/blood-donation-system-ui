import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../service/UseRegister";
import { useLocation } from "../../../hooks/useLocation";
import type { RegisterFormData } from "../service/register.type";
import toast from "react-hot-toast";
import { styles } from "../container/style";
import { StepAccount } from "../container/StepAccount";
import { StepHealth } from "../container/StrpHealth";
import { StepLocation } from "../container/StepLocation";
import { StepSocials } from "../container/StepSocial";



const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Health" },
  { id: 3, label: "Location" },
  { id: 4, label: "Socials" },
];

const STEP_FIELD_ORDER: Record<number, string[]> = {
  1: ["name", "phone", "email", "avatar", "password", "confirmPassword"],
  2: ["age", "weight", "dateOfBirth"],
  3: ["city", "state", "state_district", "county", "country", "postcode", "lat", "lng"],
  4: ["facebook", "instagram", "twitter"],
};

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
  const [step, setStep] = useState(1);
  const { getLocation, loading: detectingLocation } = useLocation();
  const submitLockRef = useRef(false);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [isCompact, setIsCompact] = useState(false);


  const [form, setForm] = useState<RegisterFormData>({
    role: "donor",
    isAvailable: true,
    avatar: null,
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

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const set = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const setRole = (role: "user" | "donor") => {
    setForm((prev) => ({
      ...prev,
      role,
      isAvailable: role === "donor" ? prev.isAvailable : false,
    }));
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

  const setFieldRef = (key: string) => (el: HTMLInputElement | null) => {
    fieldRefs.current[key] = el;
  };

  const focusField = (key: string) => {
    const target = fieldRefs.current[key];
    if (target) {
      target.focus();
      target.select?.();
    }
  };

  const focusNextField = (currentKey: string): boolean => {
    const order = STEP_FIELD_ORDER[step] || [];
    const currentIndex = order.indexOf(currentKey);
    if (currentIndex === -1) return false;
    const nextKey = order[currentIndex + 1];
    if (!nextKey) return false;
    focusField(nextKey);
    return true;
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    currentKey: string,
  ) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const moved = focusNextField(currentKey);
    if (!moved) {
      if (step === 4) {
        void handleSubmit();
      } else {
        next();
      }
    }
  };

  const handleDetectLocation = async () => {
    const result = await getLocation();
    if (!result) return;
    const { latitude, longitude, displayName, details } = result;
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        displayName,
        road: details.road || "",
        quarter: details.quarter || "",
        city: details.city || details.town || details.quarter || "",
        county: details.county || "",
        state_district: details.state_district || "",
        state: details.state || "",
        postcode: details.postcode || "",
        country: details.country || "",
        country_code: (details.country_code || "").toUpperCase(),
        coordinates: { lat: latitude, lng: longitude },
      },
    }));
  };

  const handleSubmit = async () => {
    if (loading || submitLockRef.current) return;
    if (!validateStep(4)) return;

    submitLockRef.current = true;
    const loadingToast = toast.loading("Creating account...");

    try {
      const locationResult = await getLocation();
      const finalForm = locationResult
        ? {
            ...form,
            location: {
              ...form.location,
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
          }
        : form;

      if (locationResult) {
        setForm(finalForm);
      }

      await register(finalForm);

      toast.success("Account created! Verify your email.", { id: loadingToast });
      navigate(`/verify-otp?email=${encodeURIComponent(finalForm.email.trim())}`);
    } catch (err: any) {
      const backendErrors = err?.response?.data?.errors;
      const message =
        (Array.isArray(backendErrors) && backendErrors.length > 0
          ? backendErrors[0]
          : undefined) ||
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        err?.message ||
        "Registration failed";
      toast.error(message, { id: loadingToast });
      setErrors({ submit: message });
    } finally {
      submitLockRef.current = false;
    }
  };

  const strength = getPasswordStrength(form.password);

  const setCoordinate = (axis: "lat" | "lng", value: string) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [axis]: value ? Number(value) : null,
        },
      },
    }));
  };

  return (
    <div
      style={{
        ...styles.page,
        gridTemplateColumns: isCompact ? "1fr" : styles.page.gridTemplateColumns,
      }}
    >
      {/* ── LEFT PANEL ── */}
      {!isCompact && (
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
      )}

      {/* ── RIGHT PANEL ── */}
      <div style={styles.right}>
        <div style={styles.rightInner}>
          {/* Role Toggle */}
          <div style={styles.roleToggleWrapper}>
            <div style={styles.roleToggleTrack}>
              <div
                style={{
                  ...styles.roleToggleSlider,
                  transform: form.role === "donor" ? "translateX(100%)" : "translateX(0)",
                }}
              />
              <button
                type="button"
                onClick={() => setRole("user")}
                style={{
                  ...styles.roleToggleBtn,
                  color: form.role === "user" ? "#fff" : "#888",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                User
              </button>
              <button
                type="button"
                onClick={() => setRole("donor")}
                style={{
                  ...styles.roleToggleBtn,
                  color: form.role === "donor" ? "#fff" : "#888",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                Donor
              </button>
            </div>
          </div>

          {/* Availability Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid #E8E2DA",
              background: "#F9F6F1",
              marginBottom: "1.2rem",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}>
                Available for donation
              </div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                {form.role === "donor"
                  ? "Visible to blood requesters"
                  : "Only donors can set availability"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => form.role === "donor" && set("isAvailable", !form.isAvailable)}
              disabled={form.role !== "donor"}
              style={{
                width: "48px",
                height: "26px",
                borderRadius: "13px",
                border: "none",
                background: form.isAvailable ? "#1D9E75" : "#D5D0CA",
                cursor: form.role === "donor" ? "pointer" : "not-allowed",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
                opacity: form.role === "donor" ? 1 : 0.7,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: form.isAvailable ? "25px" : "3px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
              />
            </button>
          </div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "1.4rem" }}>
            You can change availability later in your profile.
          </div>

          {/* Header */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={styles.formTitle}>Create your account</h2>
            <p style={styles.formSub}>
              Already have an account?{" "}
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
            <StepAccount
              form={form}
              errors={errors}
              strength={strength}
              set={set}
              setFieldRef={setFieldRef}
              handleInputKeyDown={handleInputKeyDown}
              onNext={next}
            />
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <StepHealth
              form={form}
              errors={errors}
              set={set}
              setFieldRef={setFieldRef}
              handleInputKeyDown={handleInputKeyDown}
              focusField={focusField}
              onNext={next}
              onBack={back}
            />
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <StepLocation
              form={form}
              errors={errors}
              detectingLocation={detectingLocation}
              setLocation={setLocation}
              setCoordinate={setCoordinate}
              setFieldRef={setFieldRef}
              handleInputKeyDown={handleInputKeyDown}
              onDetectLocation={handleDetectLocation}
              onNext={next}
              onBack={back}
            />
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <StepSocials
              form={form}
              errors={errors}
              loading={loading}
              setSocial={setSocial}
              setFieldRef={setFieldRef}
              handleInputKeyDown={handleInputKeyDown}
              onSubmit={handleSubmit}
              onBack={back}
            />
          )}
        </div>
      </div>
    </div>
  );
}
