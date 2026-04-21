import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { clearHospital } from "../../redux/slices/hospitalSlice";
import { hospitalLogoutApi } from "../../features/hospital/service/hospitalAuthService";
import { Icons } from "../icons/Icons";

const navItems = [
  { label: "Dashboard", to: "/hospital", icon: Icons.Dashboard, end: true },
  { label: "Donor Selection", to: "/hospital/donors", icon: Icons.Search },
];

const HospitalLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await hospitalLogoutApi();
      toast.success(result.message || "Logged out successfully");
    } catch {
      toast.error("Session ended. Signing out locally.");
    } finally {
      dispatch(clearHospital());
      navigate("/hospital/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Icons.Hospital className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[3px] text-gray-400">
                  Portal
                </p>
                <p className="text-sm font-semibold text-gray-900">Hospital</p>
              </div>
            </div>
          </div>

          <nav className="px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-slate-50",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto p-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-slate-50 hover:text-rose-700"
            >
              <Icons.Close className="w-4 h-4 text-rose-500" />
              Logout
            </button>
            <div className="px-3 pt-4 text-xs text-gray-400">
              BloodConnect Hospital Portal
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icons.Blood className="w-4 h-4 text-red-500" />
                Donation approvals
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                Hospital shift dashboard
              </div>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default HospitalLayout;
