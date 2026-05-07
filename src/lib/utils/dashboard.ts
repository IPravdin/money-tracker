import { Transaction } from "@/types";
import { TransactionType } from "@/types/enums";

/**
 * Get the start and end dates for the current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Filter transactions for the current month
 */
export function filterCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const { start, end } = getCurrentMonthRange();
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
}

/**
 * Group transactions by currency and calculate totals
 */
export interface CurrencyTotal {
  currency: string;
  total: number;
  count: number;
}

export function groupTransactionsByCurrency(
  transactions: Transaction[],
  type?: TransactionType
): CurrencyTotal[] {
  const filtered = type
    ? transactions.filter((t) => t.type === type)
    : transactions;

  const grouped = filtered.reduce((acc, transaction) => {
    const { currency, amount } = transaction;
    if (!acc[currency]) {
      acc[currency] = { currency, total: 0, count: 0 };
    }
    acc[currency].total += amount;
    acc[currency].count += 1;
    return acc;
  }, {} as Record<string, CurrencyTotal>);

  return Object.values(grouped);
}

/**
 * Calculate monthly income totals by currency
 */
export function calculateMonthlyIncome(transactions: Transaction[]): CurrencyTotal[] {
  const currentMonthTransactions = filterCurrentMonthTransactions(transactions);
  return groupTransactionsByCurrency(currentMonthTransactions, TransactionType.INCOME);
}

/**
 * Calculate monthly expense totals by currency
 */
export function calculateMonthlyExpenses(transactions: Transaction[]): CurrencyTotal[] {
  const currentMonthTransactions = filterCurrentMonthTransactions(transactions);
  return groupTransactionsByCurrency(currentMonthTransactions, TransactionType.EXPENSE);
}

/**
 * Calculate net balance (income - expenses) by currency
 */
export function calculateNetBalance(transactions: Transaction[]): CurrencyTotal[] {
  const currentMonthTransactions = filterCurrentMonthTransactions(transactions);
  
  const balances = currentMonthTransactions.reduce((acc, transaction) => {
    const { currency, amount, type } = transaction;
    if (!acc[currency]) {
      acc[currency] = { currency, total: 0, count: 0 };
    }
    
    if (type === TransactionType.INCOME) {
      acc[currency].total += amount;
    } else {
      acc[currency].total -= amount;
    }
    acc[currency].count += 1;
    
    return acc;
  }, {} as Record<string, CurrencyTotal>);

  return Object.values(balances);
}

/**
 * Calculate savings rate as a percentage
 * Returns null if there's no income
 */
export function calculateSavingsRate(transactions: Transaction[]): number | null {
  const currentMonthTransactions = filterCurrentMonthTransactions(transactions);
  
  // For simplicity, calculate in the account's default currency
  // In a real app, you'd need to handle currency conversion
  const income = currentMonthTransactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = currentMonthTransactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  if (income === 0) return null;
  
  const savingsRate = ((income - expenses) / income) * 100;
  return Math.round(savingsRate);
}

/**
 * Get recent transactions (last N transactions)
 */
export function getRecentTransactions(
  transactions: Transaction[],
  limit: number = 5
): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Format relative date (e.g., "Today", "2 days ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const transactionDate = new Date(date);
  
  // Reset time to compare dates only
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
  
  const diffTime = nowDate.getTime() - txDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  
  const months = Math.floor(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
