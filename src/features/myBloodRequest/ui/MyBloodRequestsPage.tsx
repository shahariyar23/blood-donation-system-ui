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

interface RespondedDonor {
  _id: string;
  name: string;
  phone: string;
  bloodType: string;
  email: string;
}

function RequestCard({
  request,
  onCancel,
  onFulfill,
}: {
  request: UserBloodRequest & { respondedDonors?: RespondedDonor[]; neededBy?: string; expiresAt?: string; phone?: string; notes?: string };
  onCancel: (id: string) => Promise<void>;
  onFulfill: (id: string) => Promise<void>;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      setCancelling(true);
      try {
        await onCancel(request._id);
      } finally {
        setCancelling(false);
      }
    }
  };

  const handleFulfill = async () => {
    if (window.confirm("Are you sure this blood request has been fulfilled?")) {
      setFulfilling(true);
      try {
        await onFulfill(request._id);
      } finally {
        setFulfilling(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "fulfilled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "expired":
        return "bg-slate-700 text-white border-slate-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const locationName =
    typeof request.location === "string"
      ? request.location
      : request.location?.displayName || request.location?.city || "Unknown Location";

  const bloodColor = {
    "A+": "#ef4444",
    "A-": "#b91c1c",
    "B+": "#f97316",
    "B-": "#c2410c",
    "AB+": "#8b5cf6",
    "AB-": "#6d28d9",
    "O+": "#10b981",
    "O-": "#047857",
  }[request.bloodType] || "#ef4444";

  const isFilled = request.status === "fulfilled";

  return (
    <article className={`border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-shadow ${
      request.status.toLowerCase() === "expired" ? "bg-slate-50 opacity-80" : "bg-white"
    }`}>
      <div className="h-1 w-full mb-4" style={{ background: `linear-gradient(90deg,${bloodColor},${bloodColor}55)` }} />
      <div className="flex flex-col">
        <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-4">
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black text-dark">
                  {request.patientInfo?.name || "Patient"}
                </h3>
                <p className="truncate text-sm font-medium text-slate-500">{request.hospital}</p>
              </div>
              {!isFilled ? (
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${getStatusColor(request.status)}`}>
                  {request.status}
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
            <span className="text-primary">📍</span>
            <span className="truncate">{locationName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">🩸</span>
            <span>{request.units} unit{request.units > 1 ? "s" : ""} needed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">📅</span>
            <span>Needed by: {request.neededBy ? new Date(request.neededBy).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">⏰</span>
            <span>Expires: {request.expiresAt ? new Date(request.expiresAt).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>📝</span>
            <span>Posted {new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {request.respondedDonors && request.respondedDonors.length > 0 && (
          <div className="mb-3">
            <h4 className="mb-2 text-sm font-bold text-slate-800">Responded Donors ({request.respondedDonors.length})</h4>
            <div className="space-y-2">
              {request.respondedDonors.map((donor) => (
                <div key={donor._id} className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">{donor.name}</p>
                      <p className="text-green-700">{donor.bloodType} • {donor.email}</p>
                    </div>
                    <a href={`tel:${donor.phone}`} className="text-green-600 hover:text-green-800">
                      📞 {donor.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {request.notes && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="mb-1 font-bold">⚑ Note</p>
            <p className="text-sm leading-6">{request.notes}</p>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/60 px-3 py-3">
          <span className="text-primary">📞</span>
          <a href={`tel:${request.phone}`} className="text-sm font-bold text-primary transition hover:text-red-700">
            Patient: {request.phone}
          </a>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {request.status.toLowerCase() === "active" && (
            <>
              <CustomButton
                onClick={handleFulfill}
                disabled={cancelling}
                loading={fulfilling}
                variant="secondary"
                size="sm"
                radius="lg"
              >
                {fulfilling ? "Updating..." : "Fulfilled"}
              </CustomButton>
              <CustomButton
                onClick={handleCancel}
                disabled={cancelling || fulfilling}
                variant="danger"
                size="sm"
                radius="lg"
              >
                {cancelling ? "Cancelling..." : "Cancel Request"}
              </CustomButton>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 bg-red-50 text-primary rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
        🩸
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        No blood requests found
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        You haven't made any blood requests yet. When you need blood, you can submit a request and track it here.
      </p>
    </div>
  );
}

export default function MyBloodRequestsPage() {
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const [requests, setRequests] = useState<UserBloodRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  const loadRequests = async (page: number) => {
    if (!reduxUser?._id) return;
    setLoading(true);
    try {
      const data = await getUserBloodRequests({ page, limit: 10 });
      setRequests(data.requests);
      if (data.total !== undefined && data.limit) {
        setTotalPages(Math.ceil(data.total / data.limit));
        setTotalRequests(data.total);
      }
    } catch (err: any) {
      console.error("Failed to load requests:", err);
      toast.error(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(currentPage);
  }, [currentPage, reduxUser?._id]);

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelBloodRequest(id);
      toast.success("Request cancelled successfully");
      loadRequests(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel request");
    }
  };

  const handleFulfillRequest = async (id: string) => {
    try {
      const updatedRequest = await fulfillBloodRequest(id);
      toast.success(`Request marked as ${updatedRequest.status}`);
      loadRequests(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark request as fulfilled");
    }
  };

  const activeCount = requests.filter(
    (r) => r.status.toLowerCase() === "active"
  ).length;
  const fulfilledCount = requests.filter(
    (r) => r.status.toLowerCase() === "fulfilled"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Blood Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your blood donation requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total requests", value: totalRequests || requests.length, icon: "📋" },
            { label: "Active", value: activeCount, icon: "⏳" },
            { label: "Fulfilled", value: fulfilledCount, icon: "✅" },
            { label: "Cancelled", value: fulfilledCount, icon: "❌" },
          ].map((stat, i) => (
            <div
              key={i}
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

        {/* Requests List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-800">
              Request History
            </h2>
            <span className="text-xs text-gray-400">
              {requests.length} record{requests.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-5">
              {requests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onCancel={handleCancelRequest}
                  onFulfill={handleFulfillRequest}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-4 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="px-4 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
