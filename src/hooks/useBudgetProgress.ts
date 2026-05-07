import { useQuery } from "@tanstack/react-query";
import { Budget, Transaction } from "@/types";
import { useTransactions } from "./useTransactions";
import { TransactionType } from "@/types/enums";

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isWarning: boolean; // 80% threshold
  isExceeded: boolean; // Over 100%
}

/**
 * Calculate budget progress for a specific account and month
 */
export function useBudgetProgress(accountId?: string, month?: Date) {
  const currentMonth = month || new Date();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(accountId);

  return useQuery({
    queryKey: ["budget-progress", accountId, currentMonth.toISOString()],
    queryFn: async (): Promise<BudgetProgress[]> => {
      // Fetch budgets for the account
      const url = accountId ? `/api/budgets?accountId=${accountId}` : "/api/budgets";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }
      const data = await response.json();
      const budgets: Budget[] = data.budgets;

      if (!transactions) {
        return [];
      }

      // Filter transactions for the current month and expenses only
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

      const monthlyExpenses = transactions.filter((t: Transaction) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === TransactionType.EXPENSE &&
          transactionDate >= monthStart &&
          transactionDate <= monthEnd
        );
      });

      // Calculate progress for each budget
      return budgets.map((budget) => {
        // Sum expenses for this category in the same currency
        const spent = monthlyExpenses
          .filter((t: Transaction) => t.category === budget.category && t.currency === budget.currency)
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

        const remaining = Number(budget.monthlyLimit) - spent;
        const percentage = (spent / Number(budget.monthlyLimit)) * 100;
        const isWarning = percentage >= 80 && percentage < 100;
        const isExceeded = percentage >= 100;

        return {
          budget,
          spent,
          remaining,
          percentage: Math.min(percentage, 100), // Cap at 100 for display
          isWarning,
          isExceeded,
        };
      });
    },
    enabled: !transactionsLoading && !!transactions,
  });
}
