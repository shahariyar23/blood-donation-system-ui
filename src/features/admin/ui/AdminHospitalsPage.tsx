import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Warehouse,
  X,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import {
  createAdminHospitalApi,
  getAdminDashboardApi,
  getAdminHospitalDetailsApi,
  getAdminHospitalsApi,
  unverifyAdminHospitalApi,
  updateAdminHospitalStatusApi,
  verifyAdminHospitalApi,
  type AdminCreateHospitalPayload,
} from "../service/adminService.ts";
import Pagination from "../../../shared/components/Pagination.tsx";
import { formatAdminDate } from "../service/adminReporting.ts";
import type { AdminHospital } from "../types/admin";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

type HospitalFormState = Omit<AdminCreateHospitalPayload, "totalBedCapacity" | "bloodBankCapacity" | "location" | "sendCredentialsEmail" | "emailNote"> & {
  totalBedCapacity: string;
  bloodBankCapacity: string;
  area: string;
  district: string;
  division: string;
  lat: string;
  lng: string;
  sendCredentialsEmail: boolean;
  emailNote: string;
};

const initialFormState: HospitalFormState = {
  hospitalName: "",
  registrationNumber: "",
  email: "",
  password: "",
  phone: "",
  website: "",
  licenseNumber: "",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  totalBedCapacity: "0",
  bloodBankCapacity: "0",
  address: "",
  area: "",
  district: "",
  division: "",
  lat: "",
  lng: "",
  sendCredentialsEmail: true,
  emailNote: "",
};

const buildDefaultEmailNote = (hospitalName: string) =>
  `${hospitalName ? `${hospitalName}, ` : ""}please change your hospital password after the first login.`;

const toDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
};

