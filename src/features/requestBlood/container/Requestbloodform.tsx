import { useState } from "react";
import Form from "../../../shared/components/Form";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import {
  DEFAULT_FORM,
  requestFields,
  validateRequest,
  type BloodRequest,
  type LocationDetails,
} from "../service/Requestblooddata";

// ── Reverse geocode via OpenStreetMap Nominatim ────────
const reverseGeocode = async (
  lat: number,
  lon: number
): Promise<{ displayName: string; details: LocationDetails }> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const res  = await fetch(url, { headers: { "User-Agent": "BloodConnect/1.0" } });
  const data = await res.json();
  const addr = data.address;
  const displayName =
    addr.city || addr.town || addr.village || addr.county || "Unknown location";
  return { displayName, details: addr };
};

const RequestBloodForm = () => {
  const [values,         setValues]         = useState<BloodRequest>(DEFAULT_FORM);
  const [errors,         setErrors]         = useState<Record<string, string>>({});
  const [loading,        setLoading]        = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationHelper,  setLocationHelper]  = useState("Click 📍 to auto-detect your location");

  // ── Handlers ───────────────────────────────────────
  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // clear error on change
    if (errors[name]) {
      setErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });
    }
    // if user manually edits location, clear coordinates
    if (name === "location") {
      setValues((prev) => ({ ...prev, location: value, latitude: "", longitude: "", locationDetails: null }));
      setLocationHelper("Click 📍 to auto-detect your location");
    }
  };

  // ── Auto location detect ───────────────────────────
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationHelper("Geolocation not supported by your browser");
      return;
    }
    setLocationLoading(true);
    setLocationHelper("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { displayName, details } = await reverseGeocode(latitude, longitude);
          setValues((prev) => ({
            ...prev,
            location:        displayName,
            latitude:        latitude.toString(),
            longitude:       longitude.toString(),
            locationDetails: details,
          }));
          // clear location error if any
          setErrors((prev) => { const e = { ...prev }; delete e.location; return e; });
          setLocationHelper("✓ Location detected automatically");
        } catch {
          setLocationHelper("Could not detect location. Please enter manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationHelper("Permission denied. Please enter location manually.");
        setLocationLoading(false);
      }
    );
  };

  // ── Location action button (injected into Form field) ──
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

  // ── Submit ─────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRequest(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log(values)
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  // ── Dynamic fields — inject location helperText ────
  const dynamicFields = requestFields.map((f) =>
    f.name === "location" ? { ...f, helperText: locationHelper } : f
  );

  // ── Success state ──────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-white rounded-xs shadow-md p-8 sm:p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 center-flex mx-auto mb-5 shadow-md">
          <Icons.Check className=" text-green-600" />
        </div>
        <h2 className="font-serif text-xl font-bold text-dark mb-2">
          Request Posted Successfully!
        </h2>
        <p className="text-gray-500 text-sm mb-2 max-w-sm mx-auto">
          Your blood request for{" "}
          <span className="font-bold text-primary">{values.bloodType}</span> has been
          posted. Nearby donors are being notified.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Patient: <span className="font-semibold text-dark">{values.patientName}</span>
          {" · "}
          Hospital: <span className="font-semibold text-dark">{values.hospital}</span>
          {values.latitude && (
            <>
              {" · "}
              <span className="text-green-600 font-semibold">
                📍 Location verified
              </span>
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => { setValues(DEFAULT_FORM); setSubmitted(false); setLocationHelper("Click 📍 to auto-detect your location"); }}
            className="btn-outline text-sm"
          >
            Post Another Request
          </button>
          <a href="/find-donor" className="btn-primary text-sm text-center">
            View Donors
          </a>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────
  return (
    <div className="bg-white rounded-xs shadow-md p-5 sm:p-7">

      {/* Card header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xs bg-primary/10 center-flex shrink-0">
          <Icons.Blood className=" text-primary" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-dark text-base sm:text-lg">
            Blood Request Details
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            All fields marked <span className="text-primary font-bold">*</span> are required
            · <span className="text-primary text-xxs">📍 Location auto-detect available</span>
          </p>
        </div>
      </div>

      <Form
        fields={dynamicFields}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        fieldActions={{ location: locationAction }}
        loading={loading}
        layout="double"
        submitText={
          <span className="flex items-center gap-2">
            <Icons.Emergency />
            Post Blood Request
          </span>
        }
      />
    </div>
  );
};

export default RequestBloodForm;