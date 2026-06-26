# 🐮 CashCow

**A student-focused cash-flow app for international students.**

CashCow isn't just an expense tracker — it answers the one question students
actually care about: *"Can I safely spend money before my next rent, income, or
bill?"* It combines a Notion-style structured finance model with a Toss-style
clean, friendly dashboard.

> _"You can safely spend about $58 per day until your next income."_

---

## ✨ Features

- **Home dashboard** — total balance, this-month in/out, and a big **"safe to
  spend per day"** number that turns red when a bill isn't covered.
- **Money Feed** — short, friendly coaching lines instead of cold numbers.
- **Add / Edit / Delete transactions** — with one-tap quick-add chips (Coffee,
  Lunch, Groceries, Transport). Editing and deleting also fix account balances.
- **Activity** — transactions grouped by date with filters (Income / Expense /
  Fixed / Variable).
- **Insights** — donut chart + ranked category bars, fixed vs flexible split,
  and plain-language spending tips.
- **Accounts** — multi-account and multi-currency (AUD / KRW), set a main account.
- **Saves automatically** to your browser via `localStorage` — no login, no backend.

---

## 🛠️ Tech Stack

- [React](https://react.dev) + [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org) for the donut chart
- Plain JavaScript, `localStorage` for persistence (no backend in v0.1)

---

## 🚀 Getting Started

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev
```

Then open the URL it prints (usually **http://localhost:5173**).

```bash
# build a production version
npm run build

# preview the production build locally
npm run preview
```

> **Reset your data:** open the browser console and run
> `localStorage.clear(); location.reload();`

---

## 📁 Project Structure

```
src/
├─ App.jsx                ← all state, localStorage, and screen routing
├─ data/sampleData.js     ← seed accounts, categories, transactions
├─ utils/calculations.js  ← money math (safe-to-spend, totals, breakdowns)
└─ components/
   ├─ Layout.jsx / NavBar.jsx        ← app frame + navigation
   ├─ Dashboard.jsx / MoneyFeed.jsx  ← home screen + coach messages
   ├─ AddTransaction.jsx             ← add & edit form
   ├─ TransactionsList.jsx           ← grouped list + filters
   ├─ Insights.jsx                   ← chart + analytics
   ├─ Accounts.jsx / AccountCard.jsx ← accounts
   └─ StatCard.jsx                   ← reusable number card
```

---

## 🧮 How "Safe to Spend" works

```
Safe per day = (AUD balance − next fixed payment) / days until it's due
```

If the balance can't cover the upcoming payment, the dashboard shows a clear
warning instead of a number.

---

## 🗺️ Roadmap

- [ ] Currency conversion so AUD + KRW combine into one net worth
- [ ] Manage fixed payments from the UI (add / edit / mark as paid)
- [ ] Use real income dates for a smarter safe-to-spend number
- [ ] Move from `localStorage` to a backend (e.g. Supabase) for sync

---

Built as a learning project. 🐮💸
