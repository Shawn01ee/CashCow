# Changelog

All notable changes to CashCow. Newest first.

## v0.8.0 — Months & subscriptions (2026-06-30)
- **Month selector** (`‹ June 2026 ›`) on Activity and Insights — page through
  any month and the lists, charts, category breakdown and ratings all follow it.
- **Subscription-style Fixed payments**: a header showing your total recurring
  cost per month, how many you have, the rough yearly total, and how many are
  due within 7 days.

## v0.7.0 — Purchase ratings (2026-06-29)
- **Rate your spending**: mark expenses ✅ Worth it / ⚠️ Meh / ❌ Regret.
- **Quick-rate in Activity**: tap the rating chips right on each expense row;
  no edit screen needed (saves instantly).
- **Insights "How your spending felt"**: per-rating totals, a worth-it/meh/regret
  proportion bar, and a "N% felt worth it" headline plus a regret callout.

## v0.6.0 — Transfers & richer insights (2026-06-29)
- **Account transfers**: a third type (Expense / Income / **Transfer**) that
  moves money between two accounts. Total balance stays the same and transfers
  are kept out of income/expense totals.
- **Activity upgrades**: transfers show as `From → To`, a new Transfer filter,
  and a per-account filter.
- **Insights**: spending-trend bar chart with Week / Month / Year toggle, plus a
  clearer "Where your money went" breakdown (top categories and their share).

## v0.5.0 — Buttercream redesign (2026-06-28)
- **Full light theme** (cream + green) with the Pretendard font, applied across
  every screen using inline styles.
- **Onboarding intro** (3 steps) shown before login on first visit.
- **Accounts**: edit name / currency / balance, delete accounts, and an instant
  (optimistic) "Set as main".
- **Link previews**: Open Graph image and meta tags for nice share cards.

## v0.4.0 — Passwordless login (2026-06-28)
- **Email OTP login**: no passwords — you get an 8-digit code by email.
- **Gmail delivery via a Vercel function**: Supabase's Send Email Hook calls a
  serverless function that relays the code through Gmail (works where Supabase's
  own SMTP is blocked).
- One-time-code box input that auto-advances and accepts pasted codes.

## v0.3.0 — Onboarding & reliability (2026-06-28)
- **Fixed payments** screen: add / edit / delete, and "Paid" logs an expense,
  lowers the balance, and advances the due date.
- **New-user onboarding**: a default account on sign-up plus empty-state CTAs.
- **Balance bug fix**: add / edit / delete now always persist the correct
  account balance.
- In-app **toasts** and a delete-confirm dialog replace browser pop-ups.

## v0.2.0 — Cloud & multi-user (2026-06-26)
- **Supabase backend**: Postgres database, email auth, and Row Level Security so
  each user only ever sees their own data.
- Data layer replacing localStorage; deployed to **Vercel** with a public link.

## v0.1.0 — Local MVP (2026-06-26)
- React + Vite + Tailwind cash-flow app: dashboard, add/edit/delete transactions,
  activity list, insights, and accounts — saved to `localStorage`.
- Core "safe to spend per day" calculation.
