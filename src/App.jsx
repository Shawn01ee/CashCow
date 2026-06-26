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

  // Add a new transaction AND adjust the matching account's balance.
  function addTransaction(tx) {
    setTransactions((prev) => [tx, ...prev]);
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== tx.accountId) return acc;
        const delta = tx.type === "income" ? tx.amount : -tx.amount;
        return { ...acc, balance: acc.balance + delta };
      })
    );
    setPage("transactions"); // jump to the list so the user sees it landed
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
            categories={categories}
            accounts={accounts}
            onAdd={addTransaction}
          />
        );
      case "transactions":
        return (
          <TransactionsList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
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
            onNavigate={setPage}
          />
        );
    }
  }

  return (
    <Layout page={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}
