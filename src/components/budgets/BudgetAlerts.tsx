"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { useBudgetProgress } from "@/hooks/useBudgetProgress";
import { formatCurrency } from "@/lib/currency";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface BudgetAlertsProps {
  accountId?: string;
  month?: Date;
}

export function BudgetAlerts({ accountId, month }: BudgetAlertsProps) {
  const { data: budgetProgress, isLoading } = useBudgetProgress(accountId, month);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoadingSpinner className="h-6 w-6" />
      </div>
    );
  }

  if (!budgetProgress || budgetProgress.length === 0) {
    return null;
  }

  // Filter budgets that need alerts
  const exceededBudgets = budgetProgress.filter((p) => p.isExceeded);
  const warningBudgets = budgetProgress.filter((p) => p.isWarning);

  if (exceededBudgets.length === 0 && warningBudgets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Exceeded Budgets */}
      {exceededBudgets.map((progress) => (
        <Alert key={progress.budget.id} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Budget Exceeded: {progress.budget.category}</AlertTitle>
          <AlertDescription>
            You've spent {formatCurrency(progress.spent, progress.budget.currency)} of your{" "}
            {formatCurrency(Number(progress.budget.monthlyLimit), progress.budget.currency)} budget.
            You're over by {formatCurrency(Math.abs(progress.remaining), progress.budget.currency)}.
          </AlertDescription>
        </Alert>
      ))}

      {/* Warning Budgets (80% threshold) */}
      {warningBudgets.map((progress) => (
        <Alert key={progress.budget.id} className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Budget Warning: {progress.budget.category}
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            You've used {progress.percentage.toFixed(1)}% of your budget. Only{" "}
            {formatCurrency(progress.remaining, progress.budget.currency)} remaining.
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
