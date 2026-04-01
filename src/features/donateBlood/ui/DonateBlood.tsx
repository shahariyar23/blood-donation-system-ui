import { useState } from "react";
import Form, { type Field } from "../../../shared/components/Form";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import { useLocation, type LocationDetails } from "../../../hooks/useLocation";
// ── Validation helpers ─────────────────────────────────
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Enter a valid email address';
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';
  const digits = phone.replace(/\D/g, '');
  const bdPhone = /^(01[3-9]\d{8})$|^(8801[3-9]\d{8})$/;
  if (!bdPhone.test(digits)) return 'Enter a valid Bangladeshi phone number';
  return null;
};

const validateName = (name: string): string | null => {
  if (!name) return 'Full name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

const validateWeight = (weight: string): string | null => {
  if (!weight) return 'Weight is required';
  const w = Number(weight);
  if (isNaN(w) || w < 50) return 'Weight must be at least 50 kg';
  return null;
};

// ── Normalize Facebook ─────────────────────────────────
const normalizeFacebook = (input: string): string => {
  if (!input) return '';
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  let username = input.startsWith('@') ? input.slice(1) : input;
  if (username.includes('/')) username = username.split('/').pop()!;
  return `https://www.facebook.com/${username}`;
};

// ── Blood types ───────────────────────────────────────
const bloodTypeOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

// ── Eligibility card (UNCHANGED) ──────────────────────
const EligibilityCard = () => (
  <div className="bg-white rounded-xs shadow-md p-6">
    <h3 className="font-serif text-xl font-bold text-dark mb-5">
      Donor Eligibility
    </h3>
    <ul className="space-y-3 text-dark/80">
      {[
        "Age between 18 and 65 years",
        "Weight at least 50 kg",
        "Healthy and free from infections",
        "No recent tattoos or surgeries (last 6 months)",
        "Not pregnant or breastfeeding",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <Icons.Check className="!w-4 !h-4 text-primary shrink-0 mt-0.5" />
          <span className="text-sm">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ── Main component ─────────────────────────────────────
const DonateBlood = () => {
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodType: '',
    location: '',
    latitude: '',
    longitude: '',
    locationDetails: null as LocationDetails | null,
    weight: '',
    lastDonation: '',
    facebook: '',
    isAvailable: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ use shared hook
  const {
    getLocation,
    loading: locationLoading,
    helper: locationHelper,
  } = useLocation();

  // ── Handle change ───────────────────────────
  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => { const e = { ...prev }; delete e[name]; return e; });
    }

    if (name === 'location') {
      setValues(prev => ({
        ...prev,
        location: value,
        latitude: '',
        longitude: '',
        locationDetails: null,
      }));
    }
  };

  // ── Detect location ─────────────────────────
  const handleDetectLocation = async () => {
    const data = await getLocation();
    if (!data) return;
    const locationData = data?.details?.quarter + "," + data?.details?.road;
    // 🔥 FULL LOCATION LOG
    console.log("FULL LOCATION DATA:", {
      displayName: data.displayName,
      latitude: data.latitude,
      longitude: data.longitude,
      details: data.details,
    });
    setValues(prev => ({
      ...prev,
      location: locationData ? locationData : data.displayName,
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
      locationDetails: data.details,
    }));

    setErrors(prev => { const e = { ...prev }; delete e.location; return e; });
  };

  // ── Location button (UNCHANGED UI) ──────────
  const locationAction = (
    <CustomButton
      type="button"
      variant="ghost"
      size="xs"
      onClick={handleDetectLocation}
      disabled={locationLoading}
      className="!p-1 h-7 w-7"
    >
      {locationLoading
        ? <Icons.Loading className="!w-4 !h-4 animate-spin text-primary" />
        : <Icons.Location className="!w-4 !h-4 text-primary" />
      }
    </CustomButton>
  );

  // ── Validation ─────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateName(values.fullName);
    const emailErr = validateEmail(values.email);
    const phoneErr = validatePhone(values.phone);
    const weightErr = validateWeight(values.weight);

    if (nameErr) newErrors.fullName = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (phoneErr) newErrors.phone = phoneErr;
    if (!values.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!values.location) newErrors.location = 'Location is required';
    if (weightErr) newErrors.weight = weightErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const submitData = {
      ...values,
      facebook: normalizeFacebook(values.facebook),
      latitude: values.latitude ? Number(values.latitude) : null,
      longitude: values.longitude ? Number(values.longitude) : null,
    };

    console.log('FINAL SUBMIT DATA:', submitData);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  // ── Fields (UNCHANGED UI) ───────────────────
  const fields: Field[] = [
    { name: 'fullName', placeholder: 'Mostak Shahariyar', label: 'Full Name', type: 'text', required: true },
    { name: 'email', placeholder: 'mostak@gmail.com',label: 'Email', type: 'email', required: true },
    { name: 'phone', placeholder: '0176666666',label: 'Phone', type: 'tel', required: true },
    {
      name: 'bloodType',
      label: 'Blood Type',
      type: 'select',
      required: true,
      options: bloodTypeOptions,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      helperText: locationHelper,
    },
    { name: 'weight', placeholder: '50', label: 'Weight', type: 'number', required: true },
  ];

 if (submitted) {
  return (
    <SectionContainer>
      <MainContainer>
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-10 text-center">

          <div className="w-16 h-16 rounded-full bg-green-100 center-flex mx-auto mb-5">
            <Icons.Check className="!w-7 !h-7 text-green-600" />
          </div>

          <h2 className="font-serif text-xl font-bold text-dark mb-2">
            Registration Successful!
          </h2>

          <p className="text-gray-500 text-sm mb-4">
            Thank you <strong>{values.fullName}</strong>. Your donor profile
            is under review.
          </p>

          {values.latitude && (
            <p className="text-green-600 text-xs font-semibold mb-6">
              📍 Location verified automatically
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSubmitted(false)}
              className="btn-outline text-sm"
            >
              Register Another
            </button>

            <a href="/find-donor" className="btn-primary text-sm text-center">
              Find Donors
            </a>
          </div>

        </div>
      </MainContainer>
    </SectionContainer>
  );
}

return (
  <SectionContainer>
    <MainContainer>

      {/* 🔥 Fancy Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-10 bg-primary" />
          <span className="text-primary text-xs font-bold tracking-widest uppercase">
            Save Lives
          </span>
        </div>

        <SectionHeading title="Become a Donor" />

        <p className="text-dark/60 text-sm mt-2 max-w-xl">
          Join our mission and help people in urgent need. Your single donation
          can save up to <span className="font-semibold text-primary">3 lives</span>.
        </p>
      </div>

      {/* 🔥 Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* 🔥 Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">

          {/* Card Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-primary/10 center-flex">
              <Icons.Blood className="!w-5 !h-5 text-primary" />
            </div>

            <div>
              <h2 className="font-serif font-bold text-dark text-lg">
                Donor Registration
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Fill in your details to get started
              </p>
            </div>
          </div>

          {/* Form */}
          <Form
            
            fields={fields}
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            errors={errors}
            fieldActions={{ location: locationAction }}
            loading={loading}
            submitText={
              <span className="flex items-center gap-2">
                <Icons.Check className="!w-4 !h-4" />
                Register as Donor
              </span>
            }
          />

        </div>

        {/* 🔥 Sidebar */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/10 p-5 shadow-sm">
            <EligibilityCard />
          </div>
        </div>

      </div>
    </MainContainer>
  </SectionContainer>
);
};

export default DonateBlood;