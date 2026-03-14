import { useState } from 'react';
import Form, { type Field } from '../../../shared/components/Form';
import MainContainer from '../../../shared/main-container/MainContainer';
import SectionContainer from '../../../shared/section-container/SectionContainer';
import SectionHeading from '../../../shared/section-heading/SectionHeading';
import CustomButton from '../../../shared/button/CustomButton';
import {Icons} from '../../../shared/icons/Icons';

interface LocationDetails {
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

// Validation helpers (unchanged)
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Enter a valid email address';
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';
  const digitsOnly = phone.replace(/\D/g, '');
  const bdPhoneRegex = /^(01[3-9]\d{8})$|^(8801[3-9]\d{8})$/;
  if (!bdPhoneRegex.test(digitsOnly)) return 'Enter a valid Bangladeshi phone number';
  return null;
};

const validateName = (name: string): string | null => {
  if (!name) return 'Full name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

const validateBloodType = (bloodType: string): string | null => {
  if (!bloodType) return 'Blood type is required';
  return null;
};

const validateLocation = (location: string): string | null => {
  if (!location) return 'Location is required';
  if (location.length < 3) return 'Please enter a valid location';
  return null;
};

const validateWeight = (weight: string): string | null => {
  if (!weight) return 'Weight is required';
  const w = Number(weight);
  if (isNaN(w) || w < 50) return 'Weight must be at least 50 kg';
  return null;
};

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationHelperText, setLocationHelperText] = useState('Click the location icon to auto‑detect');

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

  const fields: Field[] = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
      colSpan: 'full',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'your@email.com',
      colSpan: 'full',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      required: true,
      placeholder: '017XXXXXXXX',
      colSpan: 'full',
    },
    {
      name: 'facebook',
      label: 'Facebook Profile',
      type: 'text',
      required: false,
      placeholder: 'https://facebook.com/username or @username',
      colSpan: 'full',
      helperText: 'Optional – helps us verify your identity',
    },
    {
      name: 'bloodType',
      label: 'Blood Type',
      type: 'select',
      required: true,
      options: bloodTypeOptions,
      placeholder: 'Select blood type',
      colSpan: 'half',
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'City, area',
      colSpan: 'half',
      helperText: locationError || locationHelperText, // dynamic helper text
    },
    {
      name: 'weight',
      label: 'Weight (kg)',
      type: 'number',
      required: true,
      min: 50,
      placeholder: '50',
      helperText: 'Minimum 50 kg required',
      colSpan: 'half',
    },
    {
      name: 'lastDonation',
      label: 'Last Donation',
      type: 'date',
      required: false,
      placeholder: 'Select date',
      colSpan: 'half',
      maxDate: new Date(),
    },
    {
      name: 'isAvailable',
      label: 'I am available to donate now',
      type: 'checkbox',
      required: false,
      colSpan: 'full',
    },
  ];

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (name === 'location') {
      // Clear coordinates and details when user manually edits location
      setValues(prev => ({ ...prev, latitude: '', longitude: '', locationDetails: null }));
      setLocationError('');
      setLocationHelperText('Click the location icon to auto‑detect');
    }
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<{ displayName: string; details: LocationDetails }> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BloodConnect/1.0' },
    });
    const data = await response.json();
    const addr = data.address;
    const displayName = addr.city || addr.town || addr.village || addr.county || 'Unknown location';
    return { displayName, details: addr };
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser');
      setLocationHelperText('Geolocation not supported');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    setLocationHelperText('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { displayName, details } = await reverseGeocode(latitude, longitude);
          setValues(prev => ({
            ...prev,
            location: displayName,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            locationDetails: details,
          }));
          setLocationError('');
          setLocationHelperText('Location detected'); // success message
        } catch (error) {
          setLocationError('Could not detect location. Please enter manually.');
          setLocationHelperText('Could not detect location');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationError('Location permission denied. Please enter manually.');
        setLocationHelperText('Permission denied');
        setLocationLoading(false);
      }
    );
  };

  // Normalize Facebook input
  const normalizeFacebook = (input: string): string => {
    if (!input) return '';
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }
    let username = input.startsWith('@') ? input.slice(1) : input;
    if (username.includes('/')) {
      const parts = username.split('/');
      username = parts[parts.length - 1];
    }
    return `https://www.facebook.com/${username}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nameError = validateName(values.fullName);
    if (nameError) newErrors.fullName = nameError;

    const emailError = validateEmail(values.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(values.phone);
    if (phoneError) newErrors.phone = phoneError;

    const bloodError = validateBloodType(values.bloodType);
    if (bloodError) newErrors.bloodType = bloodError;

    const locationErrorField = validateLocation(values.location);
    if (locationErrorField) newErrors.location = locationErrorField;

    const weightError = validateWeight(values.weight);
    if (weightError) newErrors.weight = weightError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const normalizedFacebook = normalizeFacebook(values.facebook);

    setLoading(true);
    const submitData = {
      ...values,
      facebook: normalizedFacebook,
      latitude: values.latitude ? Number(values.latitude) : null,
      longitude: values.longitude ? Number(values.longitude) : null,
    };
    console.log('Form submitted:', submitData);
    // Replace with actual API call
    setTimeout(() => setLoading(false), 2000);
  };

  // Action button for location field – shows spinner when loading, location icon otherwise
  const locationAction = (
    <CustomButton
      type="button"
      variant="ghost"
      size="xs"
      onClick={getCurrentLocation}
      disabled={locationLoading}
      className="!p-1 h-7 w-7"
    >
      {locationLoading ? (
        <Icons.Loading className="w-4 h-4 animate-spin" />
      ) : (
        <Icons.Location className="w-4 h-4" />
      )}
    </CustomButton>
  );

  return (
    <SectionContainer>
      <MainContainer>
        <SectionHeading align="left" title='Become a Donor' description=''></SectionHeading>
        <p className="text-dark/70 mt-2 max-w-2xl">
          Join our life‑saving mission. Register as a blood donor and help those in urgent need.
        </p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <Form
              fields={fields}
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              errors={errors}
              fieldActions={{ location: locationAction }}
              loading={loading}
              submitText="Register as Donor"
              layout="double"
            />
          </div>

          {/* Info Card (unchanged) */}
          <div className="bg-white rounded-xs shadow-md p-6">
            <h3 className="text-xl font-serif font-bold mb-4">Donor Eligibility</h3>
            <ul className="space-y-3 text-dark/80">
              <li className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Age between 18 and 65 years</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Weight at least 50 kg</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Healthy and free from infections</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>No recent tattoos or surgeries (last 6 months)</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Not pregnant or breastfeeding</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-light rounded-xs">
              <p className="text-sm">
                <Icons.Heartbeat className="inline w-4 h-4 text-primary mr-1" />
                Your one donation can save up to three lives.
              </p>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default DonateBlood;