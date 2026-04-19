import CustomButton from "../../../shared/button/CustomButton";
import BuildInLoader from "../../../shared/loader/BuildInLoader";
import { Icons } from "../../../shared/icons/Icons";
import { SORT_OPTIONS, type Donor, type FilterState } from "../service/Donordata";
import DonorCard from "./DonorCard";

interface DonorGridProps {
  donors: Donor[];
  visibleCount: number;
  totalFiltered: number;
  sortBy: FilterState["sortBy"];
  onLoadMore: () => void;
  onExpandSearch: () => void;
  loading?: boolean;
  isFetching?: boolean;
}

const DonorGrid = ({
  donors,
  visibleCount,
  totalFiltered,
  sortBy,
  onLoadMore,
  onExpandSearch,
  loading = false,
  isFetching = false,
}: DonorGridProps) => {

  if (isFetching && donors.length === 0) {
    return (
      <div className="bg-white rounded-xs shadow-md p-10 sm:p-14 center-flex">
        <BuildInLoader />
      </div>
    );
  }

  // ── Empty state ──
  if (totalFiltered === 0) {
    return (
      <div className="bg-white rounded-xs shadow-md p-10 sm:p-14 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 center-flex mx-auto mb-5">
          <Icons.Blood className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-serif font-bold text-dark text-lg mb-2">
          No donors found
        </h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
          Try expanding your search distance or changing the blood group filter.
        </p>
        <CustomButton
          variant="primary"
          size="md"
          radius="xs"
          onClick={onExpandSearch}
        >
          Expand Search
        </CustomButton>
      </div>
    );
  }

  return (
    <div>
      {/* Result count row */}
      <div className="hidden lg:flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-bold text-dark">
            {Math.min(visibleCount, totalFiltered)}
          </span>{" "}
          of <span className="font-bold text-dark">{totalFiltered}</span> donors
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Icons.LocationPin className="w-3 h-3 text-primary" />
          Sorted by {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {donors.map((donor) => (
          <DonorCard key={donor.id} donor={donor} />
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
              Load More Donors
            </CustomButton>
          )}
        </div>
      )}

      {/* All loaded message */}
      {visibleCount >= totalFiltered && totalFiltered > 6 && (
        <p className="mt-8 text-center text-xs text-gray-400">
          All {totalFiltered} donors loaded
        </p>
      )}
    </div>
  );
};

export default DonorGrid;