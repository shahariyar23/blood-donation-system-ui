import { useEffect, useState } from "react";
import { Icons } from "../../../shared/icons/Icons";
import {
  mapHospitalDonor,
  type HospitalDonor,
  type HospitalDonationRequestApi,
} from "../service/hospitalData";
import {
  createHospitalDonation,
  fetchHospitalIdentifierSuggestions,
  fetchHospitalDonorByIdentifier,
} from "../service/hospitalService";

const HospitalDonorSelection = () => {
  const [donors, setDonors] = useState<HospitalDonor[]>([]);
  const [donorLoading, setDonorLoading] = useState(false);
  const [donorError, setDonorError] = useState<string | null>(null);
  const [donorQuery, setDonorQuery] = useState("");
  const [donorSuggestions, setDonorSuggestions] = useState<
    Array<{
      identifier: string;
      title: string;
      subtitle: string;
    }>
  >([]);
  const [donorSuggestionsOpen, setDonorSuggestionsOpen] = useState(false);
  const [donorSuggestionsLoading, setDonorSuggestionsLoading] = useState(false);
  const [donorSuggestionHint, setDonorSuggestionHint] = useState<string | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<HospitalDonor | null>(null);
  const [request, setRequest] = useState<HospitalDonationRequestApi | null>(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    bloodType: "",
    units: 1,
    patientName: "",
    patientAddress: "",
    patientPhone: "",
    reason: "",
    notes: "",
  });

  const loadDonorByIdentifier = async (identifier: string) => {
    setDonorLoading(true);
    setDonorError(null);
    setCreateError(null);

    try {
      const data = await fetchHospitalDonorByIdentifier(identifier);
      setRequest(data.request);

      const mapped = mapHospitalDonor(data.donor);
      setDonors([mapped]);

      // Reset selected donor if it no longer matches current search result.
      if (selectedDonor && selectedDonor.id !== mapped.id) {
        setSelectedDonor(null);
      }

      setForm((prev) => ({
        ...prev,
        bloodType: data.request?.bloodType ?? mapped.bloodType,
        units: data.request?.units ?? prev.units,
        patientName: data.request?.patientInfo?.name ?? "",
        patientAddress: data.request?.patientInfo?.address ?? "",
        patientPhone: data.request?.patientInfo?.phone ?? "",
        reason: data.request?.patientInfo?.reasonForBlood ?? "",
        notes: data.request?.notes ?? "",
      }));
    } catch {
      setDonors([]);
      setSelectedDonor(null);
      setRequest(null);
      setDonorError("Donor is not found");
    } finally {
      setDonorLoading(false);
    }
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!selectedDonor) {
      setCreateError("Please select a donor first.");
      return;
    }

    if (!request?.requestedBy?._id) {
      setCreateError("Requester not found for this donation request.");
      return;
    }

    if (!selectedDonor.isAvailable) {
      setCreateError("Selected donor is unavailable. Please select an available donor.");
      return;
    }

    if (!form.bloodType.trim()) {
      setCreateError("Blood type is required");
      return;
    }

    if (form.units < 1) {
      setCreateError("Units must be at least 1");
      return;
    }

    if (!form.patientName.trim()) {
      setCreateError("Patient name is required");
      return;
    }

    if (!form.patientAddress.trim()) {
      setCreateError("Patient address is required");
      return;
    }

    if (!form.patientPhone.trim()) {
      setCreateError("Patient phone is required");
      return;
    }

    if (!form.reason.trim()) {
      setCreateError("Reason is required");
      return;
    }

    setCreateLoading(true);
    try {
      await createHospitalDonation({
        donorId: selectedDonor.id,
        requesterId: request.requestedBy._id,
        bloodType: form.bloodType.trim(),
        units: form.units,
        patientInfo: {
          name: form.patientName.trim(),
          address: form.patientAddress.trim(),
          phone: form.patientPhone.trim(),
          reasonForBlood: form.reason.trim(),
        },
        notes: form.notes.trim() || undefined,
      });

      setCreateSuccess("Donation created successfully");
      setForm((prev) => ({
        ...prev,
        patientName: "",
        patientAddress: "",
        patientPhone: "",
        reason: "",
        notes: "",
      }));
    } catch {
      setCreateError("Failed to create donation");
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    const query = donorQuery.trim();
    const digits = query.replace(/\D/g, "");
    const isDigitsOnly = Boolean(digits) && digits === query;

    if (!query) {
      setDonorSuggestionHint(null);
      setDonorSuggestions([]);
      setDonorSuggestionsLoading(false);
      return;
    }

    const shouldSuggest = isDigitsOnly ? digits.length >= 3 : query.length >= 1;
    if (!shouldSuggest) {
      setDonorSuggestionHint(null);
      setDonorSuggestions([]);
      setDonorSuggestionsLoading(false);
      return;
    }

    let isActive = true;
    setDonorSuggestionsLoading(true);
    setDonorSuggestionHint(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const suggestions = await fetchHospitalIdentifierSuggestions(query);
        console.log("Suggestions received:", suggestions);
        const mapped = suggestions.slice(0, 6).map((item) => {
          const title = item.name ? `${item.name} (${item.role})` : item.identifier;
          const subtitle = [item.email, item.phone].filter(Boolean).join(" • ");
          return {
            identifier: item.identifier,
            title,
            subtitle: subtitle || item.identifier,
          };
        });

        if (!isActive) return;
        setDonorSuggestions(mapped);
        setDonorSuggestionHint(mapped.length === 0 ? "No suggestion found." : null);
      } catch (error) {
        console.error("Suggestions API error:", error);
        if (!isActive) return;
        setDonorSuggestions([]);
        setDonorSuggestionHint("Suggestion is unavailable.");
      } finally {
        if (isActive) {
          setDonorSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [donorQuery]);

  const donorSuggestionsEnabled =
    donorQuery.trim().length >= 1;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-100 bg-[linear-gradient(120deg,#fff1f2_0%,#ffffff_55%,#eef2ff_100%)] p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[3px] text-red-500 font-semibold">
          Hospital Portal
        </p>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">
          Donor Selection
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Search a donor by phone or email, verify availability, then create a donation request.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 rounded-xl border border-red-100 bg-[linear-gradient(120deg,#fff5f5_0%,#ffffff_45%,#f0f9ff_100%)] p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 center-flex">
                <Icons.Search className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[2px] text-red-500 font-semibold">
                  Donor Directory
                </p>
                <p className="text-sm font-semibold text-gray-900">Find the right donor fast</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-600">
              Use email or phone to find one donor profile and review availability before selection.
            </p>
          </div>

          {request && (
            <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[2px] text-indigo-600 font-semibold">
                    Donation Request
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    Request ID: <span className="font-semibold">{request._id}</span>
                  </p>
                </div>
                <span className="rounded-full bg-white/70 border border-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                  {request.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="text-slate-500">Blood Type:</span> {request.bloodType}
                </p>
                <p>
                  <span className="text-slate-500">Units:</span> {request.units}
                </p>
                {request.patientInfo?.name && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Patient:</span> {request.patientInfo.name}
                  </p>
                )}
                {request.patientInfo?.address && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Address:</span> {request.patientInfo.address}
                  </p>
                )}
                {request.patientInfo?.reasonForBlood && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Reason:</span> {request.patientInfo.reasonForBlood}
                  </p>
                )}
                {request.requestedBy?.name && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Requested By:</span> {request.requestedBy.name}
                  </p>
                )}
                {request.requestedBy?.email && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Email:</span> {request.requestedBy.email}
                  </p>
                )}
                {request.requestedBy?.phone && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Phone:</span> {request.requestedBy.phone}
                  </p>
                )}
                {request.patientInfo?.address && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Location:</span> {request.patientInfo.address}
                  </p>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const identifier = donorQuery.trim();
              if (!identifier) {
                setDonorError("Please enter donor email or phone");
                setDonors([]);
                setSelectedDonor(null);
                setRequest(null);
                return;
              }
              void loadDonorByIdentifier(identifier);
            }}
            className="flex w-full flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Icons.Search className="w-4 h-4 text-red-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={donorQuery}
                onChange={(e) => {
                  setDonorQuery(e.target.value);
                  setDonorSuggestionsOpen(true);
                }}
                onFocus={() => setDonorSuggestionsOpen(true)}
                onBlur={() => window.setTimeout(() => setDonorSuggestionsOpen(false), 150)}
                placeholder="Search by email or phone"
                className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:border-red-400 focus:outline-none"
              />

              {donorSuggestionsOpen && donorQuery.trim() && donorSuggestionsEnabled && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                  {donorSuggestionsLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                  ) : donorSuggestionHint ? (
                    <div className="px-4 py-3 text-sm text-gray-500">{donorSuggestionHint}</div>
                  ) : donorSuggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No match found. Try full email or phone.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {donorSuggestions.map((item) => (
                        <button
                          key={item.identifier}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setDonorQuery(item.identifier);
                            setDonorSuggestionsOpen(false);
                            void loadDonorByIdentifier(item.identifier);
                          }}
                          className="flex w-full items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            <p className="mt-1 text-xs text-gray-500">{item.subtitle}</p>
                          </div>
                          <span className="mt-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="rounded-full bg-gray-900 text-white px-5 py-2.5 text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {donorError && (
            <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {donorError}
            </div>
          )}

          <div className="mt-4 space-y-3">
            {donorLoading ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400">
                Loading donor profile...
              </div>
            ) : donors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400">
                No donor found. Search by exact email or phone.
              </div>
            ) : (
              donors.map((donor) => {
                const isSelected = selectedDonor?.id === donor.id;
                return (
                  <div
                    key={donor.id}
                    className={`rounded-xl border p-4 transition ${
                      isSelected
                        ? "border-red-300 bg-red-50/40"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-gray-900">{donor.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{donor.id}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          donor.isAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {donor.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                      <p>
                        <span className="text-gray-400">Email:</span> {donor.email}
                      </p>
                      <p>
                        <span className="text-gray-400">Phone:</span> {donor.phone}
                      </p>
                      <p>
                        <span className="text-gray-400">Blood Group:</span> {donor.bloodType}
                      </p>
                      <p>
                        <span className="text-gray-400">City:</span> {donor.city}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                        Donations: {donor.totalDonations}
                      </span>
                      {donor.primarySocialLink && (
                        <a
                          href={donor.primarySocialLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary font-semibold hover:underline"
                        >
                          Primary social link
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={!donor.isAvailable}
                        onClick={() => {
                          if (!donor.isAvailable) return;
                          setSelectedDonor(donor);
                          setForm((prev) => ({ ...prev, bloodType: donor.bloodType }));
                          setCreateError(null);
                        }}
                        className={`ml-auto rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                          donor.isAvailable
                            ? isSelected
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                            : "border-gray-100 text-gray-400 cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        {donor.isAvailable ? (isSelected ? "Selected" : "Use this donor") : "Unavailable donor"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 center-flex">
              <Icons.Search className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[2px] text-gray-400">New Record</p>
              <p className="text-sm font-semibold text-gray-900">Create donation</p>
            </div>
          </div>
          {selectedDonor && (
            <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Selected donor: <span className="font-semibold">{selectedDonor.name}</span> ({selectedDonor.bloodType})
            </div>
          )}

          <form className="space-y-3" onSubmit={handleCreateDonation}>
            <div>
              <label className="text-xs text-gray-500">Selected Donor ID</label>
              <input
                value={selectedDonor?.id ?? ""}
                readOnly
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                placeholder="Select an available donor first"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Blood Type</label>
              <input
                value={form.bloodType}
                readOnly
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                placeholder="Auto-filled from selected donor"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Units</label>
              <input
                type="number"
                min={1}
                value={form.units}
                onChange={(e) => setForm((p) => ({ ...p, units: Number(e.target.value) }))}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Patient Name</label>
              <input
                value={form.patientName}
                onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                placeholder="e.g. Md. Rahim Uddin"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Patient Address</label>
              <textarea
                value={form.patientAddress}
                onChange={(e) => setForm((p) => ({ ...p, patientAddress: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                placeholder="House, road, area, city"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Patient Phone</label>
              <input
                value={form.patientPhone}
                onChange={(e) => setForm((p) => ({ ...p, patientPhone: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                placeholder="01711111111"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Reason for Blood Request</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                placeholder="Surgery, accident case, severe anemia, etc."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Additional Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                placeholder="Urgency, preferred collection time, extra instructions"
              />
            </div>

            {createError && (
              <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {createSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={createLoading || !selectedDonor || !selectedDonor.isAvailable}
              className="w-full rounded-md bg-gray-900 text-white py-2.5 text-sm font-semibold hover:bg-black transition disabled:opacity-60"
            >
              {createLoading ? "Creating..." : "Create donation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalDonorSelection;
