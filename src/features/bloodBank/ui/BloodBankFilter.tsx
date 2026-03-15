import CustomButton from "../../../shared/button/CustomButton";
import ToggleIcon from "../../../shared/button/CustomToggle";
import { Icons } from "../../../shared/icons/Icons";
import {
  BLOOD_GROUPS,
  DISTRICTS,
  SORT_OPTIONS,
  type BankFilterState,
} from "../service/bloodBankData";

interface BloodBankFilterSidebarProps {
  filters:        BankFilterState;
  isOpen:         boolean;
  resultCount:    number;
  onToggle:       () => void;
  onChange:       (updated: Partial<BankFilterState>) => void;
  onReset:        () => void;
}

const BloodBankFilterSidebar = ({
  filters,
  isOpen,
  resultCount,
  onToggle,
  onChange,
  onReset,
}: BloodBankFilterSidebarProps) => {
  return (
    <>
      {/* Mobile toggle row */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-dark">{resultCount}</span> banks found
        </p>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-semibold text-primary
            bg-white shadow-md px-4 py-2 rounded-xs hover:shadow-lg transition-all"
        >
          <Icons.Setting className="!w-4 !h-4" />
          Filters
          <ToggleIcon isOpen={isOpen} icon={<Icons.ArrowForward className="!w-3 !h-3" />} />
        </button>
      </div>

      {/* Filter panel */}
      <aside className={`lg:w-64 shrink-0 ${isOpen ? "block" : "hidden"} lg:block`}>
        <div className="bg-white rounded-xs shadow-md p-5 sticky top-4 space-y-6">

          <h3 className="font-serif font-bold text-dark text-base border-b border-gray-100 pb-3">
            Filters
          </h3>

          {/* Sort by */}
          <div>
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
              Sort By
            </label>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="bankSort"
                    checked={filters.sortBy === opt.value}
                    onChange={() => onChange({ sortBy: opt.value as BankFilterState["sortBy"] })}
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

          {/* Open now toggle */}
          <div>
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
              Status
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.openOnly}
                onChange={() => onChange({ openOnly: !filters.openOnly })}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-gray-600">Open now only</span>
            </label>
          </div>

          {/* District quick select */}
          <div>
            <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 block mb-2">
              District
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DISTRICTS.map((d) => (
                <button
                  key={d}
                  onClick={() => onChange({ district: d })}
                  className={`text-xs font-semibold px-3 py-1 rounded-xs transition-all duration-200
                    ${filters.district === d
                      ? "bg-primary text-white shadow-sm"
                      : "bg-light text-gray-600 hover:text-primary hover:bg-red-50"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
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
                      ? "bg-primary text-white shadow-sm"
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

export default BloodBankFilterSidebar;