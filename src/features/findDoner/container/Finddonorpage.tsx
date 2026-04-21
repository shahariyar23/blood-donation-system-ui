import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainContainer from "../../../shared/main-container/MainContainer";
import FindDonorHero from "../ui/FindDonorHero";
import DonorSearchBar from "../ui/DonorSearchBar";
import DonorFilterSidebar from "../ui/DonorFilter";
import DonorGrid from "../ui/DonorGrid";
import {
  DEFAULT_FILTERS,
  mapApiDonorToDonor,
  type FilterState,
} from "../service/Donordata";
import Api from "../../../utilities/api";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  clearDonors,
  resetDonors,
  setError,
  setResults,
  startFetch,
  startLoadMore,
} from "../../../redux/slices/donorSlice";

const PAGE_LIMIT = 10;

const FindDonorPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const donorsState = useSelector((state: RootState) => state.donors);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const {
    donors,
    total,
    page,
    totalPages,
    isFetching,
    loadingMore,
  } = donorsState;

  const resolvedBloodType = useMemo(() => {
    if (filters.bloodType !== "All") return filters.bloodType;
    return reduxUser?.bloodType ?? "";
  }, [filters.bloodType, reduxUser?.bloodType]);

  const coords = reduxUser?.location?.coordinates;
  const canSearch = Boolean(
    resolvedBloodType &&
    coords?.lat !== null && coords?.lat !== undefined &&
    coords?.lng !== null && coords?.lng !== undefined
  );

  const fetchDonors = useCallback(async (pageToLoad: number, append: boolean) => {
    if (!canSearch) {
      dispatch(resetDonors());
      return;
    }

    if (append) dispatch(startLoadMore());
    else dispatch(startFetch());

    try {
      const response = await Api.get("/donors", {
        params: {
          bloodType: resolvedBloodType,
          excludeUserId: reduxUser?._id,
          lat: coords?.lat as number,
          lng: coords?.lng as number,
          radiusKm: filters.distance,
          sortBy: filters.sortBy,
          page: pageToLoad,
          limit: PAGE_LIMIT,
          ...(filters.availableOnly ? { availableOnly: true } : {}),
          ...(filters.verifiedOnly ? { verifiedOnly: true } : {}),
        },
      });

      const payload = response.data?.data;
      const apiDonors = payload?.donors ?? [];
      const mappedDonors = apiDonors.map(mapApiDonorToDonor);
      console.log("[res]: ", response, "[payload]: ", payload, "[donor]", mappedDonors);
      const pagination = payload?.pagination;
      const totalCount = pagination?.total ?? mappedDonors.length;
      const totalPagesCount = pagination?.totalPages
        ?? Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

      dispatch(setResults({
        donors: mappedDonors,
        total: totalCount,
        page: pagination?.page ?? pageToLoad,
        totalPages: totalPagesCount,
        append,
      }));
    } catch {
      dispatch(setError("Failed to fetch donors"));
      if (!append) dispatch(clearDonors());
    }
  }, [
    canSearch,
    coords?.lat,
    coords?.lng,
    dispatch,
    filters.availableOnly,
    filters.distance,
    filters.sortBy,
    filters.verifiedOnly,
    resolvedBloodType,
  ]);

  // ── Helpers ──────────────────────────────────────────
  const updateFilters = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetchDonors(page + 1, true);
  };

  const handleExpandSearch = () => {
    updateFilters({ distance: 30, bloodType: "All" });
  };

  useEffect(() => {
    fetchDonors(1, false);
  }, [fetchDonors]);

  return (
    <div className="min-h-screen bg-light">

      {/* Hero banner */}
      <FindDonorHero donorCount={total} />

      {/* Search bar — overlaps hero */}
      <DonorSearchBar
        bloodType={filters.bloodType}
        location={filters.location}
        distance={filters.distance}
        onBloodTypeChange={(val) => updateFilters({ bloodType: val })}
        onLocationChange={(val)  => updateFilters({ location: val  })}
        onDistanceChange={(val)  => updateFilters({ distance: val  })}
      />

      {/* Main content */}
      <MainContainer>
        <div className="flex flex-col lg:flex-row gap-6 pb-16">

          {/* Sidebar filters */}
          <DonorFilterSidebar
            filters={filters}
            isOpen={showFilters}
            donorCount={total}
            onToggle={() => setShowFilters((prev) => !prev)}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          {/* Donor cards grid */}
          <div className="flex-1 min-w-0">
            <DonorGrid
              donors={donors}
              visibleCount={donors.length}
              totalFiltered={total}
              sortBy={filters.sortBy}
              onLoadMore={handleLoadMore}
              onExpandSearch={handleExpandSearch}
              loading={loadingMore}
              isFetching={isFetching}
            />
          </div>

        </div>
      </MainContainer>
    </div>
  );
};

export default FindDonorPage;