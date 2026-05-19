import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Save, Trash2, Warehouse } from "lucide-react";
import {
  getAdminBloodBankSettingsApi,
  updateAdminBloodBankSettingsApi,
} from "../service/adminService.ts";
import type { AdminBloodBankApiEntry, AdminBloodBankSettings } from "../types/admin";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const defaultSettings: AdminBloodBankSettings = {
  isVisible: true,
  isMaintenance: false,
  maintenanceMessage: "Blood Bank is temporarily unavailable.",
  sectionTitle: "Blood Bank",
  notice: "Results are provided by partner blood banks.",
  allowedBloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  maxResults: 20,
  requestTimeoutMs: 8000,
  apis: [],
};

const createApiEntry = (): AdminBloodBankApiEntry => ({
  name: "",
  label: "",
  baseUrl: "",
  apiKey: "",
  isActive: true,
  priority: 1,
});

const normalizeSettings = (settings: AdminBloodBankSettings): AdminBloodBankSettings => ({
  ...defaultSettings,
  ...settings,
  allowedBloodGroups: settings.allowedBloodGroups ?? defaultSettings.allowedBloodGroups,
  apis: (settings.apis ?? []).map((api) => ({
    ...api,
    apiKey: api.apiKey === "********" ? "" : api.apiKey ?? "",
  })),
});

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm font-semibold text-zinc-100">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-rose-600"
      />
    </label>
  );
}

