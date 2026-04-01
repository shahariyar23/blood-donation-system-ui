import { useState } from "react";
import { Link } from "react-router-dom";
import Form from "../../../shared/components/Form";
import type { Field } from "../../../shared/components/Form";
import { Icons } from "../../../shared/icons/Icons";
import { useLocation } from "../../../hooks/useLocation";

// ── Validation ─────────────────────────────────────────
const validateIdentifier = (value: string): string | null => {
  if (!value) return "Email or phone is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) return null;
  const digits   = value.replace(/\D/g, "");
  const bdPhone  = /^(01[3-9]\d{8})$|^(8801[3-9]\d{8})$/;
  if (bdPhone.test(digits)) return null;
  return "Enter a valid email or Bangladeshi phone number";
};

const LoginPage = () => {
  const [values,  setValues]  = useState({ identifier: "", password: "" });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });
    }
  };


const { getLocation} = useLocation();


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const identifierError = validateIdentifier(values.identifier);
  if (identifierError) {
    setErrors({ identifier: identifierError });
    return;
  }

  if (!values.password) {
    setErrors({ password: "Password is required" });
    return;
  }

  setErrors({});
  setLoading(true);

  // 🔥 Get user location
  const location = await getLocation();

  console.log("LOGIN LOCATION:", location);

  // 🔥 Send login data
  const payload = {
    identifier: values.identifier,
    password: values.password,
    location: location
      ? location
      : null,
  };

  console.log("LOGIN PAYLOAD:", payload);

  // simulate API
  setTimeout(() => {
    setLoading(false);
    setSuccess(true);
  }, 2000);
};
  
  const fields: Field[] = [
    {
      name:        "identifier",
      label:       "Email or Phone",
      type:        "text",
      required:    true,
      placeholder: "your@email.com or 017XXXXXXXX",
      icon:        Icons.User,
    },
    {
      name:        "password",
      label:       "Password",
      type:        "password",
      required:    true,
      placeholder: "••••••••",
      icon:        Icons.Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-light flex items-stretch">

      {/* ── Left panel — decorative ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden
        flex-col items-center justify-center p-12 text-center">

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full border border-white/5" />
        <div className="absolute top-16  -left-8  w-44 h-44 rounded-full border border-white/5" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute bottom-12 right-8 w-40 h-40 rounded-full border border-primary/10" />

        {/* Content */}
        <div className="relative z-10 max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xs bg-primary center-flex shadow-xl">
              <Icons.Blood className="!w-6 !h-6 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-white">
              Blood<span className="text-primary">Connect</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-serif text-3xl font-bold text-white leading-snug mb-4">
            Every Login<br />
            <span className="text-primary">Saves a Life</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            Sign in to access your donor profile, track requests,
            and connect with those who need your help most.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "12K+", label: "Lives Saved"    },
              { value: "8.9K", label: "Active Donors"  },
              { value: "64",   label: "Districts"      },
            ].map(({ value, label }) => (
              <div key={label}
                className="bg-white/5 rounded-xs px-3 py-4 border border-white/10
                  hover:bg-white/10 transition-colors">
                <p className="font-serif font-black text-white text-lg leading-none">{value}</p>
                <p className="text-white/40 text-xxs uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-8 bg-white/5 rounded-xs p-5 border border-white/10 text-left">
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-white/70 text-xs italic leading-relaxed">
              "BloodConnect found a donor for my father in under 10 minutes.
              This platform saved his life."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 center-flex
                font-bold text-primary text-xs shrink-0">R</div>
              <div>
                <p className="text-white text-xs font-semibold">Rahim Uddin</p>
                <p className="text-white/40 text-xxs">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xs bg-primary center-flex">
              <Icons.Blood className="!w-5 !h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-dark">
              Blood<span className="text-primary">Connect</span>
            </span>
          </div>

          {success ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 center-flex mx-auto mb-5 shadow-md">
                <Icons.Check className="!w-7 !h-7 text-green-600" />
              </div>
              <h2 className="font-serif text-xl font-bold text-dark mb-2">Welcome Back!</h2>
              <p className="text-gray-500 text-sm mb-6">You've signed in successfully.</p>
              <Link to="/" className="btn-primary text-sm">
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 bg-primary" />
                  <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
                    Welcome Back
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-dark">
                  Sign In to Your Account
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary font-semibold hover:underline">
                    Register free
                  </Link>
                </p>
              </div>

              {/* Social login */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2
                  border border-gray-200 rounded-xs py-2.5 text-sm font-medium text-dark
                  hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button className="flex-1 flex items-center justify-center gap-2
                  border border-gray-200 rounded-xs py-2.5 text-sm font-medium text-dark
                  hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                  <Icons.Facebook className="!w-4 !h-4 text-blue-600" />
                  Facebook
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or sign in with credentials</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Form */}
              <Form
                fields={fields}
                values={values}
                onChange={handleChange}
                onSubmit={handleSubmit}
                errors={errors}
                loading={loading}
                submitText={
                  <span className="flex items-center gap-2">
                    <Icons.ArrowForward className="!w-4 !h-4" />
                    Sign In
                  </span>
                }
                footer={
                  <div className="space-y-4 mt-2">
                    {/* Forgot password */}
                    <div className="text-right -mt-3">
                      <Link to="/forgot-password"
                        className="text-xs text-primary hover:underline font-medium">
                        Forgot password?
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs text-gray-400">new here?</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Register link */}
                    <Link to="/register"
                      className="w-full btn-outline text-sm center-flex gap-2 py-2.5">
                      <Icons.User className="!w-4 !h-4" />
                      Create an Account
                    </Link>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                      {[
                        { icon: Icons.Shield, text: "Secure Login"    },
                        { icon: Icons.Check,  text: "Verified Donors" },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-1.5 text-gray-400">
                          <Icon className="!w-3 !h-3" />
                          <span className="text-xxs">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;