import { useState } from "react";
import toast from "react-hot-toast";

// ── types ──────────────────────────────────────────────
interface Donation {
  id:             string;
  requestId:      string;
  patientName:    string;
  hospital:       string;
  bloodType:      string;
  units:          number;
  donatedAt:      string;
  verifiedByBank: boolean;
  notes:          string;
}

// ── mock data — replace with API ───────────────────────
const MOCK_DONATIONS: Donation[] = [
  {
    id:             "1",
    requestId:      "REQ001",
    patientName:    "Rahim Uddin",
    hospital:       "Dhaka Medical College Hospital",
    bloodType:      "B+",
    units:          1,
    donatedAt:      "2025-12-01",
    verifiedByBank: true,
    notes:          "Emergency case",
  },
  {
    id:             "2",
    requestId:      "REQ002",
    patientName:    "Fatema Begum",
    hospital:       "Square Hospital, Dhaka",
    bloodType:      "B+",
    units:          2,
    donatedAt:      "2025-09-14",
    verifiedByBank: true,
    notes:          "",
  },
  {
    id:             "3",
    requestId:      "REQ003",
    patientName:    "Karim Ahmed",
    hospital:       "Bangabandhu Sheikh Mujib Medical University",
    bloodType:      "B+",
    units:          1,
    donatedAt:      "2025-06-20",
    verifiedByBank: false,
    notes:          "Surgery support",
  },
  {
    id:             "4",
    requestId:      "REQ004",
    patientName:    "Nusrat Jahan",
    hospital:       "Holy Family Red Crescent Hospital",
    bloodType:      "B+",
    units:          1,
    donatedAt:      "2025-03-08",
    verifiedByBank: true,
    notes:          "",
  },
  {
    id:             "5",
    requestId:      "REQ005",
    patientName:    "Sohel Rana",
    hospital:       "National Heart Foundation Hospital",
    bloodType:      "B+",
    units:          2,
    donatedAt:      "2024-11-22",
    verifiedByBank: true,
    notes:          "Heart surgery",
  },
];

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

const daysSince = (d: string) =>
  Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));

export default function MyDonationsPage() {
  const [donations] = useState<Donation[]>(MOCK_DONATIONS);
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");

  const filtered = donations.filter((d) =>
    filter === "all"      ? true :
    filter === "verified" ? d.verifiedByBank :
    !d.verifiedByBank
  );

  const totalUnits   = donations.reduce((s, d) => s + d.units, 0);
  const nextEligible = donations.length
    ? new Date(
        new Date(donations[0].donatedAt).getTime() + 90 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Now";

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* header */}
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>My donations</h1>
          <p style={s.pageSubtitle}>Your complete donation history</p>
        </div>

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
          {[
            { label: "Total donations", value: donations.length,  icon: "🩸" },
            { label: "Units donated",   value: totalUnits,         icon: "💉" },
            { label: "Lives impacted",  value: donations.length * 3, icon: "❤️" },
            { label: "Next eligible",   value: nextEligible,       icon: "📅" },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>{stat.icon}</div>
              <div style={s.statNum}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* filter tabs */}
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["all", "verified", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...s.filterBtn,
                    background:  filter === f ? "#C0392B" : "#F7F5F2",
                    color:       filter === f ? "white"   : "#666",
                    borderColor: filter === f ? "#C0392B" : "#E8E2DA",
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "all"      && ` (${donations.length})`}
                  {f === "verified" && ` (${donations.filter((d) => d.verifiedByBank).length})`}
                  {f === "pending"  && ` (${donations.filter((d) => !d.verifiedByBank).length})`}
                </button>
              ))}
            </div>
            <span style={{ fontSize: "13px", color: "#999" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* donation list */}
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((d) => (
                <DonationCard key={d.id} donation={d} />
              ))}
            </div>
          )}
        </div>

        {/* eligibility info */}
        <div style={{ ...s.card, background: "#FEF9F0", borderColor: "#F9C74F" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "20px" }}>ℹ️</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#633806", marginBottom: "4px" }}>
                Donation eligibility
              </div>
              <p style={{ fontSize: "13px", color: "#854F0B", lineHeight: 1.6, margin: 0 }}>
                You must wait at least <strong>90 days</strong> between whole blood donations.
                Your next eligible date is <strong>{nextEligible}</strong>.
                Stay hydrated and maintain a healthy diet before donating.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DonationCard({ donation: d }: { donation: Donation }) {
  const days = daysSince(d.donatedAt);

  return (
    <div style={{
      border:       "1px solid #E8E2DA",
      borderRadius: "12px",
      padding:      "16px 20px",
      display:      "flex",
      alignItems:   "center",
      gap:          "16px",
      background:   "#FAFAF8",
      transition:   "border-color 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2DA")}
    >
      {/* blood drop icon */}
      <div style={{
        width:          "44px",
        height:         "44px",
        borderRadius:   "10px",
        background:     "linear-gradient(135deg, #922B21, #C0392B)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "20px",
        flexShrink:     0,
      }}>🩸</div>

      {/* main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A1A" }}>
            {d.patientName}
          </span>
          <span style={{
            fontSize:    "11px",
            background:  "#FADBD8",
            color:       "#922B21",
            padding:     "2px 8px",
            borderRadius:"20px",
            fontWeight:  500,
          }}>
            {d.bloodType} · {d.units} unit{d.units > 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ fontSize: "13px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {d.hospital}
        </div>
        {d.notes && (
          <div style={{ fontSize: "12px", color: "#AAA", marginTop: "2px" }}>
            {d.notes}
          </div>
        )}
      </div>

      {/* right side */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#555", marginBottom: "4px" }}>
          {fmt(d.donatedAt)}
        </div>
        <div style={{ fontSize: "11px", color: "#BBB", marginBottom: "6px" }}>
          {days} days ago
        </div>
        <span style={{
          fontSize:     "11px",
          padding:      "2px 10px",
          borderRadius: "20px",
          fontWeight:   500,
          background:   d.verifiedByBank ? "#E8F8F0" : "#FEF9F0",
          color:        d.verifiedByBank ? "#0F6E56" : "#854F0B",
          border:       `1px solid ${d.verifiedByBank ? "#9FE1CB" : "#FAC775"}`,
        }}>
          {d.verifiedByBank ? "✓ Verified" : "⏳ Pending"}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "#999" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>🩸</div>
      <div style={{ fontSize: "16px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
        No donations yet
      </div>
      <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
        Your donation history will appear here after you donate blood.
      </p>
    </div>
  );
}

// ── styles ─────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:        { minHeight: "100vh", background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif" },
  container:   { maxWidth: "860px", margin: "0 auto", padding: "32px 24px 80px" },
  pageHeader:  { marginBottom: "28px" },
  pageTitle:   { fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" },
  pageSubtitle:{ fontSize: "14px", color: "#888", margin: 0 },
  card:        { background: "#fff", border: "1px solid #E8E2DA", borderRadius: "16px", padding: "24px", marginBottom: "20px" },
  statCard:    { background: "#fff", border: "1px solid #E8E2DA", borderRadius: "14px", padding: "20px", textAlign: "center" },
  statNum:     { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#1A1A1A" },
  statLabel:   { fontSize: "12px", color: "#999", marginTop: "3px" },
  filterBtn:   { height: "34px", padding: "0 16px", border: "1px solid", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" },
};