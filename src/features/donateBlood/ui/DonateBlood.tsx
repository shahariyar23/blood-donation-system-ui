import { useState } from 'react';
import Form, { type Field } from '../../../shared/components/Form';
import MainContainer from '../../../shared/main-container/MainContainer';
import SectionContainer from '../../../shared/section-container/SectionContainer';
import SectionHeading from '../../../shared/section-heading/SectionHeading';
import CustomButton from '../../../shared/button/CustomButton';
import { Icons } from '../../../shared/icons/Icons';

// ── Types ──────────────────────────────────────────────
interface LocationDetails {
  city?:           string;
  town?:           string;
  village?:        string;
  county?:         string;
  state_district?: string;
  state?:          string;
  postcode?:       string;
  country?:        string;
  country_code?:   string;
}

// ── Validation helpers ─────────────────────────────────
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email)                    return 'Email is required';
  if (!emailRegex.test(email))   return 'Enter a valid email address';
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';
  const digits    = phone.replace(/\D/g, '');
  const bdPhone   = /^(01[3-9]\d{8})$|^(8801[3-9]\d{8})$/;
  if (!bdPhone.test(digits)) return 'Enter a valid Bangladeshi phone number';
  return null;
};

const validateName = (name: string): string | null => {
  if (!name)              return 'Full name is required';
  if (name.length < 2)    return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

const validateWeight = (weight: string): string | null => {
  if (!weight)                     return 'Weight is required';
  const w = Number(weight);
  if (isNaN(w) || w < 50)          return 'Weight must be at least 50 kg';
  return null;
};

// ── Reverse geocode ────────────────────────────────────
const reverseGeocode = async (
  lat: number,
  lon: number
): Promise<{ displayName: string; details: LocationDetails }> => {
  const url  = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const res  = await fetch(url, { headers: { 'User-Agent': 'BloodConnect/1.0' } });
  const data = await res.json();
  const addr = data.address;
  const displayName = addr.city || addr.town || addr.village || addr.county || 'Unknown location';
  return { displayName, details: addr };
};

// ── Normalize Facebook input ───────────────────────────
const normalizeFacebook = (input: string): string => {
  if (!input) return '';
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  let username = input.startsWith('@') ? input.slice(1) : input;
  if (username.includes('/')) username = username.split('/').pop()!;
  return `https://www.facebook.com/${username}`;
};

// ── Blood type options ─────────────────────────────────
const bloodTypeOptions = [
  { value: 'A+',  label: 'A+'  },
  { value: 'A-',  label: 'A-'  },
  { value: 'B+',  label: 'B+'  },
  { value: 'B-',  label: 'B-'  },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+',  label: 'O+'  },
  { value: 'O-',  label: 'O-'  },
];

// ── Eligibility info card ──────────────────────────────
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
          {/* FIX: !w-4 !h-4 overrides createIcon default w-5 h-5 */}
          <Icons.Check className="!w-4 !h-4 text-primary shrink-0 mt-0.5" />
          <span className="text-sm">{item}</span>
        </li>
      ))}
    </ul>

    <div className="mt-6 p-4 bg-light rounded-xs flex items-center gap-2">
      <Icons.Heartbeat className="!w-4 !h-4 text-primary shrink-0" />
      <p className="text-sm text-dark/70">
        Your one donation can save up to <strong>three lives</strong>.
      </p>
    </div>

    {/* Donation process steps */}
    <div className="mt-5 border-t border-gray-100 pt-5">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        After Registration
      </p>
      {[
        { step: "01", text: "Profile reviewed within 24 hours"       },
        { step: "02", text: "Donors in your area can contact you"     },
        { step: "03", text: "Donate when you're available and ready"  },
      ].map(({ step, text }) => (
        <div key={step} className="flex items-center gap-3 mb-3 last:mb-0">
          <span className="w-6 h-6 rounded-xs bg-primary/10 center-flex
            text-xxs font-black text-primary shrink-0">
            {step}
          </span>
          <span className="text-xs text-gray-500">{text}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────
const DonateBlood = () => {
  const [values, setValues] = useState({
    fullName:        '',
    email:           '',
    phone:           '',
    bloodType:       '',
    location:        '',
    latitude:        '',
    longitude:       '',
    locationDetails: null as LocationDetails | null,
    weight:          '',
    lastDonation:    '',
    facebook:        '',
    isAvailable:     false,
  });

  const [loading,         setLoading]         = useState(false);
  const [submitted,       setSubmitted]       = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationHelper,  setLocationHelper]  = useState('Click 📍 to auto-detect your location');

  // ── Field change handler ───────────────────────────
  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // clear error on change
    if (errors[name]) {
      setErrors(prev => { const e = { ...prev }; delete e[name]; return e; });
    }

    // reset coords when user manually edits location
    if (name === 'location') {
      setValues(prev => ({
        ...prev,
        location:        value,
        latitude:        '',
        longitude:       '',
        locationDetails: null,
      }));
      setLocationHelper('Click 📍 to auto-detect your location');
    }
  };

  // ── Auto-detect location ───────────────────────────
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationHelper('Geolocation not supported by your browser');
      return;
    }
    setLocationLoading(true);
    setLocationHelper('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { displayName, details } = await reverseGeocode(latitude, longitude);
          setValues(prev => ({
            ...prev,
            location:        displayName,
            latitude:        latitude.toString(),
            longitude:       longitude.toString(),
            locationDetails: details,
          }));
          setErrors(prev => { const e = { ...prev }; delete e.location; return e; });
          setLocationHelper('✓ Location detected automatically');
        } catch {
          setLocationHelper('Could not detect location. Please enter manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationHelper('Permission denied. Please enter location manually.');
        setLocationLoading(false);
      }
    );
  };

  // ── Location action button ─────────────────────────
  const locationAction = (
    <CustomButton
      type="button"
      variant="ghost"
      size="xs"
      onClick={getCurrentLocation}
      disabled={locationLoading}
      className="!p-1 h-7 w-7"
    >
      {locationLoading
        ? <Icons.Loading className="!w-4 !h-4 animate-spin text-primary" />
        : <Icons.Location className="!w-4 !h-4 text-primary" />
      }
    </CustomButton>
  );

  // ── Validation ─────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr   = validateName(values.fullName);
    const emailErr  = validateEmail(values.email);
    const phoneErr  = validatePhone(values.phone);
    const weightErr = validateWeight(values.weight);

    if (nameErr)   newErrors.fullName  = nameErr;
    if (emailErr)  newErrors.email     = emailErr;
    if (phoneErr)  newErrors.phone     = phoneErr;
    if (!values.bloodType)  newErrors.bloodType = 'Blood type is required';
    if (!values.location || values.location.length < 3)
                   newErrors.location  = 'Please enter a valid location';
    if (weightErr) newErrors.weight    = weightErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const submitData = {
      ...values,
      facebook:  normalizeFacebook(values.facebook),
      latitude:  values.latitude  ? Number(values.latitude)  : null,
      longitude: values.longitude ? Number(values.longitude) : null,
    };
    console.log('Donor registered:', submitData);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  // ── Dynamic fields — inject location helperText ────
  const fields: Field[] = [
    {
      name:        'fullName',
      label:       'Full Name',
      type:        'text',
      required:    true,
      placeholder: 'Enter your full name',
      colSpan:     'half',
      icon:        Icons.User,
    },
    {
      name:        'email',
      label:       'Email',
      type:        'email',
      required:    true,
      placeholder: 'your@email.com',
      colSpan:     'half',
      icon:        Icons.Mail,
    },
    {
      name:        'phone',
      label:       'Phone',
      type:        'tel',
      required:    true,
      placeholder: '017XXXXXXXX',
      colSpan:     'half',
      icon:        Icons.Phone,
    },
    {
      name:        'facebook',
      label:       'Facebook Profile',
      type:        'text',
      required:    false,
      placeholder: 'https://facebook.com/username or @username',
      colSpan:     'half',
      icon:        Icons.Facebook,
      helperText:  'Optional – helps verify your identity',
    },
    {
      name:     'bloodType',
      label:    'Blood Type',
      type:     'select',
      required: true,
      options:  bloodTypeOptions,
      colSpan:  'half',
      icon:     Icons.Blood,
    },
    {
      name:        'location',
      label:       'Location',
      type:        'text',
      required:    true,
      placeholder: 'City, area',
      colSpan:     'half',
      icon:        Icons.Location,
      helperText:  locationHelper,   // ← dynamic
    },
    {
      name:        'weight',
      label:       'Weight (kg)',
      type:        'number',
      required:    true,
      min:         50,
      placeholder: '50',
      helperText:  'Minimum 50 kg required',
      colSpan:     'half',
      icon:        Icons.User,
    },
    {
      name:     'lastDonation',
      label:    'Last Donation Date',
      type:     'date',
      required: false,
      colSpan:  'half',
      icon:     Icons.Clock,
      maxDate:  new Date(),
    },
    {
      name:  'isAvailable',
      label: 'I am available to donate now',
      type:  'checkbox',
      colSpan: 'full',
    },
  ];

  // ── Success state ──────────────────────────────────
  if (submitted) {
    return (
      <SectionContainer>
        <MainContainer>
          <div className="max-w-lg mx-auto bg-white rounded-xs shadow-md p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 center-flex mx-auto mb-5">
              <Icons.Check className="!w-7 !h-7 text-green-600" />
            </div>
            <h2 className="font-serif text-xl font-bold text-dark mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-500 text-sm mb-2">
              Thank you, <strong>{values.fullName}</strong>. Your donor profile
              is under review and will be live within 24 hours.
            </p>
            {values.latitude && (
              <p className="text-green-600 text-xs font-semibold mb-6">
                📍 Location verified automatically
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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

  // ── Main render ────────────────────────────────────
  return (
    <SectionContainer>
      <MainContainer>
        {/* Page heading */}
        <SectionHeading
          align="left"
          title="Become a Donor"
          className="mb-1"
        />
        <p className="text-dark/60 text-sm mt-2 mb-8 max-w-2xl">
          Join our life-saving mission. Register as a blood donor and help
          those in urgent need.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">

          {/* Form card */}
          <div className="bg-white rounded-xs shadow-md p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xs bg-primary/10 center-flex shrink-0">
                <Icons.Blood className="!w-5 !h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-dark text-base sm:text-lg">
                  Donor Registration
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Fields marked <span className="text-primary font-bold">*</span> are required
                  · <span className="text-primary text-xxs">📍 Location auto-detect available</span>
                </p>
              </div>
            </div>

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
              layout="double"
            />
          </div>

          {/* Eligibility sidebar */}
          <div className="lg:sticky lg:top-4">
            <EligibilityCard />
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default DonateBlood;