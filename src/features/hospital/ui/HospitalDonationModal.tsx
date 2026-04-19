import { useEffect, useState } from "react";
import { Icons } from "../../../shared/icons/Icons";
import Api from "../../../utilities/api";
import type { HospitalDonation } from "../service/hospitalData";

interface HospitalDonationModalProps {
  donation: HospitalDonation | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
}

interface DonorProfile {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string | null;
  bloodType?: string | null;
  location?: {
    city?: string;
  };
  avatar?: string | null;
}

const HospitalDonationModal = ({
  donation,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: HospitalDonationModalProps) => {
  if (!isOpen || !donation) return null;

  const [note, setNote] = useState("");
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const isPending = donation.status === "pending";

  useEffect(() => {
    if (!isOpen || !donation) return;
    let isActive = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      setNote("");
      try {
        const res = await Api.get(`/users/${donation.donorId}`);
        const payload = res.data?.data as DonorProfile | undefined;
        if (isActive) setDonorProfile(payload ?? null);
      } catch {
        if (isActive) setDonorProfile(null);
      } finally {
        if (isActive) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      isActive = false;
    };
  }, [donation, isOpen]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Donation review"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-gray-400">
              Donation Review
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-1">
              {donorProfile?.name || `Donor #${donation.donorId.slice(-6)}`}
            </h3>
            <p className="text-sm text-gray-500">
              Donation ID {donation.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 overflow-y-auto max-h-[60vh] pr-2">
          <div className="flex items-center gap-2">
            <span className="blood-badge">{donation.bloodType}</span>
            <span>Donor blood</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Blood className="w-3 h-3 text-red-500" />
            <span>{donation.units} unit(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Hospital className="w-3 h-3 text-red-500" />
            <span>Hospital ID: {donation.hospitalId || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Clock className="w-3 h-3 text-slate-500" />
            <span>
              {donation.donatedAt
                ? new Date(donation.donatedAt).toLocaleString("en-US")
                : "Not donated yet"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Mail className="w-3 h-3 text-indigo-500" />
            <span className="break-all">
              {loadingProfile ? "Loading..." : donorProfile?.email || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Phone className="w-3 h-3 text-emerald-500" />
            <span>{loadingProfile ? "Loading..." : donorProfile?.phone || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Location className="w-3 h-3 text-primary" />
            <span>
              {loadingProfile
                ? "Loading..."
                : donorProfile?.location?.city || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.AlertCircle className="w-3 h-3 text-amber-500" />
            <span>Status: {donation.status}</span>
          </div>
          {donation.patientInfo && (
            <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-md p-3 text-xs text-slate-600">
              Patient: {donation.patientInfo}
            </div>
          )}
          <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-md p-3 text-xs text-slate-600">
            {donation.notes || "No notes provided."}
          </div>
          {donation.reportNote && (
            <div className="col-span-2 bg-rose-50 border border-rose-100 rounded-md p-3 text-xs text-rose-600">
              Rejection note: {donation.reportNote}
            </div>
          )}
          {isPending && (
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Report note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-600 focus:border-rose-300 focus:outline-none"
                rows={3}
                placeholder="Add a note if you reject this donation"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              donation.status === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-100"
                : donation.status === "approved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-100"
            }`}
          >
            {donation.status}
          </span>

          {isPending ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onReject(donation.id, note)}
                className="px-4 py-2 rounded-md border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onApprove(donation.id)}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Approve
              </button>
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              Status locked after decision
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDonationModal;
