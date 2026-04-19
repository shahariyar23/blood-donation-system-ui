import type { RegisterFormData } from "../service/register.type";
import { Field } from "./Field";
import { NavBtns } from "./NextBtn";
import { styles } from "./style";
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function StepHealth({
  form,
  errors,
  set,
  setFieldRef,
  handleInputKeyDown,
  focusField,
  onNext,
  onBack,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  set: (field: string, value: any) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  focusField: (key: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Health information</div>

      <Field label="Blood type" error={errors.bloodType}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
          {BLOOD_TYPES.map((bt) => (
            <button
              type="button"
              key={bt}
              onClick={() => set("bloodType", bt)}
              style={{
                ...styles.selectBtn,
                background: form.bloodType === bt ? "#C0392B" : "#F7F5F2",
                color: form.bloodType === bt ? "white" : "#666",
                borderColor: form.bloodType === bt ? "#C0392B" : "#E8E2DA",
              }}
            >
              {bt}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Gender" error={errors.gender}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {["male", "female"].map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => {
                set("gender", g);
                focusField("age");
              }}
              style={{
                ...styles.selectBtn,
                background: form.gender === g ? "#C0392B" : "#F7F5F2",
                color: form.gender === g ? "white" : "#666",
                borderColor: form.gender === g ? "#C0392B" : "#E8E2DA",
                textTransform: "capitalize",
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </Field>

      <div style={styles.grid3}>
        <Field label="Age" error={errors.age}>
          <input
            ref={setFieldRef("age")}
            name="age"
            style={{ ...styles.input, ...(errors.age ? styles.inputError : {}) }}
            type="number"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "age")}
            placeholder="25"
            min={18}
            max={65}
          />
          <span style={styles.hint}>18–65 years</span>
        </Field>
        <Field label="Weight (kg)" error={errors.weight}>
          <input
            ref={setFieldRef("weight")}
            name="weight"
            style={{ ...styles.input, ...(errors.weight ? styles.inputError : {}) }}
            type="number"
            value={form.weight}
            onChange={(e) => set("weight", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "weight")}
            placeholder="65"
            min={50}
          />
          <span style={styles.hint}>Min 50 kg</span>
        </Field>
        <Field label="Date of birth">
          <input
            ref={setFieldRef("dateOfBirth")}
            name="dateOfBirth"
            style={styles.input}
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "dateOfBirth")}
          />
        </Field>
      </div>

      <NavBtns onNext={onNext} onBack={onBack} />
    </div>
  );
}
