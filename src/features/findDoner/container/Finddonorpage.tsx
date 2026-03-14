import { useState } from "react";
import MainContainer from "../../../shared/main-container/MainContainer";
import FindDonorHero from "../ui/FindDonorHero";
import DonorSearchBar from "../ui/DonorSearchBar";
import DonorFilterSidebar from "../ui/DonorFilter";
import DonorGrid from "../ui/DonorGrid";
import {
  allDonors,
  applyFilters,
  DEFAULT_FILTERS,
  type FilterState,
} from "../service/Donordata";

const FindDonorPage = () => {
  const [filters,      setFilters]      = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters,  setShowFilters]  = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading,      setLoading]      = useState(false);

  // Filtered donor list
  const filtered = applyFilters(allDonors, filters);
  const visible  = filtered.slice(0, visibleCount);

  // ── Helpers ──────────────────────────────────────────
  const updateFilters = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setVisibleCount(6);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(6);
  };

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setLoading(false);
    }, 800);
  };

  const handleExpandSearch = () => {
    updateFilters({ distance: 50, bloodType: "All" });
  };

  return (
    <div className="min-h-screen bg-light">

      {/* Hero banner */}
      <FindDonorHero donorCount={filtered.length} />

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
            donorCount={filtered.length}
            onToggle={() => setShowFilters((prev) => !prev)}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          {/* Donor cards grid */}
          <div className="flex-1 min-w-0">
            <DonorGrid
              donors={visible}
              visibleCount={visibleCount}
              totalFiltered={filtered.length}
              sortBy={filters.sortBy}
              onLoadMore={handleLoadMore}
              onExpandSearch={handleExpandSearch}
              loading={loading}
            />
          </div>

        </div>
      </MainContainer>
    </div>
  );
};

export default FindDonorPage;