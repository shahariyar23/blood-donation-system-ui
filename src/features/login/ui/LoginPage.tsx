import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLocation } from "../../../hooks/useLocation";
import { loginApi } from "../service/loginService";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/slices/userSlice";

// ── Component ──────────────────────────────────────────────
export default function LoginPage() {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();
  const { getLocation } = useLocation();

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Email or phone is required";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (): Promise<void> => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const locationData = await getLocation();
      const res = await loginApi({
        identifier,
        password,
        location: {
          city:
            locationData?.details?.city ||
            locationData?.details?.town ||
            locationData?.details?.village ||
            locationData?.details?.quarter ||
            "",
          country: locationData?.details?.country || "",
          country_code: locationData?.details?.country_code || "",
          county: locationData?.details?.county || "",
          postcode: locationData?.details?.postcode || "",
          state: locationData?.details?.state || "",
          state_district: locationData?.details?.state_district || "",
          coordinates: {
            lat: locationData?.latitude,
            lng: locationData?.longitude,
          },
        },
      });
      toast.success(res?.message);
      dispatch(setUser({ user: res.data?.user, token: res.data?.accessToken }));
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const msg = error?.response?.data?.message || "Login failed";
      toast.error(msg);
      if (error?.response?.status === 401 || error?.response?.status === 423) {
        setErrors({ identifier: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !loading) void handleSubmit();
  };

  const inputClass = (hasError: boolean) =>
    [
      "w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition",
      "bg-gray-50 text-gray-900 border-gray-300",
      "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20",
      hasError ? "border-red-500 bg-red-50 focus:ring-red-500/20" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden text-white
          bg-[linear-gradient(135deg,#7f1d1d_0%,#991b1b_45%,#b91c1c_100%)]"
      >
        <div className="absolute -top-[120px] -right-[120px] w-[420px] h-[420px] rounded-full
          bg-red-500/20 blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-[100px] -left-[100px] w-[350px] h-[350px] rounded-full
          bg-red-700/20 blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              🩸
            </div>
            <span className="text-lg font-semibold tracking-[0.3px]">
              BloodConnect
            </span>
          </div>

          <span className="text-[11px] tracking-[2px] uppercase bg-white/10 px-3 py-1 rounded-full text-white/85">
            Donor Login
          </span>

          <h1 className="text-[38px] font-bold leading-tight mt-6 mb-5">
            Give the gift of life.{" "}
            <span className="text-red-300">One drop at a time.</span>
          </h1>

          <p className="text-white/65 text-sm leading-relaxed max-w-[340px]">
            Join thousands of verified donors making a real difference in their
            communities every day.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          {(
            [
              { title: "12K+", sub: "Active donors" },
              { title: "98%", sub: "Match success" },
              { title: "64", sub: "Districts covered" },
              { title: "3min", sub: "Avg response" },
            ] as const
          ).map((s) => (
            <div
              key={s.sub}
              className="bg-white/10 border border-white/10 rounded-xl p-4"
            >
              <div className="text-[22px] font-bold">{s.title}</div>
              <div className="text-xs text-white/55 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-[#fafafa] p-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-[-0.3px]">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500">
              Sign in to continue saving lives
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">

            {/* identifier */}
            <div className="mb-4">
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email or phone
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setIdentifier(e.target.value);
                  setErrors((p) => ({ ...p, identifier: "" }));
                }}
                onKeyDown={onKeyDown}
                placeholder="masudhasanantorsarker@gmail.com"
                autoComplete="username"
                className={inputClass(!!errors.identifier)}
              />
              {errors.identifier && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.identifier}
                </p>
              )}
            </div>

            {/* password */}
            <div className="mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputClass(!!errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* forgot */}
            <div className="text-right mb-6">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-red-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* submit */}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="w-full rounded-md bg-[#c0392b] px-4 py-2.5 text-sm font-semibold text-white
                transition hover:bg-[#a93226] disabled:cursor-not-allowed disabled:bg-[#e5a8a2]
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <path
                      fill="currentColor"
                      opacity="0.75"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#c0392b] font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
