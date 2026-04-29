import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../../redux/slices/userSlice";
import { useLocation } from "../../../hooks/useLocation";
import { adminLoginApi } from "../service/adminService.ts";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getLocation } = useLocation();

  const inputClass = (hasError: boolean) =>
    [
      "w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition",
      "bg-white text-gray-900 border-gray-300",
      "focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15",
      hasError ? "border-red-500 bg-red-50" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Email or phone is required";
    if (!password) errs.password = "Password is required";
    return errs;
  };

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
      const response = await adminLoginApi({
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
            lat: locationData?.latitude || null,
            lng: locationData?.longitude || null,
          },
        },
      });

      const user = response.data?.user;
      const accessToken = response.data?.accessToken;
      if (!user || !accessToken) {
        throw new Error("Invalid login response");
      }

      if (user.role !== "admin") {
        toast.error("Admin account required");
        return;
      }

      dispatch(setUser({ user, token: accessToken }));
      toast.success(response.message || "Admin login successful");
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const message = error?.response?.data?.message || "Admin login failed";
      toast.error(message);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setErrors({ identifier: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] p-6">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
        <p className="text-xs uppercase tracking-[3px] text-gray-400">Admin Login</p>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Control center access</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Use your admin credentials to continue.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or phone</label>
            <input
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrors((prev) => ({ ...prev, identifier: "" }));
              }}
              className={inputClass(!!errors.identifier)}
              placeholder="admin@bloodconnect.com"
            />
            {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: "" }));
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
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}
