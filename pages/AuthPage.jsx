import { useState } from "react";
import { SERIF, FONT } from "../lib/constants.js";

const P_LIGHT = {
  bg: "#f9f8f5", surface: "#ffffff", ink: "#2e1f27",
  muted: "#854d27", border: "#d8e2dc", accent: "#dd7230",
  radius: 12, radiusSm: 8,
};

export default function AuthPage({ onSignIn, onSignUp, onResetPassword }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "signin") {
        await onSignIn(email, password);
      } else if (mode === "signup") {
        await onSignUp(email, password);
        setDone(true);
      } else if (mode === "reset") {
        await onResetPassword(email);
        setDone(true);
      }
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

  const titleMap = {
    signin: "Welcome back",
    signup: "Create your account",
    reset:  "Reset your password",
  };
  const buttonMap = {
    signin: "Sign in",
    signup: "Create account",
    reset:  "Send reset link",
  };
  const canSubmit = mode === "reset" ? !!email : (!!email && !!password);

  return (
    <div style={{ minHeight: "100vh", background: P_LIGHT.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 700, color: P_LIGHT.ink, margin: 0 }}>
            Finance Tracker
          </h1>
          <p style={{ color: P_LIGHT.muted, marginTop: 8, fontSize: 15 }}>
            {titleMap[mode]}
          </p>
        </div>

        {done ? (
          <div style={{ background: "#fff", border: `1px solid ${P_LIGHT.border}`, borderRadius: P_LIGHT.radius, padding: "32px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontFamily: SERIF, color: P_LIGHT.ink, margin: "0 0 8px" }}>Check your email</h2>
            <p style={{ color: P_LIGHT.muted, fontSize: 14 }}>
              {mode === "reset"
                ? <>We sent a password reset link to <strong>{email}</strong>. Click it to set a new password.</>
                : <>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.</>}
            </p>
            <button onClick={() => { setMode("signin"); setDone(false); setPassword(""); }} style={{ marginTop: 20, border: "none", background: P_LIGHT.accent, color: "#fff", borderRadius: P_LIGHT.radiusSm, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Back to sign in
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", border: `1px solid ${P_LIGHT.border}`, borderRadius: P_LIGHT.radius, padding: "32px 28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ display: "block" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: P_LIGHT.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Email</div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputS}
                  onKeyDown={(e) => e.key === "Enter" && submit()} />
              </label>

              {mode !== "reset" && (
                <label style={{ display: "block" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: P_LIGHT.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Password</span>
                    {mode === "signin" && (
                      <button onClick={() => { setMode("reset"); setError(""); setPassword(""); }}
                        style={{ border: "none", background: "transparent", color: P_LIGHT.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" style={inputS}
                    onKeyDown={(e) => e.key === "Enter" && submit()} />
                </label>
              )}

              {error && (
                <div style={{ background: "rgba(221,114,48,0.1)", border: "1px solid #dd7230", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dd7230" }}>
                  {error}
                </div>
              )}

              <button onClick={submit} disabled={loading || !canSubmit} style={{
                border: "none", background: P_LIGHT.accent, color: "#fff", borderRadius: P_LIGHT.radiusSm,
                padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: loading ? "wait" : "pointer",
                opacity: canSubmit ? 1 : 0.5, transition: "opacity .15s",
              }}>
                {loading ? "Please wait…" : buttonMap[mode]}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: P_LIGHT.muted }}>
              {mode === "signin" && (
                <>No account? <button onClick={() => setMode("signup")} style={{ border: "none", background: "transparent", color: P_LIGHT.accent, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Sign up</button></>
              )}
              {mode === "signup" && (
                <>Already have an account? <button onClick={() => setMode("signin")} style={{ border: "none", background: "transparent", color: P_LIGHT.accent, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Sign in</button></>
              )}
              {mode === "reset" && (
                <>Remembered it? <button onClick={() => setMode("signin")} style={{ border: "none", background: "transparent", color: P_LIGHT.accent, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Back to sign in</button></>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
