# 🐮 CashCow

**A student-focused cash-flow web app for international students.**

CashCow isn't just an expense tracker. It answers the one question students
actually care about: *"Can I safely spend money before my next rent, income, or
bill?"* It combines a Notion-style structured finance model with a Toss-style
clean, friendly dashboard.

### 🔗 Live demo

**https://cash-cow-indol.vercel.app/**

Sign up with any email and you get your own private space. Your data is never
visible to other users (enforced by Postgres Row Level Security).

---

## ✨ Features

- **Accounts & login**: email/password auth; every user only ever sees their own data.
- **Home dashboard**: total balance, this-month in/out, and a big **"safe to
  spend per day"** number that turns red when a bill isn't covered.
- **Money Feed**: short, friendly coaching lines instead of cold numbers.
- **Add / Edit / Delete transactions**: with one-tap quick-add chips (Coffee,
  Lunch, Groceries, Transport). Editing and deleting also fix account balances.
- **Activity**: transactions grouped by date with filters (Income / Expense /
  Fixed / Variable).
- **Insights**: donut chart + ranked category bars, fixed vs flexible split,
  and plain-language spending tips.
- **Multi-account & multi-currency** (AUD / KRW), with a "main account" badge.
- **Cloud sync**: data is stored in Supabase Postgres, so it follows you across
  devices and browsers.

---

## 🧱 Architecture

```
[ User's browser ]
        │
   React + Vite + Tailwind        ← the UI (this repo)
        │
   Supabase Auth                  ← who is logged in (the "ID check")
        │
   Supabase Postgres database     ← each user's accounts/transactions/etc.
        │
   Row Level Security (RLS)       ← the lock: you can only touch your own rows
        │
   Deployed on Vercel             ← hosting + the public link
```

| Layer | What it does |
|---|---|
| **React** | The screens you see |
| **Supabase Auth** | Sign up / log in, keeps the session |
| **Supabase Postgres** | The actual database tables |
| **RLS policies** | Guarantee User A can never read User B's data |
| **Vercel** | Builds the app and serves it at a public URL |

---

## 🛠️ Tech Stack

- [React](https://react.dev) + [Vite](https://vite.dev) + [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com): Auth + Postgres + Row Level Security
- [Recharts](https://recharts.org) for the donut chart
- [Vercel](https://vercel.com) for deployment
- Plain JavaScript (no TypeScript yet)

---

## 🚀 Run it locally

```bash
# 1. install dependencies
npm install

# 2. add your Supabase keys
cp .env.local.example .env.local      # then paste your URL + anon key

# 3. start the dev server
npm run dev
```

Open the URL it prints (usually **http://localhost:5173**).

> Full Supabase + Vercel setup is documented step-by-step in **[SETUP.md](SETUP.md)**.

---

## 🗄️ Where is the data? (How to view your database)

Everything lives in your **Supabase** project dashboard:

- **Table Editor**: browse every row like a spreadsheet. Tables:
  `accounts`, `categories`, `transactions`, `fixed_payments`, `profiles`.
- **Authentication → Users**: the list of everyone who signed up.
- **SQL Editor**: run queries directly, e.g.
  `select * from transactions order by transaction_date desc;`

Because RLS is on, the **app** only ever shows a logged-in user their own rows —
but in the Supabase dashboard (the owner view) you can see all data across users.

---

## 📁 Project Structure

```
src/
├─ App.jsx                  ← auth gate + loads/saves each user's data via Supabase
├─ lib/
│  ├─ supabase.js           ← the shared Supabase client (reads env keys)
│  └─ api.js                ← all database calls (CRUD), with snake_case⇄camelCase mapping
├─ auth/
│  ├─ AuthContext.jsx       ← shares the logged-in user app-wide
│  ├─ AuthScreen.jsx        ← login / sign-up page
│  └─ SetupNeeded.jsx       ← shown if Supabase keys are missing
├─ utils/calculations.js    ← money math (safe-to-spend, totals, breakdowns)
├─ data/sampleData.js       ← quick-add presets (and the original local seed data)
└─ components/
   ├─ Layout.jsx / NavBar.jsx        ← app frame + navigation + logout
   ├─ Dashboard.jsx / MoneyFeed.jsx  ← home screen + coach messages
   ├─ AddTransaction.jsx             ← add & edit form
   ├─ TransactionsList.jsx           ← grouped list + filters
   ├─ Insights.jsx                   ← chart + analytics
   ├─ Accounts.jsx / AccountCard.jsx ← accounts
   └─ StatCard.jsx                   ← reusable number card

supabase/
└─ schema.sql               ← tables + RLS policies + auto-seed categories (run in SQL Editor)
```

---

## 🔒 Security model (short version)

- The **anon / publishable key** is safe in the browser: it can only do what the
  **RLS policies** allow.
- Every table has policies like *"you may only touch rows where
  `user_id = auth.uid()`"*. So even with the same public key, one user's queries
  can never return another user's rows.
- The **secret key** is never used in this app and never committed.
- `.env.local` (your keys) is git-ignored.

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
- [ ] PWA so it installs to the iPhone home screen like a native app

---

Built as a learning project: from a localStorage prototype to a deployed,
multi-user web service. 🐮💸
