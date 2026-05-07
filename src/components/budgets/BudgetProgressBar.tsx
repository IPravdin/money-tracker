"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { BudgetProgress } from "@/hooks/useBudgetProgress";
import { formatCurrency } from "@/lib/currency";

interface BudgetProgressBarProps {
  progress: BudgetProgress;
  onClick?: () => void;
}

export function BudgetProgressBar({ progress, onClick }: BudgetProgressBarProps) {
  const { budget, spent, remaining, percentage, isWarning, isExceeded } = progress;

  // Determine color based on status
  const getProgressColor = () => {
    if (isExceeded) return "bg-destructive";
    if (isWarning) return "bg-yellow-500";
    return "bg-primary";
  };

  const getStatusBadge = () => {
    if (isExceeded) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Exceeded
        </Badge>
      );
    }
    if (isWarning) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
        <CheckCircle className="h-3 w-3" />
        On Track
      </Badge>
    );
  };

  return (
    <Card 
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        isExceeded ? "border-destructive" : isWarning ? "border-yellow-500" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{budget.category}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className={`font-semibold ${isExceeded ? "text-destructive" : ""}`}>
              {formatCurrency(spent, budget.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">
              {formatCurrency(Number(budget.monthlyLimit), budget.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className={`font-medium ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(Math.max(0, remaining), budget.currency)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{percentage.toFixed(1)}% used</span>
            {isExceeded && (
              <span className="text-destructive font-medium">
                Over by {formatCurrency(Math.abs(remaining), budget.currency)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
