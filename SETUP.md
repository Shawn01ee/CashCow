# 🐮 CashCow — Supabase + Vercel Setup Guide

This guide turns CashCow into a real multi-user web app. Follow it top to
bottom. Steps marked **👉 YOU** are things only you can do (creating accounts);
everything else is already coded.

---

## Part A — Supabase (the database + login)

### 1. 👉 Create a Supabase project
1. Go to **https://supabase.com** → sign in → **New project**.
2. Name it `cashcow`, choose a region near you, set a database password (save it).
3. Wait ~2 minutes for it to finish provisioning.

### 2. 👉 Run the database schema
1. In your project, open **SQL Editor** → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this repo,
   copy **everything**, paste it in, and click **Run**.
3. You should see "Success". This creates all tables, security rules (RLS),
   and a trigger that gives every new user starter categories.

### 3. 👉 Get your keys
1. Go to **Project Settings → API**.
2. Copy two values:
   - **Project URL**
   - **anon / publishable** key (the public one — safe for the browser)

### 4. 👉 Put the keys in `.env.local`
In the project folder, create a file named `.env.local` (copy the example):

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and paste your values:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci....
```

> `.env.local` is git-ignored, so your keys never get committed.

### 5. Restart the dev server
```bash
npm run dev
```
Open the app — you should now see a **login / sign-up** screen instead of the
"setup needed" screen. Create an account, log in, and add a transaction.

> **Optional (easier testing):** In Supabase → **Authentication → Providers →
> Email**, turn **"Confirm email" OFF** so you can log in immediately without
> clicking a confirmation link.

---

## Part B — Vercel (put it online)

### 6. Push to GitHub
Already done — the repo lives at the `origin` remote. Any new commits:
```bash
git add -A && git commit -m "your message" && git push
```

### 7. 👉 Deploy on Vercel
1. Go to **https://vercel.com** → sign in **with GitHub**.
2. **Add New… → Project** → import the **CashCow** repo.
3. Framework preset: **Vite** (auto-detected). Leave build settings as-is.
4. Expand **Environment Variables** and add the same two keys:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. After ~1 minute you get a link like
   `https://cashcow.vercel.app`.

### 8. 👉 Allow your live URL in Supabase
1. Supabase → **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL and add it to **Redirect URLs**.

That's it — send the link to friends. Each person signs up and only ever sees
their own data (enforced by RLS).

---

## 🐞 Common errors & fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| App shows "setup needed" | `.env.local` missing or unread | Check the file exists, then **restart** `npm run dev` |
| "Invalid login credentials" | wrong password, or email not confirmed | Re-check password, or turn off email confirmation (step 5) |
| Login works but no data / "row level security" error | schema not run, or RLS blocking | Re-run `supabase/schema.sql`; make sure you're logged in |
| Vercel build OK but blank/login loops | env vars missing on Vercel | Add the two `VITE_` vars in Vercel → redeploy |
| Changes don't deploy | not pushed to GitHub | `git push`, Vercel auto-redeploys |

---

## How the security works (short version)

- The **anon key** is public and safe — it can only do what your **RLS
  policies** allow.
- Every table has policies like *"you may only touch rows where
  `user_id = auth.uid()`"*. So even with the same key, User A's queries can
  never return User B's rows.
- That's why **running the schema (which enables RLS) is not optional**.
