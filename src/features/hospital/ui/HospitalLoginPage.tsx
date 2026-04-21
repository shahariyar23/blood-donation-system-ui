import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hospitalLoginApi } from "../service/hospitalAuthService";
import { setHospital } from "../../../redux/slices/hospitalSlice";
import { useLocation } from "../../../hooks/useLocation";

export default function HospitalLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLocation } = useLocation();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Email is required";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const inputClass = (hasError: boolean) =>
    [
      "w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition",
      "bg-white text-gray-900 border-gray-300",
      "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
      hasError ? "border-red-500 bg-red-50" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const locationData = await getLocation();
      const res = await hospitalLoginApi({
        email: identifier,
        password,
      });

      if (!res.hospital) {
        toast.error("Hospital account required for this portal");
        return;
      }

      dispatch(setHospital({ hospital: res.hospital, token: res.accessToken }));
      const city =
        locationData?.details?.city ||
        locationData?.details?.town ||
        locationData?.details?.village ||
        locationData?.details?.quarter;
      toast.success(city ? `Login successful (${city})` : "Login successful");
      navigate("/hospital");
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

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-light">
      <div className="hidden lg:flex flex-col justify-between p-16 bg-white border-r border-gray-100">
        <div>
          <p className="text-xs uppercase tracking-[4px] text-gray-400">Hospital</p>
          <h1 className="text-4xl font-semibold text-gray-900 mt-4 leading-tight">
            Approve donations with confidence.
          </h1>
          <p className="text-sm text-gray-500 mt-4 max-w-sm">
            Review donor reports, verify eligibility, and keep hospital blood
            availability up to date.
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 border border-red-100 p-6">
          <p className="text-xs uppercase tracking-[2px] text-red-500">Shift note</p>
          <p className="text-sm text-red-900 mt-2">
            Pending approvals should be cleared within 24 hours to keep donor
            availability accurate.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-105 bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[3px] text-gray-400">
              Hospital Login
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-2">
              Sign in to the portal
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Use your hospital account credentials.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrors((p) => ({ ...p, identifier: "" }));
                }}
                className={inputClass(!!errors.identifier)}
                placeholder="hospital@example.com"
              />
              {errors.identifier && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.identifier}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  className={`${inputClass(!!errors.password)} pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="mt-6 w-full rounded-md bg-[#c0392b] px-4 py-2.5 text-sm font-semibold text-white
              transition hover:bg-[#a93226] disabled:cursor-not-allowed disabled:bg-[#e5a8a2]"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-4 text-xs text-gray-500">
            Need a donor account?{" "}
            <Link to="/login" className="text-red-600 font-semibold hover:underline">
              Donor login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
