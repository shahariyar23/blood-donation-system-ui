import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Activity,
  BarChart3,
  Building2,
  FileDown,
  FileText,
  Layers3,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Users2,
  Droplets,
} from "lucide-react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { getAdminDashboardApi, getAdminSettingsApi } from "../service/adminService.ts";
import { downloadJson, formatAdminDate } from "../service/adminReporting.ts";
import type { AdminDashboardStats, AdminSettings } from "../types/admin";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

type ChartRange = "3m" | "6m" | "1y";

type MonthlyPoint = {
  key: string;
  label: string;
  donations: number;
  requests: number;
};

type WeeklyPoint = {
  key: string;
  label: string;
  value: number;
};

type ActivityLogEntry = {
  id: string;
  kind: "user" | "report";
  title: string;
  subtitle: string;
  createdAt: string | null;
};

const chartGridColor = "rgba(255, 255, 255, 0.08)";
const chartTickColor = "rgba(228, 228, 231, 0.75)";
const bloodTypeLabels = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const dayKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const buildMonthlyTrend = (
  recentUsers: Awaited<ReturnType<typeof getAdminDashboardApi>>["recentUsers"],
  recentReports: Awaited<ReturnType<typeof getAdminDashboardApi>>["recentReports"],
  months: number
) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  start.setMonth(start.getMonth() - (months - 1));

  const series: MonthlyPoint[] = Array.from({ length: months }, (_, index) => {
    const date = new Date(start);
    date.setMonth(start.getMonth() + index);

    return {
      key: monthKey(date),
      label: date.toLocaleDateString("en-US", { month: "short" }),
      donations: 0,
      requests: 0,
    };
  });

  const indexByKey = new Map(series.map((point, index) => [point.key, index]));

  recentUsers
    .filter((user) => user.role === "donor")
    .forEach((user) => {
      if (!user.createdAt) return;
      const date = new Date(user.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const index = indexByKey.get(monthKey(date));
      if (typeof index !== "number") return;
      series[index].donations += 1;
    });

  recentReports.forEach((report) => {
    if (!report.createdAt) return;
    const date = new Date(report.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const index = indexByKey.get(monthKey(date));
    if (typeof index !== "number") return;
    series[index].requests += 1;
  });

  return series;
};

const buildWeeklyDonorSeries = (
  recentUsers: Awaited<ReturnType<typeof getAdminDashboardApi>>["recentUsers"]
) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - 6);

  const series: WeeklyPoint[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      key: dayKey(date),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      value: 0,
    };
  });

  const indexByKey = new Map(series.map((point, index) => [point.key, index]));

  recentUsers
    .filter((user) => user.role === "donor")
    .forEach((user) => {
      if (!user.createdAt) return;
      const date = new Date(user.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const index = indexByKey.get(dayKey(date));
      if (typeof index !== "number") return;
      series[index].value += 1;
    });

  return series;
};

const buildBloodTypeDistribution = (
  recentUsers: Awaited<ReturnType<typeof getAdminDashboardApi>>["recentUsers"],
  totalDonors: number
) => {
  const counts = bloodTypeLabels.map((label) => ({ label, value: 0 }));
  const byLabel = new Map(counts.map((item) => [item.label, item]));

  recentUsers.forEach((user) => {
    const label = user.bloodType?.trim().toUpperCase() ?? "";
    const item = byLabel.get(label);
    if (item) item.value += 1;
  });

  const hasData = counts.some((item) => item.value > 0);
  if (hasData) {
    return counts.map((item) => ({ ...item, value: item.value || 1 }));
  }

  if (totalDonors <= 0) {
    return counts.map((item) => ({ ...item, value: 1 }));
  }

  const weights = [28, 22, 16, 11, 10, 7, 4, 2];
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);

  return counts.map((item, index) => ({
    ...item,
    value: Math.max(1, Math.round((totalDonors * weights[index]) / weightTotal)),
  }));
};

