import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Droplets, X } from "lucide-react";
import Pagination from "../../../shared/components/Pagination";
import {
  getAdminBloodRequestDetailsApi,
  getAdminBloodRequestsApi,
  getAdminDashboardApi,
} from "../service/adminService.ts";
import { downloadCsv, formatAdminDate } from "../service/adminReporting.ts";
import type { AdminBloodRequest } from "../types/admin";

const getHospitalName = (request: AdminBloodRequest) =>
  typeof request.hospital === "string"
    ? request.hospital
    : request.hospital?.hospitalName ?? "N/A";

const getRequesterName = (request: AdminBloodRequest) =>
  request.requestedBy?.name ?? getHospitalName(request) ?? "Unknown requester";

const getRequesterEmail = (request: AdminBloodRequest) =>
  request.requestedBy?.email ?? (typeof request.hospital === "string" ? "" : request.hospital?.email) ?? "";

const getLocationLine = (location?: NonNullable<AdminBloodRequest["requestedBy"]>["location"]) => {
  if (!location) return "N/A";

  return [
    location.displayName,
    location.road,
    location.quarter,
    location.suburb,
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ") || "N/A";
};

const requestsCsvColumns = [
  { label: "Requested by", value: (request: AdminBloodRequest) => getRequesterName(request) },
  { label: "Requester email", value: (request: AdminBloodRequest) => getRequesterEmail(request) },
  { label: "Requester role", value: (request: AdminBloodRequest) => request.requestedBy?.role ?? "" },
  { label: "Blood type", value: (request: AdminBloodRequest) => request.bloodType },
  { label: "Units needed", value: (request: AdminBloodRequest) => request.unitsNeeded },
  { label: "Urgency level", value: (request: AdminBloodRequest) => request.urgencyLevel },
  { label: "Reason", value: (request: AdminBloodRequest) => request.reason ?? "" },
  { label: "Patient name", value: (request: AdminBloodRequest) => request.patientName ?? "" },
  { label: "Status", value: (request: AdminBloodRequest) => request.status },
  { label: "Respondents", value: (request: AdminBloodRequest) => request.respondents ?? 0 },
  { label: "Fulfilled units", value: (request: AdminBloodRequest) => request.fulfilledUnits ?? 0 },
  { label: "Needed by", value: (request: AdminBloodRequest) => formatAdminDate(request.neededBy ?? "") },
  { label: "Created at", value: (request: AdminBloodRequest) => formatAdminDate(request.createdAt ?? "") },
] as const;

export default function AdminBloodRequestsPage() {
  const [requests, setRequests] = useState<AdminBloodRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminBloodRequest | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ active: 0, fulfilled: 0, expired: 0, total: 0 });

  const fetchRequests = async (nextPage = page, nextStatus = status) => {
    try {
      setLoading(true);
      const data = await getAdminBloodRequestsApi({
        page: nextPage,
        limit: itemsPerPage,
        status: nextStatus || undefined,
      });
      setRequests(data.requests);
      setTotalItems(data.pagination.total);
      setItemsPerPage(data.pagination.limit);
    } catch {
      toast.error("Failed to load blood requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadGlobalStats = async () => {
      try {
        const dashboardData = await getAdminDashboardApi();
        
        const [activeData, fulfilledData, expiredData] = await Promise.all([
          getAdminBloodRequestsApi({ page: 1, limit: 1, status: "active" }),
          getAdminBloodRequestsApi({ page: 1, limit: 1, status: "fulfilled" }),
          getAdminBloodRequestsApi({ page: 1, limit: 1, status: "expired" }),
        ]);

        if (isMounted) {
          setGlobalStats({
            total: dashboardData.stats.totalBloodRequests,
            active: activeData.pagination.total,
            fulfilled: fulfilledData.pagination.total,
            expired: expiredData.pagination.total,
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
    void fetchRequests();
  }, [page, status]);

  const stats = useMemo(
    () => ({
      total: globalStats.total,
      active: globalStats.active,
      fulfilled: globalStats.fulfilled,
      expired: globalStats.expired,
    }),
    [globalStats]
  );

  const getStatusClass = (requestStatus: string) => {
    if (requestStatus === "active") return "bg-blue-500/20 text-blue-300";
    if (requestStatus === "fulfilled") return "bg-emerald-500/20 text-emerald-300";
    if (requestStatus === "expired") return "bg-zinc-500/20 text-zinc-300";
    if (requestStatus === "pending") return "bg-amber-500/20 text-amber-300";
    return "bg-rose-500/20 text-rose-300";
  };

  const handleExportRequests = () => {
    if (requests.length === 0) {
      toast.error("No requests available to export");
      return;
    }

    downloadCsv(
      `admin-blood-requests-${new Date().toISOString().slice(0, 10)}.csv`,
      requestsCsvColumns,
      requests
    );
    toast.success("Blood requests report downloaded");
  };

  const handleFilterReset = () => {
    setStatus("");
    setPage(1);
  };

  const handleOpenRequestDetails = async (request: AdminBloodRequest) => {
    setSelectedRequest(request);
    setDetailsLoading(true);

    try {
      const details = await getAdminBloodRequestDetailsApi(request._id);
      setSelectedRequest(details);
    } catch {
      toast.error("Failed to load request details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeRequestModal = () => {
    setSelectedRequest(null);
    setDetailsLoading(false);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-red-300 font-semibold">Blood Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Blood Requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Track blood requests, requester details, urgency, and fulfillment progress.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleExportRequests()}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <FileDown className="h-4 w-4" />
            Export report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-400/40 bg-[linear-gradient(135deg,#64748B_0%,#475569_100%)] p-5 shadow-[0_8px_28px_rgba(100,116,139,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-slate-200 font-medium">Total requests</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-blue-400/40 bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] p-5 shadow-[0_8px_28px_rgba(59,130,246,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-blue-100 font-medium">Active</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] p-5 shadow-[0_8px_28px_rgba(16,185,129,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-emerald-100 font-medium">Fulfilled</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.fulfilled}</p>
        </div>
        <div className="rounded-2xl border border-zinc-400/40 bg-[linear-gradient(135deg,#71717A_0%,#52525B_100%)] p-5 shadow-[0_8px_28px_rgba(113,113,122,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-zinc-100 font-medium">Expired</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.expired}</p>
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
          <option value="active" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Active</option>
          <option value="fulfilled" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Fulfilled</option>
          <option value="expired" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Expired</option>
        </select>
        {status && (
          <button
            onClick={() => void handleFilterReset()}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            No requests found.
          </div>
        ) : (
          requests.map((request) => (
            <article
              key={request._id}
              onClick={() => void handleOpenRequestDetails(request)}
              className="cursor-pointer rounded-xl border border-white/10 bg-[#232630] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[#2a2d38]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                    <Droplets className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{getRequesterName(request)}</p>
                    <p className="text-xs text-zinc-400">
                      {request.patientName ?? "N/A"} - {request.unitsNeeded} units of {request.bloodType} - {request.urgencyLevel}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${getStatusClass(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {getRequesterEmail(request) || "No requester email"} - {request.respondents ?? 0} respondents - needed by {formatAdminDate(request.neededBy ?? "")}
              </p>
            </article>
          ))
        )}
      </div>

      {requests.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Blood request details"
          onClick={closeRequestModal}
        >
          <div
            className="my-4 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-[#171a20] shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[#232630] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[3px] text-red-300">
                  Blood request
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
                  {selectedRequest.patientName ?? "Unnamed patient"}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {selectedRequest.unitsNeeded} units of {selectedRequest.bloodType}
                </p>
              </div>
              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                aria-label="Close request details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-6">
              {detailsLoading ? (
                <div className="mb-4 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200">
                  Loading latest request details...
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Request ID</p>
                  <p className="mt-2 break-all text-sm font-semibold text-zinc-100">{selectedRequest._id}</p>
                </div>
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-red-300">Blood type</p>
                  <p className="mt-2 text-xl font-bold text-red-100">{selectedRequest.bloodType}</p>
                </div>
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-blue-300">Status</p>
                  <p className="mt-2 text-sm font-bold uppercase text-blue-100">{selectedRequest.status}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Requested by</p>
                  <div className="mt-2 flex items-center gap-3">
                    {selectedRequest.requestedBy?.avatar ? (
                      <img
                        src={selectedRequest.requestedBy.avatar}
                        alt={selectedRequest.requestedBy.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                        {getRequesterName(selectedRequest).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{getRequesterName(selectedRequest)}</p>
                      <p className="break-all text-xs text-zinc-400">{getRequesterEmail(selectedRequest) || "No email"}</p>
                    </div>
                  </div>
                  <p className="mt-1 text-xs capitalize text-zinc-500">{selectedRequest.requestedBy?.role ?? "N/A"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Patient name</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{selectedRequest.patientName ?? "N/A"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Units needed</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{selectedRequest.unitsNeeded}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Urgency</p>
                  <p className="mt-2 text-sm font-semibold capitalize text-zinc-100">{selectedRequest.urgency ?? selectedRequest.urgencyLevel}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Respondents</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{selectedRequest.respondents ?? 0}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Request phone</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{selectedRequest.phone ?? "N/A"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Needed by</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{formatAdminDate(selectedRequest.neededBy ?? "")}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Created at</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{formatAdminDate(selectedRequest.createdAt ?? "")}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Expires at</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{formatAdminDate(selectedRequest.expiresAt ?? "")}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Updated at</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{formatAdminDate(selectedRequest.updatedAt ?? "")}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Expired</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{selectedRequest.isExpired ? "Yes" : "No"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Terms agreed</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{selectedRequest.agreeTerms ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Notes</p>
                <p className="mt-2 text-sm text-zinc-100">{selectedRequest.notes ?? selectedRequest.reason ?? "No notes provided"}</p>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Hospital and request location</p>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    <p>Hospital: {getHospitalName(selectedRequest)}</p>
                    <p>Location: {selectedRequest.location ?? "N/A"}</p>
                    <p>Latitude: {selectedRequest.latitude ?? "N/A"}</p>
                    <p>Longitude: {selectedRequest.longitude ?? "N/A"}</p>
                    <p>Location details: {selectedRequest.locationDetails ?? "N/A"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Requester profile</p>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    <p>Phone: {selectedRequest.requestedBy?.phone ?? "N/A"}</p>
                    <p>Blood type: {selectedRequest.requestedBy?.bloodType ?? "N/A"}</p>
                    <p>Verified: {selectedRequest.requestedBy?.isVerified ? "Yes" : "No"}</p>
                    <p>Active: {selectedRequest.requestedBy?.isActive ? "Yes" : "No"}</p>
                    <p>Total received: {selectedRequest.requestedBy?.totalReceived ?? 0}</p>
                    <p>Joined: {formatAdminDate(selectedRequest.requestedBy?.createdAt ?? "")}</p>
                    <p>Location: {getLocationLine(selectedRequest.requestedBy?.location)}</p>
                  </div>
                </div>
              </div>

              {(selectedRequest.respondents ?? 0) > 0 && (selectedRequest.respondedDonors?.length ?? 0) > 0 ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Responded users</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {selectedRequest.respondedDonors?.map((donor) => (
                      <div key={donor._id} className="rounded-xl border border-white/10 bg-[#232630] p-4">
                        <div className="flex items-start gap-3">
                          {donor.avatar ? (
                            <img
                              src={donor.avatar}
                              alt={donor.name}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                              {donor.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">{donor.name}</p>
                            <p className="break-all text-xs text-zinc-400">{donor.email ?? "No email"}</p>
                            <p className="mt-1 text-xs text-zinc-500">{donor.phone ?? "No phone"} - {donor.role}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
                          <p>Blood type: {donor.bloodType ?? "N/A"}</p>
                          <p>Verified: {donor.isVerified ? "Yes" : "No"}</p>
                          <p>Active: {donor.isActive ? "Yes" : "No"}</p>
                          <p>Donor verified: {donor.isDonorVerified ?? donor.isVerifyDonor ? "Yes" : "No"}</p>
                          <p>Available: {donor.donor?.isAvailable ? "Yes" : "No"}</p>
                          <p>Total donations: {donor.donor?.totalDonations ?? 0}</p>
                        </div>
                        <p className="mt-3 text-xs text-zinc-500">
                          {getLocationLine(donor.location)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
