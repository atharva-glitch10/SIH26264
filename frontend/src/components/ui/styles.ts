import type { TagTone } from "./Tag";

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
  }`;
