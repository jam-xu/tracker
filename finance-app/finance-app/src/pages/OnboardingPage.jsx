import { useState } from "react";
import { SERIF, FONT } from "../lib/constants.js";

export default function OnboardingPage({ P, onImport, onSkip }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setError(""); setLoading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await onImport(json);
    } catch (e) {
      setError("Invalid JSON file. Make sure you exported from Finance Tracker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 500 }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, color: P.ink, marginBottom: 8, textAlign: "center" }}>Welcome!</h1>
        <p style={{ color: P.muted, textAlign: "center", marginBottom: 32, fontSize: 15 }}>
          Let's get your data set up. You can import an existing export, or start fresh.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${dragging ? P.accent : P.border}`,
            borderRadius: P.radius, padding: "48px 24px", textAlign: "center",
            background: dragging ? P.accentSoft : P.surface,
            transition: "all .2s", cursor: "pointer", marginBottom: 16,
          }}
          onClick={() => document.getElementById("json-upload").click()}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <div style={{ fontWeight: 600, color: P.ink, fontSize: 16, marginBottom: 6 }}>
            Drop your seed-data.json here
          </div>
          <div style={{ color: P.muted, fontSize: 13 }}>or click to browse</div>
          <input id="json-upload" type="file" accept=".json" style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {error && (
          <div style={{ background: P.expenseLight, border: `1px solid ${P.expense}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: P.expense, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", color: P.muted, fontSize: 14, marginBottom: 16 }}>
            Importing your data…
          </div>
        )}

        <button onClick={onSkip} style={{
          width: "100%", border: `1px solid ${P.border}`, background: "transparent",
          color: P.muted, borderRadius: P.radiusSm, padding: "11px 20px",
          fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>
          Start fresh with no data
        </button>

        <p style={{ textAlign: "center", color: P.faint, fontSize: 12, marginTop: 20 }}>
          You can always import data later from Settings.
        </p>
      </div>
    </div>
  );
}
