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
  ChevronDown,
  Shield,
  Ban,
} from "lucide-react";
import {
  getAdminUserDetailsApi,
  getAdminUsersApi,
  getAdminSettingsApi,
  updateAdminCommunityFlagsApi,
  updateAdminUserStatusApi,
  verifyAdminDonorApi,
  verifyAdminUserApi,
} from "../service/adminService.ts";
import { downloadCsv, formatAdminDate } from "../service/adminReporting.ts";
import type { AdminUser, AdminUserDetails } from "../types/admin";

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
        const payload = await getAdminUserDetailsApi(selectedUser._id);
        if (isActive) {
          setSelectedUserDetails({ ...selectedUser, ...payload });
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
  const selectedUserLastDonationDate = selectedUserDetails?.donorInfo?.lastDonationDate ?? null;
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
      <div className="rounded-3xl border border-gradient-to-r from-amber-500/30 to-orange-500/20 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-amber-300 font-semibold">Admin users</p>
            <h1 className="mt-2 text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Verification and safety</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-300">
              Review account status, verify users and donors, and export the current moderation list.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportUsers}
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-6 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20"
          >
            <FileDown className="h-4 w-4" />
            Generate report
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/15 to-indigo-600/10 p-6 shadow-[0_12px_28px_rgba(99,102,241,0.18)] hover:shadow-[0_16px_40px_rgba(99,102,241,0.25)] transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-indigo-200 font-semibold">Total users</p>
              <p className="mt-3 text-3xl font-bold text-indigo-100">{verificationSummary.total}</p>
            </div>
            <Users2 className="h-8 w-8 text-indigo-400/50" />
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 p-6 shadow-[0_12px_28px_rgba(16,185,129,0.18)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.25)] transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-emerald-200 font-semibold">Verified</p>
              <p className="mt-3 text-3xl font-bold text-emerald-100">{verificationSummary.verified}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400/50" />
          </div>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-amber-600/10 p-6 shadow-[0_12px_28px_rgba(245,158,11,0.18)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.25)] transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-amber-200 font-semibold">Pending review</p>
              <p className="mt-3 text-3xl font-bold text-amber-100">{verificationSummary.pending}</p>
            </div>
            <Flag className="h-8 w-8 text-amber-400/50" />
          </div>
        </div>
        <div className="rounded-2xl border border-sky-400/40 bg-gradient-to-br from-sky-500/15 to-sky-600/10 p-6 shadow-[0_12px_28px_rgba(14,165,233,0.18)] hover:shadow-[0_16px_40px_rgba(14,165,233,0.25)] transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-sky-200 font-semibold">Donors</p>
              <p className="mt-3 text-3xl font-bold text-sky-100">{verificationSummary.donors}</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-sky-400/50" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-[#232630]/50 p-5 backdrop-blur-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:bg-white/10 focus:outline-none transition"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 font-medium cursor-pointer hover:border-white/25 focus:border-amber-500/50 focus:bg-white/10 focus:outline-none transition"
        >
          <option value="" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>All roles</option>
          <option value="user" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>User</option>
          <option value="donor" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Donor</option>
          <option value="admin" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Admin</option>
        </select>
        <button
          onClick={() => void fetchUsers()}
          className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105 active:scale-95"
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
              className={`rounded-full px-5 py-2.5 text-xs font-semibold transition ${verification === item.value ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20" : "bg-white/10 border border-white/15 text-zinc-200 hover:bg-white/15 hover:text-white hover:border-white/25"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1d24] shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <table className="w-full text-sm" style={{ minWidth: "1200px" }}>
          <thead className="bg-gradient-to-r from-[#232630] to-[#2a2d35] text-left text-zinc-200">
            <tr className="border-b border-white/10">
              <th className="px-4 py-4 font-semibold text-zinc-100">Name</th>
              <th className="px-4 py-4 font-semibold text-zinc-100">Email</th>
              <th className="px-4 py-4 font-semibold text-zinc-100">Role</th>
              <th className="px-4 py-4 font-semibold text-zinc-100">Verified</th>
              <th className="px-4 py-4 font-semibold text-zinc-100">Status</th>
              <th className="px-4 py-4 font-semibold text-zinc-100">Verify Donor</th>
              <th className="px-4 py-4 font-semibold text-zinc-100">Flags</th>
              <th className="px-4 py-4 font-semibold text-zinc-100">Actions</th>
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
                  className="border-t border-white/10 transition hover:bg-white/5"
                >
                  <td className="px-4 py-4 font-medium text-zinc-100">{user.name}</td>
                  <td className="px-4 py-4 text-zinc-400">{user.email}</td>
                  <td className="px-4 py-4 uppercase text-xs tracking-[1px] text-zinc-400 font-semibold">{user.role}</td>
                  
                  {/* Verified Column with Dropdown */}
                  <td className="px-4 py-4 relative">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === `verified-${user._id}` ? null : `verified-${user._id}`)}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${user.isVerified ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"}`}
                      >
                        <span>{user.isVerified ? "Verified" : "Pending"}</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      {openDropdown === `verified-${user._id}` && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2d35] border border-white/10 rounded-lg shadow-lg z-40">
                          {!user.isVerified && (
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                void handleVerifyUser(user);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-2 border-b border-white/10"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Verify user
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setOpenDropdown(null);
                              void handleToggleStatus(user);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition flex items-center gap-2"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Ban
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Status Column with Dropdown */}
                  <td className="px-4 py-4 relative">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === `status-${user._id}` ? null : `status-${user._id}`)}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${user.isActive ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"}`}
                      >
                        <span>{user.isActive ? "Active" : "Blocked"}</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      {openDropdown === `status-${user._id}` && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2d35] border border-white/10 rounded-lg shadow-lg z-40">
                          {user.isActive ? (
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                void handleToggleStatus(user);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition flex items-center gap-2"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                void handleToggleStatus(user);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-2"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Activate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Verify Donor Column with Dropdown */}
                  <td className="px-4 py-4 relative">
                    {user.role === "donor" ? (
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === `donor-${user._id}` ? null : `donor-${user._id}`)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${user.isDonorVerified ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"}`}
                        >
                          <span>{user.isDonorVerified ? "Verified" : "Pending"}</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        {openDropdown === `donor-${user._id}` && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2d35] border border-white/10 rounded-lg shadow-lg z-40">
                            {!user.isDonorVerified && (
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  void handleVerifyDonor(user);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-2"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Verify donor
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500">N/A</span>
                    )}
                  </td>
                  
                  <td className="px-4 py-4 text-zinc-400 font-semibold">{user.communityFlags ?? 0}</td>
                  
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => void handleSetFlags(user)}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                      title="Set community flags"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Set flags
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 mt-6">
        <article className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 shadow-[0_12px_30px_rgba(16,185,129,0.15)] backdrop-blur-sm hover:shadow-[0_16px_40px_rgba(16,185,129,0.2)] transition">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-emerald-500/20 p-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Verification checklist</h2>
              <p className="mt-1 text-sm text-zinc-400">Focus on users that are still pending account review.</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-zinc-300">
            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Verify new users from the pending queue.</li>
            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Export the current list before taking moderation action.</li>
            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Keep banned accounts separated from active review.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 shadow-[0_12px_30px_rgba(245,158,11,0.15)] backdrop-blur-sm hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)] transition">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-amber-500/20 p-3">
              <FileDown className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Report generation</h2>
              <p className="mt-1 text-sm text-zinc-400">Create a CSV snapshot of the visible users in one click.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportUsers}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20"
          >
            <FileDown className="h-4 w-4" />
            Export visible users
          </button>
        </article>
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="User details"
          onClick={closeDetailsModal}
        >
          <div
            className="my-4 flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#1f222a] to-[#171a20] shadow-[0_32px_80px_rgba(0,0,0,0.65)] max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#232630] to-[#1f222a] px-8 py-6">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-lg font-bold text-amber-200">
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
                  <h2 className="mt-2 text-2xl font-bold text-zinc-100">
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
                className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white hover:border-white/20"
                aria-label="Close user details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8 pb-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-indigo-300 font-semibold">Role</p>
                  <p className="mt-3 text-sm font-bold text-indigo-100">
                    {selectedUserDetails?.role ?? selectedUser.role}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-emerald-300 font-semibold">Verified</p>
                  <p className="mt-3 text-sm font-bold text-emerald-100">
                    {selectedUserDetails?.isVerified ? "Yes" : "No"}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-sky-600/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-sky-300 font-semibold">Active</p>
                  <p className="mt-3 text-sm font-bold text-sky-100">
                    {selectedUserDetails?.isActive ? "Active" : "Banned"}
                  </p>
                </div>
                <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-orange-300 font-semibold">Blood type</p>
                  <p className="mt-3 text-sm font-bold text-orange-100">
                    {renderDetailValue(selectedUserDetails?.bloodType)}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-600/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-rose-300 font-semibold">Phone</p>
                  <p className="mt-3 text-sm font-bold text-rose-100">
                    {renderDetailValue(selectedUserDetails?.phone)}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-amber-300 font-semibold">Community flags</p>
                  <p className="mt-3 text-sm font-bold text-amber-100">
                    {selectedUserDetails?.communityFlags ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-semibold">Created at</p>
                  <p className="mt-3 text-sm font-semibold text-zinc-100">
                    {formatAdminDate(selectedUserDetails?.createdAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-semibold">Last update</p>
                  <p className="mt-3 text-sm font-semibold text-zinc-100">
                    {formatAdminDate(selectedUserDetails?.updatedAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[2px] text-zinc-400 font-semibold">Location</p>
                  <p className="mt-3 text-sm font-semibold text-zinc-100">
                    {"N/A"}
                  </p>
                </div>
              </div>

              {detailsLoading ? (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  Loading user details...
                </div>
              ) : null}

              {selectedUserRole === "donor" ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6">
                  <h3 className="text-lg font-bold text-emerald-100">Donor activity</h3>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-emerald-300 font-semibold">Donor verified</p>
                      <p className="mt-3 text-sm font-bold text-emerald-100">
                        {selectedUserDetails?.donorInfo
                          ? selectedUserDetails.donorInfo.isVerified
                            ? "Yes"
                            : "No"
                          : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-sky-300 font-semibold">Total donations</p>
                      <p className="mt-3 text-sm font-bold text-sky-100">
                        {selectedUserDetails?.donorInfo?.totalDonations ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-amber-300 font-semibold">Last donation</p>
                      <p className="mt-3 text-sm font-bold text-amber-100">
                        {formatAdminDate(selectedUserDetails?.donorInfo?.lastDonationDate ?? undefined)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-rose-300 font-semibold">Last units</p>
                      <p className="mt-3 text-sm font-bold text-rose-100">
                        {renderDetailValue(selectedUserDetails?.donorInfo?.lastDonationUnits)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                      <p className="text-xs uppercase tracking-[2px] text-indigo-300 font-semibold">Next available</p>
                      <p className="mt-3 text-sm font-bold text-indigo-100">
                        {formatAdminDate(selectedUserNextEligibleDate ?? undefined)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-emerald-300/70">
                    Based on the last donation date and the current eligibility window.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-sky-600/5 p-6">
                  <h3 className="text-lg font-bold text-sky-100">User activity</h3>
                  <p className="mt-2 text-sm text-sky-200">
                    No donor activity available for this role.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
