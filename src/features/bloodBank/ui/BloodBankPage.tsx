import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import MainContainer from "../../../shared/main-container/MainContainer";
import BloodBankHero from "../ui/BloodBankHero";
import BloodBankSearchBar from "../ui/BloodBankSearchBar";
import BloodBankFilterSidebar from "../ui/BloodBankFilter";
import BloodBankGrid from "../ui/BloodBankGrid";
import {
  applyBankFilters,
  DEFAULT_FILTERS,
  type BankFilterState,
} from "../service/bloodBankData";
import {
  type BloodBankSearchResult,
  mapSearchResultToBloodBank,
  searchBloodBanksApi,
  type BloodBankSearchResponse,
} from "../service/bloodBankService";

const PAGE_LIMIT = 5;

const defaultSearchFilters: BankFilterState = {
  ...DEFAULT_FILTERS,
  bloodType: "O+",
  district: "Dhaka",
};

const BloodBankPage = () => {
  const [filters, setFilters] = useState<BankFilterState>(defaultSearchFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(true);
  const [response, setResponse] = useState<BloodBankSearchResponse | null>(null);
  const [bankResults, setBankResults] = useState<BloodBankSearchResult[]>([]);

  const banks = useMemo(
    () => bankResults.map(mapSearchResultToBloodBank),
    [bankResults]
  );
  const allowedBloodGroups = useMemo(
    () => ["All", ...(response?.allowedBloodGroups ?? [])],
    [response]
  );
  const filtered = applyBankFilters(banks, filters);
  const currentPage = response?.pagination?.page ?? response?.page ?? 1;
  const currentLimit = response?.pagination?.limit ?? response?.limit ?? PAGE_LIMIT;
  const totalFromApi = response?.pagination?.total ?? response?.total;
  const totalPagesFromApi = response?.pagination?.totalPages ?? response?.totalPages;
  const hasMoreResults =
    totalPagesFromApi !== undefined
      ? currentPage < totalPagesFromApi
      : totalFromApi !== undefined
        ? bankResults.length < totalFromApi
        : Boolean(response && (response.results?.length ?? 0) >= currentLimit);

  const fetchBloodBanks = useCallback(async (
    nextFilters: Pick<BankFilterState, "bloodType" | "district">,
    pageToLoad = 1,
    append = false
  ) => {
    try {
      if (append) {
        setLoadMoreLoading(true);
      } else {
        setSearchLoading(true);
      }

      const data = await searchBloodBanksApi({
        bloodType: nextFilters.bloodType === "All" ? undefined : nextFilters.bloodType,
        district: nextFilters.district === "All" ? undefined : nextFilters.district,
        page: pageToLoad,
        limit: PAGE_LIMIT,
      });

      setResponse(data);
      setBankResults((prev) => {
        if (!append) return data.results ?? [];

        const existingIds = new Set(prev.map((bank) => bank.id));
        const nextResults = (data.results ?? []).filter(
          (bank) => !existingIds.has(bank.id)
        );

        return [...prev, ...nextResults];
      });
    } catch {
      toast.error("Failed to load blood bank results");
      if (!append) {
        setResponse(null);
        setBankResults([]);
      }
    } finally {
      if (append) {
        setLoadMoreLoading(false);
      } else {
        setSearchLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchBloodBanks(
      { bloodType: filters.bloodType, district: filters.district },
      1,
      false
    );
  }, [fetchBloodBanks, filters.bloodType, filters.district]);

  const updateFilters = (updated: Partial<BankFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const resetFilters = () => {
    setFilters(defaultSearchFilters);
  };

  const handleLoadMore = () => {
    if (loadMoreLoading || !hasMoreResults) return;
    void fetchBloodBanks(
      { bloodType: filters.bloodType, district: filters.district },
      currentPage + 1,
      true
    );
  };

  if (searchLoading && !response) {
    return (
      <div className="min-h-screen bg-light">
        <BloodBankHero totalCount={0} />
        <MainContainer>
          <div className="py-16 text-center text-sm text-gray-500">
            Loading blood bank results...
          </div>
        </MainContainer>
      </div>
    );
  }

  if (response && !response.isVisible) {
    return (
      <div className="min-h-screen bg-light">
        <BloodBankHero totalCount={0} />
        <MainContainer>
          <div className="py-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-dark">
              {response.sectionTitle}
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Blood bank search is currently unavailable.
            </p>
          </div>
        </MainContainer>
      </div>
    );
  }

  if (response?.isMaintenance) {
    return (
      <div className="min-h-screen bg-light">
        <BloodBankHero totalCount={0} />
        <MainContainer>
          <div className="py-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-dark">
              {response.sectionTitle}
            </h2>
            <p className="mt-3 text-sm text-gray-500">{response.message}</p>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <BloodBankHero totalCount={response?.maxResults ?? banks.length} />

      <BloodBankSearchBar
        filters={filters}
        onFilterChange={updateFilters}
        bloodGroups={allowedBloodGroups}
      />

      <MainContainer>
        {response?.notice ? (
          <div className="mb-5 rounded-xs border border-red-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            {response.notice}
          </div>
        ) : null}

        {response?.sources?.length ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {response.sources.map((source) => (
              <span
                key={`${source.name}-${source.priority}`}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm"
              >
                {source.label} - {source.status}
              </span>
            ))}
          </div>
        ) : null}

        {searchLoading ? (
          <div className="mb-5 rounded-xs border border-red-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
            Refreshing blood bank results...
          </div>
        ) : null}

        <div className="flex flex-col gap-6 pb-16 lg:flex-row">
          <BloodBankFilterSidebar
            filters={filters}
            isOpen={showFilters}
            resultCount={filtered.length}
            bloodGroups={allowedBloodGroups}
            onToggle={() => setShowFilters((prev) => !prev)}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          <div className="min-w-0 flex-1">
            <BloodBankGrid
              banks={filtered}
              visibleCount={filtered.length}
              totalFiltered={totalFromApi ?? filtered.length}
              filters={filters}
              loading={loadMoreLoading}
              hasMore={hasMoreResults}
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
