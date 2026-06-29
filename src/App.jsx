import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import AddTransaction from "./components/AddTransaction";
import TransactionsList from "./components/TransactionsList";
import Insights from "./components/Insights";
import Accounts from "./components/Accounts";
import FixedPayments from "./components/FixedPayments";
import AuthScreen from "./auth/AuthScreen";
import OnboardingScreen from "./auth/OnboardingScreen";
import SetupNeeded from "./auth/SetupNeeded";
import { useAuth } from "./auth/AuthContext";
import { useToast } from "./components/Toast";
import { isSupabaseConfigured } from "./lib/supabase";
import * as api from "./lib/api";

// ----------------------------------------------------------------------
// App = the "gate": decides what to show based on setup + login state.
// ----------------------------------------------------------------------
export default function App() {
  const { user, loading } = useAuth();
  // Remember if the intro was already seen, so it only shows on first visit.
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem("cashcow.onboarded") === "1"
  );

  function finishOnboarding() {
    localStorage.setItem("cashcow.onboarded", "1");
    setOnboarded(true);
  }

  if (!isSupabaseConfigured) return <SetupNeeded />;
  if (loading) return <CenterMessage text="Loading…" />;
  if (!user) {
    if (!onboarded) return <OnboardingScreen onFinish={finishOnboarding} />;
    return <AuthScreen />;
  }
  return <CashCowApp user={user} />;
}

function CenterMessage({ text }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBF6EC",
        color: "#A89D8C",
        fontFamily: "'Pretendard', system-ui, sans-serif",
      }}
    >
      {text}
    </div>
  );
}

// Move a due date forward by one cycle. "once" payments have no next date.
function advanceDueDate(dateStr, frequency) {
  const d = new Date(dateStr);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "fortnightly") d.setDate(d.getDate() + 14);
  else if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ----------------------------------------------------------------------
