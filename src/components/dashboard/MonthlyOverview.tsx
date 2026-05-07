"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { getCurrencySymbol } from "@/lib/validations/account";
import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetBalance,
  calculateSavingsRate,
} from "@/lib/utils/dashboard";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";

interface MonthlyOverviewProps {
  transactions: Transaction[];
  defaultCurrency?: string;
  className?: string;
}

export function MonthlyOverview({
  transactions,
  defaultCurrency = "USD",
  className,
}: MonthlyOverviewProps) {
  const monthlyIncome = useMemo(
    () => calculateMonthlyIncome(transactions),
    [transactions]
  );

  const monthlyExpenses = useMemo(
    () => calculateMonthlyExpenses(transactions),
    [transactions]
  );

  const netBalance = useMemo(
    () => calculateNetBalance(transactions),
    [transactions]
  );

  const savingsRate = useMemo(
    () => calculateSavingsRate(transactions),
    [transactions]
  );

  // Helper to format currency totals
  const formatCurrencyTotals = (totals: Array<{ currency: string; total: number }>) => {
    if (totals.length === 0) {
      return `${getCurrencySymbol(defaultCurrency)}0.00`;
    }

    if (totals.length === 1) {
      const { currency, total } = totals[0];
      return `${getCurrencySymbol(currency)}${total.toFixed(2)}`;
    }

    // Multiple currencies - show primary and count
    const primary = totals[0];
    return (
      <div className="flex flex-col">
        <span>{`${getCurrencySymbol(primary.currency)}${primary.total.toFixed(2)}`}</span>
        <span className="text-xs text-muted-foreground">
          +{totals.length - 1} more {totals.length - 1 === 1 ? "currency" : "currencies"}
        </span>
      </div>
    );
  };

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}>
      {/* Net Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrencyTotals(netBalance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Current month balance
          </p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrencyTotals(monthlyIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            {monthlyIncome.reduce((sum, item) => sum + item.count, 0)} transactions
          </p>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrencyTotals(monthlyExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {monthlyExpenses.reduce((sum, item) => sum + item.count, 0)} transactions
          </p>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {savingsRate !== null ? `${savingsRate}%` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {savingsRate !== null
              ? savingsRate >= 0
                ? "Positive savings"
                : "Spending more than income"
              : "No income data"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
