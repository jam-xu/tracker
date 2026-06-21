import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function useData(user) {
  const [transactions, setTransactions] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setTransactions([]); setConfig(null); setLoading(false); return; }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [{ data: txns, error: e1 }, { data: cfg, error: e2 }] = await Promise.all([
          supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
          supabase.from("user_config").select("*").eq("user_id", user.id).maybeSingle(),
        ]);
        if (e1) throw e1;
        if (e2) throw e2;
        setTransactions(txns || []);
        setConfig(cfg || { currency: "CAD", room_left: {}, categories: {}, accounts: [] });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const addTransaction = useCallback(async (txn) => {
    const row = { ...txn, id: uid(), user_id: user.id };
    const { error } = await supabase.from("transactions").insert(row);
    if (error) throw error;
    setTransactions((prev) => [row, ...prev]);
  }, [user]);

  const updateTransaction = useCallback(async (updated) => {
    const { error } = await supabase.from("transactions").update(updated).eq("id", updated.id).eq("user_id", user.id);
    if (error) throw error;
    setTransactions((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [user]);

  const bulkUpdate = useCallback(async (ids, field, value) => {
    const updates = ids.map((id) =>
      supabase.from("transactions").update({ [field]: value }).eq("id", id).eq("user_id", user.id)
    );
    await Promise.all(updates);
    setTransactions((prev) => prev.map((t) => ids.includes(t.id) ? { ...t, [field]: value } : t));
  }, [user]);

  const updateConfig = useCallback(async (patch) => {
    const merged = { ...config, ...patch, user_id: user.id };
    const { error } = await supabase.from("user_config").upsert(merged, { onConflict: "user_id" });
    if (error) throw error;
    setConfig(merged);
  }, [user, config]);

  // ── REPLACE ALL: wipe existing data and load fresh from JSON ────
  const replaceAllData = useCallback(async (json) => {
    if (!user) throw new Error("Not signed in.");

    // 1. Wipe existing transactions for this user
    const { error: delErr } = await supabase.from("transactions").delete().eq("user_id", user.id);
    if (delErr) throw delErr;

    // 2. Normalize and insert incoming rows (in batches of 500)
    const rows = (json.transactions || []).map((t) => ({
      id: t.id || uid(),
      user_id: user.id,
      date: t.date,
      type: t.type,
      category: t.category || "",
      subcategory: t.subcategory || "",
      amount: +t.amount || 0,
      account: t.account || "",
      note: t.note || "",
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from("transactions").insert(rows.slice(i, i + 500));
      if (error) throw error;
    }

    // 3. Upsert config (accept either room_left or openingBalances; either flat or nested categories/accounts)
    const cfg = {
      user_id: user.id,
      currency: json.currency || "CAD",
      room_left: json.room_left || json.openingBalances || {},
      categories: json.categories || json.config?.categories || {},
      accounts: json.accounts || json.config?.accounts || [],
    };
    const { error: cfgErr } = await supabase.from("user_config").upsert(cfg, { onConflict: "user_id" });
    if (cfgErr) throw cfgErr;

    setTransactions(rows.sort((a, b) => b.date.localeCompare(a.date)));
    setConfig(cfg);
  }, [user]);

  // Build the in-memory snapshot for export
  const exportData = useCallback(() => {
    return {
      version: 1,
      currency: config?.currency || "CAD",
      room_left: config?.room_left || {},
      categories: config?.categories || {},
      accounts: config?.accounts || [],
      transactions: (transactions || []).map((t) => ({
        date: t.date, type: t.type,
        category: t.category, subcategory: t.subcategory,
        amount: t.amount, account: t.account, note: t.note,
        id: t.id,
      })),
    };
  }, [transactions, config]);

  return {
    transactions, config, loading, error,
    addTransaction, updateTransaction, deleteTransaction, bulkUpdate,
    updateConfig, replaceAllData, exportData,
  };
}
