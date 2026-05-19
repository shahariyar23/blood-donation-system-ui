import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Clock,
  Droplets,
  Filter,
  Heart,
  MapPin,
  Phone,
  Search,
  X,
  Zap,
} from "lucide-react";
import Api from "../../../utilities/api";
import CustomLoader from "../../../shared/loader/CustomLoader";
import CustomButton from "../../../shared/button/CustomButton";
import toast from "react-hot-toast";

interface BloodRequest {
  _id: string;
  requestedBy: string;
  patientName: string;
  bloodType: string;
  units: number;
  hospital: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  locationDetails: any | null;
  phone: string;
  urgency: "critical" | "urgent" | "moderate" | "planned";
  neededBy: string;
  expiresAt: string;
  notes: string;
  agreeTerms: boolean;
  status: "active" | "fulfilled" | "expired" | "cancelled";
  respondedDonors: string[];
  fulfilledBy: string | null;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    requests: BloodRequest[];
    pagination: Pagination;
  };
}

const BLOOD_COLORS: Record<string, string> = {
  "A+": "#ef4444",
  "A-": "#b91c1c",
  "B+": "#f97316",
  "B-": "#c2410c",
  "AB+": "#8b5cf6",
  "AB-": "#6d28d9",
  "O+": "#10b981",
  "O-": "#047857",
};

const URGENCY_STYLE: Record<BloodRequest["urgency"], { label: string; color: string; tint: string; border: string }> = {
  critical: { label: "CRITICAL", color: "#ef4444", tint: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.28)" },
  urgent: { label: "URGENT", color: "#f97316", tint: "rgba(249,115,22,.10)", border: "rgba(249,115,22,.28)" },
  moderate: { label: "MODERATE", color: "#f59e0b", tint: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.28)" },
  planned: { label: "PLANNED", color: "#64748b", tint: "rgba(100,116,139,.08)", border: "rgba(100,116,139,.22)" },
};

const SEL =
  "w-full appearance-none cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/40 hover:border-red-300";

