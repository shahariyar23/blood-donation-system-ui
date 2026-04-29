import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Droplets } from "lucide-react";
import Pagination from "../../../shared/components/Pagination";
import { getAdminBloodRequestsApi, getAdminDashboardApi } from "../service/adminService.ts";
import { downloadCsv, formatAdminDate } from "../service/adminReporting.ts";
import type { AdminBloodRequest } from "../types/admin";

const requestsCsvColumns = [
  { label: "Hospital", value: (request: AdminBloodRequest) => request.hospital.hospitalName },
  { label: "Blood type", value: (request: AdminBloodRequest) => request.bloodType },
  { label: "Units needed", value: (request: AdminBloodRequest) => request.unitsNeeded },
  { label: "Urgency level", value: (request: AdminBloodRequest) => request.urgencyLevel },
  { label: "Reason", value: (request: AdminBloodRequest) => request.reason ?? "" },
  { label: "Patient name", value: (request: AdminBloodRequest) => request.patientName ?? "" },
  { label: "Status", value: (request: AdminBloodRequest) => request.status },
  { label: "Respondents", value: (request: AdminBloodRequest) => request.respondents ?? 0 },
  { label: "Fulfilled units", value: (request: AdminBloodRequest) => request.fulfilledUnits ?? 0 },
  { label: "Created at", value: (request: AdminBloodRequest) => formatAdminDate(request.createdAt ?? "") },
] as const;

export default function AdminBloodRequestsPage() {
  const [requests, setRequests] = useState<AdminBloodRequest[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ pending: 0, fulfilled: 0, rejected: 0, total: 0 });

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
        
        // Fetch counts for each status
        const [pendingData, fulfilledData, rejectedData] = await Promise.all([
          getAdminBloodRequestsApi({ page: 1, limit: 1, status: "pending" }),
          getAdminBloodRequestsApi({ page: 1, limit: 1, status: "fulfilled" }),
          getAdminBloodRequestsApi({ page: 1, limit: 1, status: "rejected" }),
        ]);

        if (isMounted) {
          setGlobalStats({
            total: dashboardData.stats.totalBloodRequests,
            pending: pendingData.pagination.total,
            fulfilled: fulfilledData.pagination.total,
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
    void fetchRequests();
  }, [page, status]);

  const stats = useMemo(
    () => ({
      total: globalStats.total,
      pending: globalStats.pending,
      fulfilled: globalStats.fulfilled,
      rejected: globalStats.rejected,
    }),
    [globalStats]
  );

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

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-red-300 font-semibold">Blood Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Blood Requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Track and manage blood requests from hospitals and medical facilities.
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
        <div className="rounded-2xl border border-amber-400/40 bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] p-5 shadow-[0_8px_28px_rgba(245,158,11,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-amber-100 font-medium">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] p-5 shadow-[0_8px_28px_rgba(16,185,129,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-emerald-100 font-medium">Fulfilled</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.fulfilled}</p>
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
          <option value="pending" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Pending</option>
          <option value="fulfilled" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Fulfilled</option>
          <option value="rejected" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Rejected</option>
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
            <article key={request._id} className="rounded-xl border border-white/10 bg-[#232630] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.16)] hover:border-white/20 transition">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                    <Droplets className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{request.hospital.hospitalName}</p>
                    <p className="text-xs text-zinc-400">{request.patientName ?? "N/A"} • {request.unitsNeeded} units of {request.bloodType} • {request.urgencyLevel}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${
                  request.status === "pending" ? "bg-amber-500/20 text-amber-300" : 
                  request.status === "fulfilled" ? "bg-emerald-500/20 text-emerald-300" : 
                  "bg-rose-500/20 text-rose-300"
                }`}>
                  {request.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">{request.reason ?? "No reason provided"} • {request.respondents ?? 0} respondents • {request.fulfilledUnits ?? 0}/{request.unitsNeeded} units fulfilled</p>
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
    </section>
  );
}
