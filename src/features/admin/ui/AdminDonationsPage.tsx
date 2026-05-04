import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Heart, X } from "lucide-react";
import Pagination from "../../../shared/components/Pagination";
import { getAdminDonationsApi, getAdminDashboardApi, getAdminDonationDetailsApi, updateAdminDonationStatusApi } from "../service/adminService.ts";
import { downloadCsv, formatAdminDate } from "../service/adminReporting.ts";
import type { AdminDonation, AdminDonationDetails } from "../types/admin";

const donationCsvColumns = [
  { label: "Donor", value: (donation: AdminDonation) => donation.donor.name },
  { label: "Email", value: (donation: AdminDonation) => donation.donor.email ?? "" },
  { label: "Phone", value: (donation: AdminDonation) => donation.donor.phone ?? "" },
  { label: "Blood type", value: (donation: AdminDonation) => donation.bloodType },
  { label: "Hospital details", value: (donation: AdminDonation) => donation.hospital.name },
  { label: "Hospital email", value: (donation: AdminDonation) => donation.hospital.email ?? "" },
  { label: "Hospital phone", value: (donation: AdminDonation) => donation.hospital.phone ?? "" },
  { label: "Hospital address", value: (donation: AdminDonation) => donation.hospital.address ?? "" },
  { label: "Requested by", value: (donation: AdminDonation) => donation.requestedBy?.name ?? "" },
  { label: "Requested by email", value: (donation: AdminDonation) => donation.requestedBy?.email ?? "" },
  { label: "Units collected", value: (donation: AdminDonation) => donation.unitsCollected },
  { label: "Donation date", value: (donation: AdminDonation) => formatAdminDate(donation.donationDate ?? undefined) },
  { label: "Status", value: (donation: AdminDonation) => donation.status },
  { label: "Notes", value: (donation: AdminDonation) => donation.notes ?? "" },
] as const;

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ request: 0, approved: 0, pending: 0, rejected: 0, total: 0 });
  const [selectedDonation, setSelectedDonation] = useState<AdminDonation | null>(null);
  const [selectedDonationDetails, setSelectedDonationDetails] = useState<AdminDonationDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDonations = async (nextPage = page, nextStatus = status) => {
    try {
      setLoading(true);
      const data = await getAdminDonationsApi({
        page: nextPage,
        limit: itemsPerPage,
        status: nextStatus || undefined,
      });
      setDonations(data.donations);
      setTotalItems(data.pagination.total);
      setItemsPerPage(data.pagination.limit);
    } catch {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadGlobalStats = async () => {
      try {
        const dashboardData = await getAdminDashboardApi();
        
        // Fetch counts for each status
        const [requestData, approvedData, pendingData, rejectedData] = await Promise.all([
          getAdminDonationsApi({ page: 1, limit: 1, status: "request" }),
          getAdminDonationsApi({ page: 1, limit: 1, status: "approved" }),
          getAdminDonationsApi({ page: 1, limit: 1, status: "pending" }),
          getAdminDonationsApi({ page: 1, limit: 1, status: "rejected" }),
        ]);

        if (isMounted) {
          setGlobalStats({
            total: dashboardData.stats.totalDonations,
            request: requestData.pagination.total,
            approved: approvedData.pagination.total,
            pending: pendingData.pagination.total,
            rejected: rejectedData.pagination.total,
          });
        }
      } catch {
        // stats remain at default
      }
    };

    void loadGlobalStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void fetchDonations();
  }, [page, status]);

  useEffect(() => {
    if (!selectedDonation) {
      setSelectedDonationDetails(null);
      return;
    }

    const fetchDonationDetails = async () => {
      try {
        setDetailsLoading(true);
        const details = await getAdminDonationDetailsApi(selectedDonation._id);
        setSelectedDonationDetails(details);
      } catch {
        toast.error("Failed to load donation details");
      } finally {
        setDetailsLoading(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDonation(null);
        setSelectedDonationDetails(null);
        setActionReason("");
      }
    };

    void fetchDonationDetails();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedDonation]);

  const stats = useMemo(
    () => ({
      total: globalStats.total,
      request: globalStats.request,
      approved: globalStats.approved,
      pending: globalStats.pending,
      rejected: globalStats.rejected,
    }),
    [globalStats]
  );

  const handleExportDonations = () => {
    if (donations.length === 0) {
      toast.error("No donations available to export");
      return;
    }

    downloadCsv(
      `admin-donations-${new Date().toISOString().slice(0, 10)}.csv`,
      donationCsvColumns,
      donations
    );
    toast.success("Donations report downloaded");
  };

  const handleUpdateDonationStatus = async (newStatus: string) => {
    if (!selectedDonation) return;
    if (!actionReason.trim()) {
      toast.error("Please provide a reason for this action");
      return;
    }

    try {
      setActionLoading(true);
      const demoPayload = {
        donationId: selectedDonation._id,
        status: newStatus,
        notes: actionReason,
      };

      // Demo payload for backend API (logged for debugging)
      // { donationId, status, notes }
      // Example: { donationId: "abc123", status: "approved", notes: "Verified blood test" }
      // Call the API to update donation status
      console.debug("Donation status update payload:", demoPayload);

      await updateAdminDonationStatusApi(selectedDonation._id, {
        status: newStatus,
        notes: actionReason,
      });

      // update local state after successful API call
      setDonations(donations.map((d) =>
        d._id === selectedDonation._id
          ? { ...d, status: newStatus, notes: actionReason }
          : d
      ));

      toast.success(`Donation marked as ${newStatus}`);
      setSelectedDonation(null);
      setActionReason("");
    } catch {
      toast.error("Failed to update donation status");
    } finally {
      setActionLoading(false);
    }
  };

  const getAvailableActions = () => {
    if (!selectedDonation) return [];
    
    const currentStatus = selectedDonation.status;
    const allActions = [
      { status: "request", label: "Request", color: "bg-blue-500" },
      { status: "approved", label: "Approve", color: "bg-emerald-500" },
      { status: "pending", label: "Pending", color: "bg-amber-500" },
      { status: "rejected", label: "Reject", color: "bg-rose-500" },
    ];
    
    return allActions.filter(action => action.status !== currentStatus);
  };

  const getStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      case "request":
        return "Request";
      default:
        return currentStatus;
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-rose-300 font-semibold">Donation Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">All Donations</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Track and manage all blood donations from registered donors.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportDonations}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <FileDown className="h-4 w-4" />
            Export report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-400/40 bg-[linear-gradient(135deg,#64748B_0%,#475569_100%)] p-5 shadow-[0_8px_28px_rgba(100,116,139,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-slate-200 font-medium">Total donations</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-blue-400/40 bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] p-5 shadow-[0_8px_28px_rgba(59,130,246,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-blue-100 font-medium">Request</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.request}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] p-5 shadow-[0_8px_28px_rgba(16,185,129,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-emerald-100 font-medium">Approved</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] p-5 shadow-[0_8px_28px_rgba(245,158,11,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-amber-100 font-medium">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-rose-400/40 bg-[linear-gradient(135deg,#EF4444_0%,#DC2626_100%)] p-5 shadow-[0_8px_28px_rgba(239,68,68,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-rose-100 font-medium">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.rejected}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-white/15 bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_100%)] px-3 py-2 text-sm text-zinc-100 font-medium cursor-pointer hover:border-white/25 transition"
        >
          <option value="" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>All statuses</option>
          <option value="request" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Request</option>
          <option value="approved" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Approved</option>
          <option value="pending" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Pending</option>
          <option value="rejected" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Rejected</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            Loading donations...
          </div>
        ) : donations.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            No donations found.
          </div>
        ) : (
          donations.map((donation) => (
            <article
              key={donation._id}
              onClick={() => setSelectedDonation(donation)}
              className="rounded-xl border border-white/10 bg-[#232630] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.16)] transition hover:border-white/20 cursor-pointer hover:bg-[#2a2e38]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20">
                    <Heart className="h-5 w-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{donation.donor.name}</p>
                    <p className="text-xs text-zinc-400">
                      {donation.unitsCollected} unit{donation.unitsCollected > 1 ? "s" : ""} of {donation.bloodType} • {donation.hospital.name}
                    </p>
                    {donation.requestedBy ? (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Requested by {donation.requestedBy.name}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${
                    donation.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : donation.status === "pending"
                        ? "bg-amber-500/20 text-amber-300"
                        : donation.status === "request"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {donation.status}
                </span>
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                {donation.donationDate ? `Donated on ${formatAdminDate(donation.donationDate)}` : "Donation pending"}
              </div>
              {donation.notes ? <p className="mt-2 text-xs text-zinc-400">Note: {donation.notes}</p> : null}
            </article>
          ))
        )}
      </div>

      {!loading && totalItems > 0 ? (
        <Pagination
          currentPage={page}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
        />
      ) : null}

      {selectedDonation && (
        <div className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1d24] rounded-2xl border border-white/10 w-full max-w-4xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] my-4 flex flex-col max-h-[90vh]">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-[#232630] border-b border-white/10 shrink-0">
              <h2 className="text-2xl font-semibold text-zinc-100">Donation Details</h2>
              <button
                onClick={() => {
                  setSelectedDonation(null);
                  setSelectedDonationDetails(null);
                  setActionReason("");
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-rose-400 mb-4"></div>
                  <p className="text-sm text-zinc-400">Loading donation details...</p>
                </div>
              </div>
            ) : selectedDonationDetails ? (
              <div className="flex-1 min-h-0 overflow-y-auto pb-8">
                <div className="p-6 space-y-6">
                  {/* Donor Info with Avatar */}
                  <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Donor Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-full bg-rose-500/20 flex items-center justify-center overflow-hidden">
                        {selectedDonationDetails.donor.avatar ? (
                          <img
                            src={selectedDonationDetails.donor.avatar}
                            alt={selectedDonationDetails.donor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-rose-400">
                            {selectedDonationDetails.donor.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-zinc-100">{selectedDonationDetails.donor.name}</p>
                        <p className="text-sm text-zinc-400">Verified: {selectedDonationDetails.donor.isVerified ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Email</p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.donor.email}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Phone</p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.donor.phone}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Blood Type</p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.donor.bloodType}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Total Donations</p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.donorStats.totalDonations}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receiver Info */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Receiver Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Receiver Name</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.receiver.name}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Email</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.receiver.email}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Phone</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.receiver.phone}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Total Received</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.receiver.totalReceived}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Patient Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Patient Name</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.name}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Age</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.age ?? "N/A"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Gender</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.gender}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Phone</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.phone}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 md:col-span-2">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Address</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.address}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 md:col-span-2">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Reason for Blood</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.reasonForBlood}</p>
                    </div>
                    {selectedDonationDetails.patientInfo.medicalCondition && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 md:col-span-2">
                        <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Medical Condition</p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.medicalCondition}</p>
                      </div>
                    )}
                    {selectedDonationDetails.patientInfo.doctorName && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Doctor Name</p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.doctorName}</p>
                      </div>
                    )}
                    {selectedDonationDetails.patientInfo.doctorPhone && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Doctor Phone</p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.patientInfo.doctorPhone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hospital Info */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Hospital Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Hospital Name</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.hospitalName}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Registration Number</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.registrationNumber}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Email</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.email}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Phone</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.phone}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">License Number</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.licenseNumber}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Verified</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.isVerified ? "Yes" : "No"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Admin Name</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.adminName}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Admin Phone</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.adminPhone}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Bed Capacity</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.totalBedCapacity}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Blood Bank Capacity</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.bloodBankCapacity}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 md:col-span-2">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Address</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospital.profile.address}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 md:col-span-2">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Location</p>
                      <p className="text-sm font-semibold text-zinc-100">
                        {selectedDonationDetails.hospital.profile.location.area}, {selectedDonationDetails.hospital.profile.location.district}, {selectedDonationDetails.hospital.profile.location.division}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Donation Info */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Donation Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Blood Type</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.bloodType}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Units Collected</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.unitsCollected}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Donation Date</p>
                      <p className="text-sm font-semibold text-zinc-100">{formatAdminDate(selectedDonationDetails.donationDate)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Current Status</p>
                      <p className={`text-sm font-semibold uppercase ${
                        selectedDonationDetails.status === "approved"
                          ? "text-emerald-300"
                          : selectedDonationDetails.status === "pending"
                            ? "text-amber-300"
                            : selectedDonationDetails.status === "request"
                              ? "text-blue-300"
                              : "text-rose-300"
                      }`}>
                        {getStatusLabel(selectedDonationDetails.status)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hospital Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Hospital Statistics</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Total Received</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospitalStats.totalReceived}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Total Donations Received</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospitalStats.totalDonationsReceived}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium mb-1">Total Units Received</p>
                      <p className="text-sm font-semibold text-zinc-100">{selectedDonationDetails.hospitalStats.totalUnitsReceived}</p>
                    </div>
                  </div>
                </div>

                {/* Current Notes */}
                {selectedDonationDetails.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Admin Notes</h3>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-sm text-zinc-100">{selectedDonationDetails.notes}</p>
                    </div>
                  </div>
                )}

                {/* Action Section */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Update Status</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Reason for status change</label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Enter why you are approving, marking pending, rejecting, or requesting this donation..."
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/20"
                      rows={4}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {getAvailableActions().map((action) => (
                      <button
                        key={action.status}
                        onClick={() => void handleUpdateDonationStatus(action.status)}
                        disabled={actionLoading}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition ${action.color} hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {actionLoading ? "Updating..." : action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-sm text-zinc-400">Failed to load donation details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
