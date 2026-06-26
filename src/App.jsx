import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import AddTransaction from "./components/AddTransaction";
import TransactionsList from "./components/TransactionsList";
import Insights from "./components/Insights";
import Accounts from "./components/Accounts";
import AuthScreen from "./auth/AuthScreen";
import SetupNeeded from "./auth/SetupNeeded";
import { useAuth } from "./auth/AuthContext";
import { isSupabaseConfigured } from "./lib/supabase";
import * as api from "./lib/api";

// ----------------------------------------------------------------------
// App = the "gate". It decides what to show based on setup + login state:
//   - no Supabase keys      -> SetupNeeded screen
//   - still checking session -> a small loading screen
//   - not logged in          -> AuthScreen (login / signup)
//   - logged in              -> the real CashCowApp
// ----------------------------------------------------------------------
export default function App() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) return <SetupNeeded />;
  if (loading) return <CenterMessage text="Loading…" />;
  if (!user) return <AuthScreen />;
  return <CashCowApp user={user} />;
}

function CenterMessage({ text }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
      {text}
    </div>
  );
}

// ----------------------------------------------------------------------
// CashCowApp = the actual app, shown once a user is logged in.
// It loads that user's data from Supabase and writes changes back.
// ----------------------------------------------------------------------
function CashCowApp({ user }) {
  const { signOut } = useAuth();

  const [page, setPage] = useState("home");
  const [editingTx, setEditingTx] = useState(null);

  // Data for the logged-in user.
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fixedPayments, setFixedPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load everything once, when this user's app mounts.
  useEffect(() => {
    let active = true;
    api
      .fetchAll()
      .then((data) => {
        if (!active) return;
        setAccounts(data.accounts);
        setCategories(data.categories);
        setTransactions(data.transactions);
        setFixedPayments(data.fixedPayments);
      })
      .catch((err) => alert("Couldn't load your data: " + err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user.id]);

  // ---- Balance helpers (same logic as before) ----
  const txEffect = (tx) => (tx.type === "income" ? tx.amount : -tx.amount);

  // Update one account's balance in BOTH local state and the database.
  async function changeBalance(accountId, delta) {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;
    const newBalance = acc.balance + delta;
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: newBalance } : a))
    );
    await api.setAccountBalance(accountId, newBalance);
  }

  // ---- Actions ----
  async function addTransaction(tx) {
    try {
      const saved = await api.insertTransaction(user.id, tx);
      setTransactions((prev) => [saved, ...prev]);
      await changeBalance(saved.accountId, txEffect(saved));
      setPage("transactions");
    } catch (err) {
      alert("Couldn't save: " + err.message);
    }
  }

  async function updateTransaction(updated) {
    try {
      const old = transactions.find((t) => t.id === updated.id);
      const saved = await api.updateTransaction(updated);
      setTransactions((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      // Reverse the old effect, then apply the new one.
      if (old) await changeBalance(old.accountId, -txEffect(old));
      await changeBalance(saved.accountId, txEffect(saved));
      setEditingTx(null);
      setPage("transactions");
    } catch (err) {
      alert("Couldn't update: " + err.message);
    }
  }

  async function deleteTransaction(id) {
    try {
      const tx = transactions.find((t) => t.id === id);
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (tx) await changeBalance(tx.accountId, -txEffect(tx));
    } catch (err) {
      alert("Couldn't delete: " + err.message);
    }
  }

  async function addAccount(account) {
    try {
      const saved = await api.insertAccount(user.id, account);
      setAccounts((prev) => [...prev, saved]);
    } catch (err) {
      alert("Couldn't add account: " + err.message);
    }
  }

  async function setMainAccount(accountId) {
    try {
      await api.setMainAccount(user.id, accountId);
      setAccounts((prev) =>
        prev.map((a) => ({ ...a, isMain: a.id === accountId }))
      );
    } catch (err) {
      alert("Couldn't set main account: " + err.message);
    }
  }

  function startEdit(tx) {
    setEditingTx(tx);
    setPage("add");
  }

  function navigate(targetPage) {
    if (targetPage === "add") setEditingTx(null);
    setPage(targetPage);
  }

  function renderPage() {
    switch (page) {
      case "add":
        return (
          <AddTransaction
            key={editingTx ? editingTx.id : "new"}
            categories={categories}
            accounts={accounts}
            editingTx={editingTx}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onCancel={() => {
              setEditingTx(null);
              setPage("transactions");
            }}
          />
        );
      case "transactions":
        return (
          <TransactionsList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onEdit={startEdit}
            onDelete={deleteTransaction}
          />
        );
      case "insights":
        return <Insights transactions={transactions} />;
      case "accounts":
        return (
          <Accounts
            accounts={accounts}
            onAddAccount={addAccount}
            onSetMain={setMainAccount}
          />
        );
      case "home":
      default:
        return (
          <Dashboard
            accounts={accounts}
            transactions={transactions}
            fixedPayments={fixedPayments}
            categories={categories}
            onNavigate={navigate}
          />
        );
    }
  }

  return (
    <Layout page={page} onNavigate={navigate} user={user} onSignOut={signOut}>
      {loading ? (
        <p className="text-sm text-neutral-500">Loading your money…</p>
      ) : (
        renderPage()
      )}
    </Layout>
  );
}
