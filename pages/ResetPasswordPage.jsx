import { useState } from "react";
import { SERIF, FONT } from "../lib/constants.js";

const P_LIGHT = {
  bg: "#f9f8f5", surface: "#ffffff", ink: "#2e1f27",
  muted: "#854d27", border: "#d8e2dc", accent: "#dd7230",
  radius: 12, radiusSm: 8,
};

export default function ResetPasswordPage({ onUpdatePassword }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await onUpdatePassword(password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputS = {
    width: "100%", border: `1px solid ${P_LIGHT.border}`, borderRadius: P_LIGHT.radiusSm,
    padding: "11px 14px", fontSize: 14, background: "#fff", color: P_LIGHT.ink,
    outline: "none", fontFamily: FONT, boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: P_LIGHT.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 700, color: P_LIGHT.ink, margin: 0 }}>Finance Tracker</h1>
          <p style={{ color: P_LIGHT.muted, marginTop: 8, fontSize: 15 }}>Set a new password</p>
        </div>
        <div style={{ background: "#fff", border: `1px solid ${P_LIGHT.border}`, borderRadius: P_LIGHT.radius, padding: "32px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "block" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: P_LIGHT.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>New password</div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" style={inputS}
                onKeyDown={(e) => e.key === "Enter" && submit()} />
            </label>
            <label style={{ display: "block" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: P_LIGHT.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Confirm new password</div>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" style={inputS}
                onKeyDown={(e) => e.key === "Enter" && submit()} />
            </label>
            {error && (
              <div style={{ background: "rgba(221,114,48,0.1)", border: "1px solid #dd7230", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dd7230" }}>
                {error}
              </div>
            )}
            <button onClick={submit} disabled={loading || !password || !confirm} style={{
              border: "none", background: P_LIGHT.accent, color: "#fff", borderRadius: P_LIGHT.radiusSm,
              padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: loading ? "wait" : "pointer",
              opacity: (!password || !confirm) ? 0.5 : 1, transition: "opacity .15s",
            }}>
              {loading ? "Please wait…" : "Set new password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
