import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLocation } from "../../../hooks/useLocation";
import { loginApi } from "../service/loginService";

// ── Component ──────────────────────────────────────────────
export default function LoginPage() {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {getLocation} = useLocation()

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Email or phone is required";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (): Promise<void> => {
    // e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const locationData = await getLocation();
      console.log(locationData)
      const res = await loginApi({identifier, password, location: {city:
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
          lng: locationData?.longitude}}});
          console.log(res)
      // toast.success(res?.message);
      // dispatch(setUser({ user: res.data?.user, token: res.data?.accessToken }));
    } catch (err: unknown) {
      console.log(err);
      
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

  // ── Styles ─────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#111827",
    background: "#f9fafb",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
  };

  const inputError: React.CSSProperties = {
    ...inputBase,
    borderColor: "#ef4444",
    background: "#fff5f5",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  };

  const errorText: React.CSSProperties = {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    e.target.style.borderColor = "#c0392b";
    e.target.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.1)";
    e.target.style.background = "#ffffff";
  };

  const onBlur =
    (hasErr: boolean) =>
    (e: React.FocusEvent<HTMLInputElement>): void => {
      e.target.style.borderColor = hasErr ? "#ef4444" : "#e5e7eb";
      e.target.style.boxShadow = "none";
      e.target.style.background = hasErr ? "#fff5f5" : "#f9fafb";
    };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: "50%",
          background:
            "linear-gradient(135deg, #7f1d1d 0%, #991b1b 45%, #b91c1c 100%)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "420px",
            height: "420px",
            background: "rgba(239,68,68,0.2)",
            borderRadius: "50%",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "350px",
            height: "350px",
            background: "rgba(185,28,28,0.2)",
            borderRadius: "50%",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🩸
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "600",
                letterSpacing: "0.3px",
              }}
            >
              BloodConnect
            </span>
          </div>

          <span
            style={{
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.1)",
              padding: "4px 12px",
              borderRadius: "20px",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Donor Login
          </span>

          <h1
            style={{
              fontSize: "38px",
              fontWeight: "700",
              lineHeight: "1.2",
              margin: "24px 0 20px",
            }}
          >
            Give the gift of life.{" "}
            <span style={{ color: "#fca5a5" }}>One drop at a time.</span>
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "14px",
              lineHeight: "1.7",
              maxWidth: "340px",
            }}
          >
            Join thousands of verified donors making a real difference in their
            communities every day.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
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
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "22px", fontWeight: "700" }}>
                {s.title}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.55)",
                  marginTop: "4px",
                }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#111827",
                margin: "0 0 4px",
                letterSpacing: "-0.3px",
              }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Sign in to continue saving lives
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {/* demo hint */}
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "#92400e",
                lineHeight: "1.8",
              }}
            >
              <strong>🔑 Demo credentials</strong>
              <br />
              Email: masudhasanantorsarker@gmail.com
              <br />
              Password: masud123
            </div>

            {/* identifier */}
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="identifier" style={labelStyle}>
                Email or phone
                <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setIdentifier(e.target.value);
                  setErrors((p) => ({ ...p, identifier: "" }));
                }}
                onFocus={onFocus}
                onBlur={onBlur(!!errors.identifier)}
                onKeyDown={onKeyDown}
                placeholder="masudhasanantorsarker@gmail.com"
                autoComplete="username"
                style={errors.identifier ? inputError : inputBase}
              />
              {errors.identifier && (
                <p style={errorText}>
                  <span>⚠</span> {errors.identifier}
                </p>
              )}
            </div>

            {/* password */}
            <div style={{ marginBottom: "8px" }}>
              <label htmlFor="password" style={labelStyle}>
                Password
                <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  onFocus={onFocus}
                  onBlur={onBlur(!!errors.password)}
                  onKeyDown={onKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    ...(errors.password ? inputError : inputBase),
                    paddingRight: "44px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: "16px",
                    padding: "2px",
                    lineHeight: "1",
                  }}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && (
                <p style={errorText}>
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* forgot */}
            <div style={{ textAlign: "right", marginBottom: "24px" }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  textDecoration: "none",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  (e.currentTarget.style.color = "#c0392b")
                }
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  (e.currentTarget.style.color = "#6b7280")
                }
              >
                Forgot password?
              </Link>
            </div>

            {/* submit */}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                background: loading ? "#e5a8a2" : "#c0392b",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!loading) e.currentTarget.style.background = "#a93226";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!loading) e.currentTarget.style.background = "#c0392b";
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{
                      width: "16px",
                      height: "16px",
                      animation: "spin 0.7s linear infinite",
                    }}
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
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Signing in...
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#6b7280",
              marginTop: "20px",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#c0392b",
                fontWeight: "500",
                textDecoration: "none",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
