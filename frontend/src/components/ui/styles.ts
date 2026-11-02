import type { TagTone } from "./Tag";

<<<<<<< HEAD
export const inputClass =
  "w-full h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-xs";

export const selectClass =
  "h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-xs cursor-pointer";

export const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";

export const statusTone = (s?: string): TagTone => {
  switch (s) {
    case "UNDER_PROCESS":
      return "info";
    case "ESCALATED":
      return "bad";
    case "DISPOSED":
    case "CLOSED":
      return "ok";
    case "PENDING":
    case "RECEIVED":
      return "warn";
    case "TRANSFERRED":
      return "info";
    default:
      return "neutral";
  }
};

export const priorityTone = (p?: string): TagTone => {
  switch (p) {
    case "URGENT":
      return "bad";
    case "HIGH":
      return "warn";
    case "MEDIUM":
      return "neutral";
    case "LOW":
      return "neutral";
    default:
      return "neutral";
  }
};

export const riskTone = (r?: string): TagTone => {
  switch (r) {
    case "CRITICAL":
    case "HIGH":
      return "bad";
    case "MEDIUM":
      return "warn";
    case "LOW":
      return "ok";
    default:
      return "neutral";
  }
};

export const slaTone = (s?: string): TagTone => {
  switch (s) {
    case "OVERDUE":
      return "bad";
    case "APPROACHING_DEADLINE":
      return "warn";
    case "DISPOSED":
      return "ok";
    default:
      return "ok";
  }
};

export const toggleClass = (active: boolean) =>
  `h-9 px-3.5 text-xs font-medium rounded-lg border transition-all duration-150 select-none ${
    active
      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
=======
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
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  }`;
