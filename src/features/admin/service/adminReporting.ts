type CsvValue = string | number | boolean | null | undefined;

export interface CsvColumn<T> {
  label: string;
  value: (row: T) => CsvValue;
}

export function escapeCsvValue(value: CsvValue) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

export function buildCsv<T>(
  columns: ReadonlyArray<CsvColumn<T>>,
  rows: ReadonlyArray<T>
) {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const body = rows
    .map((row) => columns.map((column) => escapeCsvValue(column.value(row))).join(","))
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function downloadCsv<T>(
  filename: string,
  columns: ReadonlyArray<CsvColumn<T>>,
  rows: ReadonlyArray<T>
) {
  downloadTextFile(filename, buildCsv(columns, rows), "text/csv;charset=utf-8");
}

export function downloadJson(filename: string, data: unknown) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
}

export function formatAdminDate(value?: string) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
