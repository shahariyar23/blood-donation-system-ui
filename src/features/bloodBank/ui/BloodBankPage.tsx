import { useState } from "react";
import MainContainer from "../../../shared/main-container/MainContainer";
import BloodBankHero         from "../ui/BloodBankHero";
import BloodBankSearchBar    from "../ui/BloodBankSearchBar";
import BloodBankFilterSidebar from "../ui/BloodBankFilter";
import BloodBankGrid         from "../ui/BloodBankGrid";
import {
  allBanks,
  applyBankFilters,
  DEFAULT_FILTERS,
  type BankFilterState,
} from "../service/bloodBankData";

const BloodBankPage = () => {
  const [filters,      setFilters]      = useState<BankFilterState>(DEFAULT_FILTERS);
  const [showFilters,  setShowFilters]  = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading,      setLoading]      = useState(false);

  // Filtered list
  const filtered = applyBankFilters(allBanks, filters);
  const visible  = filtered.slice(0, visibleCount);

  // ── Helpers ──────────────────────────────────────────
  const updateFilters = (updated: Partial<BankFilterState>) => {
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

  return (
    <div className="min-h-screen bg-light">

      {/* Hero */}
      <BloodBankHero totalCount={allBanks.length} />

      {/* Search bar — overlaps hero */}
      <BloodBankSearchBar
        filters={filters}
        onFilterChange={updateFilters}
      />

      {/* Main content */}
      <MainContainer>
        <div className="flex flex-col lg:flex-row gap-6 pb-16">

          {/* Sidebar */}
          <BloodBankFilterSidebar
            filters={filters}
            isOpen={showFilters}
            resultCount={filtered.length}
            onToggle={() => setShowFilters((prev) => !prev)}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <BloodBankGrid
              banks={visible}
              visibleCount={visibleCount}
              totalFiltered={filtered.length}
              filters={filters}
              loading={loading}
              onLoadMore={handleLoadMore}
              onReset={resetFilters}
            />
          </div>

        </div>
      </MainContainer>
    </div>
  );
};

export default BloodBankPage;