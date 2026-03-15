// ── Types ──────────────────────────────────────────────
export interface BloodBank {
  id:          number;
  name:        string;
  address:     string;
  area:        string;
  district:    string;
  phone:       string;
  email:       string;
  distance:    number;  // km
  isOpen:      boolean;
  hours:       string;
  rating:      number;
  totalUnits:  number;
  availability: Record<string, "high" | "medium" | "low" | "unavailable">;
}

export interface BankFilterState {
  search:       string;
  district:     string;
  bloodType:    string;
  openOnly:     boolean;
  sortBy:       "distance" | "rating" | "units";
}

// ── Constants ──────────────────────────────────────────
export const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const DISTRICTS = ["All", "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"];

export const SORT_OPTIONS = [
  { label: "Nearest First",   value: "distance" },
  { label: "Highest Rated",   value: "rating"   },
  { label: "Most Units",      value: "units"    },
];

export const DEFAULT_FILTERS: BankFilterState = {
  search:    "",
  district:  "All",
  bloodType: "All",
  openOnly:  false,
  sortBy:    "distance",
};

// ── Fake data ──────────────────────────────────────────
export const allBanks: BloodBank[] = [
  {
    id: 1,
    name:       "Dhaka Medical College Blood Bank",
    address:    "Dhaka Medical College Hospital, Secretariat Rd",
    area:       "Secretariat, Dhaka",
    district:   "Dhaka",
    phone:      "+880 2-55165088",
    email:      "dmch.blood@gov.bd",
    distance:   1.4,
    isOpen:     true,
    hours:      "24 / 7",
    rating:     4.7,
    totalUnits: 320,
    availability: { "A+": "high", "A-": "medium", "B+": "high", "B-": "low", "O+": "high", "O-": "unavailable", "AB+": "medium", "AB-": "low" },
  },
  {
    id: 2,
    name:       "Sandhani National Blood Bank",
    address:    "Sir Salimullah Medical College, Mitford Rd",
    area:       "Mitford, Old Dhaka",
    district:   "Dhaka",
    phone:      "+880 2-7312973",
    email:      "sandhani@bloodbank.bd",
    distance:   2.8,
    isOpen:     true,
    hours:      "08:00 – 22:00",
    rating:     4.9,
    totalUnits: 480,
    availability: { "A+": "high", "A-": "high", "B+": "high", "B-": "medium", "O+": "high", "O-": "medium", "AB+": "high", "AB-": "medium" },
  },
  {
    id: 3,
    name:       "Square Hospital Blood Bank",
    address:    "18/F Bir Uttam Qazi Nuruzzaman Sarak",
    area:       "West Panthapath, Dhaka",
    district:   "Dhaka",
    phone:      "+880 10616-21212",
    email:      "blood@squarehospital.com",
    distance:   3.5,
    isOpen:     true,
    hours:      "24 / 7",
    rating:     4.6,
    totalUnits: 215,
    availability: { "A+": "high", "A-": "low", "B+": "medium", "B-": "unavailable", "O+": "high", "O-": "low", "AB+": "medium", "AB-": "unavailable" },
  },
  {
    id: 4,
    name:       "Quantum Blood Bank",
    address:    "23/3 Indira Road",
    area:       "Farmgate, Dhaka",
    district:   "Dhaka",
    phone:      "+880 1711-123456",
    email:      "quantum@bloodbank.bd",
    distance:   4.1,
    isOpen:     false,
    hours:      "09:00 – 18:00",
    rating:     4.3,
    totalUnits: 140,
    availability: { "A+": "medium", "A-": "low", "B+": "high", "B-": "low", "O+": "medium", "O-": "unavailable", "AB+": "low", "AB-": "unavailable" },
  },
  {
    id: 5,
    name:       "Apollo Hospitals Blood Bank",
    address:    "Plot 81, Block E, Bashundhara R/A",
    area:       "Bashundhara, Dhaka",
    district:   "Dhaka",
    phone:      "+880 10678-75222",
    email:      "blood@apollodhaka.com",
    distance:   6.2,
    isOpen:     true,
    hours:      "24 / 7",
    rating:     4.8,
    totalUnits: 390,
    availability: { "A+": "high", "A-": "medium", "B+": "high", "B-": "medium", "O+": "high", "O-": "high", "AB+": "high", "AB-": "medium" },
  },
  {
    id: 6,
    name:       "BIRDEM Blood Transfusion",
    address:    "122 Kazi Nazrul Islam Ave",
    area:       "Shahbag, Dhaka",
    district:   "Dhaka",
    phone:      "+880 2-58610093",
    email:      "blood@birdem.gov.bd",
    distance:   2.1,
    isOpen:     true,
    hours:      "08:00 – 20:00",
    rating:     4.5,
    totalUnits: 260,
    availability: { "A+": "high", "A-": "medium", "B+": "medium", "B-": "low", "O+": "high", "O-": "low", "AB+": "medium", "AB-": "unavailable" },
  },
  {
    id: 7,
    name:       "Chattogram Medical Blood Bank",
    address:    "K.B. Fazlul Kader Road",
    area:       "Panchlaish, Chattogram",
    district:   "Chattogram",
    phone:      "+880 31-619100",
    email:      "cmch.blood@gov.bd",
    distance:   8.3,
    isOpen:     true,
    hours:      "24 / 7",
    rating:     4.4,
    totalUnits: 300,
    availability: { "A+": "high", "A-": "low", "B+": "high", "B-": "medium", "O+": "high", "O-": "medium", "AB+": "medium", "AB-": "low" },
  },
  {
    id: 8,
    name:       "Sylhet MAG Osmani Blood Bank",
    address:    "MAG Osmani Medical College Rd",
    area:       "Sylhet Sadar",
    district:   "Sylhet",
    phone:      "+880 821-716476",
    email:      "blood@somc.gov.bd",
    distance:   9.7,
    isOpen:     false,
    hours:      "08:00 – 18:00",
    rating:     4.2,
    totalUnits: 175,
    availability: { "A+": "medium", "A-": "unavailable", "B+": "medium", "B-": "unavailable", "O+": "high", "O-": "low", "AB+": "low", "AB-": "unavailable" },
  },
];

// ── Filter + sort utility ──────────────────────────────
export const applyBankFilters = (banks: BloodBank[], f: BankFilterState): BloodBank[] => {
  return banks
    .filter(b => f.district  === "All" || b.district === f.district)
    .filter(b => !f.openOnly || b.isOpen)
    .filter(b =>
      f.search.trim() === "" ||
      b.name.toLowerCase().includes(f.search.toLowerCase()) ||
      b.area.toLowerCase().includes(f.search.toLowerCase()) ||
      b.address.toLowerCase().includes(f.search.toLowerCase())
    )
    .filter(b =>
      f.bloodType === "All" ||
      b.availability[f.bloodType] !== "unavailable"
    )
    .sort((a, b) => {
      if (f.sortBy === "distance") return a.distance - b.distance;
      if (f.sortBy === "rating")   return b.rating   - a.rating;
      if (f.sortBy === "units")    return b.totalUnits - a.totalUnits;
      return 0;
    });
};

// ── Availability helpers ───────────────────────────────
export const availabilityConfig = {
  high:        { label: "High",      color: "bg-green-100 text-green-700"   },
  medium:      { label: "Medium",    color: "bg-yellow-100 text-yellow-700" },
  low:         { label: "Low",       color: "bg-orange-100 text-orange-600" },
  unavailable: { label: "–",         color: "bg-gray-100 text-gray-400"     },
};