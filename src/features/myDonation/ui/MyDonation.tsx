import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import {
  fetchDonorHistory,
  type DonationItem,
  type Pagination,
} from "../service/myDonations.service";
import { DonationCard } from "./DonationCard";
import { EmptyState } from "./EmptyState";

export default function MyDonationsPage() {
  const reduxUser = useSelector((state: RootState) => state.user.user);

  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totalDonations, setTotalDonations] = useState(0);
  const [nextAvailableAt, setNextAvailableAt] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async (page: number) => {
    if (!reduxUser?._id) return;
    setIsFetching(true);
    try {
      const data = await fetchDonorHistory(reduxUser._id, page, 10);
      console.log(data)
      setDonations(data.donationHistory);
      setPagination(data.pagination);
      setTotalDonations(data.totalDonations);
      setNextAvailableAt(data.nextAvailableAt)
    } catch (err) {
      console.error("Failed to fetch donation history", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, reduxUser?._id]);

  const nextEligible = nextAvailableAt
  ? new Date(nextAvailableAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : "Now";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10 pb-20">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My donations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your complete donation history
          </p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total donations", value: totalDonations, icon: "🩸" },
            { label: "Units donated", value: totalDonations, icon: "💉" },
            { label: "Lives impacted", value: totalDonations * 3, icon: "❤️" },
            { label: "Next eligible", value: nextEligible, icon: "📅" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-2xl p-5 text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* donation list */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-800">
              Donation history
            </h2>
            <span className="text-xs text-gray-400">
              {donations.length} record{donations.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isFetching ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : donations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {donations.map((d, i) => (
                <DonationCard key={i} donation={d} />
              ))}
            </div>
          )}

          {/* pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* eligibility info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex gap-3 items-start">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Donation eligibility
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                You must wait at least <strong>90 days</strong> between whole
                blood donations. Your next eligible date is{" "}
                <strong>{nextEligible}</strong>. Stay hydrated and maintain a
                healthy diet before donating.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
