import type { Field } from "../../../shared/components/Form";
import { Icons } from "../../../shared/icons/Icons";

// ── Types ──────────────────────────────────────────────
export interface LocationDetails {
  city?:         string;
  town?:         string;
  village?:      string;
  county?:       string;
  state?:        string;
  postcode?:     string;
  country?:      string;
  country_code?: string;
}

export interface BloodRequest {
  patientName:     string;
  bloodType:       string;
  units:           number;
  hospital:        string;
  location:        string;
  latitude:        string;
  longitude:       string;
  locationDetails: LocationDetails | null;
  phone:           string;
  urgency:         string;
  neededBy:        string;
  notes:           string;
  agreeTerms:      boolean;
}

export const DEFAULT_FORM: BloodRequest = {
  patientName:     "",
  bloodType:       "",
  units:           1,
  hospital:        "",
  location:        "",
  latitude:        "",
  longitude:       "",
  locationDetails: null,
  phone:           "",
  urgency:         "",
  neededBy:        "",
  notes:           "",
  agreeTerms:      false,
};

// ── Validation ─────────────────────────────────────────
export const validateRequest = (values: BloodRequest): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.patientName.trim())
    errors.patientName = "Patient name is required";
  else if (!/^[a-zA-Z\s]+$/.test(values.patientName))
    errors.patientName = "Name can only contain letters and spaces";

  if (!values.bloodType)
    errors.bloodType = "Blood type is required";

  if (!values.units || values.units < 1)
    errors.units = "At least 1 unit required";
  else if (values.units > 10)
    errors.units = "Maximum 10 units allowed";

  if (!values.hospital.trim())
    errors.hospital = "Hospital name is required";

  if (!values.location.trim())
    errors.location = "Location is required";
  else if (values.location.trim().length < 3)
    errors.location = "Please enter a valid location";

  if (!values.phone.trim()) {
    errors.phone = "Contact number is required";
  } else {
    const digits = values.phone.replace(/\D/g, "");
    const bdPhone = /^(01[3-9]\d{8})$|^(8801[3-9]\d{8})$/;
    if (!bdPhone.test(digits))
      errors.phone = "Enter a valid Bangladeshi phone number";
  }

  if (!values.urgency)
    errors.urgency = "Please select urgency level";

  if (!values.neededBy)
    errors.neededBy = "Required date is needed";

  if (!values.agreeTerms)
    errors.agreeTerms = "You must agree to the terms";

  return errors;
};

// ── Form fields ────────────────────────────────────────
export const requestFields: Field[] = [
  {
    name:        "patientName",
    label:       "Patient Name",
    type:        "text",
    placeholder: "Full name of the patient",
    required:    true,
    colSpan:     "half",
    icon:        Icons.User,
  },
  {
    name:     "bloodType",
    label:    "Blood Group Required",
    type:     "select",
    required: true,
    colSpan:  "half",
    icon:     Icons.Blood,
    options: [
      { value: "A+",  label: "A+"  },
      { value: "A-",  label: "A-"  },
      { value: "B+",  label: "B+"  },
      { value: "B-",  label: "B-"  },
      { value: "O+",  label: "O+"  },
      { value: "O-",  label: "O-"  },
      { value: "AB+", label: "AB+" },
      { value: "AB-", label: "AB-" },
    ],
  },
  {
    name:        "units",
    label:       "Units Needed",
    type:        "number",
    placeholder: "Number of units",
    required:    true,
    min:         1,
    max:         10,
    colSpan:     "half",
    icon:        Icons.BloodType,
    helperText:  "1 unit = ~450ml of whole blood",
  },
  {
    name:     "urgency",
    label:    "Urgency Level",
    type:     "select",
    required: true,
    colSpan:  "half",
    icon:     Icons.Emergency,
    options: [
      { value: "critical", label: "🔴 Critical — Within hours"  },
      { value: "urgent",   label: "🟠 Urgent — Within 24 hours" },
      { value: "moderate", label: "🟡 Moderate — Within 3 days" },
      { value: "planned",  label: "🟢 Planned — Within a week"  },
    ],
  },
  {
    name:        "hospital",
    label:       "Hospital / Clinic Name",
    type:        "text",
    placeholder: "Name of the hospital or clinic",
    required:    true,
    colSpan:     "half",
    icon:        Icons.Hospital,
  },
  {
    name:        "location",
    label:       "Location / Area",
    type:        "text",
    placeholder: "e.g. Mirpur-10, Dhaka",
    required:    true,
    colSpan:     "half",
    icon:        Icons.Location,
    // helperText injected dynamically in RequestBloodForm
  },
  {
    name:        "phone",
    label:       "Contact Number",
    type:        "tel",
    placeholder: "+880 1X XX XXX XXX",
    required:    true,
    colSpan:     "half",
    icon:        Icons.Phone,
    helperText:  "Donors will contact you on this number",
  },
  {
    name:     "neededBy",
    label:    "Blood Needed By",
    type:     "date",
    required: true,
    colSpan:  "half",
    icon:     Icons.Clock,
    minDate:  new Date(),
  },
  {
    name:        "notes",
    label:       "Additional Notes",
    type:        "textarea",
    placeholder: "Any additional information for donors (optional)...",
    colSpan:     "full",
    rows:        3,
  },
  {
    name:     "agreeTerms",
    label:    "I confirm that this is a genuine blood request and the information provided is accurate.",
    type:     "checkbox",
    required: true,
    colSpan:  "full",
  },
];