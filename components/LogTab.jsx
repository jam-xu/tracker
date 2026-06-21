import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { Card, Field, Select, Empty, N } from "./ui.jsx";
import EntryList from "./EntryList.jsx";
import { MONO, ALL, PIE_COLORS, TYPE_META, ml, optionsFor, groupSortedRows, byMonthRows, inputStyle, btnPrimaryStyle, SERIF } from "../lib/constants.js";

function AddForm({ P, money0, type, catOptions, subOptions, acctOptions, onAdd, config }) {
  const meta = TYPE_META[type];
  const catLabel = type === "income" ? "Source" : type === "investment" ? "Account" : "Category";
  const [f, setF] = useState({ date: new Date().toISOString().slice(0, 10), category: "", subcategory: "", amount: "", account: "", note: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const amt = parseFloat(f.amount);
    if (!f.category || isNaN(amt)) return;
    onAdd({ ...f, type, amount: Math.round(amt * 100) / 100 });
    setF((p) => ({ ...p, category: "", subcategory: "", amount: "", note: "" }));
  };
  const verb = type === "investment" ? "contribution" : type;
  const inputS = inputStyle(P);
  const btnPrimary = btnPrimaryStyle(P);

  return (
    <Card P={P}>
      <div style={{ fontSize: 18, fontWeight: 600, fontFamily: SERIF, marginBottom: 18, color: P.accent }}>{meta.icon} Log {verb}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Field P={P} label="Date"><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} style={inputS} /></Field>
        <Field P={P} label="Amount"><input type="number" step="0.01" inputMode="decimal" value={f.amount} placeholder="0.00" onChange={(e) => set("amount", e.target.value)} style={{ ...inputS, fontFamily: MONO }} /></Field>
        <Field P={P} label={catLabel}>
          <input list={`dl-cat-${type}`} value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="Pick or type…" style={inputS} />
          <datalist id={`dl-cat-${type}`}>{catOptions.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        {type === "expense" ? (
          <Field P={P} label="Sub-category">
            <input list="dl-sub" value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} placeholder="e.g. Restaurant" style={inputS} />
            <datalist id="dl-sub">{subOptions.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
        ) : (
          <Field P={P} label="Note"><input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Optional" style={inputS} /></Field>
        )}
        {type === "expense" && (
          <>
            <Field P={P} label="Account / card">
              <input list="dl-acct" value={f.account} onChange={(e) => set("account", e.target.value)} placeholder="e.g. AMEX" style={inputS} />
              <datalist id="dl-acct">{acctOptions.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field P={P} label="Note"><input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Optional" style={inputS} /></Field>
          </>
        )}
      </div>
      <button onClick={submit} style={btnPrimary}>Add {verb}</button>
    </Card>
  );
}

function Donut({ P, money, money0, data }) {
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 8 }}>
        {data.map((c, i) => (
          <span key={c.name} style={{ fontSize: 11, color: P.muted, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
            {c.name} <N>{money0(c.value)}</N>
          </span>
        ))}
      </div>
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

export default function LogTab({ P, money, money0, type, txns, scoped, month, config, onAdd, onDel, onEdit, onBulkEdit }) {
  const meta     = TYPE_META[type];
  const catLabel = type === "income" ? "Source" : "Category";
  const catOptions  = useMemo(() => optionsFor(txns, type, "category", config), [txns, type, config]);
  const acctOptions = useMemo(() => optionsFor(txns, type, "account", config), [txns, type, config]);
  const subOptions  = useMemo(() => optionsFor(txns, type, "subcategory", config), [txns, type, config]);

  const [fCat, setFCat]   = useState(ALL);
  const [fAcct, setFAcct] = useState(ALL);
  const [q, setQ]         = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return scoped.filter((t) => t.type === type)
      .filter((t) => fCat === ALL || t.category === fCat)
      .filter((t) => fAcct === ALL || t.account === fAcct)
      .filter((t) => !s || [t.category, t.subcategory, t.account, t.note].join(" ").toLowerCase().includes(s))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [scoped, type, fCat, fAcct, q]);

  const total      = rows.reduce((a, b) => a + b.amount, 0);
  const filtersOn  = fCat !== ALL || fAcct !== ALL || q.trim() !== "";
  const byCat      = useMemo(() => groupSortedRows(rows, "category"), [rows]);
  const byAcct     = useMemo(() => groupSortedRows(rows, "account"), [rows]);
  const monthlyRows = useMemo(() => byMonthRows(rows), [rows]);
  const TT = { contentStyle: { background: P.surface, border: `1px solid ${P.border}`, borderRadius: P.radiusSm, fontSize: 12 }, itemStyle: { color: P.ink, fontSize: 12 } };
  const inputS = inputStyle(P);
  const clearBtn = { marginTop: 12, border: `1px solid ${P.border}`, background: P.surface, color: P.muted, borderRadius: P.radiusSm, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" };

  return (
    <div>
      <AddForm P={P} money0={money0} type={type} catOptions={catOptions} subOptions={subOptions} acctOptions={acctOptions} onAdd={onAdd} config={config} />

      <Card P={P} title="Filters" subtitle="Refine what's shown below">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <Field P={P} label={catLabel}><Select P={P} value={fCat} onChange={setFCat} options={catOptions} allLabel={`All ${catLabel.toLowerCase()}s`} /></Field>
          {type === "expense" && <Field P={P} label="Account / card"><Select P={P} value={fAcct} onChange={setFAcct} options={acctOptions} allLabel="All accounts" /></Field>}
          <Field P={P} label="Search"><input placeholder="Search notes, subcategory…" value={q} onChange={(e) => setQ(e.target.value)} style={inputS} /></Field>
        </div>
        {filtersOn && <button onClick={() => { setFCat(ALL); setFAcct(ALL); setQ(""); }} style={clearBtn}>Clear filters</button>}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: type === "expense" ? "1fr 1fr" : "1fr", gap: 12 }}>
        <Card P={P} title={type === "income" ? "Income by source" : "By category"} subtitle={month === "all" ? "All months" : ml(month)}>
          {byCat.length === 0 ? <Empty P={P} /> : (type === "expense" ? <Donut P={P} money={money} money0={money0} data={byCat} /> : <Bars P={P} money0={money0} data={byCat} color={P.income} />)}
        </Card>
        {type === "expense" && (
          <Card P={P} title="By account / card" subtitle="Where it was charged">
            {byAcct.length === 0 ? <Empty P={P} /> : <Bars P={P} money0={money0} data={byAcct} color={P.expense} />}
          </Card>
        )}
      </div>

      <Card P={P} title={type === "income" ? "Income by month" : "Spending by month"} subtitle="Matches filters above">
        {monthlyRows.length === 0 ? <Empty P={P} /> : (
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRows} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 6" stroke={P.borderLight} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: P.muted, fontFamily: MONO }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: P.faint, fontFamily: MONO }} axisLine={false} tickLine={false} tickFormatter={money0} width={60} />
                <Tooltip {...TT} formatter={money} />
                <Bar dataKey="value" name={meta.label} fill={type === "income" ? P.income : P.expense} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 2px 10px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>Entries</span>
        <span style={{ fontSize: 12, color: P.faint, fontFamily: MONO }}>{rows.length} · {money(total)}</span>
      </div>
      <EntryList P={P} money={money} type={type} rows={rows} color={type === "income" ? P.income : P.expense}
        onDel={onDel} onEdit={onEdit} onBulkEdit={onBulkEdit} config={config}
        empty={filtersOn ? "Nothing matches these filters." : "No entries yet."} />
    </div>
  );
}
