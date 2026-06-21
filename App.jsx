import { useState, useMemo } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useData } from "./hooks/useData.js";
import { supabase } from "./lib/supabase.js";
import { PALETTE_DARK, PALETTE_LIGHT, FONT, MONO, makeMoney, mk, ml, inputStyle, btnPrimaryStyle } from "./lib/constants.js";
import { Card, Pill, Field, N } from "./components/ui.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import LogTab from "./components/LogTab.jsx";
import InvestTab from "./components/InvestTab.jsx";

export default function App() {
  const { user, loading: authLoading, recovering, signIn, signUp, signOut, resetPassword, updatePassword } = useAuth();
  const { transactions, config, loading: dataLoading,
          addTransaction, updateTransaction, deleteTransaction, bulkUpdate, updateConfig } = useData(user);

  const [tab, setTab]           = useState("dash");
  const [month, setMonth]       = useState("all");
  const [darkMode, setDarkMode] = useState(false); // default light mode

  const P = darkMode ? PALETTE_DARK : PALETTE_LIGHT;
  const { money, money0 } = makeMoney(config?.currency || "CAD");

  // ALL hooks before early returns
  const months = useMemo(() => [...new Set((transactions || []).map((t) => mk(t.date)))].sort(), [transactions]);
  const scoped  = useMemo(() => {
    if (!transactions) return [];
    return month === "all" ? transactions : transactions.filter((t) => mk(t.date) === month);
  }, [transactions, month]);

  if (authLoading) return (
    <div style={{ fontFamily: FONT, color: "#854d27", padding: 60, textAlign: "center", background: "#f9f8f5", minHeight: "100vh" }}>Loading…</div>
  );
  if (recovering) return <ResetPasswordPage onUpdatePassword={updatePassword} />;
  if (!user) return <AuthPage onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />;
  if (dataLoading) return (
    <div style={{ fontFamily: FONT, color: P.muted, padding: 60, textAlign: "center", background: P.bg, minHeight: "100vh" }}>Loading your ledger…</div>
  );

  const tabs = [
    { k: "dash",       label: "Dashboard",  icon: "⊞" },
    { k: "expense",    label: "Expenses",    icon: "↓" },
    { k: "income",     label: "Income",      icon: "↑" },
    { k: "investment", label: "Investments", icon: "◆" },
    { k: "settings",   label: "Settings",    icon: "⚙" },
  ];

  return (
    <div style={{ fontFamily: FONT, background: P.bg, color: P.ink, minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input, select, button, textarea { font-family: ${FONT}; }
        ::selection { background: ${P.accentSoft}; color: ${P.ink}; }
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
          <button onClick={() => setDarkMode(!darkMode)} style={{
            marginLeft: "auto", border: `1px solid ${P.border}`, background: P.surface, color: P.muted,
            borderRadius: 8, padding: "6px 12px", fontSize: 14, cursor: "pointer", whiteSpace: "nowrap",
          }}>{darkMode ? "☀️" : "🌙"}</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 0" }}>
        {/* Month filter — hidden on settings tab */}
        {tab !== "settings" && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 20 }}>
            <Pill P={P} active={month === "all"} onClick={() => setMonth("all")}>All months</Pill>
            {months.map((m) => <Pill key={m} P={P} active={month === m} onClick={() => setMonth(m)}>{ml(m)}</Pill>)}
          </div>
        )}

        {tab === "dash" && <Dashboard P={P} money={money} money0={money0} txns={transactions} scoped={scoped} month={month} darkMode={darkMode} />}
        {tab === "expense" && <LogTab P={P} money={money} money0={money0} type="expense" txns={transactions} scoped={scoped} month={month} config={config} onAdd={addTransaction} onEdit={updateTransaction} onDel={deleteTransaction} onBulkEdit={bulkUpdate} />}
        {tab === "income" && <LogTab P={P} money={money} money0={money0} type="income" txns={transactions} scoped={scoped} month={month} config={config} onAdd={addTransaction} onEdit={updateTransaction} onDel={deleteTransaction} onBulkEdit={bulkUpdate} />}
        {tab === "investment" && <InvestTab P={P} money={money} money0={money0} txns={transactions} scoped={scoped} month={month} config={config} onAdd={addTransaction} onEdit={updateTransaction} onDel={deleteTransaction} onBulkEdit={bulkUpdate} />}
        {tab === "settings" && <SettingsTab P={P} user={user} config={config} onUpdateConfig={updateConfig} onSignOut={signOut} />}
      </div>
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────
const ACCOUNTS = ["TFSA", "FHSA", "RRSP"];

function SettingsTab({ P, user, config, onUpdateConfig, onSignOut }) {
  const roomLeft = config?.room_left || {};
  const [rooms, setRooms]           = useState({ TFSA: roomLeft.TFSA ?? "", FHSA: roomLeft.FHSA ?? "", RRSP: roomLeft.RRSP ?? "" });
  const [saved, setSaved]           = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmDel, setConfirmDel] = useState("");
  const [delError, setDelError]     = useState("");

  const saveRooms = async () => {
    const room_left = {};
    ACCOUNTS.forEach((a) => { const v = parseFloat(rooms[a]); if (!isNaN(v) && v >= 0) room_left[a] = v; });
    await onUpdateConfig({ room_left });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteAccount = async () => {
    if (confirmDel !== user.email) { setDelError("Email doesn't match."); return; }
    setDeleting(true);
    try {
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("user_config").delete().eq("user_id", user.id);
      await supabase.rpc("delete_user");
      await supabase.auth.signOut();
    } catch (e) {
      setDelError("Could not delete account: " + e.message);
      setDeleting(false);
    }
  };

  const inputS    = inputStyle(P);
  const btnDanger = { border: `1px solid ${P.over}`, background: "transparent", color: P.over, borderRadius: P.radiusSm, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" };

  return (
    <div>
      <Card P={P} title="Account">
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 16 }}>
          Signed in as <strong style={{ color: P.ink }}>{user.email}</strong>
        </div>
        <button onClick={onSignOut} style={{ border: `1px solid ${P.border}`, background: "transparent", color: P.muted, borderRadius: P.radiusSm, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
          Sign out
        </button>
      </Card>

      <Card P={P} title="Contribution room" subtitle="Your remaining room for this year">
        <p style={{ fontSize: 13, color: P.muted, marginBottom: 20, marginTop: 0 }}>
          Enter how much contribution room you have left in each account. Find these numbers on your CRA My Account or your latest NOA.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
          {ACCOUNTS.map((a) => (
            <div key={a} style={{ background: P.surfaceAlt, borderRadius: P.radius, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{a}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 15, color: P.muted, fontWeight: 600 }}>$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={rooms[a]}
                  onChange={(e) => setRooms((r) => ({ ...r, [a]: e.target.value }))}
                  placeholder="0.00"
                  style={{ ...inputS, fontFamily: MONO, fontSize: 18, fontWeight: 700, border: "none", background: "transparent", padding: 0, width: "100%", color: P.ink }}
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={saveRooms} style={{ ...btnPrimaryStyle(P), width: "auto", padding: "9px 24px", fontSize: 13 }}>
          {saved ? "✓ Saved" : "Save"}
        </button>
      </Card>

      <Card P={P} title="Delete account">
        <p style={{ fontSize: 13, color: P.muted, marginBottom: 16, marginTop: 0 }}>
          Permanently deletes your account and all your data. This cannot be undone.
        </p>
        <Field P={P} label={`Type your email to confirm: ${user.email}`}>
          <input value={confirmDel} onChange={(e) => { setConfirmDel(e.target.value); setDelError(""); }}
            placeholder={user.email} style={{ ...inputS, marginBottom: 12 }} />
        </Field>
        {delError && <div style={{ fontSize: 13, color: P.over, marginBottom: 12 }}>{delError}</div>}
        <button onClick={deleteAccount} disabled={deleting} style={btnDanger}>
          {deleting ? "Deleting…" : "Delete my account"}
        </button>
      </Card>
    </div>
  );
}
