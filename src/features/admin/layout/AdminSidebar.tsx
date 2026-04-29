import { NavLink } from "react-router-dom";
import {
  Droplets,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  Shield,
  Users2,
} from "lucide-react";

type SidebarItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  badge: string | null;
};

type SidebarSection = {
  label: string;
  items: SidebarItem[];
};

const buildSidebarSections = (usersCount?: number | null, donationsCount?: number | null, bloodRequestsCount?: number | null): SidebarSection[] => [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, badge: null },
      { label: "Users", to: "/admin/users", icon: Users2, badge: usersCount == null ? null : String(usersCount) },
      { label: "Reports", to: "/admin/reports", icon: ListChecks, badge: "5" },
    ],
  },
  {
    label: "Requests",
    items: [
      { label: "Blood requests", to: "/admin/blood-requests", icon: Droplets, badge: bloodRequestsCount == null ? null : String(bloodRequestsCount) },
      { label: "Donations", to: "/admin/donations", icon: Shield, badge: donationsCount == null ? null : String(donationsCount) },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Verifications", to: "/admin/verifications", icon: Shield, badge: "5" },
      { label: "Settings", to: "/admin/settings", icon: Settings, badge: null },
    ],
  },
];

interface AdminSidebarProps {
  onLogout: () => void;
  logoutLoading?: boolean;
  usersCount?: number | null;
  donationsCount?: number | null;
  bloodRequestsCount?: number | null;
}

export default function AdminSidebar({
  onLogout,
  logoutLoading = false,
  usersCount = null,
  donationsCount = null,
  bloodRequestsCount = null,
}: AdminSidebarProps) {
  const sidebarSections = buildSidebarSections(usersCount, donationsCount, bloodRequestsCount);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-65 flex-col border-r border-white/10 bg-[#8b1114] text-white overflow-y-auto z-50">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-black/10 px-3 py-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg shadow-black/10">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[17px] font-semibold leading-none">BloodConnect</p>
            <p className="mt-1 text-[11px] uppercase tracking-[2.5px] text-white/65">
              Admin portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-5">
          {sidebarSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-xs uppercase tracking-[2px] text-white/35">
                {section.label}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.to === "/admin"}
                      className={({ isActive }) =>
                        [
                          "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                          isActive
                            ? "bg-white/15 text-white shadow-inner shadow-black/10"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      }
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.badge ? (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="rounded-3xl border border-white/10 bg-black/15 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
              SA
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Super Admin</p>
              <p className="text-xs text-white/60">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            disabled={logoutLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {logoutLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
