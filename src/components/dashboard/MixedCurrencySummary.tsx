"use client";

import { useMemo } from "react";
import { Transaction } from "@/types";
import { TransactionType } from "@/types/enums";
import { MultiCurrencySummary } from "@/components/ui/currency-display";
import { groupByCurrency } from "@/lib/currency";

interface MixedCurrencySummaryProps {
  transactions: Transaction[];
  type?: TransactionType;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Component to display transaction summaries with mixed currencies
 * Automatically groups transactions by currency and displays them appropriately
 */
export function MixedCurrencySummary({
  transactions,
  type,
  title,
  description,
  className,
}: MixedCurrencySummaryProps) {
  // Filter transactions by type if specified
  const filteredTransactions = useMemo(() => {
    if (!type) return transactions;
    return transactions.filter((t) => t.type === type);
  }, [transactions, type]);

  // Determine default title based on type
  const defaultTitle = useMemo(() => {
    if (title) return title;
    if (type === TransactionType.INCOME) return "Total Income";
    if (type === TransactionType.EXPENSE) return "Total Expenses";
    return "Total";
  }, [title, type]);

  return (
    <MultiCurrencySummary
      items={filteredTransactions}
      title={defaultTitle}
      description={description}
      showCounts={true}
      className={className}
    />
  );
}

interface AccountBalanceSummaryProps {
  transactions: Transaction[];
  className?: string;
}

/**
 * Display net balance (income - expenses) grouped by currency
 */
export function AccountBalanceSummary({
  transactions,
  className,
}: AccountBalanceSummaryProps) {
  const balanceItems = useMemo(() => {
    // Calculate net balance for each transaction
    return transactions.map((t) => ({
      amount: t.type === TransactionType.INCOME ? t.amount : -t.amount,
      currency: t.currency,
    }));
  }, [transactions]);

  const groups = groupByCurrency(balanceItems);

  return (
    <MultiCurrencySummary
      items={balanceItems}
      title="Net Balance"
      description="Total income minus expenses"
      showCounts={false}
      className={className}
    />
  );
}