function timeAgo(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function BloodOrb({ bloodType, critical }: { bloodType: string; critical: boolean }) {
  const base = BLOOD_COLORS[bloodType] || "#ef4444";
  return (
    <div className="relative h-16 w-16 shrink-0">
      {critical && (
        <span
          className="absolute -inset-1.25 rounded-full border-2 opacity-45"
          style={{ borderColor: base, animation: "pulse-ring 1.7s ease-out infinite" }}
        />
      )}
      <div
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full shadow-lg"
        style={{ background: `radial-gradient(circle at 35% 35%,${base}ee,${base}77)`, boxShadow: critical ? `0 0 0 3px ${base}44,0 8px 24px ${base}55` : `0 4px 16px ${base}33` }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-linear-to-b from-white/30 to-transparent" />
        <span className="relative text-sm font-extrabold tracking-tight text-white">{bloodType}</span>
      </div>
    </div>
  );
}

function RequestCard({ req, idx }: { req: BloodRequest; idx: number }) {
  const [hovered, setHovered] = useState(false);
  const [responding, setResponding] = useState(false);
  const style = URGENCY_STYLE[req.urgency];
  const bloodColor = BLOOD_COLORS[req.bloodType] || "#ef4444";
  const isFilled = req.status === "fulfilled";

  const handleDonate = async () => {
    setResponding(true);
    try {
      await Api.post(`/blood-requests/${req._id}/respond`);
      // Optionally show success message or refresh
      toast.success("Thank you for your interest! Your response has been recorded.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record your response. Please try again.");
    } finally {
      setResponding(false);
    }
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        animation: "pop-in .42s cubic-bezier(.34,1.4,.64,1) both",
        animationDelay: `${idx * 0.07}s`,
        borderColor: hovered ? style.border : "rgba(229,57,53,.14)",
        boxShadow: hovered ? `0 22px 42px rgba(229,57,53,.10)` : undefined,
      }}
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${bloodColor},${bloodColor}55)` }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start gap-3 border-b border-red-100 pb-4">
          <BloodOrb bloodType={req.bloodType} critical={req.urgency === "critical"} />
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black text-dark transition-colors group-hover:text-primary">
                  {req.patientName}
                </h3>
                <p className="truncate text-sm font-medium text-slate-500">{req.hospital}</p>
              </div>
              {!isFilled ? (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ background: style.tint, borderColor: style.border, color: style.color }}
                >
                  {req.urgency === "critical" && <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: style.color }} />}
                  {style.label}
                </span>
              ) : (
                <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-green-700">
                  ✓ Filled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-4 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{req.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <span>{req.units} unit{req.units > 1 ? "s" : ""} needed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Needed by: {new Date(req.neededBy).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Expires: {new Date(req.expiresAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="h-4 w-4" />
            <span>Posted {timeAgo(req.createdAt)}</span>
          </div>
        </div>

        {req.notes && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="mb-1 font-bold">⚑ Note</p>
            <p className="text-sm leading-6">{req.notes}</p>
          </div>
        )}

        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold">Responded donors:</span> {req.respondedDonors.length}
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/60 px-3 py-3">
          <Phone className="h-4 w-4 shrink-0 text-primary" />
          <a href={`tel:${req.phone}`} className="text-sm font-bold text-primary transition hover:text-red-700">
            Patient: {req.phone}
          </a>
        </div>

        <div className="mt-auto pt-2">
          {!isFilled ? (
            <CustomButton
              fullWidth
              variant="primary"
              size="md"
              radius="lg"
              onClick={handleDonate}
              loading={responding}
              disabled={responding}
              leftIcon={<Heart className="h-4 w-4" />}
            >
              I Can Manage
            </CustomButton>
          ) : (
            <CustomButton
              fullWidth
              variant="secondary"
              size="md"
              radius="lg"
              disabled
            >
              ✓ Request Fulfilled
            </CustomButton>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ViewAllRequestBlood() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ bt: string; ug: string; st: "active" | "fulfilled" | "expired" | "cancelled" | "all" }>({
    bt: "",
    ug: "",
    st: "active",
  });

  const fetchRequests = async (status: string = "active") => {
    setLoading(true);
    setError(null);
    try {
      const res = await Api.get<ApiResponse>("/blood-requests/all", {
        params: { page: 1, limit: 100, status },
      });
      setRequests(res.data.data.requests);
      setPagination(res.data.data.pagination);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(filters.st || "all");
  }, [filters.st]);

  const bloodTypes = [...new Set(requests.map((r) => r.bloodType))];

  const stats = {
    total: pagination?.total || requests.length,
    active: requests.filter((request) => request.status === "active").length,
    expired: requests.filter((request) => request.status === "expired").length,
  };

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        if (filters.bt && request.bloodType !== filters.bt) return false;
        if (filters.ug && request.urgency !== filters.ug) return false;
        if (filters.st && filters.st !== "all" && request.status !== filters.st) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !request.patientName.toLowerCase().includes(q) &&
            !request.hospital.toLowerCase().includes(q) &&
            !request.location.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      }),
    [requests, filters.bt, filters.ug, filters.st, search]
  );

  const hasFilters = Boolean(search || filters.bt || filters.ug || filters.st !== "active");

  return (
    <div className="min-h-screen bg-light text-dark">
      <style>{`
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.7);opacity:0} }
        @keyframes pop-in { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes live-dot { 0%,100%{box-shadow:0 0 0 0 rgba(229,57,53,.35)} 60%{box-shadow:0 0 0 8px rgba(229,57,53,0)} }
      `}</style>

      <section className="relative overflow-hidden border-b border-red-100 bg-[radial-gradient(circle_at_top_left,rgba(229,57,53,0.12),transparent_36%),radial-gradient(circle_at_top_right,rgba(248,113,113,0.12),transparent_32%),linear-gradient(180deg,#fff7f7_0%,#ffffff_55%)] py-12 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_60%,rgba(229,57,53,.08)_0%,transparent_55%),radial-gradient(ellipse_at_85%_40%,rgba(248,113,113,.08)_0%,transparent_55%)]" />
        <div className="container-custom relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-1.5 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animation: "live-dot 1.8s infinite" }} />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">BloodConnect Requests</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-dark sm:text-5xl">
            BloodConnect <span className="text-primary">Request Center</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Browse available blood requests. If you are logged in, your own requests are excluded from this list.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: <Activity className="h-4 w-4" />, label: "Total", val: pagination?.total || 0 },
              { icon: <Zap className="h-4 w-4" />, label: "Active", val: requests.filter((request) => request.status === "active").length },
              { icon: <Heart className="h-4 w-4" />, label: "Expired", val: requests.filter((request) => request.status === "expired").length },
            ].map((item) => (
              <div key={item.label} className="glass flex items-center gap-3 rounded-2xl border border-red-100 px-4 py-3 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-primary">{item.icon}</span>
                <div>
                  <div className="text-2xl font-black leading-none text-dark">{item.val}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-custom px-4 py-8">
        <div className="mb-6 rounded-3xl border border-red-100 bg-white p-5 shadow-lg shadow-red-100/40 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Filter Requests</span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search patient, hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${SEL} pl-10`}
              />
            </div>
            <select value={filters.bt} onChange={(e) => setFilters((prev) => ({ ...prev, bt: e.target.value }))} className={SEL}>
              <option value="">All Types</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select value={filters.ug} onChange={(e) => setFilters((prev) => ({ ...prev, ug: e.target.value }))} className={SEL}>
              <option value="">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="urgent">Urgent</option>
              <option value="moderate">Moderate</option>
            </select>
            <select value={filters.st} onChange={(e) => setFilters((prev) => ({ ...prev, st: e.target.value as "active" | "fulfilled" | "expired" | "cancelled" | "all" }))} className={SEL}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Showing <span className="font-bold text-primary">{filteredRequests.length}</span> of {stats.total} requests
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setFilters({ bt: "", ug: "", st: "active" });
                setSearch("");
              }}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-red-300 hover:text-primary"
              type="button"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <CustomLoader />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              ⚠️
            </div>
            <h3 className="mb-2 text-lg font-bold text-red-800">Error Loading Requests</h3>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => fetchRequests()}
              className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              type="button"
            >
              Try Again
            </button>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((request, idx) => (
              <RequestCard key={request._id} req={request} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl text-primary">
              🩸
            </div>
            <h3 className="mb-2 text-2xl font-black text-dark">No results found</h3>
            <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-slate-600">
              Adjust your filters or check back later.
            </p>
            <button
              onClick={() => {
                setFilters({ bt: "", ug: "", st: "active" });
                setSearch("");
              }}
              className="btn-primary rounded-full"
              type="button"
            >
              ✕ Clear Filters
            </button>
          </div>
        )}

        <div className="mt-10 rounded-3xl bg-linear-to-r from-primary to-red-600 px-6 py-8 text-white shadow-2xl shadow-red-200/50 sm:px-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-100">BloodConnect</p>
              <h3 className="text-2xl font-black">Need to post a new blood request?</h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-red-50">
                Add a request and reach donors faster with the same clean BloodConnect UI across your site.
              </p>
            </div>
            <button
              onClick={() => navigate("/request")}
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition hover:scale-105 hover:bg-red-50"
              type="button"
            >
              Post Blood Request
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
