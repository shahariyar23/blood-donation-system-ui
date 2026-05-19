import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hospitalLoginApi } from "../service/hospitalAuthService";
import { setHospital } from "../../../redux/slices/hospitalSlice";
import { useLocation } from "../../../hooks/useLocation";

/* ── Eye icons ──────────────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── stat badges ────────────────────────────────────────────── */
const stats = [
  { value: "2,400+", label: "Active donors" },
  { value: "98%",    label: "Eligibility accuracy" },
  { value: "< 2 hr", label: "Avg. approval time" },
];

/* ── dynamic year ───────────────────────────────────────────── */
const currentYear = new Date().getFullYear();

export default function HospitalLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [focused, setFocused]       = useState<string | null>(null);

  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const { getLocation } = useLocation();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Email is required";
    if (!password)          errs.password   = "Password is required";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const locationData = await getLocation();
      const res = await hospitalLoginApi({ email: identifier, password });
      if (!res.hospital) { toast.error("Hospital account required for this portal"); return; }
      dispatch(setHospital({ hospital: res.hospital, token: res.accessToken }));
      const city =
        locationData?.details?.city    ||
        locationData?.details?.town    ||
        locationData?.details?.village ||
        locationData?.details?.quarter;
      toast.success(city ? `Login successful (${city})` : "Login successful");
      navigate("/hospital");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = error?.response?.data?.message || "Login failed";
      toast.error(msg);
      if (error?.response?.status === 401 || error?.response?.status === 423)
        setErrors({ identifier: msg });
    } finally {
      setLoading(false);
    }
  };

  /* input field container classes */
  const fieldBox = (key: string, hasErr: boolean) =>
    [
      "flex items-center gap-3 rounded-xl border px-4 py-3 bg-white transition-all duration-200",
      hasErr
        ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
        : focused === key
          ? "border-red-400 shadow-[0_0_0_3px_rgba(192,57,43,0.1)]"
          : "border-gray-200 hover:border-gray-300",
    ].join(" ");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ════════════════════════════════
          LEFT PANEL
      ════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden
        bg-[#faf9f7] p-14 xl:p-20 border-r border-gray-100">

        {/* dot-grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* soft red glow bottom-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 w-96 h-96
            rounded-full bg-red-100/60 blur-[100px]"
        />

        {/* top content */}
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-red-500 mb-4">
            Hospital Portal
          </p>
          <h1 className="text-4xl xl:text-5xl font-semibold text-gray-900 leading-[1.15] mb-5">
            Approve donations<br />
            <span className="text-red-500">with confidence.</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Review donor reports, verify eligibility, and keep hospital
            blood availability accurate and up to date.
          </p>
        </div>

        {/* bottom: stats + shift note */}
        <div className="relative z-10">
          <div className="flex gap-8 mb-10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-red-500 mb-1.5">
                  Active shift note
                </p>
                <p className="text-sm text-red-900/60 leading-relaxed">
                  Pending approvals should be cleared within 24 hours to
                  keep donor availability accurate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT PANEL — form
      ════════════════════════════════ */}
      <div className="flex items-center justify-center min-h-screen bg-white p-6 relative overflow-hidden">

        {/* faint red glow top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-80 h-80
            rounded-full bg-red-50 blur-[80px]"
        />

        <div className="relative z-10 w-full max-w-md">

          {/* card */}
          <div className="rounded-2xl border border-gray-100 bg-white
            shadow-xl shadow-gray-100/80 overflow-hidden">

            {/* top accent bar */}
            <div className="h-1 bg-gradient-to-r from-red-400 via-red-500 to-rose-400" />

            <div className="p-8 sm:p-10">

              {/* heading */}
              <div className="mb-8">
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-red-500 mb-3">
                  Hospital Login
                </p>
                <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                  Sign in to the portal
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  Use your hospital account credentials.
                </p>
              </div>

              {/* fields */}
              <div className="space-y-4">

                {/* email */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className={fieldBox("email", !!errors.identifier)}>
                    <svg className="text-gray-300 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="3"/>
                      <path d="M2 7l10 7 10-7"/>
                    </svg>
                    <input
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setErrors(p => ({ ...p, identifier: "" })); }}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="hospital@example.com"
                      className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-300 outline-none"
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
                      <span>⚠</span>{errors.identifier}
                    </p>
                  )}
                </div>

                {/* password */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className={fieldBox("pass", !!errors.password)}>
                    <svg className="text-gray-300 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                      onFocus={() => setFocused("pass")}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-300 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                    >
                      {showPass ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
                      <span>⚠</span>{errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* submit */}
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loading}
                className="mt-7 w-full rounded-xl py-3 px-4 text-sm font-semibold text-white
                  tracking-wide bg-red-600 hover:bg-red-500 active:scale-[0.98]
                  disabled:bg-red-200 disabled:text-red-300 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-md shadow-red-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign in →"}
              </button>

              {/* divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-300 text-xs">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* donor link */}
              <p className="text-center text-xs text-gray-400">
                Need a donor account?{" "}
                <Link to="/login" className="text-red-500 font-semibold hover:text-red-600 transition-colors">
                  Donor login →
                </Link>
              </p>
            </div>

            {/* bottom accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          </div>

          {/* footer */}
          <p className="text-center text-gray-300 text-xs mt-6">
            Protected hospital portal &copy; {currentYear}
          </p>
        </div>
      </div>
    </div>
  );
}