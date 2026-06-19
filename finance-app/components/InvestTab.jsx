import { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, KpiCard, Field, N } from "./ui.jsx";
import EntryList from "./EntryList.jsx";
import { MONO, MONTHS, TYPE_META, mk, SERIF, optionsFor, inputStyle, btnPrimaryStyle } from "../lib/constants.js";

function RoomWaterTank({ P, money, account, roomLeft, contributed }) {
  const [fillPct, setFillPct] = useState(0);
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const phaseRef  = useRef(0);

  const total      = (roomLeft || 0) + contributed;
  const targetFill = total > 0 ? (contributed / total) * 100 : 0;
  const pctLeft    = total > 0 ? (roomLeft / total) * 100 : 0;

  useEffect(() => { const t = setTimeout(() => setFillPct(targetFill), 200); return () => clearTimeout(t); }, [targetFill]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let currentFill = 0;
    function draw() {
      const W = canvas.width, H = canvas.height;
      currentFill += (fillPct - currentFill) * 0.03;
      phaseRef.current += 0.04;
      ctx.clearRect(0, 0, W, H);
      const waterY = H * (1 - currentFill / 100);
      const amp = 6, freq = (2 * Math.PI) / W;
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      for (let x = 0; x <= W; x++) {
        ctx.lineTo(x, waterY + Math.sin(x * freq * 2 + phaseRef.current) * amp + Math.sin(x * freq * 3 + phaseRef.current * 1.3) * (amp * 0.4));
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = "#f4c95d"; ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      for (let x = 0; x <= W; x++) {
        ctx.lineTo(x, waterY + Math.sin(x * freq * 2 + phaseRef.current) * amp + Math.sin(x * freq * 3 + phaseRef.current * 1.3) * (amp * 0.4));
      }
      for (let x = W; x >= 0; x--) {
        ctx.lineTo(x, waterY + Math.sin(x * freq * 2 + phaseRef.current) * amp + Math.sin(x * freq * 3 + phaseRef.current * 1.3) * (amp * 0.4) - 4);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill();
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fillPct]);

  if (roomLeft == null) return (
    <div style={{ padding: "16px", textAlign: "center", color: P.faint, fontSize: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{account}</div>No limit set
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: "100%", height: 200, borderRadius: 12, border: `3px solid ${P.muted}`, overflow: "hidden", background: P.surfaceAlt }}>
        <canvas ref={canvasRef} width={300} height={200} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2, pointerEvents: "none" }}>
          <N style={{ fontSize: 22, fontWeight: 700, color: P.ink, textShadow: "0 1px 3px rgba(255,255,255,0.4)" }}>{money(roomLeft)}</N>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 4, fontWeight: 500 }}>room left</div>
        </div>
      </div>
      <div style={{ textAlign: "center", width: "100%", marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: P.ink, marginBottom: 4, fontFamily: SERIF }}>{account}</div>
        <div style={{ fontSize: 12, color: P.muted, fontFamily: MONO }}>{pctLeft.toFixed(0)}% available</div>
        <div style={{ fontSize: 11, color: P.faint, marginTop: 3 }}>{money(contributed)} used of {money(total)}</div>
      </div>
    </div>
  );
}

