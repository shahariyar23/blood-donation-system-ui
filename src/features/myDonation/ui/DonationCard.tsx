import type { DonationItem } from "../service/myDonations.service";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

const daysSince = (d: string) =>
  Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));


const statusConfig = {
  request:  { label: "Request",  className: "bg-blue-50 text-blue-700 border border-blue-200"   },
  pending:  { label: "Pending",  className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  approved: { label: "Approved", className: "bg-green-50 text-green-700 border border-green-200"  },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border border-red-200"      },
} as const;


export function DonationCard({ donation: d }: { donation: DonationItem }) {
  const days    = daysSince(d.date);
  const isRequest = d.status === "request";
  const status  = statusConfig[d.status as keyof typeof statusConfig];

  return (
    <div className="flex items-center gap-4 flex-wrap p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-red-300 transition-colors">

      {/* icon */}
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-800 to-red-500 flex items-center justify-center text-xl flex-shrink-0">
        🩸
      </div>

      {/* main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">
            {isRequest ? (d.requestedBy ?? "Unknown") : (d.patientName ?? "Unknown")}
          </span>
          <span className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full font-medium">
            {d.bloodType} · {d.units} unit{d.units > 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">
          {isRequest ? "Blood request received" : (d.hospitalName ?? "Unknown hospital")}
        </p>
        {!isRequest && d.reasonForBlood && (
          <p className="text-xs text-gray-400 mt-0.5">{d.reasonForBlood}</p>
        )}
      </div>

      {/* right side */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium text-gray-600 mb-0.5">{fmt(d.date)}</p>
        <p className="text-xs text-gray-400 mb-1.5">{days} days ago</p>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status?.className}`}>
          {status?.label ?? d.status}
        </span>
      </div>

    </div>
  );
}