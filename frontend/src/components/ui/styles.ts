import type { TagTone } from "./Tag";

// Class strings for plain <input>/<select> elements in pages not yet moved to ui/Field.
export const inputClass =
  "w-full px-3 py-2 text-sm bg-surface border border-border-strong rounded-sm text-ink placeholder:text-muted transition-colors duration-150 hover:border-ink/60";
export const selectClass =
  "h-10 px-2.5 text-sm bg-surface border border-border-strong rounded-sm text-ink transition-colors duration-150 hover:border-ink/60";
export const labelClass = "block text-sm font-medium text-ink mb-1";

export const statusTone = (s?: string): TagTone =>
  s === "UNDER_PROCESS" ? "info"
  : s === "ESCALATED" ? "danger"
  : s === "DISPOSED" ? "success"
  : s === "PENDING" ? "warning"
  : "neutral";

export const priorityTone = (p?: string): TagTone =>
  p === "URGENT" ? "danger" : p === "HIGH" ? "warning" : "neutral";

export const riskTone = (r?: string): TagTone =>
  r === "HIGH" ? "danger" : r === "MEDIUM" ? "warning" : "success";

export const slaTone = (s?: string): TagTone =>
  s === "OVERDUE" ? "danger"
  : s === "APPROACHING_DEADLINE" ? "warning"
  : s === "DISPOSED" ? "neutral"
  : "success";

export const toggleClass = (active: boolean) =>
  `h-10 px-3 text-sm font-medium rounded-sm border transition-colors duration-150 ${
    active ? "bg-brand text-white border-brand" : "bg-surface text-ink border-border-strong hover:bg-page"
  }`;
