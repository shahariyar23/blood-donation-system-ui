import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Plus,
  User,
} from "lucide-react";
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
      />

      {/* Fixed Header - positioned on right side */}
      <header className="fixed top-0 right-0 left-0 lg:left-65 z-20 border-b border-white/10 bg-[#2b2b2b]/95 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-[28px] font-medium leading-none text-white">Dashboard</h1>
            <p className="mt-2 text-sm text-white/65">
              {formatHeaderDate(new Date())}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            {user && (
              <div className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B5CF6]">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span>{user.name}</span>
              </div>
            )}
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Add donor
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable only, with padding for fixed header and sidebar */}
      <main className="ml-0 lg:ml-65 mt-22.5 min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(191,28,28,0.16),transparent_36%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_26%)] p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
