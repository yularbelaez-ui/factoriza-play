export function csvCell(value: unknown): string {
  let text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  if (typeof value === "string" && /^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}