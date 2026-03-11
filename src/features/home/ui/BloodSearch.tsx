import { useState } from "react";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import Button from "../../../shared/button/CustomButton";

interface BloodSearchProps {
  isFloating?: boolean;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const BloodSearch = ({ isFloating = false }: BloodSearchProps) => {
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(10);

  // ── Mobile layout (< sm) ──────────────────────────────────────────────
  const mobileContent = (
    <div className="sm:hidden w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-gray-100">

        {/* Blood Group */}
        <div className="flex flex-col px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            Blood Group
          </label>
          <div className="flex items-center gap-1.5">
            <Icons.Blood className="text-primary shrink-0 w-3.5 h-3.5" />
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="outline-none bg-transparent text-sm text-gray-700 w-full font-medium"
            >
              {bloodGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Distance */}
        <div className="flex flex-col px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            Distance
          </label>
          <div className="flex items-center gap-1.5">
            <Icons.Location className="text-primary shrink-0 w-3.5 h-3.5" />
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="outline-none bg-transparent text-sm text-gray-700 w-full font-medium"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        </div>

        {/* Location — full width */}
        <div className="col-span-2 flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors">
          <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            Location
          </label>
          <div className="flex items-center gap-1.5">
            <Icons.Location className="text-primary shrink-0 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Enter city or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="outline-none bg-transparent text-sm text-gray-700 w-full"
            />
          </div>
        </div>
      </div>

      {/* Search Button — full width */}
      <Button
        variant="primary"
        size="md"
        fullWidth
        leftIcon={<Icons.Search />}
        className="w-full rounded-none rounded-b-2xl text-sm py-3"
      >
        Find Donor
      </Button>
    </div>
  );

  // ── Desktop layout (sm+) ──────────────────────────────────────────────
  const desktopContent = (
    <div className="hidden sm:flex w-full bg-white rounded-full shadow-2xl overflow-hidden flex-row items-stretch">

      {/* Blood Group */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4
        border-r border-gray-100 hover:bg-gray-50 transition-colors min-w-0">
        <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          Blood Group
        </label>
        <div className="flex items-center gap-2">
          <Icons.Blood className="text-primary shrink-0" />
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="outline-none bg-transparent text-sm text-gray-700 w-full"
          >
            {bloodGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4
        border-r border-gray-100 hover:bg-gray-50 transition-colors min-w-0">
        <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          Location
        </label>
        <div className="flex items-center gap-2">
          <Icons.Location className="text-primary shrink-0" />
          <input
            type="text"
            placeholder="Enter your area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="outline-none bg-transparent text-sm text-gray-700 w-full"
          />
        </div>
      </div>

      {/* Distance */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4
        border-r border-gray-100 hover:bg-gray-50 transition-colors min-w-0">
        <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          Distance
        </label>
        <div className="flex items-center gap-2">
          <Icons.Location className="text-primary shrink-0" />
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="outline-none bg-transparent text-sm text-gray-700 w-full"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <Button
        variant="primary"
        size="sm"
        radius="none"
        rightIcon={<Icons.Search />}
        className="
          shrink-0
          rounded-tl-none rounded-tr-full rounded-bl-none rounded-br-full
          shadow-lg hover:shadow-xl px-8 text-sm
        "
      >
        Find Donor
      </Button>
    </div>
  );

  const wrapper = (children: React.ReactNode) => (
    <div className="w-full overflow-visible" style={{ position: "relative", zIndex: 100 }}>
      {children}
    </div>
  );

  if (isFloating) {
    return wrapper(<>{mobileContent}{desktopContent}</>);
  }

  return (
    <MainContainer>
      {wrapper(<>{mobileContent}{desktopContent}</>)}
    </MainContainer>
  );
};

export default BloodSearch;