// CashCowApp = the actual app, shown once a user is logged in.
// ----------------------------------------------------------------------
function CashCowApp({ user }) {
  const { signOut } = useAuth();
  const toast = useToast();

  const [page, setPage] = useState("home");
  const [editingTx, setEditingTx] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fixedPayments, setFixedPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load everything once for this user.
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
      .catch((err) => toast.error("Couldn't load your data: " + err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user.id]);

  const hasAccounts = accounts.length > 0;

  // ---- Balance helpers ----
  // How a transaction changes account balances, as { accountId: delta }.
  // income: +amount to its account. expense: -amount. transfer: -from, +to.
  function txDeltas(tx) {
    if (tx.type === "transfer") {
      const d = {};
      if (tx.accountId) d[tx.accountId] = (d[tx.accountId] || 0) - tx.amount;
      if (tx.toAccountId) d[tx.toAccountId] = (d[tx.toAccountId] || 0) + tx.amount;
      return d;
    }
    return { [tx.accountId]: tx.type === "income" ? tx.amount : -tx.amount };
  }
  const negateDeltas = (d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, -v]));
  function mergeDeltas(...maps) {
    const r = {};
    for (const m of maps) for (const [k, v] of Object.entries(m)) r[k] = (r[k] || 0) + v;
    return r;
  }

  // Apply a delta to one account in BOTH local state and the database.
  // Compute the new balance up front (so the DB write always gets the right
  // value), then update local state. Callers must touch each account at most
  // once per action — updateTransaction does this by summing deltas per account.
  async function changeBalance(accountId, delta) {
    if (!delta) return;
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;
    const newBalance = acc.balance + delta;
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: newBalance } : a))
    );
    await api.setAccountBalance(accountId, newBalance);
  }

  // Apply a map of { accountId: delta } — used so an edit touches each
  // account exactly once (fixes the double-update bug).
  async function applyDeltas(deltas) {
    for (const [accId, delta] of Object.entries(deltas)) {
      await changeBalance(accId, delta);
    }
  }

  // ---- Transaction actions ----
  async function addTransaction(tx) {
    try {
      const saved = await api.insertTransaction(user.id, tx);
      setTransactions((prev) => [saved, ...prev]);
      await applyDeltas(txDeltas(saved));
      setPage("transactions");
    } catch (err) {
      toast.error("Couldn't save: " + err.message);
    }
  }

  async function updateTransaction(updated) {
    try {
      const old = transactions.find((t) => t.id === updated.id);
      const saved = await api.updateTransaction(updated);
      setTransactions((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));

      // Net balance change per account: undo the old effect, apply the new one.
      await applyDeltas(mergeDeltas(old ? negateDeltas(txDeltas(old)) : {}, txDeltas(saved)));

      setEditingTx(null);
      setPage("transactions");
      toast.success("Transaction updated");
    } catch (err) {
      toast.error("Couldn't update: " + err.message);
    }
  }

  // Quickly set/clear a purchase rating from the Activity list (no balance change).
  async function rateTransaction(id, ratingKey) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    const updated = { ...tx, rating: tx.rating === ratingKey ? null : ratingKey };
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    try {
      await api.updateTransaction(updated);
    } catch (err) {
      toast.error("Couldn't save rating: " + err.message);
    }
  }

  async function deleteTransaction(id) {
    try {
      const tx = transactions.find((t) => t.id === id);
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (tx) await applyDeltas(negateDeltas(txDeltas(tx)));
      toast.success("Transaction deleted");
    } catch (err) {
      toast.error("Couldn't delete: " + err.message);
    }
  }

  // ---- Account actions ----
  async function addAccount(account) {
    try {
      const saved = await api.insertAccount(user.id, account);
      setAccounts((prev) => [...prev, saved]);
      toast.success(`Added ${saved.name}`);
    } catch (err) {
      toast.error("Couldn't add account: " + err.message);
    }
  }

  async function setMainAccount(accountId) {
    // Update the UI immediately, then persist (so the MAIN badge moves at once).
    setAccounts((prev) => prev.map((a) => ({ ...a, isMain: a.id === accountId })));
    try {
      await api.setMainAccount(user.id, accountId);
    } catch (err) {
      toast.error("Couldn't set main account: " + err.message);
    }
  }

  // Edit an account's name / currency / balance.
  async function editAccount(account) {
    setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, ...account } : a)));
    try {
      await api.updateAccount(account);
      toast.success("Account updated");
    } catch (err) {
      toast.error("Couldn't update account: " + err.message);
    }
  }

  async function deleteAccount(accountId) {
    const acc = accounts.find((a) => a.id === accountId);
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    try {
      await api.deleteAccount(accountId);
      toast.success(`Deleted ${acc?.name || "account"}`);
    } catch (err) {
      toast.error("Couldn't delete: " + err.message);
    }
  }

  // ---- Fixed payment actions ----
  async function addFixedPayment(fp) {
    try {
      const saved = await api.insertFixedPayment(user.id, fp);
      setFixedPayments((prev) => [...prev, saved]);
      toast.success(`Added ${saved.name}`);
    } catch (err) {
      toast.error("Couldn't add: " + err.message);
    }
  }

  async function updateFixedPayment(fp) {
    try {
      const saved = await api.updateFixedPayment(fp);
      setFixedPayments((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
      toast.success("Fixed payment updated");
    } catch (err) {
      toast.error("Couldn't update: " + err.message);
    }
  }

  async function deleteFixedPayment(id) {
    try {
      await api.deleteFixedPayment(id);
      setFixedPayments((prev) => prev.filter((f) => f.id !== id));
      toast.success("Fixed payment deleted");
    } catch (err) {
      toast.error("Couldn't delete: " + err.message);
    }
  }

  // "Paid": create a real expense, subtract from the account, and either
  // advance the due date or remove a one-off payment.
  async function markFixedPaid(fp) {
    try {
      const tx = {
        type: "expense",
        amount: fp.amount,
        currency: fp.currency,
        category: fp.category || "Other",
        accountId: fp.accountId,
        memo: fp.name,
        date: todayStr(),
        isFixed: true,
      };
      const savedTx = await api.insertTransaction(user.id, tx);
      setTransactions((prev) => [savedTx, ...prev]);
      await applyDeltas(txDeltas(savedTx));

      if (fp.frequency === "once") {
        await api.deleteFixedPayment(fp.id);
        setFixedPayments((prev) => prev.filter((f) => f.id !== fp.id));
      } else {
        const next = { ...fp, nextDueDate: advanceDueDate(fp.nextDueDate, fp.frequency) };
        const saved = await api.updateFixedPayment(next);
        setFixedPayments((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
      }
      toast.success(`${fp.name} paid`);
    } catch (err) {
      toast.error("Couldn't mark paid: " + err.message);
    }
  }

  // ---- Navigation ----
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
            onNavigate={navigate}
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
            onRate={rateTransaction}
          />
        );
      case "insights":
        return <Insights transactions={transactions} />;
      case "fixed":
        return (
          <FixedPayments
            fixedPayments={fixedPayments}
            accounts={accounts}
            categories={categories}
            onAdd={addFixedPayment}
            onUpdate={updateFixedPayment}
            onDelete={deleteFixedPayment}
            onMarkPaid={markFixedPaid}
            onNavigate={navigate}
          />
        );
      case "accounts":
        return (
          <Accounts
            accounts={accounts}
            onAddAccount={addAccount}
            onSetMain={setMainAccount}
            onEditAccount={editAccount}
            onDeleteAccount={deleteAccount}
            user={user}
            onSignOut={signOut}
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
            hasAccounts={hasAccounts}
            onNavigate={navigate}
          />
        );
    }
  }

  return (
    <Layout page={page} onNavigate={navigate} user={user} onSignOut={signOut}>
      {loading ? (
        <p style={{ fontSize: 14, color: "#A89D8C" }}>Loading your money…</p>
      ) : (
        renderPage()
      )}
    </Layout>
  );
}
