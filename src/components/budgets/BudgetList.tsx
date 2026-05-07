"use client";

import { useState } from "react";
import { BudgetProgressBar } from "./BudgetProgressBar";
import { useBudgetProgress } from "@/hooks/useBudgetProgress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp } from "lucide-react";
import { EditBudgetDialog } from "./EditBudgetDialog";
import { BudgetProgress } from "@/hooks/useBudgetProgress";

interface BudgetListProps {
  accountId?: string;
  month?: Date;
}

export function BudgetList({ accountId, month }: BudgetListProps) {
  const { data: budgetProgress, isLoading, error } = useBudgetProgress(accountId, month);
  const [selectedBudget, setSelectedBudget] = useState<BudgetProgress | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load budgets. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!budgetProgress || budgetProgress.length === 0) {
    return (
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          No budgets set yet. Create your first budget to start tracking your spending.
        </AlertDescription>
      </Alert>
    );
  }

  // Sort budgets: exceeded first, then warnings, then on track
  const sortedBudgets = [...budgetProgress].sort((a, b) => {
    if (a.isExceeded && !b.isExceeded) return -1;
    if (!a.isExceeded && b.isExceeded) return 1;
    if (a.isWarning && !b.isWarning) return -1;
    if (!a.isWarning && b.isWarning) return 1;
    return b.percentage - a.percentage;
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedBudgets.map((progress) => (
          <BudgetProgressBar
            key={progress.budget.id}
            progress={progress}
            onClick={() => setSelectedBudget(progress)}
          />
        ))}
      </div>

      {selectedBudget && (
        <EditBudgetDialog
          budget={selectedBudget.budget}
          progress={selectedBudget}
          open={!!selectedBudget}
          onOpenChange={(open) => !open && setSelectedBudget(null)}
        />
      )}
    </>
  );
}
