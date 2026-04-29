import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, ShieldAlert, CheckCircle, X } from "lucide-react";
import { getAdminReportsApi, reviewAdminReportApi } from "../service/adminService.ts";
import { downloadCsv, formatAdminDate } from "../service/adminReporting.ts";
import type { AdminReport } from "../types/admin";

const reportCsvColumns = [
  { label: "Reason", value: (report: AdminReport) => report.reason },
  { label: "Status", value: (report: AdminReport) => report.status },
  { label: "Description", value: (report: AdminReport) => report.description ?? "" },
  { label: "Reported by", value: (report: AdminReport) => report.reportedBy?.name ?? "Unknown" },
  { label: "Reported user", value: (report: AdminReport) => report.reportedUser?.name ?? "Unknown" },
  { label: "Reviewed by", value: (report: AdminReport) => report.reviewedBy?.name ?? "" },
  { label: "Review note", value: (report: AdminReport) => report.reviewNote ?? "" },
  { label: "Created at", value: (report: AdminReport) => formatAdminDate(report.createdAt) },
] as const;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAdminReportsApi({ page: 1, limit: 20, status });
      setReports(data.reports);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const handleReview = async (report: AdminReport, nextStatus: "reviewed" | "dismissed") => {
    const note = window.prompt("Add review note (optional):", report.reviewNote || "") || "";
    try {
      await reviewAdminReportApi(report._id, {
        status: nextStatus,
        reviewNote: note,
        banUser: false,
      });
      toast.success("Report updated");
      await fetchReports();
    } catch {
      toast.error("Failed to review report");
    }
  };

  const handleExportReports = () => {
    if (reports.length === 0) {
      toast.error("No reports available to export");
      return;
    }

    downloadCsv(`admin-reports-${new Date().toISOString().slice(0, 10)}.csv`, reportCsvColumns, reports);
    toast.success("Reports exported");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-rose-300 font-semibold">Moderation reports</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Review and export cases</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Filter reports, resolve them quickly, and generate a moderation snapshot for the admin team.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportReports}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <FileDown className="h-4 w-4" />
            Generate report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-400/40 bg-[linear-gradient(135deg,#64748B_0%,#475569_100%)] p-5 shadow-[0_8px_28px_rgba(100,116,139,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-slate-200 font-medium">All reports</p>
          <p className="mt-2 text-2xl font-semibold text-white">{reports.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] p-5 shadow-[0_8px_28px_rgba(245,158,11,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-amber-100 font-medium">Current filter</p>
          <p className="mt-2 text-2xl font-semibold text-white">{status || "All"}</p>
        </div>
        <div className="rounded-2xl border border-rose-400/40 bg-[linear-gradient(135deg,#EF4444_0%,#DC2626_100%)] p-5 shadow-[0_8px_28px_rgba(239,68,68,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-rose-100 font-medium">Action queue</p>
          <p className="mt-2 text-2xl font-semibold text-white">{reports.filter((report) => report.status === "pending").length}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/15 bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_100%)] px-3 py-2 text-sm text-zinc-100 font-medium cursor-pointer hover:border-white/25 transition"
        >
          <option value="" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>All statuses</option>
          <option value="pending" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Pending</option>
          <option value="reviewed" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Reviewed</option>
          <option value="dismissed" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Dismissed</option>
        </select>
        <button
          onClick={() => void fetchReports()}
          className="rounded-xl bg-[linear-gradient(135deg,#8B5CF6_0%,#7C3AED_100%)] px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
        >
          Filter
        </button>
        <button
          type="button"
          onClick={handleExportReports}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-white/15"
        >
          <FileDown className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            No reports found.
          </div>
        ) : (
          reports.map((report) => (
            <article key={report._id} className="rounded-xl border border-white/10 bg-[#232630] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.16)] hover:border-white/20 transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{report.reason}</p>
                  <p className="text-xs text-zinc-400">{report.description || "No description"}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${
                  report.status === "pending" ? "bg-amber-500/20 text-amber-300" : 
                  report.status === "reviewed" ? "bg-emerald-500/20 text-emerald-300" : 
                  "bg-zinc-500/20 text-zinc-300"
                }`}>
                  {report.status}
                </span>
              </div>

              <div className="mt-3 text-xs text-zinc-400">
                Reported by: {report.reportedBy?.name || "Unknown"} | Against: {report.reportedUser?.name || "Unknown"}
              </div>

              {(report.reviewedBy || report.reviewNote) && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-zinc-300 border border-white/5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-zinc-400 flex-shrink-0" />
                  <div>
                    <p>Reviewed by: {report.reviewedBy?.name || "System"}</p>
                    {report.reviewNote && <p className="mt-1">Note: {report.reviewNote}</p>}
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => void handleReview(report, "reviewed")}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                  title="Mark this report as reviewed"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark reviewed
                </button>
                <button
                  onClick={() => void handleReview(report, "dismissed")}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[linear-gradient(135deg,#EF4444_0%,#DC2626_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                  title="Dismiss this report"
                >
                  <X className="h-3.5 w-3.5" />
                  Dismiss
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