export default function AdminBloodBanksPage() {
  const [settings, setSettings] = useState<AdminBloodBankSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const data = await getAdminBloodBankSettingsApi();
        if (isMounted) {
          setSettings(normalizeSettings(data));
        }
      } catch {
        toast.error("Failed to load blood bank settings");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = <Key extends keyof AdminBloodBankSettings>(
    key: Key,
    value: AdminBloodBankSettings[Key]
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateApi = <Key extends keyof AdminBloodBankApiEntry>(
    index: number,
    key: Key,
    value: AdminBloodBankApiEntry[Key]
  ) => {
    setSettings((current) => ({
      ...current,
      apis: current.apis.map((api, apiIndex) =>
        apiIndex === index ? { ...api, [key]: value } : api
      ),
    }));
  };

  const toggleBloodGroup = (bloodGroup: string) => {
    setSettings((current) => {
      const exists = current.allowedBloodGroups.includes(bloodGroup);
      return {
        ...current,
        allowedBloodGroups: exists
          ? current.allowedBloodGroups.filter((item) => item !== bloodGroup)
          : [...current.allowedBloodGroups, bloodGroup],
      };
    });
  };

  const addApi = () => {
    setSettings((current) => ({
      ...current,
      apis: [...current.apis, createApiEntry()],
    }));
  };

  const removeApi = (index: number) => {
    setSettings((current) => ({
      ...current,
      apis: current.apis.filter((_, apiIndex) => apiIndex !== index),
    }));
  };

  const validateSettings = () => {
    if (settings.allowedBloodGroups.length === 0) {
      toast.error("Select at least one blood group");
      return false;
    }

    if (settings.maxResults < 1) {
      toast.error("Max results must be at least 1");
      return false;
    }

    if (settings.requestTimeoutMs < 1000) {
      toast.error("Request timeout must be at least 1000ms");
      return false;
    }

    const invalidApi = settings.apis.find(
      (api) =>
        !api.name.trim() ||
        !api.label.trim() ||
        !api.baseUrl.trim() ||
        !api.apiKey.trim() ||
        api.apiKey.trim() === "********"
    );

    if (invalidApi) {
      toast.error("Complete all API fields and re-enter API keys before saving");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) return;

    setSaving(true);
    try {
      const payload: AdminBloodBankSettings = {
        ...settings,
        maxResults: Number(settings.maxResults),
        requestTimeoutMs: Number(settings.requestTimeoutMs),
        apis: settings.apis.map((api) => ({
          ...api,
          name: api.name.trim(),
          label: api.label.trim(),
          baseUrl: api.baseUrl.trim(),
          apiKey: api.apiKey.trim(),
          priority: Number(api.priority),
        })),
      };

      const data = await updateAdminBloodBankSettingsApi(payload);
      setSettings(normalizeSettings(data));
      toast.success("Blood bank settings saved");
    } catch {
      toast.error("Failed to save blood bank settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-zinc-400">Loading blood bank settings...</div>;
  }

  return (
    <section className="space-y-6 text-zinc-100">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-rose-300">
              Blood bank management
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Blood Bank Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Control the public blood bank search section, filters, limits, and partner APIs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300">
            <Warehouse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
              Section controls
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">Visibility and messaging</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ToggleRow
            label="Visible"
            checked={settings.isVisible}
            onChange={(checked) => updateField("isVisible", checked)}
          />
          <ToggleRow
            label="Maintenance mode"
            checked={settings.isMaintenance}
            onChange={(checked) => updateField("isMaintenance", checked)}
          />
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
              Section title
            </span>
            <input
              value={settings.sectionTitle}
              onChange={(event) => updateField("sectionTitle", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
              Maintenance message
            </span>
            <input
              value={settings.maintenanceMessage}
              onChange={(event) => updateField("maintenanceMessage", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
              Notice
            </span>
            <textarea
              rows={4}
              value={settings.notice}
              onChange={(event) => updateField("notice", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
            />
          </label>
        </div>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
          Blood group filter
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {bloodGroups.map((bloodGroup) => (
            <label
              key={bloodGroup}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="text-sm font-semibold text-white">{bloodGroup}</span>
              <input
                type="checkbox"
                checked={settings.allowedBloodGroups.includes(bloodGroup)}
                onChange={() => toggleBloodGroup(bloodGroup)}
                className="h-5 w-5 accent-rose-600"
              />
            </label>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
          Result controls
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
              Max results
            </span>
            <input
              type="number"
              min={1}
              value={settings.maxResults}
              onChange={(event) => updateField("maxResults", Number(event.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
              Request timeout ms
            </span>
            <input
              type="number"
              min={1000}
              step={500}
              value={settings.requestTimeoutMs}
              onChange={(event) => updateField("requestTimeoutMs", Number(event.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
            />
          </label>
        </div>
      </article>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
              Third-party API manager
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">Partner APIs</h2>
          </div>
          <button
            type="button"
            onClick={addApi}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <Plus className="h-4 w-4" />
            Add API
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {settings.apis.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
              No partner APIs configured.
            </div>
          ) : (
            settings.apis.map((api, index) => (
              <div key={`${api.name}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
                      API name
                    </span>
                    <input
                      value={api.name}
                      onChange={(event) => updateApi(index, "name", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#232630] px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
                      Display label
                    </span>
                    <input
                      value={api.label}
                      onChange={(event) => updateApi(index, "label", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#232630] px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
                      Base URL
                    </span>
                    <input
                      value={api.baseUrl}
                      onChange={(event) => updateApi(index, "baseUrl", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#232630] px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
                      API key
                    </span>
                    <input
                      type="password"
                      value={api.apiKey}
                      placeholder="Re-enter key before saving"
                      onChange={(event) => updateApi(index, "apiKey", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#232630] px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[2px] text-zinc-400">
                      Priority
                    </span>
                    <input
                      type="number"
                      value={api.priority}
                      onChange={(event) => updateApi(index, "priority", Number(event.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-[#232630] px-4 py-3 text-sm text-white outline-none transition focus:border-rose-400/60"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#232630] px-4 py-2.5 text-sm font-semibold text-zinc-100">
                    <input
                      type="checkbox"
                      checked={api.isActive}
                      onChange={(event) => updateApi(index, "isActive", event.target.checked)}
                      className="h-5 w-5 accent-rose-600"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => removeApi(index)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
