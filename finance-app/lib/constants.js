// ── Palettes ──────────────────────────────────────────────────
export const PALETTE_DARK = {
  bg: "#2e1f27", surface: "#d8e2dc", surfaceAlt: "#e7e393",
  ink: "#2e1f27", muted: "#854d27", faint: "#a4ac9680",
  border: "#c9cad9", borderLight: "#e7e393",
  income: "#f4c95d", incomeLight: "rgba(244,201,93,0.15)",
  expense: "#dd7230", expenseLight: "rgba(221,114,48,0.12)",
  invest: "#f4c95d", investLight: "rgba(244,201,93,0.12)",
  over: "#dd7230", overLight: "rgba(221,114,48,0.12)",
  accent: "#dd7230", accentSoft: "rgba(221,114,48,0.15)",
  chart1: "#dd7230", chart2: "#f4c95d", chart3: "#854d27",
  chart4: "#e7e393", chart5: "#a09cb0", chart6: "#a4ac96",
  radius: 12, radiusSm: 8,
};

export const PALETTE_LIGHT = {
  bg: "#f9f8f5", surface: "#ffffff", surfaceAlt: "#f4f2ed",
  ink: "#2e1f27", muted: "#854d27", faint: "#854d2745",
  border: "#d8e2dc", borderLight: "#e7e393",
  income: "#f4c95d", incomeLight: "rgba(244,201,93,0.15)",
  expense: "#dd7230", expenseLight: "rgba(221,114,48,0.12)",
  invest: "#f4c95d", investLight: "rgba(244,201,93,0.12)",
  over: "#dd7230", overLight: "rgba(221,114,48,0.12)",
  accent: "#dd7230", accentSoft: "rgba(221,114,48,0.15)",
  chart1: "#dd7230", chart2: "#f4c95d", chart3: "#854d27",
  chart4: "#e7e393", chart5: "#a09cb0", chart6: "#a4ac96",
  radius: 12, radiusSm: 8,
};

export const PIE_COLORS = [
  "#dd7230","#f4c95d","#e7e393","#854d27",
  "#a09cb0","#a4ac96","#d8e2dc","#c9cad9","#854d27","#f4c95d",
];

export const FONT  = "'Inter', -apple-system, system-ui, sans-serif";
export const SERIF = "'EB Garamond', 'Noto Serif Display', serif";
export const MONO  = "'JetBrains Mono', 'SF Mono', ui-monospace, monospace";

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const ALL    = "__all__";

// ── Money formatters (currency comes from user config) ─────────
export const makeMoney = (currency = "CAD") => ({
  money:  (v) => new Intl.NumberFormat("en-CA", { style: "currency", currency, minimumFractionDigits: 2 }).format(v || 0),
  money0: (v) => new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(v || 0),
});

export const mk = (d) => d.slice(0, 7);
export const ml = (k) => { const [y, m] = k.split("-"); return `${MONTHS[+m - 1]} ${y}`; };

export const TYPE_META = {
  expense:    { label: "Expenses", icon: "↓" },
  income:     { label: "Income",   icon: "↑" },
  investment: { label: "Invested", icon: "◆" },
};

// ── Shared style snippets ──────────────────────────────────────
export const inputStyle = (P) => ({
  width: "100%", border: `1px solid ${P.border}`, borderRadius: P.radiusSm,
  padding: "9px 12px", fontSize: 13, background: P.surface, color: P.ink, outline: "none",
});

export const btnPrimaryStyle = (P) => ({
  width: "100%", border: "none", borderRadius: P.radiusSm, padding: "11px 20px",
  fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#fff", background: P.accent,
});

// ── Data helpers ───────────────────────────────────────────────
export function optionsFor(txns, type, field, config) {
  const fromData = txns.filter((t) => t.type === type).map((t) => t[field]).filter(Boolean);
  let extra = [];
  if (config) {
    if (field === "category") extra = config.categories?.[type] || [];
    else if (field === "account") extra = config.accounts || [];
  }
  return [...new Set([...fromData, ...extra])].sort();
}

export function groupSorted(arr, type, field) {
  const m = {};
  arr.filter((t) => t.type === type).forEach((t) => { m[t[field]] = (m[t[field]] || 0) + t.amount; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name || "—", value: Math.round(value) }));
}

export function groupSortedRows(rows, field) {
  const m = {};
  rows.forEach((t) => { m[t[field]] = (m[t[field]] || 0) + t.amount; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name || "—", value: Math.round(value) }));
}

export function byMonth(txns) {
  const m = {};
  txns.forEach((t) => {
    const k = mk(t.date);
    m[k] ||= { month: k, income: 0, expense: 0, invest: 0 };
    m[k][t.type === "investment" ? "invest" : t.type] += t.amount;
  });
  return Object.values(m).sort((a, b) => a.month.localeCompare(b.month))
    .map((r) => ({ ...r, label: MONTHS[+r.month.split("-")[1] - 1] }));
}

export function byMonthRows(rows) {
  const m = {};
  rows.forEach((t) => { const k = mk(t.date); m[k] = (m[k] || 0) + t.amount; });
  return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => ({ label: MONTHS[+k.split("-")[1] - 1], value: Math.round(v) }));
}
