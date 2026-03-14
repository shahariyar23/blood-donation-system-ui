// ── Types ─────────────────────────────────────────────
export interface Donor {
  id: number;
  name: string;
  bloodType: string;
  location: string;
  distance: number;
  lastDonation: string;
  totalDonations: number;
  isAvailable: boolean;
  isDonorVerified: boolean;
  gender: "male" | "female";
}

export interface FilterState {
  bloodType: string;
  location: string;
  distance: number;
  sortBy: string;
  availableOnly: boolean;
  verifiedOnly: boolean;
}

// ── Constants ──────────────────────────────────────────
export const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const DISTANCE_OPTIONS = [5, 10, 20, 50];

export const SORT_OPTIONS = [
  { label: "Nearest First",  value: "distance"  },
  { label: "Most Donations", value: "donations" },
  { label: "Name A–Z",       value: "name"      },
];

export const DEFAULT_FILTERS: FilterState = {
  bloodType:     "All",
  location:      "",
  distance:      10,
  sortBy:        "distance",
  availableOnly: false,
  verifiedOnly:  false,
};

// ── Fake data ──────────────────────────────────────────
export const allDonors: Donor[] = [
  { id: 1,  name: "Rahim Uddin",    bloodType: "O+",  location: "Mirpur-10, Dhaka",     distance: 1.2,  lastDonation: "3 months ago", totalDonations: 12, isAvailable: true,  isDonorVerified: true,  gender: "male"   },
  { id: 2,  name: "Sumaiya Akter",  bloodType: "A+",  location: "Dhanmondi, Dhaka",      distance: 2.4,  lastDonation: "4 months ago", totalDonations: 7,  isAvailable: true,  isDonorVerified: true,  gender: "female" },
  { id: 3,  name: "Karim Hossain",  bloodType: "B-",  location: "Gulshan-2, Dhaka",      distance: 3.1,  lastDonation: "6 months ago", totalDonations: 20, isAvailable: true,  isDonorVerified: true,  gender: "male"   },
  { id: 4,  name: "Nusrat Jahan",   bloodType: "AB+", location: "Banani, Dhaka",          distance: 4.5,  lastDonation: "2 months ago", totalDonations: 5,  isAvailable: false, isDonorVerified: true,  gender: "female" },
  { id: 5,  name: "Imran Khan",     bloodType: "O-",  location: "Uttara, Dhaka",          distance: 5.0,  lastDonation: "5 months ago", totalDonations: 15, isAvailable: true,  isDonorVerified: false, gender: "male"   },
  { id: 6,  name: "Fatema Begum",   bloodType: "B+",  location: "Mohammadpur, Dhaka",     distance: 5.8,  lastDonation: "7 months ago", totalDonations: 9,  isAvailable: true,  isDonorVerified: true,  gender: "female" },
  { id: 7,  name: "Arif Hossain",   bloodType: "A-",  location: "Wari, Dhaka",            distance: 6.2,  lastDonation: "3 months ago", totalDonations: 3,  isAvailable: true,  isDonorVerified: false, gender: "male"   },
  { id: 8,  name: "Mithila Rahman", bloodType: "AB-", location: "Badda, Dhaka",           distance: 7.4,  lastDonation: "8 months ago", totalDonations: 11, isAvailable: false, isDonorVerified: true,  gender: "female" },
  { id: 9,  name: "Shakil Ahmed",   bloodType: "O+",  location: "Rampura, Dhaka",         distance: 8.1,  lastDonation: "4 months ago", totalDonations: 6,  isAvailable: true,  isDonorVerified: true,  gender: "male"   },
  { id: 10, name: "Sadia Islam",    bloodType: "B+",  location: "Khilgaon, Dhaka",        distance: 9.3,  lastDonation: "6 months ago", totalDonations: 8,  isAvailable: true,  isDonorVerified: true,  gender: "female" },
  { id: 11, name: "Rasel Mahmud",   bloodType: "A+",  location: "Jatrabari, Dhaka",       distance: 9.8,  lastDonation: "5 months ago", totalDonations: 4,  isAvailable: false, isDonorVerified: false, gender: "male"   },
  { id: 12, name: "Tania Khanam",   bloodType: "O-",  location: "Demra, Dhaka",           distance: 10.5, lastDonation: "3 months ago", totalDonations: 17, isAvailable: true,  isDonorVerified: true,  gender: "female" },
];

// ── Filter + sort utility ──────────────────────────────
export const applyFilters = (donors: Donor[], filters: FilterState): Donor[] => {
  return donors
    .filter((d) => filters.bloodType === "All" || d.bloodType === filters.bloodType)
    .filter((d) => d.distance <= filters.distance)
    .filter((d) => !filters.availableOnly || d.isAvailable)
    .filter((d) => !filters.verifiedOnly  || d.isDonorVerified)
    .filter((d) =>
      filters.location.trim() === "" ||
      d.location.toLowerCase().includes(filters.location.toLowerCase())
    )
    .sort((a, b) => {
      if (filters.sortBy === "distance")  return a.distance - b.distance;
      if (filters.sortBy === "donations") return b.totalDonations - a.totalDonations;
      if (filters.sortBy === "name")      return a.name.localeCompare(b.name);
      return 0;
    });
};