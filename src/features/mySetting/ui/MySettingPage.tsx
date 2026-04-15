import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getSessionsApi,
  logoutSessionApi,
  logoutOtherSessionsApi,
  type Session,
} from "../service/settingService";

interface SettingToggleProps {
  label:    string;
  sub:      string;
  value:    boolean;
  onChange: (v: boolean) => void;
}

function SettingToggle({ label, sub, value, onChange }: SettingToggleProps) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "14px 0",
      borderBottom:   "1px solid #F0EDE8",
    }}>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#1A1A1A" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{sub}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width:        "44px",
          height:       "24px",
          borderRadius: "12px",
          border:       "none",
          background:   value ? "#1D9E75" : "#D5D0CA",
          cursor:       "pointer",
          position:     "relative",
          transition:   "background 0.2s",
          flexShrink:   0,
          padding:      0,
        }}
      >
        <span style={{
          position:     "absolute",
          top:          "2px",
          left:         value ? "22px" : "2px",
          width:        "20px",
          height:       "20px",
          borderRadius: "50%",
          background:   "white",
          transition:   "left 0.2s",
          boxShadow:    "0 1px 3px rgba(0,0,0,0.15)",
        }}/>
      </button>
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.card}>
      <p style={s.cardTitle}>{title}</p>
      {children}
    </div>
  );
}

/** Return emoji based on device type from API */
function deviceIcon(session: Session): string {
  const type = session.deviceDetails?.type ?? "";
  if (type === "mobile") return "📱";
  if (type === "tablet") return "📲";
  return "💻";
}

