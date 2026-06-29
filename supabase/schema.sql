-- ====================================================================
-- CashCow database schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once (uses "if not exists" / "drop policy").
-- ====================================================================

-- ---------- TABLES ----------

-- One profile row per user, auto-created on sign-up (see trigger below).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  base_currency text default 'AUD',
  created_at timestamptz default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'AUD',
  balance numeric not null default 0,
  is_main boolean default false,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  is_fixed boolean default false,
  created_at timestamptz default now()
);

-- We store the category NAME as text (simpler than a foreign key + join,
-- and it matches the existing front-end code).
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  -- For transfers, account_id is the FROM account and to_account_id is the TO.
  to_account_id uuid references accounts(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric not null check (amount >= 0),
  currency text not null default 'AUD',
  category text,
  memo text,
  transaction_date date not null,
  is_fixed boolean default false,
  created_at timestamptz default now()
);

-- Migrations for existing databases (safe to run repeatedly):
alter table transactions add column if not exists to_account_id uuid references accounts(id) on delete set null;
alter table transactions drop constraint if exists transactions_type_check;
alter table transactions add constraint transactions_type_check check (type in ('income', 'expense', 'transfer'));
-- "rating" lets you reflect on a purchase: good (worth it) / warn (meh) / bad (regret).
alter table transactions add column if not exists rating text;
-- Protected accounts hold money you've set aside (rent reserve, savings) — it's
-- excluded from "safe to spend". "purpose" is an optional label like "Rent reserve".
alter table accounts add column if not exists protected boolean default false;
alter table accounts add column if not exists purpose text;

create table if not exists fixed_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  name text not null,
  amount numeric not null check (amount >= 0),
  currency text not null default 'AUD',
  category text,
  frequency text not null check (frequency in ('weekly','fortnightly','monthly','once')),
  next_due_date date not null,
  created_at timestamptz default now()
);

-- Helpful indexes for "all rows for this user" lookups.
create index if not exists idx_accounts_user on accounts(user_id);
create index if not exists idx_categories_user on categories(user_id);
create index if not exists idx_transactions_user on transactions(user_id);
create index if not exists idx_fixed_payments_user on fixed_payments(user_id);

-- ---------- ROW LEVEL SECURITY ----------
-- Turn RLS on everywhere. Without this, the anon key could read everyone's data.
alter table profiles       enable row level security;
alter table accounts       enable row level security;
alter table categories     enable row level security;
alter table transactions   enable row level security;
alter table fixed_payments enable row level security;

-- profiles: a user can only see/edit their own profile row.
drop policy if exists "own profile select" on profiles;
create policy "own profile select" on profiles for select using (auth.uid() = id);
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- For the four data tables the policies are identical in spirit:
-- "you may only touch rows where user_id = your id".

-- accounts
drop policy if exists "accounts select" on accounts;
create policy "accounts select" on accounts for select using (auth.uid() = user_id);
drop policy if exists "accounts insert" on accounts;
create policy "accounts insert" on accounts for insert with check (auth.uid() = user_id);
drop policy if exists "accounts update" on accounts;
create policy "accounts update" on accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "accounts delete" on accounts;
create policy "accounts delete" on accounts for delete using (auth.uid() = user_id);

-- categories
drop policy if exists "categories select" on categories;
create policy "categories select" on categories for select using (auth.uid() = user_id);
drop policy if exists "categories insert" on categories;
create policy "categories insert" on categories for insert with check (auth.uid() = user_id);
drop policy if exists "categories update" on categories;
create policy "categories update" on categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "categories delete" on categories;
create policy "categories delete" on categories for delete using (auth.uid() = user_id);

-- transactions
drop policy if exists "transactions select" on transactions;
create policy "transactions select" on transactions for select using (auth.uid() = user_id);
drop policy if exists "transactions insert" on transactions;
create policy "transactions insert" on transactions for insert with check (auth.uid() = user_id);
drop policy if exists "transactions update" on transactions;
create policy "transactions update" on transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "transactions delete" on transactions;
create policy "transactions delete" on transactions for delete using (auth.uid() = user_id);

-- fixed_payments
drop policy if exists "fixed select" on fixed_payments;
create policy "fixed select" on fixed_payments for select using (auth.uid() = user_id);
drop policy if exists "fixed insert" on fixed_payments;
create policy "fixed insert" on fixed_payments for insert with check (auth.uid() = user_id);
drop policy if exists "fixed update" on fixed_payments;
create policy "fixed update" on fixed_payments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fixed delete" on fixed_payments;
create policy "fixed delete" on fixed_payments for delete using (auth.uid() = user_id);

-- ---------- AUTO-SETUP ON SIGN-UP ----------
-- When a new auth user is created, give them a profile row and a starter
-- set of categories so the app feels populated from day one.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));

  -- Give every new user a default main account so the app isn't empty
  -- on first login. They can rename it or add more later.
  insert into accounts (user_id, name, currency, balance, is_main)
  values (new.id, 'Main', 'AUD', 0, true);

  insert into categories (user_id, name, type, icon, is_fixed) values
    (new.id, 'Rent', 'expense', '🏠', true),
    (new.id, 'Groceries', 'expense', '🛒', false),
    (new.id, 'Eating Out', 'expense', '🍜', false),
    (new.id, 'Cafe', 'expense', '☕', false),
    (new.id, 'Transport', 'expense', '🚋', false),
    (new.id, 'Study', 'expense', '📚', false),
    (new.id, 'Health', 'expense', '💊', false),
    (new.id, 'Fitness', 'expense', '🏋️', false),
    (new.id, 'Shopping', 'expense', '🛍️', false),
    (new.id, 'Subscription', 'expense', '🔁', true),
    (new.id, 'Phone', 'expense', '📱', true),
    (new.id, 'Travel', 'expense', '✈️', false),
    (new.id, 'Other', 'expense', '📦', false),
    (new.id, 'Family Support', 'income', '💸', true),
    (new.id, 'Part-time Job', 'income', '💼', true),
    (new.id, 'Scholarship', 'income', '🎓', true),
    (new.id, 'Refund', 'income', '↩️', false),
    (new.id, 'Currency Exchange', 'income', '💱', false),
    (new.id, 'Other Income', 'income', '➕', false);

  return new;
end;
$$;

-- Re-create the trigger cleanly each run.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
