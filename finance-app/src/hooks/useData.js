import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function useData(user) {
  const [transactions, setTransactions] = useState([]);
  const [config, setConfig] = useState(null);   // { currency, roomLeft, categories, accounts }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── LOAD ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setTransactions([]); setConfig(null); setLoading(false); return; }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [{ data: txns, error: e1 }, { data: cfg, error: e2 }] = await Promise.all([
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false }),
          supabase
            .from("user_config")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
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

  // ── TRANSACTIONS ──────────────────────────────────────────────
  const addTransaction = useCallback(async (txn) => {
    const row = { ...txn, id: uid(), user_id: user.id };
    const { error } = await supabase.from("transactions").insert(row);
    if (error) throw error;
    setTransactions((prev) => [row, ...prev]);
  }, [user]);

  const updateTransaction = useCallback(async (updated) => {
    const { error } = await supabase
      .from("transactions")
      .update(updated)
      .eq("id", updated.id)
      .eq("user_id", user.id);
    if (error) throw error;
    setTransactions((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [user]);

  const bulkUpdate = useCallback(async (ids, field, value) => {
    // Supabase doesn't support bulk update with IN + RLS easily, so we batch
    const updates = ids.map((id) =>
      supabase.from("transactions").update({ [field]: value }).eq("id", id).eq("user_id", user.id)
    );
    await Promise.all(updates);
    setTransactions((prev) =>
      prev.map((t) => ids.includes(t.id) ? { ...t, [field]: value } : t)
    );
  }, [user]);

  // ── CONFIG ────────────────────────────────────────────────────
  const updateConfig = useCallback(async (patch) => {
    const merged = { ...config, ...patch, user_id: user.id };
    const { error } = await supabase
      .from("user_config")
      .upsert(merged, { onConflict: "user_id" });
    if (error) throw error;
    setConfig(merged);
  }, [user, config]);

  // ── IMPORT (first-time data load from JSON) ───────────────────
  const importFromJson = useCallback(async (json) => {
    // json = the seed-data.json shape
    const rows = (json.transactions || []).map((t, i) => ({
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

    // Insert in batches of 500 (Supabase limit)
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from("transactions").insert(rows.slice(i, i + 500));
      if (error) throw error;
    }

    const cfg = {
      user_id: user.id,
      currency: json.currency || "CAD",
      room_left: json.roomLeft || {},
      categories: json.config?.categories || {},
      accounts: json.config?.accounts || [],
    };
    await supabase.from("user_config").upsert(cfg, { onConflict: "user_id" });

    setTransactions(rows);
    setConfig(cfg);
  }, [user]);

  return {
    transactions, config, loading, error,
    addTransaction, updateTransaction, deleteTransaction, bulkUpdate,
    updateConfig, importFromJson,
  };
}
