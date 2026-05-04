import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Database, FileText, Droplets, TrendingUp } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { getAdminDashboardApi, getAdminSettingsApi } from "../service/adminService.ts";

ChartJS.register(ArcElement, Legend, Tooltip);

export default function AdminBloodBanksPage() {
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [maxRequestsPerDay, setMaxRequestsPerDay] = useState(0);
  const [requestExpiryDays, setRequestExpiryDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const [dashboardData, settingsData] = await Promise.all([
          getAdminDashboardApi(),
          getAdminSettingsApi(),
        ]);

        setTotalDonations(dashboardData.stats.totalDonations);
        setTotalRequests(dashboardData.stats.totalBloodRequests);
        setMaxRequestsPerDay(settingsData.bloodBankSettings?.maxRequestsPerDay ?? 0);
        setRequestExpiryDays(settingsData.bloodBankSettings?.requestExpirationDays ?? 0);
      } catch {
        toast.error("Failed to load blood bank overview");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const relationData = {
    labels: ["Donations", "Requests", "Max/day", "Expiry days"],
    datasets: [
      {
        data: [totalDonations, totalRequests, maxRequestsPerDay, requestExpiryDays],
        backgroundColor: ["#dc2626", "#2563eb", "#f59e0b", "#059669"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <section className="space-y-6 text-zinc-100">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <p className="text-xs uppercase tracking-[3px] text-rose-300 font-semibold">Blood bank management</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Blood bank overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">Track blood-bank related workload, platform demand, and operating limits from the admin panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-rose-400/40 bg-[linear-gradient(135deg,#EF4444_0%,#DC2626_100%)] p-5 shadow-[0_8px_28px_rgba(239,68,68,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-rose-100 font-medium">Donations</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : totalDonations}</p>
        </div>
        <div className="rounded-2xl border border-blue-400/40 bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] p-5 shadow-[0_8px_28px_rgba(59,130,246,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-blue-100 font-medium">Requests</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : totalRequests}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] p-5 shadow-[0_8px_28px_rgba(245,158,11,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-amber-100 font-medium">Max/day</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : maxRequestsPerDay}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] p-5 shadow-[0_8px_28px_rgba(16,185,129,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-emerald-100 font-medium">Expiry days</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : requestExpiryDays}</p>
        </div>
      </div>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-zinc-400">Relation chart</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Blood bank pressure overview</h2>
          </div>
          <Database className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="mt-5 h-72 rounded-3xl border border-white/8 bg-[#333333] p-4">
          <Doughnut
            data={relationData}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" as const, labels: { color: "#d4d4d8" } } } }}
          />
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#232630] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-300"><Droplets className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">Blood supply flow</p>
              <p className="text-xs text-zinc-400">Donation activity routed into the blood bank system</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#232630] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300"><TrendingUp className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">Request trend</p>
              <p className="text-xs text-zinc-400">Current demand against bank limits</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#232630] p-5 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-300"><FileText className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">Operational notes</p>
              <p className="text-xs text-zinc-400">Use this section to plug in the real blood-bank API when ready.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}