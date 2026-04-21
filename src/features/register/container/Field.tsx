import { styles } from "./style";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}