const toMaskedDisplay = (value?: string | null) => {
  if (!value) {
    return "Not set";
  }
  if (value.length <= 10) {
    return "Configured";
  }
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

export default function AdminHospitalsPage() {
  const [activeView, setActiveView] = useState<"overview" | "add">("overview");
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hospitalUsers, setHospitalUsers] = useState<AdminHospital[]>([]);
  const [hospitalListLoading, setHospitalListLoading] = useState(false);
  const [hospitalDetailsLoading, setHospitalDetailsLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<AdminHospital | null>(null);
  const [hospitalPage, setHospitalPage] = useState(1);
  const [hospitalTotalItems, setHospitalTotalItems] = useState(0);
  const [hospitalItemsPerPage, setHospitalItemsPerPage] = useState(10);
  const [hospitalSearchInput, setHospitalSearchInput] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [hospitalSuggestions, setHospitalSuggestions] = useState<AdminHospital[]>([]);
  const [hospitalSuggestionsOpen, setHospitalSuggestionsOpen] = useState(false);
  const [hospitalSuggestionsLoading, setHospitalSuggestionsLoading] = useState(false);
  const [form, setForm] = useState<HospitalFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [createdPayload, setCreatedPayload] = useState<AdminCreateHospitalPayload | null>(null);
  const [hospitalActionLoading, setHospitalActionLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getAdminDashboardApi();
        setTotalHospitals(data.stats.totalHospitals);
        setTotalRequests(data.stats.totalBloodRequests);
        setTotalDonations(data.stats.totalDonations);
      } catch {
        toast.error("Failed to load hospital overview");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const relationData = {
    labels: ["Hospitals", "Requests", "Donations"],
    datasets: [
      {
        label: "Hospital activity",
        data: [totalHospitals, totalRequests, totalDonations],
        backgroundColor: ["#2563eb", "#f59e0b", "#059669"],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const relationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#d4d4d8" }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { color: "#d4d4d8", precision: 0 }, grid: { color: "rgba(255,255,255,0.08)" } },
    },
  };

  const fetchHospitals = async (
    nextPage = hospitalPage,
    nextSearch = hospitalSearch
  ) => {
    try {
      setHospitalListLoading(true);
      const data = await getAdminHospitalsApi({
        page: nextPage,
        limit: hospitalItemsPerPage,
        search: nextSearch || undefined,
      });

      // Support both { hospitals } and fallback { users } shapes to avoid false UI errors.
      const payload = data as unknown as {
        hospitals?: AdminHospital[];
        users?: AdminHospital[];
        pagination?: { total?: number; limit?: number };
      };

      const hospitals = Array.isArray(payload.hospitals)
        ? payload.hospitals
        : Array.isArray(payload.users)
          ? payload.users
          : [];

      const pagination = payload.pagination;

      setHospitalUsers(hospitals);
      setHospitalTotalItems(typeof pagination?.total === "number" ? pagination.total : hospitals.length);
      setHospitalItemsPerPage(
        typeof pagination?.limit === "number" && pagination.limit > 0
          ? pagination.limit
          : hospitalItemsPerPage
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") {
        return;
      }

      const apiMessage = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string } | undefined)?.message ?? "")
        : "";

      if (hospitalUsers.length === 0) {
        toast.error(apiMessage || "Failed to load hospitals list");
      }
    } finally {
      setHospitalListLoading(false);
    }
  };

  useEffect(() => {
    void fetchHospitals();
  }, [hospitalPage, hospitalSearch]);

  useEffect(() => {
    if (activeView !== "overview") return;

    const query = hospitalSearchInput.trim();
    const normalizedDigits = query.replace(/\D/g, "");
    const shouldSuggest =
      query.length >= 3 || (normalizedDigits.length >= 5 && normalizedDigits === query);

    if (!shouldSuggest) {
      setHospitalSuggestions([]);
      setHospitalSuggestionsLoading(false);
      return;
    }

    let isActive = true;
    setHospitalSuggestionsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await getAdminHospitalsApi({
          page: 1,
          limit: 6,
          search: query,
        });

        const payload = data as unknown as {
          hospitals?: AdminHospital[];
          users?: AdminHospital[];
        };

        const hospitals = Array.isArray(payload.hospitals)
          ? payload.hospitals
          : Array.isArray(payload.users)
            ? payload.users
            : [];

        if (isActive) {
          setHospitalSuggestions(hospitals);
        }
      } catch {
        if (isActive) {
          setHospitalSuggestions([]);
        }
      } finally {
        if (isActive) {
          setHospitalSuggestionsLoading(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [activeView, hospitalSearchInput]);

  useEffect(() => {
    if (!selectedHospital) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedHospital(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedHospital]);

  const updateField = <K extends keyof HospitalFormState>(key: K, value: HospitalFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = (clearCreatedPayload = true) => {
    setForm(initialFormState);
    if (clearCreatedPayload) {
      setCreatedPayload(null);
    }
  };

  const handleCreateHospital = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.hospitalName.trim() || !form.registrationNumber.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Please fill the required hospital fields");
      return;
    }

    const resolvedEmailNote =
      form.emailNote.trim() || buildDefaultEmailNote(form.hospitalName.trim());

    const payload: AdminCreateHospitalPayload = {
      hospitalName: form.hospitalName.trim(),
      registrationNumber: form.registrationNumber.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
      website: form.website?.trim() || undefined,
      licenseNumber: form.licenseNumber.trim(),
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim(),
      adminPhone: form.adminPhone.trim(),
      totalBedCapacity: Number(form.totalBedCapacity) || 0,
      bloodBankCapacity: Number(form.bloodBankCapacity) || 0,
      address: form.address.trim(),
      location: {
        area: form.area.trim(),
        district: form.district.trim(),
        division: form.division.trim(),
        coordinates: {
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
      },
      sendCredentialsEmail: form.sendCredentialsEmail,
      emailNote: resolvedEmailNote,
    };

    try {
      setSubmitting(true);
      console.debug("Admin hospital create payload:", payload);
      await createAdminHospitalApi(payload);
      toast.success("Hospital created. Credentials will be emailed with the password reset note.");
      resetForm(false);
      setCreatedPayload(payload);
      setActiveView("overview");
      setHospitalPage(1);
      void fetchHospitals(1, hospitalSearch);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; errors?: string[] }
          | undefined;

        const message =
          responseData?.errors?.[0] ??
          responseData?.message ??
          "Failed to create hospital";

        toast.error(message);
      } else {
        toast.error("Failed to create hospital");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenHospitalDetails = async (hospital: AdminHospital) => {
    setSelectedHospital(hospital);
    setHospitalDetailsLoading(true);

    try {
      const details = await getAdminHospitalDetailsApi(hospital._id);
      setSelectedHospital(details);
    } catch {
      // Keep the modal open with the list payload when the details endpoint is unavailable.
      // The list already contains the fields needed to render the popup.
    } finally {
      setHospitalDetailsLoading(false);
    }
  };

  const handleToggleHospitalStatus = async () => {
    if (!selectedHospital) return;
    setHospitalActionLoading(true);
    try {
      const nextActive = !Boolean(selectedHospital.isActive);
      await updateAdminHospitalStatusApi(selectedHospital._id, nextActive);
      toast.success(nextActive ? "Hospital activated" : "Hospital banned");
      setSelectedHospital((prev) => (prev ? { ...prev, isActive: nextActive } : prev));
      void fetchHospitals(hospitalPage, hospitalSearch);
      try {
        const details = await getAdminHospitalDetailsApi(selectedHospital._id);
        setSelectedHospital(details);
      } catch {
        // ignore
      }
    } catch (error: unknown) {
      const apiMessage = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string } | undefined)?.message ?? "")
        : "";
      toast.error(apiMessage || "Failed to update hospital status");
    } finally {
      setHospitalActionLoading(false);
    }
  };

  const handleVerifyHospital = async (nextVerified: boolean) => {
    if (!selectedHospital) return;
    setHospitalActionLoading(true);
    try {
      if (nextVerified) {
        await verifyAdminHospitalApi(selectedHospital._id);
      } else {
        await unverifyAdminHospitalApi(selectedHospital._id);
      }
      toast.success(nextVerified ? "Hospital verified" : "Hospital unverified");
      setSelectedHospital((prev) => (prev ? { ...prev, isVerified: nextVerified } : prev));
      void fetchHospitals(hospitalPage, hospitalSearch);
      try {
        const details = await getAdminHospitalDetailsApi(selectedHospital._id);
        setSelectedHospital(details);
      } catch {
        // ignore
      }
    } catch (error: unknown) {
      const apiMessage = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string } | undefined)?.message ?? "")
        : "";
      toast.error(apiMessage || "Failed to update hospital verification");
    } finally {
      setHospitalActionLoading(false);
    }
  };

  const geoCoordinates = selectedHospital?.location?.coordinates?.coordinates;
  const longitude =
    Array.isArray(geoCoordinates) && geoCoordinates.length >= 2
      ? geoCoordinates[0]
      : null;
  const latitude =
    Array.isArray(geoCoordinates) && geoCoordinates.length >= 2
      ? geoCoordinates[1]
      : null;

  return (
    <section className="space-y-6 text-zinc-100">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#3d1014_0%,#2a1416_44%,#1f222a_100%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <p className="text-xs uppercase tracking-[3px] text-blue-300 font-semibold">Hospital management</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Hospital overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">Monitor hospital coverage, demand pressure, and donation activity from one admin view.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveView("overview")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeView === "overview" ? "bg-white text-zinc-900" : "bg-white/10 text-white hover:bg-white/15"}`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveView("add")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeView === "add" ? "bg-white text-zinc-900" : "bg-white/10 text-white hover:bg-white/15"}`}
        >
          Add Hospital
        </button>
      </div>

      {activeView === "overview" ? (
        <>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-400/40 bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] p-5 shadow-[0_8px_28px_rgba(59,130,246,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-blue-100 font-medium">Hospitals</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : totalHospitals}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)] p-5 shadow-[0_8px_28px_rgba(245,158,11,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-amber-100 font-medium">Blood requests</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : totalRequests}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] p-5 shadow-[0_8px_28px_rgba(16,185,129,0.24)]">
          <p className="text-xs uppercase tracking-[2px] text-emerald-100 font-medium">Donations</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : totalDonations}</p>
        </div>
      </div>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-zinc-400">Relation chart</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Hospital activity comparison</h2>
          </div>
          <Building2 className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="mt-5 h-72 rounded-3xl border border-white/8 bg-[#333333] p-4">
          <Bar data={relationData} options={relationOptions} />
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#232630] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">Verified network</p>
              <p className="text-xs text-zinc-400">Hospital-side trust and compliance</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#232630] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"><Activity className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">System activity</p>
              <p className="text-xs text-zinc-400">Flow of donations through hospitals</p>
            </div>
          </div>
        </div>
      </div>

      <article className="rounded-3xl border border-white/10 bg-[#2a2a2a] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-zinc-400">All hospitals</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Hospital accounts list</h2>
            <p className="mt-1 text-sm text-zinc-400">Click any hospital card to open the full hospital schema details.</p>
          </div>
          <div className="flex w-full max-w-md gap-2">
            <div className="relative w-full">
              <input
                value={hospitalSearchInput}
                onChange={(e) => {
                  setHospitalSearchInput(e.target.value);
                  setHospitalSuggestionsOpen(true);
                }}
                onFocus={() => setHospitalSuggestionsOpen(true)}
                onBlur={() => window.setTimeout(() => setHospitalSuggestionsOpen(false), 150)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setHospitalPage(1);
                    setHospitalSearch(hospitalSearchInput.trim());
                    setHospitalSuggestionsOpen(false);
                  }
                }}
                placeholder="Search hospital by name/email/phone"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500"
              />

              {hospitalSuggestionsOpen && hospitalSearchInput.trim() && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#161922] shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                  {hospitalSuggestionsLoading ? (
                    <div className="px-4 py-3 text-sm text-zinc-400">Searching...</div>
                  ) : hospitalSuggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-zinc-400">No matches found.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {hospitalSuggestions.map((hospital) => (
                        <button
                          key={hospital._id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            const query = hospitalSearchInput.trim();
                            const normalizedDigits = query.replace(/\D/g, "");
                            const selectedValue =
                              normalizedDigits.length >= 5 && normalizedDigits === query
                                ? hospital.phone
                                : hospital.email;
                            setHospitalSearchInput(selectedValue || hospital.email);
                            setHospitalPage(1);
                            setHospitalSearch((selectedValue || hospital.email).trim());
                            setHospitalSuggestionsOpen(false);
                          }}
                          className="flex w-full items-start justify-between gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">{hospital.hospitalName}</p>
                            <p className="mt-1 text-xs text-zinc-400">
                              {hospital.email}
                              {hospital.phone ? ` • ${hospital.phone}` : ""}
                            </p>
                          </div>
                          <span className="mt-1 rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-zinc-300">
                            {hospital.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setHospitalPage(1);
                setHospitalSearch(hospitalSearchInput.trim());
                setHospitalSuggestionsOpen(false);
              }}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {hospitalListLoading ? (
            <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
              Loading hospitals...
            </div>
          ) : hospitalUsers.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-zinc-400">
              No hospitals found.
            </div>
          ) : (
            hospitalUsers.map((hospital) => (
              <article
                key={hospital._id}
                onClick={() => void handleOpenHospitalDetails(hospital)}
                className="cursor-pointer rounded-xl border border-white/10 bg-[#232630] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.16)] transition hover:border-blue-400/40 hover:bg-[#272b36]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{hospital.hospitalName}</p>
                    <p className="text-xs text-zinc-400">{hospital.email} {hospital.phone ? `• ${hospital.phone}` : ""}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">Joined: {formatAdminDate(hospital.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${hospital.isVerified ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                      {hospital.isVerified ? "Verified" : "Unverified"}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${hospital.isActive ? "bg-blue-500/20 text-blue-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {hospital.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {!hospitalListLoading && hospitalTotalItems > 0 ? (
          <Pagination
            currentPage={hospitalPage}
            totalItems={hospitalTotalItems}
            itemsPerPage={hospitalItemsPerPage}
            onPageChange={setHospitalPage}
          />
        ) : null}
      </article>

        {createdPayload ? (
          <article className="rounded-3xl border border-emerald-400/30 bg-[#0f1f18] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Hospital created successfully</p>
                <p className="mt-1 text-xs text-zinc-400">Credentials were prepared for {createdPayload.email} and the message should tell them to change their hospital password after login.</p>
                <p className="mt-1 text-xs text-blue-200">Message sent: {createdPayload.emailNote}</p>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300">
                  <p className="font-semibold text-zinc-100">Demo payload</p>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap wrap-break-word">{JSON.stringify(createdPayload, null, 2)}</pre>
                </div>
              </div>
            </div>
          </article>
        ) : null}
        </>
      ) : (
        <form onSubmit={handleCreateHospital} className="space-y-6 rounded-3xl border border-white/10 bg-[#232630] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-zinc-400">Create hospital</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Add hospital account and email credentials</h2>
              <p className="mt-1 text-sm text-zinc-400">This form matches the hospital schema and sends a temporary password to the hospital email.</p>
            </div>
            <Warehouse className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Hospital name *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.hospitalName} onChange={(e) => updateField("hospitalName", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Registration number *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Hospital email *</span>
              <input type="email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Temporary password *</span>
              <input type="password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Phone *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Website</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.website} onChange={(e) => updateField("website", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">License number *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.licenseNumber} onChange={(e) => updateField("licenseNumber", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Admin name *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.adminName} onChange={(e) => updateField("adminName", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Admin email *</span>
              <input type="email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.adminEmail} onChange={(e) => updateField("adminEmail", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Admin phone *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.adminPhone} onChange={(e) => updateField("adminPhone", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Total bed capacity</span>
              <input type="number" min="0" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.totalBedCapacity} onChange={(e) => updateField("totalBedCapacity", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Blood bank capacity</span>
              <input type="number" min="0" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.bloodBankCapacity} onChange={(e) => updateField("bloodBankCapacity", e.target.value)} />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Address *</span>
              <textarea className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" rows={3} value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Area *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.area} onChange={(e) => updateField("area", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">District *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.district} onChange={(e) => updateField("district", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Division *</span>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.division} onChange={(e) => updateField("division", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Latitude *</span>
              <input type="number" step="any" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.lat} onChange={(e) => updateField("lat", e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Longitude *</span>
              <input type="number" step="any" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.lng} onChange={(e) => updateField("lng", e.target.value)} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <input type="checkbox" checked={form.sendCredentialsEmail} onChange={(e) => updateField("sendCredentialsEmail", e.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-blue-500" />
              <span>
                <span className="block text-sm font-semibold text-white">Send credentials email</span>
                <span className="mt-1 block text-xs text-zinc-400">Email the temporary password and login instructions to the hospital mailbox.</span>
              </span>
            </label>
            <label className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs uppercase tracking-[2px] text-zinc-400">Email note</span>
              <textarea rows={4} placeholder="Type the exact message you want to send from admin panel..." className="w-full rounded-xl border border-white/10 bg-[#161922] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/60" value={form.emailNote} onChange={(e) => updateField("emailNote", e.target.value)} />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => resetForm()} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">Reset form</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3B82F6_0%,#1D4ED8_100%)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60">
              {submitting ? "Creating..." : "Create hospital and email password"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {createdPayload ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Hospital credentials were prepared for {createdPayload.email}. Tell the hospital to change the password after their first login.
            </div>
          ) : null}
        </form>
      )}

      {selectedHospital ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
          onClick={() => setSelectedHospital(null)}
        >
          <article
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#161922] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Hospital details</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{toDisplay(selectedHospital.hospitalName)}</h3>
                <p className="mt-1 text-sm text-zinc-400">ID: {selectedHospital._id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={hospitalActionLoading}
                  onClick={() => void handleVerifyHospital(!Boolean(selectedHospital.isVerified))}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60
                    ${selectedHospital.isVerified
                      ? "border border-amber-400/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                      : "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                    }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {selectedHospital.isVerified ? "Unverify" : "Verify"}
                </button>

                <button
                  type="button"
                  disabled={hospitalActionLoading}
                  onClick={() => void handleToggleHospitalStatus()}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60
                    ${selectedHospital.isActive
                      ? "border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
                      : "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                    }`}
                >
                  <Lock className="h-4 w-4" />
                  {selectedHospital.isActive ? "Ban" : "Activate"}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedHospital(null)}
                  className="rounded-full border border-white/15 bg-white/10 p-2 text-zinc-300 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close hospital details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {hospitalDetailsLoading ? (
              <div className="mt-4 rounded-xl border border-blue-400/30 bg-blue-500/10 p-3 text-sm text-blue-100">
                Loading full hospital details...
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Basic info</p>
                <div className="mt-3 space-y-2 text-sm text-zinc-200">
                  <p>Hospital name: {toDisplay(selectedHospital.hospitalName)}</p>
                  <p>Registration number: {toDisplay(selectedHospital.registrationNumber)}</p>
                  <p>Email: {toDisplay(selectedHospital.email)}</p>
                  <p>Phone: {toDisplay(selectedHospital.phone)}</p>
                  <p>Website: {toDisplay(selectedHospital.website)}</p>
                  <p>License number: {toDisplay(selectedHospital.licenseNumber)}</p>
                  <p>Address: {toDisplay(selectedHospital.address)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Admin contact</p>
                <div className="mt-3 space-y-2 text-sm text-zinc-200">
                  <p>Admin name: {toDisplay(selectedHospital.adminName)}</p>
                  <p>Admin email: {toDisplay(selectedHospital.adminEmail)}</p>
                  <p>Admin phone: {toDisplay(selectedHospital.adminPhone)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Capacity and status</p>
                <div className="mt-3 space-y-2 text-sm text-zinc-200">
                  <p>Total bed capacity: {toDisplay(selectedHospital.totalBedCapacity)}</p>
                  <p>Blood bank capacity: {toDisplay(selectedHospital.bloodBankCapacity)}</p>
                  <p>Is verified: {toDisplay(selectedHospital.isVerified)}</p>
                  <p>Is active: {toDisplay(selectedHospital.isActive)}</p>
                  <p>Is deleted: {toDisplay(selectedHospital.isDeleted)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Location</p>
                <div className="mt-3 space-y-2 text-sm text-zinc-200">
                  <p>Area: {toDisplay(selectedHospital.location?.area)}</p>
                  <p>District: {toDisplay(selectedHospital.location?.district)}</p>
                  <p>Division: {toDisplay(selectedHospital.location?.division)}</p>
                  <p>Geo type: {toDisplay(selectedHospital.location?.coordinates?.type)}</p>
                  <p>Latitude: {toDisplay(latitude)}</p>
                  <p>Longitude: {toDisplay(longitude)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Security fields</p>
                <div className="mt-3 grid gap-2 text-sm text-zinc-200 md:grid-cols-2">
                  <p>Password reset token: {toMaskedDisplay(selectedHospital.passwordResetToken)}</p>
                  <p>Password reset expires: {toDisplay(selectedHospital.passwordResetExpires)}</p>
                  <p>Refresh token hash: {toMaskedDisplay(selectedHospital.refreshTokenHash)}</p>
                  <p>Refresh token expires: {toDisplay(selectedHospital.refreshTokenExpiresAt)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Audit logs</p>
                {selectedHospital.auditLogs && selectedHospital.auditLogs.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {selectedHospital.auditLogs.map((log, index) => (
                      <div key={`${log.action}-${index}`} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-200">
                        <p>Action: {toDisplay(log.action)}</p>
                        <p>Performed by: {toDisplay(log.performedBy)}</p>
                        <p>Performed at: {toDisplay(formatAdminDate(log.performedAt))}</p>
                        <p>IP address: {toDisplay(log.ipAddress)}</p>
                        <p>User agent: {toDisplay(log.userAgent)}</p>
                        <p>Notes: {toDisplay(log.notes)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-400">No audit logs available.</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[2px] text-zinc-400">Timestamps</p>
                <div className="mt-3 grid gap-2 text-sm text-zinc-200 md:grid-cols-2">
                  <p>Created at: {toDisplay(formatAdminDate(selectedHospital.createdAt))}</p>
                  <p>Updated at: {toDisplay(formatAdminDate(selectedHospital.updatedAt))}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
