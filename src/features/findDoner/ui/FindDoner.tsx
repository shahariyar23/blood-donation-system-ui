import { useState } from "react";
import MainContainer from "../../../shared/main-container/MainContainer";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";


/* ── Fake donor data ─────────────────────────────────── */
const allDonors = [
  { id: 1,  name: "Rahim Uddin",     bloodType: "O+",  location: "Mirpur-10, Dhaka",      distance: 1.2, lastDonation: "3 months ago", totalDonations: 12, isAvailable: true,  isDonorVerified: true,  gender: "male"   },
  { id: 2,  name: "Sumaiya Akter",   bloodType: "A+",  location: "Dhanmondi, Dhaka",       distance: 2.4, lastDonation: "4 months ago", totalDonations: 7,  isAvailable: true,  isDonorVerified: true,  gender: "female" },
  { id: 3,  name: "Karim Hossain",   bloodType: "B-",  location: "Gulshan-2, Dhaka",       distance: 3.1, lastDonation: "6 months ago", totalDonations: 20, isAvailable: true,  isDonorVerified: true,  gender: "male"   },
  { id: 4,  name: "Nusrat Jahan",    bloodType: "AB+", location: "Banani, Dhaka",           distance: 4.5, lastDonation: "2 months ago", totalDonations: 5,  isAvailable: false, isDonorVerified: true,  gender: "female" },
  { id: 5,  name: "Imran Khan",      bloodType: "O-",  location: "Uttara, Dhaka",           distance: 5.0, lastDonation: "5 months ago", totalDonations: 15, isAvailable: true,  isDonorVerified: false, gender: "male"   },
  { id: 6,  name: "Fatema Begum",    bloodType: "B+",  location: "Mohammadpur, Dhaka",      distance: 5.8, lastDonation: "7 months ago", totalDonations: 9,  isAvailable: true,  isDonorVerified: true,  gender: "female" },
  { id: 7,  name: "Arif Hossain",    bloodType: "A-",  location: "Wari, Dhaka",             distance: 6.2, lastDonation: "3 months ago", totalDonations: 3,  isAvailable: true,  isDonorVerified: false, gender: "male"   },
  { id: 8,  name: "Mithila Rahman",  bloodType: "AB-", location: "Badda, Dhaka",            distance: 7.4, lastDonation: "8 months ago", totalDonations: 11, isAvailable: false, isDonorVerified: true,  gender: "female" },
  { id: 9,  name: "Shakil Ahmed",    bloodType: "O+",  location: "Rampura, Dhaka",          distance: 8.1, lastDonation: "4 months ago", totalDonations: 6,  isAvailable: true,  isDonorVerified: true,  gender: "male"   },
  { id: 10, name: "Sadia Islam",     bloodType: "B+",  location: "Khilgaon, Dhaka",         distance: 9.3, lastDonation: "6 months ago", totalDonations: 8,  isAvailable: true,  isDonorVerified: true,  gender: "female" },
  { id: 11, name: "Rasel Mahmud",    bloodType: "A+",  location: "Jatrabari, Dhaka",        distance: 9.8, lastDonation: "5 months ago", totalDonations: 4,  isAvailable: false, isDonorVerified: false, gender: "male"   },
  { id: 12, name: "Tania Khanam",    bloodType: "O-",  location: "Demra, Dhaka",            distance: 10.5,lastDonation: "3 months ago", totalDonations: 17, isAvailable: true,  isDonorVerified: true,  gender: "female" },
];

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const distanceOptions = [5, 10, 20, 50];
const sortOptions = [
  { label: "Nearest First",   value: "distance"  },
  { label: "Most Donations",  value: "donations" },
  { label: "Name A–Z",        value: "name"      },
];

