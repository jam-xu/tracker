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
  const [darkMode, setDarkMode] = useState(false);

  const P = darkMode ? PALETTE_DARK : PALETTE_LIGHT;
  const
