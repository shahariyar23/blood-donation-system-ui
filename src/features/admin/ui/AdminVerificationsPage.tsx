import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Shield, CheckCircle, X } from "lucide-react";

interface Verification {
  _id: string;
  userName: string;
  type: "donor" | "hospital" | "user";
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  documents: string[];
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setVerifications([
        {
          _id: "1",
          userName: "Mostat Shahariyar",
          type: "donor",
          status: "pending",
          submittedDate: new Date().toISOString(),
          documents: ["ID Card", "Blood Test"],
        },
        {
          _id: "2",
          userName: "City Medical Hospital",
          type: "hospital",
          status: "approved",
          submittedDate: new Date().toISOString(),
          documents: ["Registration", "License"],
        },
        {
          _id: "3",
          userName: "Jamil Hossan",
          type: "donor",
          status: "pending",
          submittedDate: new Date().toISOString(),
          documents: ["ID Card", "Medical Certificate"],
        },
        {
          _id: "4",
          userName: "Ahmed Hassan",
          type: "user",
          status: "rejected",
          submittedDate: new Date().toISOString(),
          documents: ["ID Card"],
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === "pending").length,
    approved: verifications.filter(v => v.status === "approved").length,
    rejected: verifications.filter(v => v.status === "rejected").length,
  };

  const handleApprove = (verification: Verification) => {
    toast.success(`${verification.userName} verified successfully`);
    setVerifications(verifications.map(v => v._id === verification._id ? { ...v, status: "approved" } : v));
  };

  const handleReject = (verification: Verification) => {
    toast.error(`${verification.userName} verification rejected`);
    setVerifications(verifications.map(v => v._id === verification._id ? { ...v, status: "rejected" } : v));
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-blue-300 font-semibold">Verification Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Verifications</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Review and approve identity and organization verifications.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <FileDown className="h-4 w-4" />
            Export report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-400/40 bg-[linear-gradient(135deg,#64748B_0%,#475569_100%)] p-5 shadow-[0_8px_28px_rgba(100,116,139,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-slate-200 font-medium">Total</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] p-5 shadow-[0_8px_28px_rgba(245,158,11,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-amber-100 font-medium">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] p-5 shadow-[0_8px_28px_rgba(16,185,129,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-emerald-100 font-medium">Approved</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-rose-400/40 bg-[linear-gradient(135deg,#EF4444_0%,#DC2626_100%)] p-5 shadow-[0_8px_28px_rgba(239,68,68,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-rose-100 font-medium">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.rejected}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-white/15 bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_100%)] px-3 py-2 text-sm text-zinc-100 font-medium cursor-pointer hover:border-white/25 transition"
        >
          <option value="" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>All types</option>
          <option value="donor" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Donor</option>
          <option value="hospital" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Hospital</option>
          <option value="user" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>User</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/15 bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_100%)] px-3 py-2 text-sm text-zinc-100 font-medium cursor-pointer hover:border-white/25 transition"
        >
          <option value="" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>All statuses</option>
          <option value="pending" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Pending</option>
          <option value="approved" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Approved</option>
          <option value="rejected" style={{ backgroundColor: "#16213e", color: "#f1f5f9" }}>Rejected</option>
        </select>
        <button className="rounded-xl bg-[linear-gradient(135deg,#8B5CF6_0%,#7C3AED_100%)] px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg hover:scale-105 active:scale-95">
          Filter
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            Loading verifications...
          </div>
        ) : verifications.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
            No verifications found.
          </div>
        ) : (
          verifications.map((verification) => (
            <article key={verification._id} className="rounded-xl border border-white/10 bg-[#232630] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.16)] hover:border-white/20 transition">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{verification.userName}</p>
                    <p className="text-xs text-zinc-400 capitalize">{verification.type} • {verification.documents.join(", ")}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${
                  verification.status === "pending" ? "bg-amber-500/20 text-amber-300" : 
                  verification.status === "approved" ? "bg-emerald-500/20 text-emerald-300" : 
                  "bg-rose-500/20 text-rose-300"
                }`}>
                  {verification.status}
                </span>
              </div>
              {verification.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => void handleApprove(verification)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => void handleReject(verification)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[linear-gradient(135deg,#EF4444_0%,#DC2626_100%)] text-white transition hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
