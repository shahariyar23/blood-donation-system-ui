import { useState } from "react";
import toast from "react-hot-toast";
import { Settings, Save, RotateCcw, Bell, Lock, Database, Zap } from "lucide-react";

interface Setting {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "number" | "text";
  value: boolean | number | string;
  icon: typeof Settings;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: "donations-alert",
      label: "Donation Alerts",
      description: "Send notifications for blood donation requests",
      type: "toggle",
      value: true,
      icon: Bell,
    },
    {
      id: "auto-verify",
      label: "Auto-verify Donors",
      description: "Automatically verify donors after document review",
      type: "toggle",
      value: false,
      icon: Lock,
    },
    {
      id: "request-expire",
      label: "Request Expiry (days)",
      description: "Days before blood requests expire",
      type: "number",
      value: 30,
      icon: Zap,
    },
    {
      id: "max-requests",
      label: "Max Requests per User",
      description: "Maximum blood requests allowed per user",
      type: "number",
      value: 5,
      icon: Database,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, value: !s.value } : s));
  };

  const handleChange = (id: string, value: number | string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, value } : s));
  };

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    toast.error("Settings reset to defaults");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-purple-300 font-semibold">System Configuration</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Configure system settings and platform preferences.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3B82F6_0%,#1D4ED8_100%)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <div key={setting.id} className="rounded-xl border border-white/10 bg-[#232630] p-5 shadow-[0_6px_18px_rgba(0,0,0,0.16)]">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{setting.label}</p>
                    <p className="text-xs text-zinc-400 mt-1">{setting.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {setting.type === "toggle" && (
                  <button
                    onClick={() => handleToggle(setting.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      setting.value ? "bg-emerald-600" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        setting.value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
                {setting.type === "number" && (
                  <input
                    type="number"
                    value={setting.value as number}
                    onChange={(e) => handleChange(setting.id, parseInt(e.target.value))}
                    className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-zinc-100 w-full"
                  />
                )}
                {setting.type === "text" && (
                  <input
                    type="text"
                    value={setting.value as string}
                    onChange={(e) => handleChange(setting.id, e.target.value)}
                    className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-zinc-100 w-full"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#232630] p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">System Info</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 border border-white/10">
            <span className="text-sm text-zinc-400">Platform Version</span>
            <span className="text-sm font-semibold text-zinc-100">1.0.0</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 border border-white/10">
            <span className="text-sm text-zinc-400">Database Status</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 border border-white/10">
            <span className="text-sm text-zinc-400">Last Backup</span>
            <span className="text-sm font-semibold text-zinc-100">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 border border-white/10">
            <span className="text-sm text-zinc-400">Active Users</span>
            <span className="text-sm font-semibold text-zinc-100">8</span>
          </div>
        </div>
      </div>
    </section>
  );
}
