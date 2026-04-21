import { useEffect, useState } from "react";
import type { Donor } from "../service/Donordata";
import { Icons } from "../../../shared/icons/Icons";
import Api from "../../../utilities/api";
import CustomButton from "../../../shared/button/CustomButton";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";

interface DonorDetailsModalProps {
  donor: Donor;
  isOpen: boolean;
  onClose: () => void;
}

interface DonorProfile {
  _id: string;
  id:string,
  name: string;
  email?: string;
  phone?: string;
  gender?: string | null;
  bloodType?: string | null;
  lastDonationDate?: string | null;
  totalDonations?: number;
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  };
  isDonorVerified?: boolean;
  communityFlags?: number;
  location: {
    city?: string;
  };
  createdAt?: string;
}

const DonorDetailsModal = ({ donor, isOpen, onClose }: DonorDetailsModalProps) => {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const authUser = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await Api.get(`/users/${donor.id}`);
        const payload = response.data?.data as DonorProfile | undefined;
        if (isActive) setProfile(payload ?? null);
      } catch {
        if (isActive) setError("Failed to load donor details");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isActive = false;
    };
  }, [donor.id, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      let nextFrameId: number | null = null;
      const frameId = window.requestAnimationFrame(() => {
        nextFrameId = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => {
        window.cancelAnimationFrame(frameId);
        if (nextFrameId !== null) {
          window.cancelAnimationFrame(nextFrameId);
        }
      };
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => {
      setIsMounted(false);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isMounted) return null;

  const donorId = donor.id;
  const bloodType = profile?.bloodType ?? donor.bloodType;
  const collectionId = authUser?._id;

  const handleRequestBlood = async () => {
    console.log(authUser)
    if (!donorId) {
      toast.error("Missing donor information");
      return;
    }
    if (!collectionId) {
      toast.error("Please login to request blood");
      return;
    }
    if (!bloodType) {
      toast.error("Missing blood group");
      return;
    }

    setRequestLoading(true);
    try {
      const res = await Api.post("/donations/request", {
        donorId,
        bloodType,
        collectionId,
      });
      toast.success(res?.data?.message ?? "Blood request sent");
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Failed to send blood request");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4
        transition-opacity duration-300 ease-out
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Donor details"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-md shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-hidden
          transition-[opacity,transform] duration-300 ease-out
          ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-100
              center-flex font-black text-primary text-xl shrink-0 overflow-hidden">
              {donor.avatar ? (
                <img
                  src={donor.avatar}
                  alt={profile?.name ?? donor.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (profile?.name ?? donor.name).charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-dark text-lg leading-tight">
                  {profile?.name ?? donor.name}
                </h3>
                {(profile?.isDonorVerified ?? donor.isDonorVerified) && (
                  <Icons.Check className="w-3 h-3 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {profile?.location?.city ?? donor.location}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <Icons.Close className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 overflow-y-auto max-h-[60vh] pr-1">
          {loading && (
            <div className="col-span-2 text-sm text-gray-400">
              Loading donor details...
            </div>
          )}

          {error && !loading && (
            <div className="col-span-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="blood-badge">{profile?.bloodType ?? donor.bloodType}</span>
            <span>Blood Group</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Location className="w-3 h-3 text-primary" />
            <span>{donor.distance} km away</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Blood className="w-3 h-3 text-red-500" />
            <span>{profile?.totalDonations ?? donor.totalDonations} donations</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Clock className="w-3 h-3 text-slate-500" />
            <span>{profile?.lastDonationDate ?? donor.lastDonation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Check className={`w-3 h-3 ${(profile?.isDonorVerified ?? donor.isDonorVerified) ? "text-emerald-500" : "text-indigo-500"}`} />
            <span>{(profile?.isDonorVerified ?? donor.isDonorVerified) ? "Verified donor" : "Not verified"}</span>
          </div>

          {profile?.email && (
            <div className="flex items-center gap-2">
              <Icons.Email className="w-3 h-3 text-indigo-500" />
              <span className="break-all">{profile.email}</span>
            </div>
          )}

          {profile?.phone && (
            <div className="flex items-center gap-2">
              <Icons.Phone className="w-3 h-3 text-emerald-500" />
              <span>{profile.phone}</span>
            </div>
          )}

          {profile?.gender && (
            <div className="flex items-center gap-2">
              <Icons.User className="w-3 h-3 text-slate-500" />
              <span>{profile.gender}</span>
            </div>
          )}

          {profile?.location?.city && (
            <div className="flex items-center gap-2">
              <Icons.Location className="w-3 h-3 text-primary" />
              <span>{profile.location.city}</span>
            </div>
          )}

          {typeof profile?.communityFlags === "number" && (
            <div className="flex items-center gap-2">
              <Icons.Shield className="w-3 h-3 text-amber-500" />
              <span>Community flags: {profile.communityFlags}</span>
            </div>
          )}

          {profile?.createdAt && (
            <div className="flex items-center gap-2">
              <Icons.Time className="w-3 h-3 text-slate-500" />
              <span>Joined: {new Date(profile.createdAt).toLocaleDateString("en-US")}</span>
            </div>
          )}

          {(profile?.socialLinks?.facebook || profile?.socialLinks?.instagram || profile?.socialLinks?.twitter) && (
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Social Profiles
              </p>
              <div className="flex flex-wrap items-center gap-2">
              {profile.socialLinks?.facebook && (
                <a
                  href={profile.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold
                    bg-blue-50 text-blue-700 border border-blue-100
                    hover:bg-blue-100 hover:shadow-sm transition-all"
                >
                  <Icons.Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </a>
              )}
              {profile.socialLinks?.instagram && (
                <a
                  href={profile.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold
                    bg-rose-50 text-rose-700 border border-rose-100
                    hover:bg-rose-100 hover:shadow-sm transition-all"
                >
                  <Icons.Instagram className="w-4 h-4 text-rose-600" />
                  Instagram
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold
                    bg-sky-50 text-sky-700 border border-sky-100
                    hover:bg-sky-100 hover:shadow-sm transition-all"
                >
                  <Icons.Twitter className="w-4 h-4 text-sky-600" />
                  Twitter
                </a>
              )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <CustomButton
            variant="primary"
            size="sm"
            radius="lg"
            leftIcon={<Icons.Blood className="!w-4 !h-4" />}
            onClick={handleRequestBlood}
            loading={requestLoading}
            disabled={!donor.isAvailable || !authUser}
          >
            Request for Blood
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default DonorDetailsModal;
