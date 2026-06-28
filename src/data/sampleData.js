// sampleData.js
// ----------------------------------------------------------------------
// Static UI presets that don't belong in the database.
//
// (The old localStorage seed data — sample accounts/categories/transactions —
//  was removed when CashCow moved to Supabase. New users now get starter
//  categories from the database trigger in supabase/schema.sql instead.)
// ----------------------------------------------------------------------

// Quick-add buttons shown on the Add screen for the most common expenses.
// Each one pre-fills the form so logging a coffee takes one tap.
export const quickAdds = [
  { label: "Coffee", icon: "☕", category: "Cafe", amount: 5, type: "expense" },
  { label: "Lunch", icon: "🍜", category: "Eating Out", amount: 15, type: "expense" },
  { label: "Groceries", icon: "🛒", category: "Groceries", amount: 40, type: "expense" },
  { label: "Transport", icon: "🚋", category: "Transport", amount: 4, type: "expense" },
];