function AddForm({ P, money0, type, catOptions, onAdd }) {
  const meta = TYPE_META[type];
  const [f, setF] = useState({ date: new Date().toISOString().slice(0, 10), category: "", amount: "", note: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const amt = parseFloat(f.amount);
    if (!f.category || isNaN(amt)) return;
    onAdd({ ...f, type, amount: Math.round(amt * 100) / 100 });
    setF((p) => ({ ...p, category: "", amount: "", note: "" }));
  };
  const inputS = inputStyle(P);
  const btnPrimary = btnPrimaryStyle(P);
  return (
    <Card P={P}>
      <div style={{ fontSize: 18, fontWeight: 600, fontFamily: SERIF, marginBottom: 18, color: P.accent }}>{meta.icon} Log contribution</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Field P={P} label="Date"><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} style={inputS} /></Field>
        <Field P={P} label="Amount"><input type="number" step="0.01" value={f.amount} placeholder="0.00" onChange={(e) => set("amount", e.target.value)} style={{ ...inputS, fontFamily: MONO }} /></Field>
        <Field P={P} label="Account">
          <input list="dl-invest-cat" value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="TFSA / FHSA / RRSP" style={inputS} />
          <datalist id="dl-invest-cat">{catOptions.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field P={P} label="Note"><input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Optional" style={inputS} /></Field>
      </div>
      <button onClick={submit} style={btnPrimary}>Add contribution</button>
    </Card>
  );
}

export default function InvestTab({ P, money, money0, txns, scoped, month, config, onAdd, onDel, onEdit, onBulkEdit }) {
  const meta     = TYPE_META.investment;
  const roomLeft = config?.room_left || {};

  const accounts = useMemo(() => {
    const set = new Set(Object.keys(roomLeft));
    txns.filter((t) => t.type === "investment").forEach((t) => set.add(t.category));
    return [...set];
  }, [txns, roomLeft]);

  const contributed = useMemo(() => {
    const m = {};
    txns.filter((t) => t.type === "investment").forEach((t) => { m[t.category] = (m[t.category] || 0) + t.amount; });
    return m;
  }, [txns]);

  const rows           = accounts.map((a) => ({ account: a, left: roomLeft[a] ?? null, contributed: contributed[a] || 0 }));
  const totalLeft      = rows.reduce((s, r) => s + (r.left || 0), 0);
  const totalContributed = rows.reduce((s, r) => s + r.contributed, 0);
  const catOptions     = useMemo(() => optionsFor(txns, "investment", "category", config), [txns, config]);

  const investMonths = useMemo(() => [...new Set(txns.filter((t) => t.type === "investment").map((t) => mk(t.date)))].sort(), [txns]);
  const byMonthData  = useMemo(() => investMonths.map((mo) => {
    const point = { label: MONTHS[+mo.split("-")[1] - 1] };
    accounts.forEach((a) => { point[a] = 0; });
    txns.filter((t) => t.type === "investment" && mk(t.date) === mo).forEach((t) => { point[t.category] = (point[t.category] || 0) + t.amount; });
    return point;
  }), [investMonths, txns, accounts]);

  const monthRows = scoped.filter((t) => t.type === "investment").sort((a, b) => b.date.localeCompare(a.date));
  const TT = { contentStyle: { background: P.surface, border: `1px solid ${P.border}`, borderRadius: P.radiusSm, fontSize: 12 }, itemStyle: { color: P.ink, fontSize: 12 } };
  const COLORS = ["#dd7230", "#f4c95d", "#a4ac96", "#854d27", "#a09cb0"];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard P={P} label="Room left" value={money0(totalLeft)} color={P.invest} bg={P.investLight} />
        <KpiCard P={P} label="Contributed this year" value={money0(totalContributed)} color={P.accent} bg={P.accentSoft} />
      </div>

      <Card P={P} title="Contribution room" subtitle="How much space you have left this year">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginTop: 8 }}>
          {rows.map((r) => <RoomWaterTank key={r.account} P={P} money={money} account={r.account} roomLeft={r.left} contributed={r.contributed} />)}
        </div>
      </Card>

      {byMonthData.length > 0 && (
        <Card P={P} title="Contributions by month" subtitle="Stacked by account">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonthData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 6" stroke={P.borderLight} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: P.muted, fontFamily: MONO }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: P.faint, fontFamily: MONO }} axisLine={false} tickLine={false} tickFormatter={money0} width={60} />
                <Tooltip {...TT} formatter={money} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {accounts.map((a, i) => <Bar key={a} dataKey={a} name={a} stackId="c" fill={COLORS[i % COLORS.length]} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <AddForm P={P} money0={money0} type="investment" catOptions={catOptions} onAdd={onAdd} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 2px 10px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>Contributions{month === "all" ? "" : ` · ${month}`}</span>
        <span style={{ fontSize: 12, color: P.faint, fontFamily: MONO }}>{monthRows.length} · {money(monthRows.reduce((a, b) => a + b.amount, 0))}</span>
      </div>
      <EntryList P={P} money={money} type="investment" rows={monthRows} color={P.invest}
        onDel={onDel} onEdit={onEdit} onBulkEdit={onBulkEdit} config={config} empty="No contributions logged." />
    </div>
  );
}
