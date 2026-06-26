import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import AddTransaction from "./components/AddTransaction";
import TransactionsList from "./components/TransactionsList";
import Insights from "./components/Insights";
import Accounts from "./components/Accounts";
import {
  sampleAccounts,
  sampleCategories,
  sampleTransactions,
  sampleFixedPayments,
} from "./data/sampleData";

// One key per data type keeps localStorage tidy and easy to debug.
const STORAGE_KEYS = {
  accounts: "cashcow.accounts",
  categories: "cashcow.categories",
  transactions: "cashcow.transactions",
  fixedPayments: "cashcow.fixedPayments",
};

// Small helper: load from localStorage, or fall back to sample data the
// first time the app ever runs (when nothing is saved yet).
function loadOrSeed(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    // If parsing fails for any reason, just use the sample data.
    return fallback;
  }
}

export default function App() {
  // Which screen are we on? Simple string-based "router" — no library needed.
  const [page, setPage] = useState("home");

  // When the user taps "Edit" on a transaction, we store it here and reuse
  // the Add screen as an edit form. null = we're adding a brand-new one.
  const [editingTx, setEditingTx] = useState(null);

  // All app data lives here in React state, seeded from localStorage.
  const [accounts, setAccounts] = useState(() =>
    loadOrSeed(STORAGE_KEYS.accounts, sampleAccounts)
  );
  const [categories, setCategories] = useState(() =>
    loadOrSeed(STORAGE_KEYS.categories, sampleCategories)
  );
  const [transactions, setTransactions] = useState(() =>
    loadOrSeed(STORAGE_KEYS.transactions, sampleTransactions)
  );
  const [fixedPayments, setFixedPayments] = useState(() =>
    loadOrSeed(STORAGE_KEYS.fixedPayments, sampleFixedPayments)
  );

  // Whenever a piece of data changes, mirror it back into localStorage.
  // Each useEffect watches one slice of state.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
  }, [accounts]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fixedPayments, JSON.stringify(fixedPayments));
  }, [fixedPayments]);

  // ---- Actions that screens call to change data ----

  // How a transaction changes an account: income adds, expense subtracts.
  function txEffect(tx) {
    return tx.type === "income" ? tx.amount : -tx.amount;
  }

  // Return a new accounts array with `delta` applied to one account's balance.
  function applyToBalance(accountsList, accountId, delta) {
    return accountsList.map((acc) =>
      acc.id === accountId ? { ...acc, balance: acc.balance + delta } : acc
    );
  }

  // Add a new transaction AND adjust the matching account's balance.
  function addTransaction(tx) {
    setTransactions((prev) => [tx, ...prev]);
    setAccounts((prev) => applyToBalance(prev, tx.accountId, txEffect(tx)));
    setPage("transactions"); // jump to the list so the user sees it landed
  }

  // Edit an existing transaction. We first "undo" the old transaction's effect
  // on balances, then apply the new one (the account may even have changed).
  function updateTransaction(updated) {
    const old = transactions.find((t) => t.id === updated.id);
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setAccounts((prev) => {
      let next = prev;
      if (old) next = applyToBalance(next, old.accountId, -txEffect(old)); // undo old
      next = applyToBalance(next, updated.accountId, txEffect(updated)); // apply new
      return next;
    });
    setEditingTx(null);
    setPage("transactions");
  }

  // Delete a transaction and give its money back to / take it from the account.
  function deleteTransaction(id) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setAccounts((prev) => applyToBalance(prev, tx.accountId, -txEffect(tx)));
  }

  // Open the Add screen in "edit mode" for a specific transaction.
  function startEdit(tx) {
    setEditingTx(tx);
    setPage("add");
  }

  // Navigation wrapper: tapping "Add" in the menu always means a NEW
  // transaction, so we clear any leftover edit target first.
  function navigate(targetPage) {
    if (targetPage === "add") setEditingTx(null);
    setPage(targetPage);
  }

  function addAccount(account) {
    setAccounts((prev) => [...prev, account]);
  }

  // Mark one account as the main account (only one can be main at a time).
  function setMainAccount(accountId) {
    setAccounts((prev) =>
      prev.map((acc) => ({ ...acc, isMain: acc.id === accountId }))
    );
  }

  // Pick which screen component to show based on `page`.
  function renderPage() {
    switch (page) {
      case "add":
        return (
          <AddTransaction
            // key forces a fresh form when switching between add/edit targets
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
    <Layout page={page} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
}
