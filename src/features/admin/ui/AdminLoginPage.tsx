// Maintenance review: September 2026
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../../redux/slices/userSlice";
import { useLocation } from "../../../hooks/useLocation";
import { adminLoginApi } from "../service/adminService.ts";
import { transformLocationToLoginFormat, type NominatimResponse } from "../../../utilities/locationTransformer";

/* ── Eye icons ──────────────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── dynamic year ───────────────────────────────────────────── */
const currentYear = new Date().getFullYear();

export default function AdminLoginPage() {
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
    if (!identifier.trim()) errs.identifier = "Email or phone is required";
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

      let transformedLocation;
      if (locationData?.details) {
        const nominatimResponse: NominatimResponse = {
          display_name: locationData.displayName || "",
          lat: locationData.latitude || 0,
          lon: locationData.longitude || 0,
          address: locationData.details,
        };
        transformedLocation = transformLocationToLoginFormat(
          nominatimResponse,
          locationData.latitude,
          locationData.longitude
        );
      } else {
        transformedLocation = {
          displayName: "", road: "", quarter: "", suburb: "", city: "",
          county: "", state_district: "", state: "", postcode: "",
          country: "", country_code: "", coordinates: { lat: 0, lng: 0 },
        };
      }

      const response = await adminLoginApi({ identifier, password, location: transformedLocation });
      const user        = response.data?.user;
      const accessToken = response.data?.accessToken;

      if (!user || !accessToken) throw new Error("Invalid login response");
      if (user.role !== "admin") { toast.error("Admin account required"); return; }

      dispatch(setUser({ user, token: accessToken }));
      toast.success(response.message || "Admin login successful");
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number } };
      const message = error?.response?.data?.message || "Admin login failed";
      toast.error(message);
      if (error?.response?.status === 401 || error?.response?.status === 403)
        setErrors({ identifier: message });
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
          ? "border-slate-400 shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
          : "border-gray-200 hover:border-gray-300",
    ].join(" ");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ════════════════════════════════
          LEFT PANEL — decorative
      ════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden
        bg-slate-950 p-14 xl:p-20">

        {/* grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* radial glow — top right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px]
            rounded-full bg-slate-700/30 blur-[120px]"
        />

        {/* radial glow — bottom left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96
            rounded-full bg-slate-600/20 blur-[100px]"
        />

        {/* top content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            border border-white/10 bg-white/5 mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/50 text-[10px] font-semibold tracking-widest uppercase">
              Secure Access
            </span>
          </div>

          <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-slate-400 mb-4">
            Admin Portal
          </p>
          <h1 className="text-4xl xl:text-5xl font-semibold text-white leading-[1.15] mb-5">
            Control center<br />
            <span className="text-slate-400">at your command.</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            Manage users, oversee operations, and keep the platform
            running at full health.
          </p>
        </div>

        {/* bottom: permission badges + note */}
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600 mb-3">
            Access level
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {["User management", "Donor oversight", "Hospital approval", "Analytics", "System config"].map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-full border border-white/8 bg-white/5
                  text-[10px] font-medium text-slate-400"
              >
                {p}
              </span>
            ))}
          </div>

          {/* warning note */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <div className="flex items-start gap-3">
              <svg className="text-amber-400 shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-400 mb-1.5">
                  Restricted access
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This portal is for authorised administrators only.
                  Unauthorised access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT PANEL — form
      ════════════════════════════════ */}
      <div className="flex items-center justify-center min-h-screen bg-[#f8f8f6] p-6 relative overflow-hidden">

        {/* subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* faint glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-80 h-80
            rounded-full bg-slate-200/50 blur-[80px]"
        />

        <div className="relative z-10 w-full max-w-md">

          {/* card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white
            shadow-xl shadow-slate-200/60 overflow-hidden">

            {/* top accent bar — slate gradient */}
            <div className="h-1 bg-gradient-to-r from-slate-600 via-slate-800 to-slate-900" />

            <div className="p-8 sm:p-10">

              {/* shield icon + heading */}
              <div className="mb-8">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>

                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mb-3">
                  Admin Login
                </p>
                <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                  Control center access
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  Use your admin credentials to continue.
                </p>
              </div>

              {/* fields */}
              <div className="space-y-4">

                {/* identifier */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-2">
                    Email or phone <span className="text-red-400">*</span>
                  </label>
                  <div className={fieldBox("id", !!errors.identifier)}>
                    <svg className="text-gray-300 shrink-0" width="15" height="15" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="3"/>
                      <path d="M2 7l10 7 10-7"/>
                    </svg>
                    <input
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setErrors(p => ({ ...p, identifier: "" })); }}
                      onFocus={() => setFocused("id")}
                      onBlur={() => setFocused(null)}
                      placeholder="admin@example.com"
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
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className={fieldBox("pass", !!errors.password)}>
                    <svg className="text-gray-300 shrink-0" width="15" height="15" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.8">
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
                  tracking-wide bg-slate-900 hover:bg-slate-800 active:scale-[0.98]
                  disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-md shadow-slate-200"
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

              {/* security note */}
              <div className="mt-5 flex items-center gap-2 justify-center">
                <svg className="text-gray-300" width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p className="text-[11px] text-gray-300">
                  All login activity is encrypted and monitored
                </p>
              </div>
            </div>

            {/* bottom accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          </div>

          {/* footer */}
          <p className="text-center text-gray-300 text-xs mt-6">
            Admin control panel &copy; {currentYear}
          </p>
        </div>
      </div>
    </div>
  );
}