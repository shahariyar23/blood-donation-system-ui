import MainContainer from "../../../shared/main-container/MainContainer";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import { BLOOD_GROUPS, DISTRICTS, type BankFilterState } from "../service/bloodBankData";

interface BloodBankSearchBarProps {
  filters:          BankFilterState;
  onFilterChange:   (updated: Partial<BankFilterState>) => void;
}

const BloodBankSearchBar = ({ filters, onFilterChange }: BloodBankSearchBarProps) => {
  return (
    <div className="-mt-8 relative z-10 mb-6">
      <MainContainer>
        <div className="bg-white rounded-xs shadow-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="flex-1 flex flex-col">
              <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Search
              </label>
              <div className="flex items-center gap-2 bg-light rounded-xs px-3 py-2.5">
                <Icons.Search className="!w-4 !h-4 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Name, area or address..."
                  value={filters.search}
                  onChange={(e) => onFilterChange({ search: e.target.value })}
                  className="outline-none bg-transparent text-sm text-dark w-full"
                />
                {filters.search && (
                  <button onClick={() => onFilterChange({ search: "" })}>
                    <Icons.Close className="!w-3.5 !h-3.5 text-gray-400 hover:text-dark" />
                  </button>
                )}
              </div>
            </div>

            {/* District */}
            <div className="flex-1 flex flex-col">
              <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
                District
              </label>
              <div className="flex items-center gap-2 bg-light rounded-xs px-3 py-2.5">
                <Icons.Location className="!w-4 !h-4 text-primary shrink-0" />
                <select
                  value={filters.district}
                  onChange={(e) => onFilterChange({ district: e.target.value })}
                  className="outline-none bg-transparent text-sm text-dark w-full"
                >
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Blood type */}
            <div className="flex-1 flex flex-col">
              <label className="text-xxs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Blood Group
              </label>
              <div className="flex items-center gap-2 bg-light rounded-xs px-3 py-2.5">
                <Icons.Blood className="!w-4 !h-4 text-primary shrink-0" />
                <select
                  value={filters.bloodType}
                  onChange={(e) => onFilterChange({ bloodType: e.target.value })}
                  className="outline-none bg-transparent text-sm text-dark w-full"
                >
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
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
                leftIcon={<Icons.Search className="!w-4 !h-4" />}
              >
                Search
              </CustomButton>
            </div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
};

export default BloodBankSearchBar;