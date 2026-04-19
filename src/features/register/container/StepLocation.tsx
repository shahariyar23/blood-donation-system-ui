import type { RegisterFormData } from "../service/register.type";
import { Field } from "./Field";
import { NavBtns } from "./NextBtn";
import { styles } from "./style";

export function StepLocation({
  form,
  errors,
  detectingLocation,
  setLocation,
  setCoordinate,
  setFieldRef,
  handleInputKeyDown,
  onDetectLocation,
  onNext,
  onBack,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  detectingLocation: boolean;
  setLocation: (field: string, value: any) => void;
  setCoordinate: (axis: "lat" | "lng", value: string) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  onDetectLocation: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Your location</div>

      <button
        type="button"
        onClick={onDetectLocation}
        disabled={detectingLocation}
        style={styles.detectBtn}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
        {detectingLocation ? "Detecting location..." : "Detect location"}
      </button>

      {errors.location && (
        <p style={{ color: "#C0392B", fontSize: "12px", marginBottom: "8px" }}>
          {errors.location}
        </p>
      )}

      <div style={styles.grid2}>
        <Field label="City / Town" error={errors.city}>
          <input
            ref={setFieldRef("city")}
            name="city"
            style={{ ...styles.input, ...(errors.city ? styles.inputError : {}) }}
            value={form.location.city}
            onChange={(e) => setLocation("city", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "city")}
            placeholder="Dhaka"
          />
        </Field>
        <Field label="State / Division">
          <input
            ref={setFieldRef("state")}
            name="state"
            style={styles.input}
            value={form.location.state}
            onChange={(e) => setLocation("state", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "state")}
            placeholder="Dhaka Division"
          />
        </Field>
        <Field label="District">
          <input
            ref={setFieldRef("state_district")}
            name="state_district"
            style={styles.input}
            value={form.location.state_district}
            onChange={(e) => setLocation("state_district", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "state_district")}
            placeholder="Dhaka District"
          />
        </Field>
        <Field label="County">
          <input
            ref={setFieldRef("county")}
            name="county"
            style={styles.input}
            value={form.location.county}
            onChange={(e) => setLocation("county", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "county")}
            placeholder="County"
          />
        </Field>
        <Field label="Country" error={errors.country}>
          <input
            ref={setFieldRef("country")}
            name="country"
            style={{ ...styles.input, ...(errors.country ? styles.inputError : {}) }}
            value={form.location.country}
            onChange={(e) => setLocation("country", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "country")}
            placeholder="Bangladesh"
          />
        </Field>
        <Field label="Postcode">
          <input
            ref={setFieldRef("postcode")}
            name="postcode"
            style={styles.input}
            value={form.location.postcode}
            onChange={(e) => setLocation("postcode", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "postcode")}
            placeholder="1207"
          />
        </Field>
        <Field label="Latitude">
          <input
            ref={setFieldRef("lat")}
            name="lat"
            style={styles.input}
            type="number"
            step="any"
            value={form.location.coordinates.lat ?? ""}
            onChange={(e) => setCoordinate("lat", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "lat")}
            placeholder="23.8103"
          />
        </Field>
        <Field label="Longitude">
          <input
            ref={setFieldRef("lng")}
            name="lng"
            style={styles.input}
            type="number"
            step="any"
            value={form.location.coordinates.lng ?? ""}
            onChange={(e) => setCoordinate("lng", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "lng")}
            placeholder="90.4125"
          />
        </Field>
      </div>

      <NavBtns onNext={onNext} onBack={onBack} />
    </div>
  );
}