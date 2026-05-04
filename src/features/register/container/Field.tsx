import { styles } from "./style";

export function Field({
  label,
  error,
  isRequired = false,
  children,
}: {
  label: string;
  error?: string;
  isRequired?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
      <label style={styles.label}>
        {label}
        {isRequired && <span style={{ color: "#C0392B", marginLeft: "4px", fontWeight: 600 }}>*</span>}
      </label>
      {children}
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}