import { useState, useMemo, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Card, KpiCard, Row, N, Empty } from "./ui.jsx";
import { SERIF, MONO, PIE_COLORS, ml, mk, MONTHS, groupSorted, byMonth } from "../lib/constants.js";

function Donut({ P, money, money0, data, legend }) {
  const TT = { contentStyle: { background: P.surface, border: `1px solid ${P.border}`, borderRadius: P.radiusSm, fontSize: 12 }, itemStyle: { color: P.ink, fontSize: 12 } };
  return (
    <>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke={P.surface} strokeWidth={2} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip {...TT} formatter={money} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {legend && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 8 }}>
          {data.map((c, i) => (
            <span key={c.name} style={{ fontSize: 11, color: P.muted, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
              {c.name} <N>{money0(c.value)}</N>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function Bars({ P, money0, data, color }) {
  const max = data[0]?.value || 1;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {data.map((s, i) => (
        <div key={s.name}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
            <span style={{ fontWeight: 500 }}>{s.name}</span>
            <N style={{ color }}>{money0(s.value)}</N>
          </div>
          <div style={{ height: 6, background: P.surfaceAlt, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(4, (s.value / max) * 100)}%`, background: PIE_COLORS[(i + 1) % PIE_COLORS.length], borderRadius: 3, transition: "width .3s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ P, money, money0, txns, scoped, month, darkMode }) {
  const sum = (arr, t) => arr.filter((x) => x.type === t).reduce((a, b) => a + b.amount, 0);
  const income  = sum(scoped, "income");
  const expense = sum(scoped, "expense");
  const invest  = sum(scoped, "investment");
  const net = income - expense;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;

  const monthly    = useMemo(() => byMonth(txns), [txns]);
  const catData    = useMemo(() => groupSorted(scoped, "expense", "category"), [scoped]);
  const incData    = useMemo(() => groupSorted(scoped, "income", "category"), [scoped]);
  const cumulative = useMemo(() => {
    let ci = 0, ce = 0, cv = 0;
    return monthly.map((m) => { ci += m.income; ce += m.expense; cv += m.invest; return { label: m.label, income: Math.round(ci), expense: Math.round(ce), invest: Math.round(cv) }; });
  }, [monthly]);
  const topExpenses = useMemo(() => scoped.filter((t) => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 5), [scoped]);

  const [shareModal, setShareModal] = useState(false);
  const shareCanvasRef = useRef(null);
  const TT = { contentStyle: { background: P.surface, border: `1px solid ${P.border}`, borderRadius: P.radiusSm, fontSize: 12 }, itemStyle: { color: P.ink, fontSize: 12 } };

  const generateShareCard = useCallback(() => {
    setShareModal(true);
    setTimeout(() => {
      const canvas = shareCanvasRef.current;
      if (!canvas) return;
      const W = 1080, H = 1080;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      const bg     = darkMode ? "#2e1f27" : "#f9f8f5";
      const surface = darkMode ? "#3d2a34" : "#ffffff";
      const ink    = darkMode ? "#d8e2dc" : "#2e1f27";
      const muted  = darkMode ? "#a4ac96" : "#854d27";
      const accent = "#dd7230";
      const gold   = "#f4c95d";
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#dd723022"); grad.addColorStop(0.5, "#f4c95d22"); grad.addColorStop(1, "#dd723022");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 6);
      const roundRect = (x, y, w, h, r, fill) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
      ctx.fillStyle = ink; ctx.font = "bold 52px Georgia, serif"; ctx.fillText("My Finances", 80, 110);
      ctx.fillStyle = muted; ctx.font = "32px Georgia, serif"; ctx.fillText(month === "all" ? "Year to date" : ml(month), 80, 155);
      const kpis = [
        { label: "Income", value: money0(income), color: gold },
        { label: "Expenses", value: money0(expense), color: accent },
        { label: "Net savings", value: (net >= 0 ? "+" : "") + money0(net), color: net >= 0 ? gold : accent },
        { label: "Invested", value: money0(invest), color: "#a4ac96" },
      ];
      kpis.forEach((k, i) => {
        const x = 80 + (i % 2) * 500, y = 200 + Math.floor(i / 2) * 184;
        roundRect(x, y, 460, 160, 18, surface);
        ctx.fillStyle = k.color; ctx.font = "600 20px Inter, sans-serif"; ctx.fillText(k.label.toUpperCase(), x + 28, y + 44);
        ctx.font = "bold 52px Georgia, serif"; ctx.fillText(k.value, x + 28, y + 115);
      });
      if (income > 0) {
        roundRect(80, 570, 960, 80, 40, surface);
        ctx.fillStyle = muted; ctx.font = "600 22px Inter, sans-serif"; ctx.fillText("SAVINGS RATE", 120, 618);
        ctx.fillStyle = savingsRate >= 0 ? gold : accent; ctx.font = "bold 40px Georgia, serif";
        ctx.textAlign = "right"; ctx.fillText(`${savingsRate.toFixed(1)}%`, 1000, 618); ctx.textAlign = "left";
      }
      const chartData = monthly.slice(-6);
      if (chartData.length > 0) {
        roundRect(80, 680, 960, 280, 18, surface);
        ctx.fillStyle = muted; ctx.font = "600 20px Inter, sans-serif"; ctx.fillText("MONTHLY OVERVIEW", 116, 718);
        const maxVal = Math.max(...chartData.flatMap(m => [m.income, m.expense]));
        const bAX = 116, bAY = 738, bAW = 888, bAH = 186, gW = bAW / chartData.length, bW = Math.min(gW * 0.3, 42);
        chartData.forEach((m, i) => {
          const gx = bAX + i * gW + gW / 2;
          const iH = maxVal > 0 ? (m.income / maxVal) * bAH : 0;
          const eH = maxVal > 0 ? (m.expense / maxVal) * bAH : 0;
          ctx.fillStyle = gold; ctx.beginPath(); ctx.roundRect(gx - bW - 4, bAY + bAH - iH, bW, iH, [6,6,0,0]); ctx.fill();
          ctx.fillStyle = accent; ctx.beginPath(); ctx.roundRect(gx + 4, bAY + bAH - eH, bW, eH, [6,6,0,0]); ctx.fill();
          ctx.fillStyle = muted; ctx.font = "22px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(m.label, gx, bAY + bAH + 28); ctx.textAlign = "left";
        });
      }
      ctx.fillStyle = muted; ctx.font = "24px Georgia, serif"; ctx.textAlign = "center";
      ctx.fillText("Generated with my finance tracker", W / 2, H - 40); ctx.textAlign = "left";
    }, 50);
  }, [income, expense, invest, net, savingsRate, monthly, month, darkMode, money0]);

  const btnPrimary = { width: "100%", border: "none", borderRadius: P.radiusSm, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#fff", background: P.accent };

  return (
    <div>
      {shareModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setShareModal(false)}>
          <div style={{ background: P.surface, borderRadius: P.radius, padding: 28, maxWidth: 520, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontFamily: SERIF, color: P.ink }}>Share your dashboard</h2>
              <button onClick={() => setShareModal(false)} style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: P.muted }}>✕</button>
            </div>
            <canvas ref={shareCanvasRef} style={{ width: "100%", borderRadius: 12, display: "block", border: `1px solid ${P.border}` }} />
            <button onClick={() => { const a = document.createElement("a"); a.href = shareCanvasRef.current.toDataURL("image/png"); a.download = `finances-${month === "all" ? "ytd" : month}.png`; a.click(); }}
              style={{ ...btnPrimary, marginTop: 16 }}>⬇ Download image</button>
            <div style={{ fontSize: 11, color: P.faint, textAlign: "center", marginTop: 10 }}>1080×1080px · perfect for Instagram, Twitter, LinkedIn</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={generateShareCard} style={{ border: `1px solid ${P.border}`, background: P.surface, color: P.muted, borderRadius: P.radiusSm, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ↗ Share dashboard
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
        <KpiCard P={P} label="Income" value={money0(income)} color={P.income} bg={P.incomeLight} />
        <KpiCard P={P} label="Expenses" value={money0(expense)} color={P.expense} bg={P.expenseLight} />
        <KpiCard P={P} label="Net savings" value={`${net >= 0 ? "+" : ""}${money0(net)}`} color={net >= 0 ? P.income : P.expense} bg={net >= 0 ? P.incomeLight : P.expenseLight} />
        <KpiCard P={P} label="Invested" value={money0(invest)} color={P.invest} bg={P.investLight} />
        {income > 0 && <KpiCard P={P} label="Savings rate" value={`${savingsRate.toFixed(1)}%`} color={savingsRate >= 0 ? P.income : P.expense} bg={savingsRate >= 0 ? P.incomeLight : P.expenseLight} />}
      </div>

      <Card P={P} title="Monthly overview" subtitle="Income vs expenses vs investments">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} barGap={2} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 6" stroke={P.borderLight} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: P.muted, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: P.faint, fontFamily: MONO }} axisLine={false} tickLine={false} tickFormatter={money0} width={60} />
              <Tooltip {...TT} formatter={money} />
              <Bar dataKey="income" name="Income" fill={P.chart1} radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expenses" fill={P.chart2} radius={[4,4,0,0]} />
              <Bar dataKey="invest" name="Invested" fill={P.chart3} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card P={P} title="Where money goes" subtitle={`${catData.length} categories`}>
          {catData.length === 0 ? <Empty P={P} /> : <Donut P={P} money={money} money0={money0} data={catData} legend />}
        </Card>
        <Card P={P} title="Income sources" subtitle={incData.length > 0 ? `${incData.length} sources` : ""}>
          {incData.length === 0 ? <Empty P={P} /> : <Bars P={P} money0={money0} data={incData} color={P.income} />}
        </Card>
      </div>

      <Card P={P} title="Year-to-date" subtitle="Cumulative totals">
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulative} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 6" stroke={P.borderLight} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: P.muted, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: P.faint, fontFamily: MONO }} axisLine={false} tickLine={false} tickFormatter={money0} width={60} />
              <Tooltip {...TT} formatter={money} />
              <Line type="monotone" dataKey="income" name="Income" stroke={P.chart1} strokeWidth={2} dot={{ r: 3, fill: P.chart1 }} />
              <Line type="monotone" dataKey="expense" name="Expenses" stroke={P.chart2} strokeWidth={2} dot={{ r: 3, fill: P.chart2 }} />
              <Line type="monotone" dataKey="invest" name="Invested" stroke={P.chart3} strokeWidth={2} dot={{ r: 3, fill: P.chart3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {topExpenses.length > 0 && (
        <Card P={P} title="Largest expenses" subtitle={month === "all" ? "All time" : ml(month)}>
          {topExpenses.map((t) => (
            <Row key={t.id} P={P} title={`${t.category}${t.subcategory ? ` · ${t.subcategory}` : ""}`}
              sub={`${t.date}${t.note ? ` — ${t.note}` : ""}`} amount={money(t.amount)} color={P.expense} />
          ))}
        </Card>
      )}
    </div>
  );
}
