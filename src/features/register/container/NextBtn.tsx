import { styles } from "./style";

export function NavBtns({
  onNext,
  onBack,
  nextLabel = "Continue →",
  showBack = true,
  disabled = false,
}: {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
      {showBack && onBack && (
        <button onClick={onBack} style={styles.btnBack}>
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        style={{ ...styles.btnNext, opacity: disabled ? 0.7 : 1 }}
      >
        {nextLabel}
      </button>
    </div>
  );
}