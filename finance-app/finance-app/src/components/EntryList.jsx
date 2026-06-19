import { useState, useMemo } from "react";
import { Card, Field, N, Empty } from "./ui.jsx";
import { MONO, ALL, optionsFor, inputStyle, btnPrimaryStyle } from "../lib/constants.js";

export default function EntryList({ P, money, type, rows, color, onDel, onEdit, onBulkEdit, empty, config }) {
  const [editingId, setEditingId]   = useState(null);
  const [draft, setDraft]           = useState({});
  const [selected, setSelected]     = useState(new Set());
  const [bulkField, setBulkField]   = useState("account");
  const [bulkValue, setBulkValue]   = useState("");
  const [selectMode, setSelectMode] = useState(false);

  const catOptions  = useMemo(() => optionsFor(rows, type, "category", config), [rows, type, config]);
  const subOptions  = useMemo(() => optionsFor(rows, type, "subcategory", config), [rows, type, config]);
  const acctOptions = useMemo(() => optionsFor(rows, type, "account", config), [rows, type, config]);

  const startEdit  = (t) => { if (selectMode) return; setEditingId(t.id); setDraft({ ...t }); };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };
  const saveEdit   = () => {
    const amt = parseFloat(draft.amount);
    if (!draft.category || isNaN(amt)) return;
    onEdit({ ...draft, amount: Math.round(amt * 100) / 100 });
    setEditingId(null);
  };
  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const toggleSelect  = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll     = () => setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)));
  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); setBulkValue(""); };
  const applyBulk     = () => { if (!bulkValue || selected.size === 0) return; onBulkEdit([...selected], bulkField, bulkValue); exitSelectMode(); };

  const bulkFields = [
    ...(type === "expense"    ? [{ value: "account", label: "Account / card" }, { value: "category", label: "Category" }, { value: "subcategory", label: "Sub-category" }] : []),
    ...(type === "income"     ? [{ value: "category", label: "Source" }] : []),
    ...(type === "investment" ? [{ value: "category", label: "Account" }] : []),
  ];
  const bulkOptions = bulkField === "account" ? acctOptions : bulkField === "subcategory" ? subOptions : catOptions;

  const inputS    = inputStyle(P);
  const btnPrimary = btnPrimaryStyle(P);

  return (
    <Card P={P} noPad>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${P.borderLight}`, background: selectMode ? P.surfaceAlt : "transparent" }}>
        {!selectMode ? (
          <button onClick={() => setSelectMode(true)} style={{ border: `1px solid ${P.border}`, background: P.surface, color: P.muted, borderRadius: P.radiusSm, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            ☑ Select entries
          </button>
        ) : (
          <>
            <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: P.accent }} />
            <span style={{ fontSize: 12, color: P.muted, minWidth: 80 }}>
              {selected.size === 0 ? "Select all" : `${selected.size} selected`}
            </span>
            {selected.size > 0 && (
              <>
                <select value={bulkField} onChange={(e) => { setBulkField(e.target.value); setBulkValue(""); }}
                  style={{ ...inputS, flex: "0 0 auto", width: "auto", fontSize: 12, padding: "5px 8px" }}>
                  {bulkFields.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <span style={{ fontSize: 12, color: P.muted }}>→</span>
                <input list="bulk-val-list" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}
                  placeholder={`Set ${bulkFields.find(f => f.value === bulkField)?.label || "value"}…`}
                  style={{ ...inputS, flex: 1, minWidth: 120, fontSize: 12, padding: "5px 10px" }} />
                <datalist id="bulk-val-list">{bulkOptions.map((o) => <option key={o} value={o} />)}</datalist>
                <button onClick={applyBulk} disabled={!bulkValue}
                  style={{ ...btnPrimary, width: "auto", padding: "6px 14px", fontSize: 12, opacity: bulkValue ? 1 : 0.4 }}>
                  Apply
                </button>
              </>
            )}
            <button onClick={exitSelectMode} style={{ marginLeft: "auto", border: "none", background: "transparent", color: P.faint, fontSize: 12, cursor: "pointer", padding: "4px 6px" }}>✕ Cancel</button>
          </>
        )}
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 500, overflow: "auto" }}>
        {rows.length === 0 ? <Empty P={P} text={empty} /> : rows.map((t) => {
          const isSelected = selected.has(t.id);

          if (editingId === t.id) return (
            <div key={t.id} style={{ padding: "14px 16px", borderBottom: `1px solid ${P.borderLight}`, background: P.surfaceAlt }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <Field P={P} label="Date"><input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} style={inputS} /></Field>
                <Field P={P} label="Amount"><input type="number" step="0.01" value={draft.amount} onChange={(e) => set("amount", e.target.value)} style={{ ...inputS, fontFamily: MONO }} /></Field>
                <Field P={P} label={type === "income" ? "Source" : type === "investment" ? "Account" : "Category"}>
                  <input list={`edit-cat-${t.id}`} value={draft.category} onChange={(e) => set("category", e.target.value)} style={inputS} />
                  <datalist id={`edit-cat-${t.id}`}>{catOptions.map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
                {type === "expense" && (
                  <Field P={P} label="Sub-category">
                    <input list={`edit-sub-${t.id}`} value={draft.subcategory || ""} onChange={(e) => set("subcategory", e.target.value)} style={inputS} />
                    <datalist id={`edit-sub-${t.id}`}>{subOptions.map((c) => <option key={c} value={c} />)}</datalist>
                  </Field>
                )}
                {type === "expense" && (
                  <Field P={P} label="Account / card">
                    <input list={`edit-acct-${t.id}`} value={draft.account || ""} onChange={(e) => set("account", e.target.value)} style={inputS} />
                    <datalist id={`edit-acct-${t.id}`}>{acctOptions.map((c) => <option key={c} value={c} />)}</datalist>
                  </Field>
                )}
                <Field P={P} label="Note"><input value={draft.note || ""} onChange={(e) => set("note", e.target.value)} placeholder="Optional" style={inputS} /></Field>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveEdit} style={{ ...btnPrimary, flex: 1, padding: "8px 14px", fontSize: 13 }}>Save</button>
                <button onClick={cancelEdit} style={{ flex: 1, padding: "8px 14px", fontSize: 13, border: `1px solid ${P.border}`, background: P.surface, color: P.muted, borderRadius: P.radiusSm, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { cancelEdit(); onDel(t.id); }} style={{ padding: "8px 14px", fontSize: 13, border: `1px solid ${P.over}`, background: "transparent", color: P.over, borderRadius: P.radiusSm, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          );

          return (
            <div key={t.id} onClick={() => selectMode ? toggleSelect(t.id) : startEdit(t)}
              style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: `1px solid ${P.borderLight}`, cursor: "pointer", transition: "background .1s", background: isSelected ? P.accentSoft : "transparent" }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = P.surfaceAlt; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
              {selectMode && (
                <div style={{ marginRight: 12, flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); toggleSelect(t.id); }}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(t.id)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: P.accent }} />
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.category}{t.subcategory ? ` · ${t.subcategory}` : ""}
                </div>
                {t.note && <div style={{ fontSize: 11, color: P.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note}</div>}
                <div style={{ fontSize: 11, color: P.faint }}>
                  {t.date} · {t.account || <span style={{ color: P.over, fontSize: 10 }}>No account</span>}
                </div>
              </div>
              <N style={{ fontSize: 14, fontWeight: 600, color, flexShrink: 0, marginLeft: 12 }}>{money(t.amount)}</N>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
