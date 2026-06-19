import { FONT, SERIF, MONO, inputStyle, btnPrimaryStyle } from "../lib/constants.js";

// ── Card ──────────────────────────────────────────────────────
export function Card({ P, title, subtitle, children, noPad }) {
  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: P.radius, padding: noPad ? 0 : "20px 24px", marginBottom: 16 }}>
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, gap: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, fontFamily: SERIF, margin: 0, color: P.ink }}>{title}</h2>
          {subtitle && <div style={{ fontSize: 11, color: P.faint, fontFamily: MONO, whiteSpace: "nowrap" }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── KpiCard ───────────────────────────────────────────────────
export function KpiCard({ P, label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: P.radius, padding: "20px 22px" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color, opacity: 0.65, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
      <N style={{ fontSize: 26, fontWeight: 700, color, fontFamily: SERIF }}>{value}</N>
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────
export function Pill({ P, active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      border: `1px solid ${active ? P.accent : P.border}`, borderRadius: 20,
      background: active ? P.accent : P.surface, color: active ? "#fff" : P.muted,
      padding: "5px 13px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s",
    }}>{children}</button>
  );
}

// ── Field ─────────────────────────────────────────────────────
export function Field({ P, label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: P.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
      {children}
    </label>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ P, value, onChange, options, allLabel }) {
  const ALL = "__all__";
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle(P), cursor: "pointer", appearance: "auto" }}>
      <option value={ALL}>{allLabel}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── N (monospace number span) ─────────────────────────────────
export function N({ children, style }) {
  return <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", ...style }}>{children}</span>;
}

// ── Empty state ───────────────────────────────────────────────
export function Empty({ P, text = "No data for this period." }) {
  return <div style={{ padding: "32px 16px", textAlign: "center", color: P.faint, fontSize: 13 }}>{text}</div>;
}

// ── Row (top-expenses list) ───────────────────────────────────
export function Row({ P, title, sub, amount, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${P.borderLight}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: P.ink }}>{title}</div>
        <div style={{ fontSize: 11, color: P.faint }}>{sub}</div>
      </div>
      <N style={{ fontSize: 14, fontWeight: 600, color }}>{amount}</N>
    </div>
  );
}
