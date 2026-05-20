import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCcw, Trash2, UserCheck2 } from "lucide-react";
import {
  getAdminDeletedUsersApi,
  restoreAdminDeletedUserApi,
  deleteAdminDeletedUserApi,
} from "../service/adminService.ts";
import type {
  AdminDeletedUser,
} from "../types/admin";

const roleLabelMap: Record<AdminDeletedUser["role"], string> = {
  donor: "Donor",
  user: "User",
  hospital: "Hospital",
  admin: "Admin",
};

export default function AdminDeletedUsersPage() {
  const [deletedUsers, setDeletedUsers] = useState<AdminDeletedUser[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDeletedUsers = useCallback(
    async (page = 1, searchQuery = "") => {
      try {
        setLoading(true);
        const data = await getAdminDeletedUsersApi({
          page,
          limit: pagination.limit,
          search: searchQuery || undefined,
        });

        setDeletedUsers(data.deletedUsers);
        setPagination(data.pagination);
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load deleted users";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    void fetchDeletedUsers(1, search);
  }, [fetchDeletedUsers, search]);

  const mostRecentDeletedAt = useMemo(() => {
    if (deletedUsers.length === 0) return "-";
    const latest = deletedUsers.reduce((latestTime, user) => {
      const time = new Date(user.deletedAt).getTime();
      return time > latestTime ? time : latestTime;
    }, 0);

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(latest));
  }, [deletedUsers]);

  const topReason = useMemo(() => {
    if (deletedUsers.length === 0) return "-";
    const counts = deletedUsers.reduce((acc, user) => {
      acc[user.reason] = (acc[user.reason] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "-";
  }, [deletedUsers]);

  const stats = useMemo(
    () => ({
      total: pagination.total,
      donors: deletedUsers.filter((user) => user.role === "donor").length,
      hospitals: deletedUsers.filter((user) => user.role === "hospital").length,
      users: deletedUsers.filter((user) => user.role === "user").length,
    }),
    [deletedUsers, pagination.total],
  );

  const handleRestore = async (id: string) => {
    try {
      setActionLoading(id);
      await restoreAdminDeletedUserApi(id);
      toast.success("Deleted user restored successfully");
      setDeletedUsers((prev) => prev.filter((user) => user.id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to restore deleted user";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      setActionLoading(id);
      await deleteAdminDeletedUserApi(id);
      toast.success("Deleted user snapshot removed permanently");
      setDeletedUsers((prev) => prev.filter((user) => user.id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete user permanently";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-white/10 bg-[#1f1f28]/80 p-8 shadow-[0_60px_120px_rgba(0,0,0,0.25)]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Deleted Users</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Recovery & archive</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Monitor deleted accounts, restore recoverable users, or remove them permanently from the system.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchDeletedUsers(pagination.page, search)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh data
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-white/10 bg-[#11111b] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total deleted</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.total}</p>
            <p className="mt-2 text-sm text-white/60">Accounts removed from the platform</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#11111b] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Donors</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.donors}</p>
            <p className="mt-2 text-sm text-white/60">Deleted donor accounts</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#11111b] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Users</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.users}</p>
            <p className="mt-2 text-sm text-white/60">Deleted user accounts</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#11111b] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Hospitals</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.hospitals}</p>
            <p className="mt-2 text-sm text-white/60">Deleted hospital accounts</p>
          </article>
        </div>
      </div>

      <div className="rounded-4xl border border-white/10 bg-[#1f1f28]/80 p-6 shadow-[0_40px_80px_rgba(0,0,0,0.18)]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Recommended Deleted User Table</h3>
            <p className="mt-2 text-sm text-white/60">
              Review removed accounts and choose whether to restore them or permanently delete them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-white/70">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Most recent deletion: {mostRecentDeletedAt}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Top reason: {topReason}</span>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label className="sr-only" htmlFor="deleted-user-search">
              Search deleted users
            </label>
            <input
              id="deleted-user-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search deleted users by name or email"
              className="w-full rounded-2xl border border-white/10 bg-[#11111b] px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              type="button"
              onClick={() => void fetchDeletedUsers(Math.max(1, pagination.page - 1), search)}
              disabled={pagination.page <= 1 || loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => void fetchDeletedUsers(Math.min(pagination.totalPages, pagination.page + 1), search)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#11111b]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-white/80">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-white/50">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Deleted At</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-white/50">
                      Loading deleted users...
                    </td>
                  </tr>
                ) : deletedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-white/50">
                      No deleted user records available.
                    </td>
                  </tr>
                ) : (
                  deletedUsers.map((user) => (
                    <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-white">{user.name}</td>
                      <td className="px-5 py-4 text-white/70">{user.email}</td>
                      <td className="px-5 py-4 text-white/70">{roleLabelMap[user.role]}</td>
                      <td className="px-5 py-4 text-white/70">{new Date(user.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                      <td className="px-5 py-4 text-white/70">{user.reason}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleRestore(user.id)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <UserCheck2 className="h-3.5 w-3.5" />
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => void handlePermanentDelete(user.id)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Forever
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
