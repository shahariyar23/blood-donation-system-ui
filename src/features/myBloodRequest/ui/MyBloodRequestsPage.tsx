import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import {
  getUserBloodRequests,
  cancelBloodRequest,
  fulfillBloodRequest,
  type UserBloodRequest,
} from "../../requestBlood/service/requestBloodApi";
import toast from "react-hot-toast";
import CustomButton from "../../../shared/button/CustomButton";

/* ── Types ─────────────────────────────────────────────────── */
interface RespondedDonor {
  _id: string;
  name: string;
  phone: string;
  bloodType: string;
  email: string;
}

type FullRequest = UserBloodRequest & {
  respondedDonors?: RespondedDonor[];
  patientName?: string;
  neededBy?: string;
  expiresAt?: string;
  phone?: string;
  notes?: string;
};

/* ── Helpers ────────────────────────────────────────────────── */
const BLOOD_COLOR: Record<string, string> = {
  "A+": "#dc2626", "A-": "#b91c1c",
  "B+": "#f97316", "B-": "#c2410c",
  "AB+": "#8b5cf6", "AB-": "#6d28d9",
  "O+": "#10b981", "O-": "#047857",
};

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500",  label: "Active"    },
  fulfilled: { bg: "bg-blue-50",     text: "text-blue-700",     dot: "bg-blue-500",     label: "Fulfilled" },
  cancelled: { bg: "bg-red-50",      text: "text-red-600",      dot: "bg-red-500",      label: "Cancelled" },
  expired:   { bg: "bg-slate-100",   text: "text-slate-500",    dot: "bg-slate-400",    label: "Expired"   },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status.toLowerCase()] ?? STATUS_STYLE.expired;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function fmt(dateStr?: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/* ── Request Card ───────────────────────────────────────────── */
function RequestCard({
  request, onCancel, onFulfill,
}: {
  request: FullRequest;
  onCancel: (id: string) => Promise<void>;
  onFulfill: (id: string) => Promise<void>;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const accent = BLOOD_COLOR[request.bloodType] ?? "#dc2626";
  const isActive = request.status.toLowerCase() === "active";
  const isExpired = request.status.toLowerCase() === "expired";
  const patientName = request.patientName || request.patientInfo?.name || "Patient";

  const location =
    typeof request.location === "string"
      ? request.location
      : request.location?.displayName || request.location?.city || "Unknown";

  const handleCancel = async () => {
    if (!window.confirm("Cancel this blood request?")) return;
    setCancelling(true);
    try { await onCancel(request._id); } finally { setCancelling(false); }
  };

  const handleFulfill = async () => {
    if (!window.confirm("Mark this request as fulfilled?")) return;
    setFulfilling(true);
    try { await onFulfill(request._id); } finally { setFulfilling(false); }
  };

  return (
    <article className={`relative rounded-2xl border overflow-hidden transition-all duration-200
      ${isExpired ? "border-slate-200 bg-slate-50/70 opacity-75" : "border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5"}`}>

      {/* left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />

      <div className="pl-5 pr-5 pt-5 pb-4">

        {/* ── top row ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* blood type badge */}
            <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm"
              style={{ backgroundColor: accent }}>
              {request.bloodType}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                {patientName}
              </h3>
              <p className="text-sm text-gray-400 truncate">{request.hospital}</p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* ── info grid ── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
            <span>{request.units} unit{request.units > 1 ? "s" : ""} needed</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Needed by {fmt(request.neededBy)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Expires {fmt(request.expiresAt)}</span>
          </div>
        </div>

        {/* ── contact strip ── */}
        {request.phone && (
          <a href={`tel:${request.phone}`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100
              text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Call patient · {request.phone}
          </a>
        )}

        {/* ── expand toggle ── */}
        {(request.notes || (request.respondedDonors && request.respondedDonors.length > 0)) && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-3"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            {expanded ? "Hide details" : `Show details${request.respondedDonors?.length ? ` · ${request.respondedDonors.length} donor${request.respondedDonors.length > 1 ? "s" : ""} responded` : ""}`}
          </button>
        )}

        {/* ── expanded section ── */}
        {expanded && (
          <div className="space-y-3 mb-4">
            {/* responded donors */}
            {request.respondedDonors && request.respondedDonors.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Responded Donors
                </p>
                <div className="space-y-2">
                  {request.respondedDonors.map((donor) => (
                    <div key={donor._id}
                      className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">{donor.name}</p>
                        <p className="text-xs text-emerald-600">{donor.bloodType} · {donor.email}</p>
                      </div>
                      <a href={`tel:${donor.phone}`}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800">
                        📞 {donor.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* notes */}
            {request.notes && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Note</p>
                <p className="text-sm text-amber-900 leading-relaxed">{request.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── footer meta + actions ── */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Posted {fmt(request.createdAt)}</span>
          {isActive && (
            <div className="flex gap-2">
              <CustomButton
                onClick={handleFulfill}
                disabled={cancelling}
                loading={fulfilling}
                variant="secondary"
                size="sm"
                radius="lg"
              >
                {fulfilling ? "Updating…" : "✓ Fulfilled"}
              </CustomButton>
              <CustomButton
                onClick={handleCancel}
                disabled={cancelling || fulfilling}
                variant="danger"
                size="sm"
                radius="lg"
              >
                {cancelling ? "Cancelling…" : "Cancel"}
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon, accent }: {
  label: string; value: number; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}15`, color: accent }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="text-center py-20 px-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">No blood requests yet</h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        When you submit a blood request, it will appear here for tracking.
      </p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function MyBloodRequestsPage() {
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const [requests, setRequests]         = useState<UserBloodRequest[]>([]);
  const [loading, setLoading]           = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [requestStats, setRequestStats] = useState<{
    active?: number;
    fulfilled?: number;
    cancelled?: number;
    expired?: number;
  }>({});
  const [filter, setFilter]             = useState<"all" | "active" | "fulfilled" | "cancelled" | "expired">("all");

  const loadRequests = async (page: number) => {
    if (!reduxUser?._id) return;
    setLoading(true);
    try {
      const data = await getUserBloodRequests({ page, limit: 10 });
      setRequests(data.requests);
      if (data.stats) {
        setRequestStats(data.stats);
      }
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalRequests(data.pagination.total);
      } else if (data.total !== undefined && data.limit) {
        setTotalPages(Math.ceil(data.total / data.limit));
        setTotalRequests(data.total);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(currentPage); }, [currentPage, reduxUser?._id]);

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelBloodRequest(id);
      toast.success("Request cancelled");
      loadRequests(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    }
  };

  const handleFulfillRequest = async (id: string) => {
    try {
      const updated = await fulfillBloodRequest(id);
      toast.success(`Marked as ${updated.status}`);
      loadRequests(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  const counts = {
    total:     totalRequests || requests.length,
    active:    requestStats.active ?? requests.filter(r => r.status.toLowerCase() === "active" && !r.isExpired).length,
    fulfilled: requestStats.fulfilled ?? requests.filter(r => r.status.toLowerCase() === "fulfilled").length,
    cancelled: requestStats.cancelled ?? requests.filter(r => r.status.toLowerCase() === "cancelled").length,
    expired:   requestStats.expired ?? requests.filter(r => r.status.toLowerCase() === "expired" || r.isExpired).length,
  };

  const filtered = filter === "all"
    ? requests
    : requests.filter(r => filter === "expired" ? r.status.toLowerCase() === "expired" || r.isExpired : r.status.toLowerCase() === filter);

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "active",    label: "Active" },
    { key: "fulfilled", label: "Fulfilled" },
    { key: "cancelled", label: "Cancelled" },
    { key: "expired",   label: "Expired" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* ── header ── */}
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-red-500 mb-2">
            My Account
          </p>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
            Blood Requests
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track and manage all your blood donation requests
          </p>
        </div>

        {/* ── stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={counts.total} accent="#6b7280"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
          />
          <StatCard label="Active" value={counts.active} accent="#10b981"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <StatCard label="Fulfilled" value={counts.fulfilled} accent="#3b82f6"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          />
          <StatCard label="Cancelled" value={counts.cancelled} accent="#ef4444"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          />
        </div>

        {/* ── filter tabs ── */}
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filter === f.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {f.label}
              {f.key !== "all" && counts[f.key] > 0 && (
                <span className={`ml-1.5 text-[10px] ${filter === f.key ? "opacity-60" : "text-gray-400"}`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── list ── */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-white border border-gray-200 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl">
              <EmptyState />
            </div>
          ) : (
            filtered.map(request => (
              <RequestCard
                key={request._id}
                request={request}
                onCancel={handleCancelRequest}
                onFulfill={handleFulfillRequest}
              />
            ))
          )}
        </div>

        {/* ── pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-4 h-9 rounded-xl border border-gray-200 text-sm text-gray-600
                disabled:opacity-40 hover:bg-gray-50 bg-white transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="px-4 h-9 rounded-xl border border-gray-200 text-sm text-gray-600
                disabled:opacity-40 hover:bg-gray-50 bg-white transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
