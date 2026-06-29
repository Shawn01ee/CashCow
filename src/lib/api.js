// api.js
// ----------------------------------------------------------------------
// Every database call lives here. Components never talk to Supabase
// directly — they call these functions. That keeps the rest of the app
// clean and means there's only one place to change if the backend changes.
//
// The database uses snake_case (transaction_date, is_fixed, ...) while the
// React code uses camelCase (date, isFixed, ...). The little "toApp*" / row
// builders below translate between the two so the UI code is unchanged.
// ----------------------------------------------------------------------
import { supabase } from "./supabase";

// ---------- DB row  ->  app object ----------
const toAppAccount = (r) => ({
  id: r.id,
  name: r.name,
  currency: r.currency,
  balance: Number(r.balance),
  isMain: r.is_main,
  isProtected: Boolean(r.protected),
  purpose: r.purpose || "",
});
const toAppCategory = (r) => ({
  id: r.id,
  name: r.name,
  type: r.type,
  icon: r.icon,
  isFixed: r.is_fixed,
});
const toAppTx = (r) => ({
  id: r.id,
  accountId: r.account_id,
  toAccountId: r.to_account_id, // only set for transfers
  type: r.type,
  amount: Number(r.amount),
  currency: r.currency,
  category: r.category,
  memo: r.memo,
  date: r.transaction_date,
  isFixed: r.is_fixed,
  rating: r.rating, // 'good' | 'warn' | 'bad' | null
});
const toAppFixed = (r) => ({
  id: r.id,
  accountId: r.account_id,
  name: r.name,
  amount: Number(r.amount),
  currency: r.currency,
  category: r.category,
  frequency: r.frequency,
  nextDueDate: r.next_due_date,
});

// ---------- Load everything for the logged-in user ----------
// RLS guarantees we only ever get back THIS user's rows.
export async function fetchAll() {
  const [acc, cat, tx, fp] = await Promise.all([
    supabase.from("accounts").select("*").order("created_at", { ascending: true }),
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
    supabase.from("transactions").select("*").order("transaction_date", { ascending: false }),
    supabase.from("fixed_payments").select("*").order("next_due_date", { ascending: true }),
  ]);

  const firstError = acc.error || cat.error || tx.error || fp.error;
  if (firstError) throw firstError;

  return {
    accounts: (acc.data || []).map(toAppAccount),
    categories: (cat.data || []).map(toAppCategory),
    transactions: (tx.data || []).map(toAppTx),
    fixedPayments: (fp.data || []).map(toAppFixed),
  };
}

// ---------- Transactions ----------
export async function insertTransaction(userId, tx) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      account_id: tx.accountId,
      to_account_id: tx.toAccountId || null,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      category: tx.category,
      memo: tx.memo,
      transaction_date: tx.date,
      is_fixed: tx.isFixed,
      rating: tx.rating || null,
    })
    .select()
    .single();
  if (error) throw error;
  return toAppTx(data);
}

export async function updateTransaction(tx) {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      account_id: tx.accountId,
      to_account_id: tx.toAccountId || null,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      category: tx.category,
      memo: tx.memo,
      transaction_date: tx.date,
      is_fixed: tx.isFixed,
      rating: tx.rating || null,
    })
    .eq("id", tx.id)
    .select()
    .single();
  if (error) throw error;
  return toAppTx(data);
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Accounts ----------
export async function insertAccount(userId, account) {
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: account.name,
      currency: account.currency,
      balance: account.balance,
      is_main: account.isMain,
      protected: account.isProtected || false,
      purpose: account.purpose || null,
    })
    .select()
    .single();
  if (error) throw error;
  return toAppAccount(data);
}

// Set a new balance (used after add/edit/delete of a transaction).
export async function setAccountBalance(accountId, balance) {
  const { error } = await supabase
    .from("accounts")
    .update({ balance })
    .eq("id", accountId);
  if (error) throw error;
}

// Edit an account's name / currency / balance.
export async function updateAccount(account) {
  const { data, error } = await supabase
    .from("accounts")
    .update({
      name: account.name,
      currency: account.currency,
      balance: account.balance,
      protected: account.isProtected || false,
      purpose: account.purpose || null,
    })
    .eq("id", account.id)
    .select()
    .single();
  if (error) throw error;
  return toAppAccount(data);
}

// Delete an account. Linked transactions keep their history (account_id is
// set to null by the ON DELETE SET NULL rule in the schema).
export async function deleteAccount(id) {
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw error;
}

// Make one account the main one (clear the flag everywhere, then set it).
export async function setMainAccount(userId, accountId) {
  const clear = await supabase
    .from("accounts")
    .update({ is_main: false })
    .eq("user_id", userId);
  if (clear.error) throw clear.error;

  const { error } = await supabase
    .from("accounts")
    .update({ is_main: true })
    .eq("id", accountId);
  if (error) throw error;
}

// ---------- Fixed payments ----------
export async function insertFixedPayment(userId, fp) {
  const { data, error } = await supabase
    .from("fixed_payments")
    .insert({
      user_id: userId,
      account_id: fp.accountId,
      name: fp.name,
      amount: fp.amount,
      currency: fp.currency,
      category: fp.category,
      frequency: fp.frequency,
      next_due_date: fp.nextDueDate,
    })
    .select()
    .single();
  if (error) throw error;
  return toAppFixed(data);
}

export async function updateFixedPayment(fp) {
  const { data, error } = await supabase
    .from("fixed_payments")
    .update({
      account_id: fp.accountId,
      name: fp.name,
      amount: fp.amount,
      currency: fp.currency,
      category: fp.category,
      frequency: fp.frequency,
      next_due_date: fp.nextDueDate,
    })
    .eq("id", fp.id)
    .select()
    .single();
  if (error) throw error;
  return toAppFixed(data);
}

export async function deleteFixedPayment(id) {
  const { error } = await supabase.from("fixed_payments").delete().eq("id", id);
  if (error) throw error;
}