/* ── Page ────────────────────────────────────────────── */
const FindDonorPage = () => {
  const [bloodType,     setBloodType]     = useState("All");
  const [location,      setLocation]      = useState("");
  const [distance,      setDistance]      = useState(10);
  const [sortBy,        setSortBy]        = useState("distance");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly,  setVerifiedOnly]  = useState(false);
  const [showFilters,   setShowFilters]   = useState(false);
  const [visibleCount,  setVisibleCount]  = useState(6);

  /* ── Filter + sort logic ── */
  const filtered = allDonors
    .filter((d) => bloodType === "All" || d.bloodType === bloodType)
    .filter((d) => d.distance <= distance)
    .filter((d) => !availableOnly || d.isAvailable)
    .filter((d) => !verifiedOnly  || d.isDonorVerified)
    .filter((d) =>
      location.trim() === "" ||
      d.location.toLowerCase().includes(location.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "distance")  return a.distance - b.distance;
      if (sortBy === "donations") return b.totalDonations - a.totalDonations;
      if (sortBy === "name")      return a.name.localeCompare(b.name);
      return 0;
    });

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-light">

      {/* ── Hero banner ── */}
      <div className="bg-primary pt-10 pb-20 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute top-16 -right-6  w-32 h-32 rounded-full bg-white/5" />

        <MainContainer>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-red-200 text-xxs font-bold uppercase tracking-widest mb-1">
                BloodConnect
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold leading-snug">
                Find Blood Donors
              </h1>
              <p className="text-red-100 text-sm mt-2">
                {filtered.length} verified donors found near you
              </p>
            </div>

            <CustomButton variant="secondary" size="sm" radius="full" leftIcon={<Icons.Emergency />}>
              Emergency Request
            </CustomButton>
          </div>
        </MainContainer>
      </div>

      {/* ── Search bar — overlaps hero ── */}
      <div className="-mt-8 relative z-10 mb-6">
        <MainContainer>
          <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row gap-3">

            {/* Blood group */}
            <div className="flex-1 flex flex-col">
              <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Blood Group
              </label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Icons.Blood className="text-primary shrink-0" />
                <select
                  value={bloodType}
                  onChange={(e) => { setBloodType(e.target.value); setVisibleCount(6); }}
                  className="outline-none bg-transparent text-sm text-dark w-full"
                >
                  {bloodGroups.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="flex-1 flex flex-col">
              <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Location
              </label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Icons.Location className="text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Enter area or city"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setVisibleCount(6); }}
                  className="outline-none bg-transparent text-sm text-dark w-full"
                />
              </div>
            </div>

            {/* Distance */}
            <div className="flex-1 flex flex-col">
              <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Distance
              </label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Icons.LocationPin className=" text-primary shrink-0" />
                <select
                  value={distance}
                  onChange={(e) => { setDistance(Number(e.target.value)); setVisibleCount(6); }}
                  className="outline-none bg-transparent text-sm text-dark w-full"
                >
                  {distanceOptions.map((d) => (
                    <option key={d} value={d}>{d} km</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search button */}
            <div className="flex items-end">
              <CustomButton variant="primary" size="md" radius="xl" fullWidth leftIcon={<Icons.Search />}>
                Search
              </CustomButton>
            </div>
          </div>
        </MainContainer>
      </div>

      {/* ── Main content ── */}
      <MainContainer>
        <div className="flex flex-col lg:flex-row gap-6 pb-16">

          {/* ── Sidebar filters (desktop) / Drawer (mobile) ── */}
          <>
            {/* Mobile toggle */}
            <div className="lg:hidden flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-dark">{filtered.length}</span> donors found
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-primary border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
              >
                <Icons.Setting />
                Filters
              </button>
            </div>

            {/* Filter panel */}
            <aside
              className={`lg:w-64 shrink-0 transition-all duration-300
                ${showFilters ? "block" : "hidden"} lg:block`}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-4 space-y-6">

                <h3 className="font-serif font-bold text-dark text-base border-b border-gray-100 pb-3">
                  Filters
                </h3>

                {/* Sort */}
                <div>
                  <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {sortOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="sort"
                          value={opt.value}
                          checked={sortBy === opt.value}
                          onChange={() => setSortBy(opt.value)}
                          className="accent-primary"
                        />
                        <span className={`text-sm transition-colors ${sortBy === opt.value ? "text-primary font-semibold" : "text-gray-600 group-hover:text-dark"}`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                    Availability
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={() => { setAvailableOnly(!availableOnly); setVisibleCount(6); }}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Available donors only</span>
                  </label>
                </div>

                {/* Verified */}
                <div>
                  <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                    Verification
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={() => { setVerifiedOnly(!verifiedOnly); setVisibleCount(6); }}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Verified donors only</span>
                  </label>
                </div>

                {/* Blood group quick select */}
                <div>
                  <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                    Blood Group
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {bloodGroups.map((g) => (
                      <button
                        key={g}
                        onClick={() => { setBloodType(g); setVisibleCount(6); }}
                        className={`text-xs font-bold py-1.5 rounded-lg border transition-all duration-200
                          ${bloodType === g
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                <CustomButton
                  variant="outline"
                  size="sm"
                  radius="lg"
                  fullWidth
                  onClick={() => {
                    setBloodType("All");
                    setLocation("");
                    setDistance(10);
                    setSortBy("distance");
                    setAvailableOnly(false);
                    setVerifiedOnly(false);
                    setVisibleCount(6);
                  }}
                >
                  Reset Filters
                </CustomButton>
              </div>
            </aside>
          </>

          {/* ── Donor results ── */}
          <div className="flex-1 min-w-0">

            {/* Result count — desktop */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-dark">{Math.min(visibleCount, filtered.length)}</span> of{" "}
                <span className="font-bold text-dark">{filtered.length}</span> donors
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Icons.LocationPin className=" text-primary" />
                Sorted by {sortOptions.find(s => s.value === sortBy)?.label}
              </div>
            </div>

            {/* No results */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-red-200 p-12 text-center">
                <div className="text-5xl mb-4">
                    <Icons.Blood/>
                </div>
                <h3 className="font-serif font-bold text-dark text-lg mb-2">
                  No donors found
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Try expanding your search distance or changing the blood group filter.
                </p>
                <CustomButton
                  variant="primary"
                  size="md"
                  radius="full"
                  onClick={() => { setDistance(50); setBloodType("All"); }}
                >
                  Expand Search
                </CustomButton>
              </div>
            ) : (
              <>
                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visible.map((donor) => (
                    <div
                      key={donor.id}
                      className="donor-card border border-gray-100 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-100 center-flex font-black text-primary text-lg shrink-0">
                            {donor.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-semibold text-dark text-sm leading-tight">
                                {donor.name}
                              </h3>
                              {donor.isDonorVerified && (
                                <Icons.Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{donor.location}</p>
                          </div>
                        </div>
                        {/* Blood badge */}
                        <span className="blood-badge shrink-0">{donor.bloodType}</span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Icons.Location className=" text-primary" />
                          {donor.distance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Blood className=" text-primary" />
                          {donor.totalDonations} donations
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Clock />
                          {donor.lastDonation}
                        </span>
                      </div>

                      {/* Status + CTA */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xxs font-bold px-2.5 py-1 rounded-full
                            ${donor.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {donor.isAvailable ? "✓ Available" : "Unavailable"}
                        </span>
                        <CustomButton
                          variant={donor.isAvailable ? "primary" : "ghost"}
                          size="xs"
                          radius="lg"
                          disabled={!donor.isAvailable}
                          leftIcon={<Icons.Phone className="w-3 h-3" />}
                        >
                          Contact
                        </CustomButton>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load more */}
                {visibleCount < filtered.length && (
                  <div className="mt-8 center-flex">
                    <CustomButton
                      variant="outline"
                      size="md"
                      radius="full"
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                    >
                      Load More Donors
                    </CustomButton>
                  </div>
                )}

                {/* All loaded */}
                {visibleCount >= filtered.length && filtered.length > 6 && (
                  <p className="mt-8 text-center text-xs text-gray-400">
                    All {filtered.length} donors loaded
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </MainContainer>
    </div>
  );
};

export default FindDonorPage;