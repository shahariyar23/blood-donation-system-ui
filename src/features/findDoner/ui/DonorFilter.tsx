import CustomButton from "../../../shared/button/CustomButton";
import ToggleIcon from "../../../shared/button/CustomToggle";
import { Icons } from "../../../shared/icons/Icons";
import {
  BLOOD_GROUPS,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
  type FilterState,
} from "../service/Donordata";

interface DonorFilterSidebarProps {
  filters: FilterState;
  isOpen: boolean;
  donorCount: number;
  onToggle: () => void;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
}

const DonorFilterSidebar = ({
  filters,
  isOpen,
  donorCount,
  onToggle,
  onChange,
  onReset,
}: DonorFilterSidebarProps) => {
  return (
    <>
      {/* Mobile toggle row */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-dark">{donorCount}</span> donors found
        </p>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-semibold text-primary
            bg-white shadow-md px-4 py-2 rounded-xs hover:shadow-lg
            transition-all duration-200"
        >
          <Icons.Setting className="w-4 h-4" />
          Filters
          <ToggleIcon isOpen={isOpen} icon={<Icons.ArrowForward className="w-3 h-3" />} />
        </button>
      </div>

      {/* Filter panel */}
      <aside
        className={`lg:w-64 shrink-0 transition-all duration-300
          ${isOpen ? "block" : "hidden"} lg:block`}
      >
        <div className="bg-white rounded-xs shadow-md p-5 sticky top-4 space-y-6">

          <h3 className="font-serif font-bold text-dark text-base border-b border-gray-100 pb-3">
            Filters
          </h3>

          {/* Sort By */}
          <div>
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
              Sort By
            </label>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={filters.sortBy === opt.value}
                    onChange={() => onChange({ sortBy: opt.value })}
                    className="accent-primary"
                  />
                  <span className={`text-sm transition-colors
                    ${filters.sortBy === opt.value
                      ? "text-primary font-semibold"
                      : "text-gray-600 group-hover:text-dark"
                    }`}>
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
                checked={filters.availableOnly}
                onChange={() => onChange({ availableOnly: !filters.availableOnly })}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-gray-600">Available donors only</span>
            </label>
          </div>

          {/* Verification */}
          <div>
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
              Verification
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={() => onChange({ verifiedOnly: !filters.verifiedOnly })}
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
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => onChange({ bloodType: g })}
                  className={`text-xs font-bold py-1.5 rounded-xs transition-all duration-200
                    ${filters.bloodType === g
                      ? "bg-primary text-white shadow-md"
                      : "bg-light text-gray-600 hover:text-primary hover:bg-red-50"
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
            radius="xs"
            fullWidth
            onClick={onReset}
          >
            Reset Filters
          </CustomButton>
        </div>
      </aside>
    </>
  );
};

export default DonorFilterSidebar;