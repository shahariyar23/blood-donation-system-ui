import { useEffect, useState } from "react";
import { Icons } from "../../../shared/icons/Icons";
import HospitalDonationModal from "./HospitalDonationModal";
import {
  formatPatientInfo,
  statusStyles,
  mapDonation,
  type DonationStatus,
  type HospitalDonation,
} from "../service/hospitalData";
import {
  approveHospitalDonation,
  fetchHospitalDonations,
  rejectHospitalDonation,
} from "../service/hospitalService";

const statusTabs: Array<{ label: string; value: DonationStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const HospitalDashboard = () => {
  const [donations, setDonations] = useState<HospitalDonation[]>([]);
  const [activeTab, setActiveTab] = useState<DonationStatus | "all">("all");
  const [activeDonation, setActiveDonation] = useState<HospitalDonation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [summaryCounts, setSummaryCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const loadSummaryCounts = async () => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetchHospitalDonations({ page: 1, limit: 1 }),
        fetchHospitalDonations({ status: "pending", page: 1, limit: 1 }),
        fetchHospitalDonations({ status: "approved", page: 1, limit: 1 }),
        fetchHospitalDonations({ status: "rejected", page: 1, limit: 1 }),
      ]);

      setSummaryCounts({
        total: allRes.pagination.total,
        pending: pendingRes.pagination.total,
        approved: approvedRes.pagination.total,
        rejected: rejectedRes.pagination.total,
      });
    } catch {
      // Ignore summary failure; page-level error is already handled by donation list loading.
    }
  };

  const loadDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHospitalDonations({
        status: activeTab === "all" ? undefined : activeTab,
        page,
        limit,
        search: submittedSearch.trim() || undefined,
      });
      setDonations(response.donations.map(mapDonation));
      setTotalPages(response.pagination.totalPages);
    } catch {
      setError("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDonations();
  }, [activeTab, page, submittedSearch]);

  useEffect(() => {
    void loadSummaryCounts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedSearch("");
    setPage(1);
  };

  const handleApprove = async (id: string) => {
    try {
      const previousStatus =
        activeDonation?.id === id
          ? activeDonation.status
          : donations.find((item) => item.id === id)?.status;
      const updated = await approveHospitalDonation(id);
      setDonations((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: updated.status, approvedAt: updated.approvedAt }
            : item
        )
      );
      setActiveDonation((prev) =>
        prev && prev.id === id
          ? { ...prev, status: updated.status, approvedAt: updated.approvedAt }
          : prev
      );

      if (previousStatus && previousStatus !== "approved") {
        setSummaryCounts((prev) => ({
          ...prev,
          pending: previousStatus === "pending" ? Math.max(0, prev.pending - 1) : prev.pending,
          rejected: previousStatus === "rejected" ? Math.max(0, prev.rejected - 1) : prev.rejected,
          approved: prev.approved + 1,
        }));
      }
    } catch {
      setError("Failed to approve donation");
    }
  };

  const handleReject = async (id: string, note: string) => {
    try {
      const previousStatus =
        activeDonation?.id === id
          ? activeDonation.status
          : donations.find((item) => item.id === id)?.status;
      const updated = await rejectHospitalDonation(id, note);
      setDonations((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: updated.status,
                approvedAt: updated.approvedAt,
                reportNote: updated.reportNote,
              }
            : item
        )
      );
      setActiveDonation((prev) =>
        prev && prev.id === id
          ? {
              ...prev,
              status: updated.status,
              approvedAt: updated.approvedAt,
              reportNote: updated.reportNote,
            }
          : prev
      );

      if (previousStatus && previousStatus !== "rejected") {
        setSummaryCounts((prev) => ({
          ...prev,
          pending: previousStatus === "pending" ? Math.max(0, prev.pending - 1) : prev.pending,
          approved: previousStatus === "approved" ? Math.max(0, prev.approved - 1) : prev.approved,
          rejected: prev.rejected + 1,
        }));
      }
    } catch {
      setError("Failed to reject donation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-red-100 bg-[linear-gradient(120deg,#fff1f2_0%,#ffffff_55%,#eef2ff_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-red-500 font-semibold">
              Hospital Portal
            </p>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">
              Donation Command Center
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Manage donation requests, verify donor eligibility, and approve or reject
              hospital donation records from one focused workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Shift Active
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-gray-400">
            Dashboard
          </p>
          <h2 className="text-2xl font-semibold text-gray-900">
            Donation approvals
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">Total requests</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{summaryCounts.total}</p>
        </div>
        <div className="rounded-sm border border-amber-100 bg-amber-50/60 p-4 shadow-sm">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{summaryCounts.pending}</p>
        </div>
        <div className="rounded-sm border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
          <p className="text-xs text-emerald-600">Approved</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{summaryCounts.approved}</p>
        </div>
        <div className="rounded-sm border border-rose-100 bg-rose-50/60 p-4 shadow-sm">
          <p className="text-xs text-rose-600">Rejected</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{summaryCounts.rejected}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all
              ${activeTab === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-sm border border-gray-100 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[2px] text-gray-400">
              Search requests
            </p>
            <p className="text-sm text-gray-600">
              Search by donation ID
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter donation id"
                className="w-full rounded-full border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm text-gray-700 focus:border-red-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Search
            </button>
            {(searchQuery || submittedSearch) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{ width: "36%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-[2px] text-gray-400">
                <th className="px-5 py-3 text-left font-medium">Donor</th>
                <th className="px-5 py-3 text-left font-medium">Blood</th>
                <th className="px-5 py-3 text-left font-medium">Units</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-sm text-gray-400" colSpan={5}>
                    Loading donations...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-sm text-gray-400" colSpan={5}>
                        No donations found.
                  </td>
                </tr>
              ) : (
                    donations.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setActiveDonation(item)}
                    className="cursor-pointer hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-red-50 text-red-600 font-semibold flex items-center justify-center">
                          {item.bloodType}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            Donor #{item.donorId.slice(-6)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formatPatientInfo(item.patientInfo)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Icons.Blood className="w-3 h-3 text-red-500 shrink-0" />
                        <span>{item.bloodType}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-sm text-gray-600 whitespace-nowrap">
                      {item.units} unit(s)
                    </td>
                    <td className="px-5 py-4 align-middle text-sm text-gray-600 whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US")
                        : "-"}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status]
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "pending"
                              ? "bg-amber-500"
                              : item.status === "approved"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50"
          >
            Next
          </button>
          {submittedSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-1 rounded-md border border-gray-200"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      <HospitalDonationModal
        donation={activeDonation}
        isOpen={Boolean(activeDonation)}
        onClose={() => setActiveDonation(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default HospitalDashboard;