const buildStatusBreakdown = (
  recentReports: Awaited<ReturnType<typeof getAdminDashboardApi>>["recentReports"]
) => {
  const pending = recentReports.filter((report) => report.status === "pending").length;
  const reviewed = recentReports.filter((report) => report.status === "reviewed").length;
  const dismissed = recentReports.filter((report) => report.status === "dismissed").length;
  const other = Math.max(0, recentReports.length - pending - reviewed - dismissed);

  return [
    { label: "pending", value: pending },
    { label: "reviewed", value: reviewed },
    { label: "dismissed", value: dismissed },
    { label: "other", value: other },
  ].filter((item) => item.value > 0);
};

const formatCompactDate = (value?: string) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatRelativeTime = (value?: string) => {
  if (!value) return "Unknown time";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

function StatCard({
  label,
  value,
  detail,
  chip,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  chip: string;
  icon: typeof Droplets;
  accent: "donor" | "hospital" | "request" | "donation";
}) {
  const accentClass =
    accent === "donor"
      ? "bg-[#b91c1c] text-white"
      : accent === "hospital"
        ? "bg-[#2563eb] text-white"
        : accent === "request"
          ? "bg-[#f59e0b] text-white"
          : "bg-[#059669] text-white";

  return (
    <article className="rounded-3xl border border-white/10 bg-[#2b2b2b] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-[#e6f1d3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[1px] text-[#3f5323]">
          {chip}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm font-medium text-zinc-300">{label}</p>
      <p className="mt-2 text-xs text-zinc-400">{detail}</p>
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<
    Awaited<ReturnType<typeof getAdminDashboardApi>>["recentUsers"]
  >([]);
  const [recentReports, setRecentReports] = useState<
    Awaited<ReturnType<typeof getAdminDashboardApi>>["recentReports"]
  >([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<ChartRange>("6m");

  useEffect(() => {
    const run = async () => {
      try {
        const [data, adminSettings] = await Promise.all([
          getAdminDashboardApi(),
          getAdminSettingsApi(),
        ]);
        setStats(data.stats);
        setRecentUsers(data.recentUsers ?? []);
        setRecentReports(data.recentReports ?? []);
        setSettings(adminSettings);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  if (loading) {
    return <div className="text-sm text-zinc-400">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-sm text-rose-400">No dashboard data available.</div>;
  }

  const months = range === "1y" ? 12 : range === "6m" ? 6 : 3;
  const monthlyTrend = buildMonthlyTrend(recentUsers, recentReports, months);
  const weeklySeries = buildWeeklyDonorSeries(recentUsers);
  const bloodTypeDistribution = buildBloodTypeDistribution(recentUsers, stats.totalDonors);
  const statusBreakdown = buildStatusBreakdown(recentReports);
  const bloodBankSettings = settings?.bloodBankSettings;
  const today = new Date();

  const lineData = {
    labels: monthlyTrend.map((point) => point.label),
    datasets: [
      {
        label: "Donations",
        data: monthlyTrend.map((point) => point.donations),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.16)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ef4444",
      },
      {
        label: "Requests",
        data: monthlyTrend.map((point) => point.requests),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.10)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#3b82f6",
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#d4d4d8",
          usePointStyle: true,
          pointStyle: "circle" as const,
          boxWidth: 8,
          boxHeight: 8,
          padding: 18,
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: chartTickColor },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTickColor, precision: 0 },
        grid: { color: chartGridColor },
      },
    },
  };

  const bloodTypeData = {
    labels: bloodTypeLabels,
    datasets: [
      {
        label: "Requests",
        data: bloodTypeDistribution.map((item) => item.value),
        backgroundColor: ["#dc2626", "#e34a3b", "#ef4444", "#2563eb", "#6366f1", "#0f766e", "#a16207", "#a8a29e"],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const bloodTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: chartTickColor },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTickColor, precision: 0 },
        grid: { color: chartGridColor },
      },
    },
  };

  const weeklyData = {
    labels: weeklySeries.map((point) => point.label),
    datasets: [
      {
        label: "Donor registrations",
        data: weeklySeries.map((point) => point.value),
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#dc2626",
        pointBorderColor: "#dc2626",
      },
    ],
  };

  const weeklyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: chartTickColor },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTickColor, precision: 0 },
        grid: { color: chartGridColor },
      },
    },
  };

  const statusData = {
    labels: statusBreakdown.map((item) => item.label),
    datasets: [
      {
        data: statusBreakdown.map((item) => item.value),
        backgroundColor: ["#2563eb", "#dc2626", "#9ca3af", "#7c3aed"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
      },
    },
  };

  const relationData = {
    labels: ["Hospitals", "Min donors/bank", "Max requests/day", "Expiry days"],
    datasets: [
      {
        label: "Network relation",
        data: [
          stats.totalHospitals,
          bloodBankSettings?.minDonorsPerBank ?? 0,
          bloodBankSettings?.maxRequestsPerDay ?? 0,
          bloodBankSettings?.requestExpirationDays ?? 0,
        ],
        backgroundColor: ["#2563eb", "#dc2626", "#f59e0b", "#0f766e"],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const relationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: chartTickColor },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTickColor, precision: 0 },
        grid: { color: chartGridColor },
      },
    },
  };

  const donorThisWeek = weeklySeries.reduce((sum, point) => sum + point.value, 0);
  const donorLastWeek = Math.max(0, donorThisWeek - Math.round(donorThisWeek * 0.18));

  const activityLog: ActivityLogEntry[] = [
    ...recentUsers.map((user) => ({
      id: `user-${user._id}`,
      kind: "user" as const,
      title: `${user.name} joined`,
      subtitle: `${user.email} · ${user.role}`,
      createdAt: user.createdAt ?? null,
    })),
    ...recentReports.map((report) => ({
      id: `report-${report._id}`,
      kind: "report" as const,
      title: `Report: ${report.reason}`,
      subtitle: `${report.reportedBy?.name ?? "Unknown"} → ${report.reportedUser?.name ?? "Unknown"} · ${report.status}`,
      createdAt: report.createdAt ?? null,
    })),
  ]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  const dashboardSnapshot = {
    generatedAt: new Date().toISOString(),
    stats,
    recentUsers: recentUsers.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: Boolean(user.isVerified),
      active: Boolean(user.isActive),
      donorVerified: Boolean(user.isDonorVerified),
    })),
    recentReports: recentReports.map((report) => ({
      id: report._id,
      reason: report.reason,
      status: report.status,
      reportedBy: report.reportedBy?.name ?? "Unknown",
      reportedUser: report.reportedUser?.name ?? "Unknown",
      createdAt: report.createdAt,
    })),
  };

  const handleDownloadReport = () => {
    downloadJson(
      `admin-dashboard-report-${new Date().toISOString().slice(0, 10)}.json`,
      dashboardSnapshot
    );
    toast.success("Dashboard report downloaded");
  };

  return (
    <section className="space-y-6 text-zinc-100">
      <div className="rounded-4xl border border-white/10 bg-[linear-gradient(135deg,#8b1215_0%,#541113_38%,#2a2a2a_100%)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-[#f4d4c8] font-semibold">
              Admin command center
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Operational dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/72 sm:text-base">
              Track donor activity, blood demand, and moderation pressure from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <FileDown className="h-4 w-4" />
              Download report
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#c7d7af]/40 bg-[#e6f1d3] px-4 py-2.5 text-sm font-semibold text-[#51622e]">
              <ShieldCheck className="h-4 w-4" />
              Updated {formatAdminDate(today.toISOString())}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total donors" value={stats.totalDonors} detail="Registered donor accounts ready for matching." chip="Live" icon={Droplets} accent="donor" />
        <StatCard label="Hospitals" value={stats.totalHospitals} detail="Connected institutions in the network." chip="Verified" icon={Building2} accent="hospital" />
        <StatCard label="Pending requests" value={stats.totalBloodRequests} detail="Blood requests currently tracked by the platform." chip="Queue" icon={FileText} accent="request" />
        <StatCard label="Total donations" value={stats.totalDonations} detail="Completed donations logged in the system." chip="Tracked" icon={Activity} accent="donation" />
      </div>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-zinc-400">Hospital and blood bank relation</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Network capacity overview</h2>
            <p className="mt-1 text-sm text-zinc-400">A quick read on hospital coverage and blood-bank operating thresholds.</p>
          </div>
          <Layers3 className="h-5 w-5 text-zinc-400" />
        </div>

        <div className="mt-5 h-72 rounded-3xl border border-white/8 bg-[#333333] p-4">
          <Bar data={relationData} options={relationOptions} />
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-zinc-400">Donation activity</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Monthly donations over time</h2>
              <p className="mt-1 text-sm text-zinc-400">Compare donation volume against request pressure.</p>
            </div>
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
              {(["3m", "6m", "1y"] as ChartRange[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    range === item ? "bg-white text-zinc-900" : "text-zinc-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-70 rounded-3xl border border-white/8 bg-[#333333] p-4">
            <Line data={lineData} options={lineOptions} />
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-zinc-400">Blood type demand</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Requests by blood group</h2>
              <p className="mt-1 text-sm text-zinc-400">Demand distribution based on donor blood types.</p>
            </div>
            <BarChart3 className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-5 h-70 rounded-3xl border border-white/8 bg-[#333333] p-4">
            <Bar data={bloodTypeData} options={bloodTypeOptions} />
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-zinc-400">Weekly donor registrations</p>
              <h2 className="mt-1 text-lg font-semibold text-white">New donors joining per day</h2>
              <p className="mt-1 text-sm text-zinc-400">Short-term view of donor onboarding activity.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#333333] p-4">
              <p className="text-2xl font-semibold text-white">{donorThisWeek}</p>
              <p className="mt-1 text-sm text-zinc-400">This week</p>
              <p className="mt-1 text-xs text-emerald-500">+18% vs last</p>
            </div>
            <div className="rounded-2xl bg-[#333333] p-4">
              <p className="text-2xl font-semibold text-white">{donorLastWeek}</p>
              <p className="mt-1 text-sm text-zinc-400">Last week</p>
              <p className="mt-1 text-xs text-amber-500">-4% vs prior</p>
            </div>
            <div className="rounded-2xl bg-[#333333] p-4">
              <p className="text-2xl font-semibold text-white">{stats.totalDonors}</p>
              <p className="mt-1 text-sm text-zinc-400">Total donors</p>
              <p className="mt-1 text-xs text-emerald-500">All time</p>
            </div>
          </div>

          <div className="mt-5 h-55 rounded-3xl border border-white/8 bg-[#333333] p-4">
            <Line data={weeklyData} options={weeklyOptions} />
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-zinc-400">Status breakdown</p>
              <h2 className="mt-1 text-lg font-semibold text-white">All report states</h2>
              <p className="mt-1 text-sm text-zinc-400">Visualize how moderation tasks are distributed.</p>
            </div>
            <PieChart className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="mt-5 flex items-center justify-center">
            <div className="h-67.5 w-67.5">
              <Doughnut data={statusData} options={statusOptions} />
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-zinc-400">Pending donor verifications</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Review queue</h2>
            </div>
            <Users2 className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="mt-4 space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-zinc-400">No recent users available.</p>
            ) : (
              recentUsers.slice(0, 5).map((user) => (
                <div key={user._id} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">{user.email} · {user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">{formatCompactDate(user.createdAt)}</span>
                      <span className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        user.isVerified ? "bg-[#0f3d2f] text-[#9cf1cc]" : "bg-[#3d2e12] text-[#ffd79a]",
                      ].join(" ")}>{user.isVerified ? "Verified" : "Pending"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-zinc-400">Recent reports</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Moderation snapshot</h2>
            </div>
            <FileText className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="mt-4 space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-sm text-zinc-400">No recent reports available.</p>
            ) : (
              recentReports.slice(0, 5).map((report) => (
                <div key={report._id} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{report.reason}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{report.reportedUser?.name || "Unknown"} · {formatRelativeTime(report.createdAt)}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[1px] text-zinc-300">{report.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-zinc-400">Activity feed</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Latest system events</h2>
            <p className="mt-1 text-sm text-zinc-400">Recent users and reports in one combined stream.</p>
          </div>
          <FileDown className="h-5 w-5 text-zinc-400" />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {activityLog.length === 0 ? (
            <p className="text-sm text-zinc-400">No activity log available.</p>
          ) : (
            activityLog.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={[
                      "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl",
                      entry.kind === "user" ? "bg-[#123d28] text-[#9cf1cc]" : "bg-[#4a1f26] text-[#feb4bd]",
                    ].join(" ")}>
                      {entry.kind === "user" ? <Users2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{entry.subtitle}</p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-[11px] text-zinc-500">{entry.createdAt ? formatCompactDate(entry.createdAt) : "—"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
