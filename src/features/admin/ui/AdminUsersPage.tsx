import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle,
  FileDown,
  Flag,
  Lock,
  ShieldCheck,
  UserCheck,
  UserX,
  Users2,
  X,
} from "lucide-react";
import Api from "../../../utilities/api";
import {
  getAdminUsersApi,
  getAdminSettingsApi,
  updateAdminCommunityFlagsApi,
  updateAdminUserStatusApi,
  verifyAdminDonorApi,
  verifyAdminUserApi,
} from "../service/adminService.ts";
import { downloadCsv, formatAdminDate } from "../service/adminReporting.ts";
import type { AdminUser } from "../types/admin";

interface AdminUserDetails extends AdminUser {
  avatar?: string | null;
  lastDonationDate?: string | null;
  totalDonations?: number;
  lastReceivedDate?: string | null;
  totalReceived?: number;
  nextEligibleDate?: string | null;
  location?: {
    city?: string;
    country?: string;
    state?: string;
  };
  updatedAt?: string;
}

const userCsvColumns = [
  { label: "Name", value: (user: AdminUser) => user.name },
  { label: "Email", value: (user: AdminUser) => user.email },
  { label: "Role", value: (user: AdminUser) => user.role },
  { label: "Verified", value: (user: AdminUser) => (user.isVerified ? "Yes" : "No") },
  { label: "Donor verified", value: (user: AdminUser) => (user.isDonorVerified ? "Yes" : "No") },
  { label: "Active", value: (user: AdminUser) => (user.isActive ? "Yes" : "No") },
  { label: "Flags", value: (user: AdminUser) => user.communityFlags ?? 0 },
  { label: "Blood type", value: (user: AdminUser) => user.bloodType ?? "" },
  { label: "Created at", value: (user: AdminUser) => formatAdminDate(user.createdAt) },
] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<AdminUserDetails | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [verification, setVerification] = useState<"all" | "verified" | "unverified">("all");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [eligibilityDays, setEligibilityDays] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsersApi({ page: 1, limit: 20, search, role });
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadSettings = async () => {
      try {
        const data = await getAdminSettingsApi();
        if (isActive) {
          setEligibilityDays(data.systemSettings.donationEligibilityDays ?? null);
        }
      } catch {
        if (isActive) {
          setEligibilityDays(null);
        }
      }
    };

    void loadSettings();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserDetails(null);
      return;
    }

    let isActive = true;

    const loadUserDetails = async () => {
      setDetailsLoading(true);
      try {
        const response = await Api.get(`/users/${selectedUser._id}`);
        const payload = response.data?.data as AdminUserDetails | undefined;
        if (isActive) {
          setSelectedUserDetails(payload ?? selectedUser);
        }
      } catch {
        if (isActive) {
          setSelectedUserDetails(selectedUser);
        }
      } finally {
        if (isActive) {
          setDetailsLoading(false);
        }
      }
    };

    void loadUserDetails();

    return () => {
      isActive = false;
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
        setSelectedUserDetails(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUser]);

  const visibleUsers = useMemo(() => {
    if (verification === "verified") {
      return users.filter((user) => Boolean(user.isVerified));
    }

    if (verification === "unverified") {
      return users.filter((user) => !Boolean(user.isVerified));
    }

    return users;
  }, [users, verification]);

  const verificationSummary = useMemo(
    () => ({
      total: users.length,
      verified: users.filter((user) => Boolean(user.isVerified)).length,
      pending: users.filter((user) => !Boolean(user.isVerified)).length,
      donors: users.filter((user) => user.role === "donor").length,
    }),
    [users]
  );

  const selectedUserRole = selectedUserDetails?.role ?? selectedUser?.role ?? null;
  const selectedUserLastDonationDate = selectedUserDetails?.lastDonationDate ?? null;
  const selectedUserNextEligibleDate = useMemo<string | undefined>(() => {
    if (selectedUserRole !== "donor" || !selectedUserLastDonationDate || !eligibilityDays) {
      return undefined;
    }

    const sourceDate = new Date(selectedUserLastDonationDate);
    if (Number.isNaN(sourceDate.getTime())) {
      return undefined;
    }

    sourceDate.setDate(sourceDate.getDate() + eligibilityDays);
    return sourceDate.toISOString();
  }, [eligibilityDays, selectedUserLastDonationDate, selectedUserRole]);

  const closeDetailsModal = () => {
    setSelectedUser(null);
    setSelectedUserDetails(null);
  };

  const renderDetailValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    return value;
  };

  const handleExportUsers = () => {
    if (visibleUsers.length === 0) {
      toast.error("No users available to export");
      return;
    }

    downloadCsv(
      `admin-users-${new Date().toISOString().slice(0, 10)}.csv`,
      userCsvColumns,
      visibleUsers
    );
    toast.success("Users report downloaded");
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await updateAdminUserStatusApi(user._id, !Boolean(user.isActive));
      toast.success(`User ${user.isActive ? "banned" : "activated"}`);
      await fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleVerifyDonor = async (user: AdminUser) => {
    try {
      await verifyAdminDonorApi(user._id);
      toast.success("Donor verified");
      await fetchUsers();
    } catch {
      toast.error("Failed to verify donor");
    }
  };

  const handleVerifyUser = async (user: AdminUser) => {
    try {
      await verifyAdminUserApi(user._id);
      toast.success("User verified");
      await fetchUsers();
    } catch {
      toast.error("Failed to verify user");
    }
  };

  const handleSetFlags = async (user: AdminUser) => {
    const input = window.prompt("Set community flags to:", String(user.communityFlags ?? 0));
    if (input === null) return;
    const value = Number(input);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a valid number");
      return;
    }

    try {
      await updateAdminCommunityFlagsApi(user._id, { action: "set", value });
      toast.success("Community flags updated");
      await fetchUsers();
    } catch {
      toast.error("Failed to update flags");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-amber-300 font-semibold">Admin users</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Verification and safety</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Review account status, verify users and donors, and export the current moderation list.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportUsers}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <FileDown className="h-4 w-4" />
            Generate report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-indigo-400/40 bg-[linear-gradient(135deg,#6366F1_0%,#4F46E5_100%)] p-5 shadow-[0_8px_28px_rgba(99,102,241,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-indigo-100 font-medium">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-white">{verificationSummary.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] p-5 shadow-[0_8px_28px_rgba(16,185,129,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-emerald-100 font-medium">Verified</p>
          <p className="mt-2 text-2xl font-semibold text-white">{verificationSummary.verified}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] p-5 shadow-[0_8px_28px_rgba(245,158,11,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-amber-100 font-medium">Pending review</p>
          <p className="mt-2 text-2xl font-semibold text-white">{verificationSummary.pending}</p>
        </div>
        <div className="rounded-2xl border border-sky-400/40 bg-[linear-gradient(135deg,#0EA5E9_0%,#0284C7_100%)] p-5 shadow-[0_8px_28px_rgba(14,165,233,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-sky-100 font-medium">Donors</p>
          <p className="mt-2 text-2xl font-semibold text-white">{verificationSummary.donors}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-400"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-white/15 bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_100%)] px-3 py-2 text-sm text-zinc-100 font-medium cursor-pointer hover:border-white/25 transition"
        >
          <option value="" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>All roles</option>
          <option value="user" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>User</option>
          <option value="donor" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Donor</option>
          <option value="admin" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Admin</option>
        </select>
        <button
          onClick={() => void fetchUsers()}
          className="rounded-xl bg-[linear-gradient(135deg,#8B5CF6_0%,#7C3AED_100%)] px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
        >
          Filter
        </button>
        <div className="ml-auto flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" as const },
            { label: "Verified", value: "verified" as const },
            { label: "Pending", value: "unverified" as const },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setVerification(item.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${verification === item.value ? "bg-[linear-gradient(135deg,#8B5CF6_0%,#7C3AED_100%)] text-white shadow-lg" : "bg-white/10 border border-white/15 text-zinc-200 hover:bg-white/15 hover:text-white"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#1a1d24]">
        <table className="w-full text-sm" style={{ minWidth: "900px" }}>
          <thead className="bg-[#232630] text-left text-zinc-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Verified</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Donor Verified</th>
              <th className="px-4 py-3 font-semibold">Flags</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-zinc-400" colSpan={8}>
                  Loading users...
                </td>
              </tr>
            ) : visibleUsers.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-400" colSpan={8}>
                  No users found.
                </td>
              </tr>
            ) : (
              visibleUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-white/10 cursor-pointer transition hover:bg-white/5"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-4 py-3 font-medium text-zinc-100">{user.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                  <td className="px-4 py-3 uppercase text-xs tracking-[1px] text-zinc-400">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.isVerified ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {user.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{user.isDonorVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-zinc-400">{user.communityFlags ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleToggleStatus(user);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold bg-[linear-gradient(135deg,#EF4444_0%,#DC2626_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
                        title={user.isActive ? "Ban this user" : "Activate this user"}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        {user.isActive ? "Ban" : "Activate"}
                      </button>
                      {!user.isVerified && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleVerifyUser(user);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                          title="Verify this user account"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Verify user
                        </button>
                      )}
                      {user.role === "donor" && !user.isDonorVerified && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleVerifyDonor(user);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold bg-[linear-gradient(135deg,#3B82F6_0%,#1D4ED8_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                          title="Verify donor eligibility"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verify donor
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleSetFlags(user);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                        title="Set community flags"
                      >
                        <Flag className="h-3.5 w-3.5" />
                        Set flags
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#232630] p-5 shadow-[0_8px_22px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Verification checklist</h2>
              <p className="text-sm text-zinc-400">Focus on users that are still pending account review.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            <li className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-emerald-400" /> Verify new users from the pending queue.</li>
            <li className="flex items-center gap-2"><Users2 className="h-4 w-4 text-sky-400" /> Export the current list before taking moderation action.</li>
            <li className="flex items-center gap-2"><UserX className="h-4 w-4 text-rose-400" /> Keep banned accounts separated from active review.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#232630] p-5 shadow-[0_8px_22px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3">
            <FileDown className="h-5 w-5 text-zinc-200" />
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Report generation</h2>
              <p className="text-sm text-zinc-400">Create a CSV snapshot of the visible users in one click.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportUsers}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/15"
          >
            <FileDown className="h-4 w-4" />
            Export visible users
          </button>
        </article>
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="User details"
          onClick={closeDetailsModal}
        >
          <div
            className="my-4 flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#171a20] shadow-[0_24px_80px_rgba(0,0,0,0.55)] max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-zinc-100">
                  {selectedUserDetails?.avatar ? (
                    <img
                      src={selectedUserDetails.avatar}
                      alt={selectedUserDetails?.name ?? selectedUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (selectedUserDetails?.name ?? selectedUser.name).charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[3px] text-amber-300 font-semibold">User profile</p>
                  <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
                    {selectedUserDetails?.name ?? selectedUser.name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {selectedUserDetails?.email ?? selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close user details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Role</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {selectedUserDetails?.role ?? selectedUser.role}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Verified</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {selectedUserDetails?.isVerified ? "Yes" : "No"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Active</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {selectedUserDetails?.isActive ? "Active" : "Banned"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Blood type</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {renderDetailValue(selectedUserDetails?.bloodType)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Phone</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {renderDetailValue(selectedUserDetails?.phone)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Community flags</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {selectedUserDetails?.communityFlags ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Created at</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {formatAdminDate(selectedUserDetails?.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Last update</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {formatAdminDate(selectedUserDetails?.updatedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Location</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {selectedUserDetails?.location?.city ?? "N/A"}
                  </p>
                </div>
              </div>

              {detailsLoading ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  Loading user details...
                </div>
              ) : null}

              {selectedUserRole === "donor" ? (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
                  <h3 className="text-lg font-semibold text-zinc-100">Donor activity</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Total donations</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        {selectedUserDetails?.totalDonations ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Total received</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        {selectedUserDetails?.totalReceived ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Last donation</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        {formatAdminDate(selectedUserDetails?.lastDonationDate ?? undefined)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Next available</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        {formatAdminDate(selectedUserNextEligibleDate ?? undefined)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-zinc-400">
                    Based on the last donation date and the current eligibility window.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/5 p-5">
                  <h3 className="text-lg font-semibold text-zinc-100">Receive activity</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Total received</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        {selectedUserDetails?.totalReceived ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-medium">Last received</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        {formatAdminDate(selectedUserDetails?.lastReceivedDate ?? undefined)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
