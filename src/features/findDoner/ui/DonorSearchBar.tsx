import MainContainer from "../../../shared/main-container/MainContainer";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import { BLOOD_GROUPS, DISTANCE_OPTIONS } from "../service/Donordata";

interface DonorSearchBarProps {
  bloodType: string;
  location: string;
  distance: number;
  onBloodTypeChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onDistanceChange: (val: number) => void;
}

const DonorSearchBar = ({
  bloodType,
  location,
  distance,
  onBloodTypeChange,
  onLocationChange,
  onDistanceChange,
}: DonorSearchBarProps) => {
  return (
    <div className="-mt-8 relative z-10 mb-6">
      <MainContainer>
        <div className="bg-white rounded-xs shadow-xl p-4 flex flex-col sm:flex-row gap-3">

          {/* Blood group */}
          <div className="flex-1 flex flex-col">
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Blood Group
            </label>
            <div className="flex items-center gap-2 bg-light rounded-xs px-3 py-2.5">
              <Icons.Blood className="w-4 h-4 text-primary shrink-0" />
              <select
                value={bloodType}
                onChange={(e) => onBloodTypeChange(e.target.value)}
                className="outline-none bg-transparent text-sm text-dark w-full"
              >
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex-1 flex flex-col">
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Location
            </label>
            <div className="flex items-center gap-2 bg-light rounded-xs px-3 py-2.5">
              <Icons.Location className="w-4 h-4 text-primary shrink-0" />
              <input
                type="text"
                placeholder="Enter area or city"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className="outline-none bg-transparent text-sm text-dark w-full"
              />
            </div>
          </div>

          {/* Distance */}
          <div className="flex-1 flex flex-col">
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Distance
            </label>
            <div className="flex items-center gap-2 bg-light rounded-xs px-3 py-2.5">
              <Icons.LocationPin className="w-4 h-4 text-primary shrink-0" />
              <select
                value={distance}
                onChange={(e) => onDistanceChange(Number(e.target.value))}
                className="outline-none bg-transparent text-sm text-dark w-full"
              >
                {DISTANCE_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d} km</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search button */}
          <div className="flex items-end">
            <CustomButton
              variant="primary"
              size="md"
              radius="xs"
              fullWidth
              leftIcon={<Icons.Search className="w-4 h-4" />}
            >
              Search
            </CustomButton>
          </div>
        </div>
      </MainContainer>
    </div>
  );
};

export default DonorSearchBar;