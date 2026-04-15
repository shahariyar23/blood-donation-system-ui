export interface RegisterLocation {
  displayName: string;
  road: string;
  quarter: string;
  suburb: string;
  city: string;
  county: string;
  state_district: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
}

export interface RegisterFormData {
  role: "user" | "donor";
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bloodType: string;
  gender: string;
  age: string;
  weight: string;
  dateOfBirth: string;
  location: RegisterLocation;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

export interface RegisterPayload {
  role: "user" | "donor";
  name: string;
  email: string;
  phone: string;
  password: string;
  bloodType: string;
  gender: string;
  age: number | null;
  weight: number | null;
  dateOfBirth: string | null;
  location: RegisterLocation;
  socialLinks: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    bloodType: string;
  };
}