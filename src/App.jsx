import { useState, useMemo, useCallback } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useData } from "./hooks/useData.js";
import { PALETTE_DARK, PALETTE_LIGHT, FONT, SERIF, MONO, MONTHS, ALL, makeMoney, mk, ml, TYPE_META, optionsFor, groupSorted, groupSortedRows, byMonth, byMonthRows, PIE_COLORS, inputStyle, btnPrimaryStyle } from "./lib/constants.js";
import { Card, KpiCard, Pill, Field, Select, N, Empty, Row } from "./components/ui.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import LogTab from "./components/LogTab.jsx";
import InvestTab from "./components/InvestTab.jsx";

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { transactions, config, loading: dataLoading, importFromJson,
          addTransaction, updateTransaction, deleteTransaction, bulkUpdate, updateConfig } = useData(user);

  const [tab, setTab]           = useState("dash");
  const [month, setMonth]       = useState("all");
  const [darkMode, setDarkMode] = useState(true);

  const P = darkMode ? PALETTE_DARK : PALETTE_LIGHT;
  const { money, money0 } = makeMoney(config?.currency || "CAD");

  // ── ALL hooks must come before any early returns ───────────────
  const months = useMemo(() => [...new Set((transactions || []).map((t) => mk(t.date)))].sort(), [transactions]);
  const scoped  = useMemo(() => {
    if (!transactions) return [];
    return month === "all" ? transactions : transactions.filter((t) => mk(t.date) === month);
  }, [transactions, month]);

  // ── Auth loading ──────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ fontFamily: FONT, color: "#854d27", padding: 60, textAlign: "center", background: "#f9f8f5", minHeight: "100vh" }}>
      Loading…
    </div>
  );

  // ── Not logged in ─────────────────────────────────────────────
  if (!user) return <AuthPage onSignIn={signIn} onSignUp={signUp} />;

  // ── Data loading ──────────────────────────────────────────────
  if (dataLoading) return (
    <div style={{ fontFamily: FONT, color: P.muted, padding: 60, textAlign: "center", background: P.bg, minHeight: "100vh" }}>
      Loading your ledger…
    </div>
  );

  // ── New user — no transactions yet, offer onboarding ──────────
  if (transactions.length === 0 && !config?.onboarded) return (
    <OnboardingPage P={P}
      onImport={async (json) => { await importFromJson(json); await updateConfig({ onboarded: true }); }}
      onSkip={() => updateConfig({ onboarded: true })}
    />
  );

  const exportData = () => {
    const out = {
      version: 2,
      currency: config?.currency || "CAD",
      roomLeft: config?.room_left || {},
      config: { categories: config?.categories || {}, accounts: config?.accounts || [] },
      transactions,
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "seed-data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { k: "dash",       label: "Dashboard",   icon: "⊞" },
    { k: "expense",    label: "Expenses",     icon: "↓" },
    { k: "income",     label: "Income",       icon: "↑" },
    { k: "investment", label: "Investments",  icon: "◆" },
    { k: "settings",   label: "Settings",     icon: "⚙" },
  ];

  return (
    <div style={{ fontFamily: FONT, background: P.bg, color: P.ink, minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input, select, button, textarea { font-family: ${FONT}; }
        ::selection { background: ${P.accentSoft}; color: ${P.ink}; }
        @keyframes waveSurface { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-30px)} 75%{transform:translateX(30px)} }
        @keyframes waveMove { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* NAV */}
      <div style={{ background: P.surface, borderBottom: `1px solid ${P.borderLight}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 4, height: 52, overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              border: "none", background: tab === t.k ? P.accentSoft : "transparent",
              color: tab === t.k ? P.accent : P.muted, borderRadius: 8, padding: "7px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s",
            }}>
              <span style={{ marginRight: 5, opacity: 0.7 }}>{t.icon}</span>{t.label}
            </button>
          ))}
          <button onClick={exportData} title="Export data as JSON" style={{
            marginLeft: "auto", border: `1px solid ${P.border}`, background: P.surface, color: P.muted,
            borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", marginRight: 8,
          }}>⬇ Export</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            border: `1px solid ${P.border}`, background: P.surface, color: P.muted,
            borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
          }}>{darkMode ? "☀" : "🌙"}</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 0" }}>
        {/* Month filter */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 20 }}>
          <Pill P={P} active={month === "all"} onClick={() => setMonth("all")}>All months</Pill>
          {months.map((m) => <Pill key={m} P={P} active={month === m} onClick={() => setMonth(m)}>{ml(m)}</Pill>)}
        </div>

        {tab === "dash" && (
          <Dashboard P={P} money={money} money0={money0} txns={transactions} scoped={scoped} month={month} darkMode={darkMode} />
        )}
        {tab === "expense" && (
          <LogTab P={P} money={money} money0={money0} type="expense" txns={transactions} scoped={scoped} month={month}
            config={config} onAdd={addTransaction} onEdit={updateTransaction} onDel={deleteTransaction} onBulkEdit={bulkUpdate} />
        )}
        {tab === "income" && (
          <LogTab P={P} money={money} money0={money0} type="income" txns={transactions} scoped={scoped} month={month}
            config={config} onAdd={addTransaction} onEdit={updateTransaction} onDel={deleteTransaction} onBulkEdit={bulkUpdate} />
        )}
        {tab === "investment" && (
          <InvestTab P={P} money={money} money0={money0} txns={transactions} scoped={scoped} month={month}
            config={config} onAdd={addTransaction} onEdit={updateTransaction} onDel={deleteTransaction} onBulkEdit={bulkUpdate} />
        )}
        {tab === "settings" && (
          <SettingsTab P={P} user={user} config={config} onUpdateConfig={updateConfig} onSignOut={signOut} onImport={importFromJson} />
        )}
      </div>
    </div>
  );
}

// ── Settings tab ───────────────────────────────────────────────
function SettingsTab({ P, user, config, onUpdateConfig, onSignOut, onImport }) {
  const [currency, setCurrency] = useState(config?.currency || "CAD");
  const [roomLeft, setRoomLeft] = useState(JSON.stringify(config?.room_left || {}, null, 2));
  const [saved, setSaved]       = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const save = async () => {
    try {
      await onUpdateConfig({ currency, room_left: JSON.parse(roomLeft) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true); setImportError("");
    try {
      const json = JSON.parse(await file.text());
      await onImport(json);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const inputS = inputStyle(P);

  return (
    <div>
      <Card P={P} title="Account">
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 16 }}>Signed in as <strong>{user.email}</strong></div>
        <button onClick={onSignOut} style={{ border: `1px solid ${P.border}`, background: "transparent", color: P.muted, borderRadius: P.radiusSm, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
          Sign out
        </button>
      </Card>

      <Card P={P} title="Preferences">
        <Field P={P} label="Currency">
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="CAD" style={{ ...inputS, maxWidth: 120 }} />
        </Field>
        <Field P={P} label="Contribution room (JSON)" >
          <textarea value={roomLeft} onChange={(e) => setRoomLeft(e.target.value)} rows={5}
            style={{ ...inputS, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, resize: "vertical", marginTop: 4 }} />
          <div style={{ fontSize: 11, color: P.faint, marginTop: 4 }}>e.g. {"{"}"TFSA": 7843.41, "FHSA": 3980.69, "RRSP": 5598{"}"}</div>
        </Field>
        <button onClick={save} style={{ ...btnPrimaryStyle(P), width: "auto", padding: "9px 20px", marginTop: 12, fontSize: 13 }}>
          {saved ? "✓ Saved" : "Save preferences"}
        </button>
      </Card>

      <Card P={P} title="Import data">
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 12 }}>
          Replace all transactions with a JSON export. <strong>This overwrites existing data.</strong>
        </div>
        <input type="file" accept=".json" onChange={handleImport} style={{ fontSize: 13, color: P.muted }} />
        {importing && <div style={{ marginTop: 8, fontSize: 13, color: P.muted }}>Importing…</div>}
        {importError && <div style={{ marginTop: 8, fontSize: 13, color: P.over }}>{importError}</div>}
      </Card>
    </div>
  );
}
