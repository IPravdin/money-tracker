import { Transaction } from "@/types";
import { TransactionType } from "@/types/enums";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export type TimePeriod = "week" | "month" | "year";

/**
 * Get date range for a specific time period
 */
export function getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  
  switch (period) {
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case "year":
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
  }
}

/**
 * Filter transactions by time period
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: TimePeriod
): Transaction[] {
  const { start, end } = getDateRangeForPeriod(period);
  
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
}

/**
 * Category data for pie chart
 */
export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  currency: string;
}

/**
 * Calculate expenses by category for a given period
 * Groups by currency and category
 */
export function calculateExpensesByCategory(
  transactions: Transaction[],
  period: TimePeriod
): Record<string, CategoryData[]> {
  const periodTransactions = filterTransactionsByPeriod(transactions, period);
  const expenses = periodTransactions.filter((t) => t.type === TransactionType.EXPENSE);
  
  if (expenses.length === 0) {
    return {};
  }
  
  // Group by currency first
  const byCurrency = expenses.reduce((acc, transaction) => {
    const { currency } = transaction;
    if (!acc[currency]) {
      acc[currency] = [];
    }
    acc[currency].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);
  
  // For each currency, calculate category breakdown
  const result: Record<string, CategoryData[]> = {};
  
  Object.entries(byCurrency).forEach(([currency, currencyTransactions]) => {
    // Group by category
    const byCategory = currencyTransactions.reduce((acc, transaction) => {
      const { category, amount } = transaction;
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);
    
    // Calculate total for percentage
    const total = Object.values(byCategory).reduce((sum, cat) => sum + cat.amount, 0);
    
    // Convert to CategoryData array
    result[currency] = Object.entries(byCategory)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: (data.amount / total) * 100,
        count: data.count,
        currency,
      }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  });
  
  return result;
}

/**
 * Get total expenses for a period by currency
 */
export function getTotalExpensesByPeriod(
  transactions: Transaction[],
  period: TimePeriod
): Record<string, number> {
  const periodTransactions = filterTransactionsByPeriod(transactions, period);
  const expenses = periodTransactions.filter((t) => t.type === TransactionType.EXPENSE);
  
  return expenses.reduce((acc, transaction) => {
    const { currency, amount } = transaction;
    if (!acc[currency]) {
      acc[currency] = 0;
    }
    acc[currency] += amount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get total income for a period by currency
 */
export function getTotalIncomeByPeriod(
  transactions: Transaction[],
  period: TimePeriod
): Record<string, number> {
  const periodTransactions = filterTransactionsByPeriod(transactions, period);
  const income = periodTransactions.filter((t) => t.type === TransactionType.INCOME);
  
  return income.reduce((acc, transaction) => {
    const { currency, amount } = transaction;
    if (!acc[currency]) {
      acc[currency] = 0;
    }
    acc[currency] += amount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Format period label for display
 */
export function formatPeriodLabel(period: TimePeriod): string {
  switch (period) {
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "year":
      return "This Year";
  }
}

/**
 * Check if there are any transactions in a period
 */
export function hasTransactionsInPeriod(
  transactions: Transaction[],
  period: TimePeriod
): boolean {
  const periodTransactions = filterTransactionsByPeriod(transactions, period);
  return periodTransactions.length > 0;
}
