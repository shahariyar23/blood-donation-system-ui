import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
} from "lucide-react";
import Search, { type SearchResult } from "../../../shared/components/Search";
import { clearUser } from "../../../redux/slices/userSlice";
import { logoutApi } from "../../login/service/loginService";
import { getAdminDashboardApi } from "../service/adminService.ts";
import AdminSidebar from "./AdminSidebar.tsx";
import type { RootState } from "../../../redux/store";

const formatHeaderDate = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [donationsCount, setDonationsCount] = useState<number | null>(null);
  const [bloodRequestsCount, setBloodRequestsCount] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardStats = async () => {
      try {
        const data = await getAdminDashboardApi();
        if (isMounted) {
          setUsersCount(data.stats.totalUsers);
          setDonationsCount(data.stats.totalDonations);
          setBloodRequestsCount(data.stats.totalBloodRequests);
        }
      } catch {
        if (isMounted) {
          setUsersCount(null);
          setDonationsCount(null);
          setBloodRequestsCount(null);
        }
      }
    };

    void loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const searchItems = useMemo<SearchResult[]>(
    () => [
      { id: "dashboard", label: "Dashboard", sublabel: "Overview and analytics", category: "Navigation", badge: "Go", badgeColor: "bg-red-600" },
      { id: "users", label: "Users", sublabel: "Manage donor, hospital and user accounts", category: "Navigation", badge: "Users", badgeColor: "bg-rose-600" },
      { id: "hospitals", label: "Hospitals", sublabel: "Review hospital profiles and status", category: "Navigation", badge: "Hospitals", badgeColor: "bg-blue-600" },
      { id: "blood-requests", label: "Blood requests", sublabel: "Track all active blood requests", category: "Navigation", badge: "Requests", badgeColor: "bg-amber-600" },
      { id: "donations", label: "Donations", sublabel: "Monitor completed donation activity", category: "Navigation", badge: "Donations", badgeColor: "bg-emerald-600" },
      { id: "verifications", label: "Verifications", sublabel: "Approve pending donor verifications", category: "Navigation", badge: "Review", badgeColor: "bg-violet-600" },
      { id: "deleted-users", label: "Deleted users", sublabel: "Restore or remove deleted accounts", category: "Navigation", badge: "Archive", badgeColor: "bg-slate-600" },
      { id: "settings", label: "Settings", sublabel: "Admin configuration and preferences", category: "Navigation", badge: "Config", badgeColor: "bg-slate-600" },
    ],
    []
  );

  const handleSearchSelect = useCallback(
    (item: SearchResult) => {
      const routeMap: Record<string, string> = {
        dashboard: "/admin",
        users: "/admin/users",
        hospitals: "/admin/hospitals",
        "blood-requests": "/admin/blood-requests",
        donations: "/admin/donations",
        verifications: "/admin/verifications",
        "deleted-users": "/admin/deleted-users",
        settings: "/admin/settings",
      };

      const route = routeMap[String(item.id)];
      if (route) {
        navigate(route);
      }
    },
    [navigate]
  );

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const normalized = query.trim();
      if (!normalized) return;
      navigate(`/admin/users?search=${encodeURIComponent(normalized)}`);
    },
    [navigate]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const searchInput = document.getElementById("admin-global-search") as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    try {
      await logoutApi();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Session ended. Signing out locally.");
    } finally {
      dispatch(clearUser());
      navigate("/admin/login", { replace: true });
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100">
      {/* Fixed Sidebar */}
      <AdminSidebar
        onLogout={() => void handleLogout()}
        logoutLoading={logoutLoading}
        usersCount={usersCount}
        donationsCount={donationsCount}
        bloodRequestsCount={bloodRequestsCount}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Fixed Header - positioned on right side */}
      <header className="fixed top-0 right-0 left-0 lg:left-65 z-20 border-b border-white/10 bg-[#2b2b2b]/95 backdrop-blur">
        <div className="px-4 py-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open admin navigation"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[26px] font-medium leading-none text-white lg:text-[28px]">Dashboard</h1>
              <p className="mt-2 truncate text-sm text-white/65">
                {formatHeaderDate(new Date())}
              </p>
            </div>
            {user && (
              <div className="inline-flex h-11 max-w-[42vw] shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 text-sm font-semibold text-white lg:hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="truncate">{user.name}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:mt-0 lg:max-w-4xl">
            <div className="min-w-0 flex-1">
              <Search
                placeholder="Search users, hospitals, blood requests…"
                items={searchItems}
                onSelect={handleSearchSelect}
                onSearch={handleSearchSubmit}
                showButton={false}
                inputId="admin-global-search"
              />
            </div>
            <div className="hidden items-center justify-end gap-3 lg:flex">
              <p className="hidden xl:block text-xs text-white/55">
                Press <span className="font-semibold">Ctrl + K</span> to focus search
              </p>
              {user && (
                <div className="inline-flex h-12 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5CF6]">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span>{user.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable only, with padding for fixed header and sidebar */}
      <main className="ml-0 mt-[164px] min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(191,28,28,0.16),transparent_36%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_26%)] p-4 sm:p-6 lg:ml-65 lg:mt-22.5 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