export default function SettingsPage() {
  const [notif, setNotif] = useState({
    bloodRequests:    true,
    donorResponses:   true,
    requestFulfilled: true,
    systemUpdates:    false,
    emailDigest:      true,
    smsAlerts:        false,
  });

  const [privacy, setPrivacy] = useState({
    showPhone:      false,
    showEmail:      false,
    showLocation:   true,
    showDonations:  true,
    showSocials:    true,
  });

  // ── Sessions state ────────────────────────────────────────
  const [sessions, setSessions]             = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [actionLoading, setActionLoading]   = useState<string | null>(null); // sessionId or "all"

  // Fetch sessions on mount
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const data = await getSessionsApi();
      setSessions(data.sessions);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Logout a single (non-current) session
  const handleLogoutSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId);
      await logoutSessionApi(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session logged out");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to log out session";
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  // Logout all other sessions
  const handleLogoutAllOthers = async () => {
    try {
      setActionLoading("all");
      await logoutOtherSessionsApi();
      setSessions((prev) => prev.filter((s) => s.current));
      toast.success("All other sessions logged out");
    } catch {
      toast.error("Failed to log out other sessions");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleNotif  = (key: keyof typeof notif)  => (v: boolean) => setNotif((p)  => ({ ...p, [key]: v }));
  const togglePrivacy = (key: keyof typeof privacy) => (v: boolean) => setPrivacy((p) => ({ ...p, [key]: v }));

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* header */}
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Settings</h1>
          <p style={s.pageSubtitle}>Manage your notifications, privacy and security</p>
        </div>

        {/* ── notifications ── */}
        <SettingSection title="Notifications">
          <SettingToggle
            label="Blood requests nearby"
            sub="Get notified when someone requests your blood type"
            value={notif.bloodRequests}
            onChange={toggleNotif("bloodRequests")}
          />
          <SettingToggle
            label="Donor responses"
            sub="When a donor responds to your blood request"
            value={notif.donorResponses}
            onChange={toggleNotif("donorResponses")}
          />
          <SettingToggle
            label="Request fulfilled"
            sub="When your blood request is marked as fulfilled"
            value={notif.requestFulfilled}
            onChange={toggleNotif("requestFulfilled")}
          />
          <SettingToggle
            label="System updates"
            sub="News and feature updates from BloodConnect"
            value={notif.systemUpdates}
            onChange={toggleNotif("systemUpdates")}
          />
          <SettingToggle
            label="Email digest"
            sub="Weekly summary of activity in your area"
            value={notif.emailDigest}
            onChange={toggleNotif("emailDigest")}
          />
          <div style={{ borderBottom: "none" }}>
            <SettingToggle
              label="SMS alerts"
              sub="Urgent blood requests via SMS (charges may apply)"
              value={notif.smsAlerts}
              onChange={toggleNotif("smsAlerts")}
            />
          </div>
        </SettingSection>

        {/* ── privacy ── */}
        <SettingSection title="Privacy">
          <SettingToggle
            label="Show phone number"
            sub="Visible to donors and requesters on your profile"
            value={privacy.showPhone}
            onChange={togglePrivacy("showPhone")}
          />
          <SettingToggle
            label="Show email address"
            sub="Visible on your public donor profile"
            value={privacy.showEmail}
            onChange={togglePrivacy("showEmail")}
          />
          <SettingToggle
            label="Show location"
            sub="Show your city/district to help donors find you"
            value={privacy.showLocation}
            onChange={togglePrivacy("showLocation")}
          />
          <SettingToggle
            label="Show donation count"
            sub="Display total donations on your public profile"
            value={privacy.showDonations}
            onChange={togglePrivacy("showDonations")}
          />
          <SettingToggle
            label="Show social links"
            sub="Facebook, Instagram and Twitter on your profile"
            value={privacy.showSocials}
            onChange={togglePrivacy("showSocials")}
          />
        </SettingSection>

        {/* ── active sessions ── */}
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <p style={{ ...s.cardTitle, margin: 0 }}>Active sessions</p>
            {sessions.filter((s) => !s.current).length > 0 && (
              <button
                type="button"
                onClick={handleLogoutAllOthers}
                disabled={actionLoading === "all"}
                style={{
                  ...s.btnOutline,
                  opacity: actionLoading === "all" ? 0.6 : 1,
                  cursor: actionLoading === "all" ? "not-allowed" : "pointer",
                }}
              >
                {actionLoading === "all" ? "Logging out…" : "Log out all others"}
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sessionsLoading ? (
              // Loading skeleton
              [1, 2, 3].map((i) => (
                <div key={i} style={{
                  padding:      "16px",
                  background:   "#F7F5F2",
                  border:       "1px solid #E8E2DA",
                  borderRadius: "10px",
                  height:       "62px",
                  animation:    "pulse 1.5s ease-in-out infinite",
                }}/>
              ))
            ) : sessions.length === 0 ? (
              <div style={{
                padding:    "24px",
                textAlign:  "center",
                color:      "#888",
                fontSize:   "14px",
              }}>
                No active sessions found
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} style={{
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent:"space-between",
                  padding:      "12px 16px",
                  background:   session.current ? "#F0FAF5" : "#F7F5F2",
                  border:       `1px solid ${session.current ? "#9FE1CB" : "#E8E2DA"}`,
                  borderRadius: "10px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width:          "38px",
                      height:         "38px",
                      borderRadius:   "8px",
                      background:     session.current ? "#1D9E75" : "#E8E2DA",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      fontSize:       "18px",
                      flexShrink:     0,
                    }}>
                      {deviceIcon(session)}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#1A1A1A", display: "flex", alignItems: "center", gap: "8px" }}>
                        {session.device}
                        {session.current && (
                          <span style={{ fontSize: "10px", background: "#1D9E75", color: "white", padding: "1px 8px", borderRadius: "10px" }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        {session.location} · {session.lastActive}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      onClick={() => handleLogoutSession(session.id)}
                      disabled={actionLoading === session.id}
                      style={{
                        ...s.btnDanger,
                        opacity: actionLoading === session.id ? 0.6 : 1,
                        cursor: actionLoading === session.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {actionLoading === session.id ? "Logging out…" : "Log out"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── danger zone ── */}
        <div style={s.card}>
          <p style={s.cardTitle}>Danger zone</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "14px 16px",
              background:     "#FFF5F5",
              border:         "1px solid #FADBD8",
              borderRadius:   "10px",
            }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#922B21" }}>
                  Deactivate account
                </div>
                <div style={{ fontSize: "12px", color: "#C0392B", marginTop: "2px" }}>
                  Hides your profile. You can reactivate anytime by logging in.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.error("This will hide your profile from all searches.")}
                style={s.btnDanger}
              >
                Deactivate
              </button>
            </div>

            <div style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "14px 16px",
              background:     "#FFF5F5",
              border:         "1px solid #FADBD8",
              borderRadius:   "10px",
            }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#922B21" }}>
                  Delete account permanently
                </div>
                <div style={{ fontSize: "12px", color: "#C0392B", marginTop: "2px" }}>
                  All your data will be erased. This cannot be undone.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.error("Permanent deletion cannot be undone.")}
                style={{ ...s.btnDanger, borderColor: "#E74C3C", color: "#E74C3C" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { minHeight: "100vh", background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif" },
  container:   { maxWidth: "720px", margin: "0 auto", padding: "32px 24px 80px" },
  pageHeader:  { marginBottom: "28px" },
  pageTitle:   { fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" },
  pageSubtitle:{ fontSize: "14px", color: "#888", margin: 0 },
  card:        { background: "#fff", border: "1px solid #E8E2DA", borderRadius: "16px", padding: "24px 28px", marginBottom: "20px" },
  cardTitle:   { fontSize: "11px", fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" as const, color: "#C0392B", marginBottom: "4px" },
  btnOutline:  { height: "34px", padding: "0 16px", background: "transparent", color: "#888", border: "1px solid #E8E2DA", borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, cursor: "pointer" },
  btnDanger:   { height: "34px", padding: "0 16px", background: "transparent", color: "#E74C3C", border: "1px solid #FADBD8", borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, cursor: "pointer", flexShrink: 0 },
};