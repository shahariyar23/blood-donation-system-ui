import CustomButton from "../../../shared/button/CustomButton";
import BuildInLoader from "../../../shared/loader/BuildInLoader";
import { Icons } from "../../../shared/icons/Icons";
import { SORT_OPTIONS, type BloodBank, type BankFilterState } from "../service/bloodBankData";
import BloodBankCard from "../container/BloodBankCard";

interface BloodBankGridProps {
  banks:          BloodBank[];
  visibleCount:   number;
  totalFiltered:  number;
  filters:        BankFilterState;
  loading:        boolean;
  onLoadMore:     () => void;
  onReset:        () => void;
}

const BloodBankGrid = ({
  banks,
  visibleCount,
  totalFiltered,
  filters,
  loading,
  onLoadMore,
  onReset,
}: BloodBankGridProps) => {

  // ── Empty state ────────────────────────────────────
  if (totalFiltered === 0) {
    return (
      <div className="bg-white rounded-xs shadow-md p-10 sm:p-14 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 center-flex mx-auto mb-5">
          <Icons.Hospital className="text-primary" />
        </div>
        <h3 className="font-serif font-bold text-dark text-lg mb-2">
          No blood banks found
        </h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
          Try changing your search filters or selecting a different district.
        </p>
        <CustomButton variant="primary" size="md" radius="xs" onClick={onReset}>
          Clear All Filters
        </CustomButton>
      </div>
    );
  }

  return (
    <div>
      {/* Result count row — desktop */}
      <div className="hidden lg:flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-bold text-dark">
            {Math.min(visibleCount, totalFiltered)}
          </span>{" "}
          of <span className="font-bold text-dark">{totalFiltered}</span> blood banks
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Icons.LocationPin className=" text-primary" />
          Sorted by {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
        {banks.map((bank) => (
          <BloodBankCard
            key={bank.id}
            bank={bank}
            highlightGroup={filters.bloodType}
          />
        ))}
      </div>

      {/* Load more */}
      {visibleCount < totalFiltered && (
        <div className="mt-8 center-flex flex-col gap-4">
          {loading ? (
            <BuildInLoader />
          ) : (
            <CustomButton
              variant="outline"
              size="md"
              radius="full"
              onClick={onLoadMore}
            >
              Load More Banks
            </CustomButton>
          )}
        </div>
      )}

      {/* All loaded */}
      {visibleCount >= totalFiltered && totalFiltered > 6 && (
        <p className="mt-8 text-center text-xs text-gray-400">
          All {totalFiltered} blood banks loaded
        </p>
      )}
    </div>
  );
};

export default BloodBankGrid;