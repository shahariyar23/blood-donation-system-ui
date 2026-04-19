import { useEffect, useMemo, useState } from "react";
import { Icons } from "../../../shared/icons/Icons";
import HospitalDonationModal from "./HospitalDonationModal";
import {
  statusStyles,
  mapDonation,
  mapHospitalDonor,
  type DonationStatus,
  type HospitalDonation,
  type HospitalDonor,
} from "../service/hospitalData";
import {
  approveHospitalDonation,
  fetchHospitalDonations,
  fetchHospitalDonors,
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [donors, setDonors] = useState<HospitalDonor[]>([]);
  const [donorLoading, setDonorLoading] = useState(false);
  const [donorError, setDonorError] = useState<string | null>(null);
  const [donorPage, setDonorPage] = useState(1);
  const [donorTotalPages, setDonorTotalPages] = useState(1);
  const [donorQuery, setDonorQuery] = useState("");
  const [donorSearch, setDonorSearch] = useState("");
  const [donorLimit] = useState(8);

  const counts = useMemo(() => {
    return {
      total: donations.length,
      pending: donations.filter((d) => d.status === "pending").length,
      approved: donations.filter((d) => d.status === "approved").length,
      rejected: donations.filter((d) => d.status === "rejected").length,
    };
  }, [donations]);

  const filtered = useMemo(() => {
    return donations;
  }, [donations]);

  const loadDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHospitalDonations({
        status: activeTab === "all" ? undefined : activeTab,
        page,
        limit,
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
  }, [activeTab, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const loadDonors = async () => {
    setDonorLoading(true);
    setDonorError(null);
    try {
      const response = await fetchHospitalDonors({
        search: donorSearch || undefined,
        page: donorPage,
        limit: donorLimit,
      });
      setDonors(response.users.map(mapHospitalDonor));
      setDonorTotalPages(response.pagination.totalPages);
    } catch {
      setDonorError("Failed to load donors");
    } finally {
      setDonorLoading(false);
    }
  };

  useEffect(() => {
    void loadDonors();
  }, [donorSearch, donorPage]);

  const handleApprove = async (id: string) => {
    try {
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
    } catch {
      setError("Failed to approve donation");
    }
  };

  const handleReject = async (id: string, note: string) => {
    try {
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
    } catch {
      setError("Failed to reject donation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-gray-400">
            Hospital Portal
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Donation approvals
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Shift</span>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Active
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">Total requests</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{counts.total}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{counts.pending}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
          <p className="text-xs text-emerald-600">Approved</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{counts.approved}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 shadow-sm">
          <p className="text-xs text-rose-600">Rejected</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{counts.rejected}</p>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-gray-400">
              Donor Directory
            </p>
            <p className="text-sm text-gray-600">
              Search donors by email or phone
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDonorPage(1);
              setDonorSearch(donorQuery.trim());
            }}
            className="flex w-full sm:w-auto gap-2"
          >
            <div className="relative flex-1">
              <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={donorQuery}
                onChange={(e) => setDonorQuery(e.target.value)}
                placeholder="Search by email or phone"
                className="w-full sm:w-72 rounded-full border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm
                  text-gray-700 focus:border-red-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-gray-900 text-white px-4 py-2 text-xs font-semibold"
            >
              Search
            </button>
            {donorSearch && (
              <button
                type="button"
                onClick={() => {
                  setDonorQuery("");
                  setDonorSearch("");
                  setDonorPage(1);
                }}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {donorError && (
          <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {donorError}
          </div>
        )}

        <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs uppercase tracking-[2px] text-gray-400 border-b border-gray-100">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Blood</div>
            <div className="col-span-2">City</div>
          </div>
          <div className="divide-y divide-gray-100">
            {donorLoading ? (
              <div className="px-4 py-6 text-sm text-gray-400">Loading donors...</div>
            ) : donors.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-400">No donors found.</div>
            ) : (
              donors.map((donor) => (
                <div key={donor.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-gray-600">
                  <div className="col-span-3 font-semibold text-gray-900">
                    {donor.name}
                  </div>
                  <div className="col-span-3 break-all">
                    {donor.email}
                  </div>
                  <div className="col-span-2">
                    {donor.phone}
                  </div>
                  <div className="col-span-2">
                    {donor.bloodType}
                  </div>
                  <div className="col-span-2">
                    {donor.city}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Page {donorPage} of {donorTotalPages}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDonorPage((prev) => Math.max(1, prev - 1))}
              disabled={donorPage <= 1 || donorLoading}
              className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setDonorPage((prev) => Math.min(donorTotalPages, prev + 1))}
              disabled={donorPage >= donorTotalPages || donorLoading}
              className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs uppercase tracking-[2px] text-gray-400 border-b border-gray-100">
          <div className="col-span-4">Donor</div>
          <div className="col-span-2">Blood</div>
          <div className="col-span-2">Units</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-5 py-8 text-sm text-gray-400">Loading donations...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-400">No donations found.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveDonation(item)}
                className="grid grid-cols-12 gap-3 px-5 py-4 text-left hover:bg-slate-50 transition"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 font-semibold flex items-center justify-center">
                    {item.bloodType}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Donor #{item.donorId.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.patientInfo || "Patient info pending"}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                  <Icons.Blood className="w-3 h-3 text-red-500" />
                  {item.bloodType}
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {item.units} unit(s)
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-US")
                    : "-"}
                </div>
                <div className="col-span-2">
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
                </div>
              </button>
            ))
          )}
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
