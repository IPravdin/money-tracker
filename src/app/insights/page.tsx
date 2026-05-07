"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountSelector } from "@/components/dashboard/AccountSelector";
import { TimePeriodSelector } from "@/components/charts/TimePeriodSelector";
import { ExpensesPieChart } from "@/components/charts/ExpensesPieChart";
import { CategoryBreakdown } from "@/components/charts/CategoryBreakdown";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { useTransactions } from "@/hooks/useTransactions";
import {
  TimePeriod,
  calculateExpensesByCategory,
  getTotalExpensesByPeriod,
  getTotalIncomeByPeriod,
  formatPeriodLabel,
  hasTransactionsInPeriod,
} from "@/lib/utils/insights";
import { getCurrencySymbol } from "@/lib/validations/account";
import { BarChart3, PieChart, TrendingDown, TrendingUp, Wallet } from "lucide-react";

export default function InsightsPage() {
  const { user } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const currentAccount = useCurrentAccount(accounts);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(
    currentAccount?.id
  );

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");

  // Calculate insights data
  const expensesByCategory = useMemo(() => {
    if (!transactions) return {};
    return calculateExpensesByCategory(transactions, selectedPeriod);
  }, [transactions, selectedPeriod]);

  const totalExpenses = useMemo(() => {
    if (!transactions) return {};
    return getTotalExpensesByPeriod(transactions, selectedPeriod);
  }, [transactions, selectedPeriod]);

  const totalIncome = useMemo(() => {
    if (!transactions) return {};
    return getTotalIncomeByPeriod(transactions, selectedPeriod);
  }, [transactions, selectedPeriod]);

  const hasData = useMemo(() => {
    if (!transactions) return false;
    return hasTransactionsInPeriod(transactions, selectedPeriod);
  }, [transactions, selectedPeriod]);

  if (!user) {
    return <LoadingPage />;
  }

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Insights"
        description="Visual analysis of your spending patterns and financial trends"
      />

      {/* Account Selector */}
      <div className="mb-6">
        <AccountSelector />
      </div>

      {/* Show loading state */}
      {(accountsLoading || transactionsLoading) && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner className="mr-2" />
            Loading insights data...
          </CardContent>
        </Card>
      )}

      {/* Show empty state if no account is selected */}
      {!accountsLoading && !currentAccount && (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<Wallet className="h-8 w-8" />}
              title="No account selected"
              description="Please create or select an account to view insights"
            />
          </CardContent>
        </Card>
      )}

      {/* Show insights when account is selected and data is loaded */}
      {!accountsLoading && !transactionsLoading && currentAccount && (
        <>
          {/* Time Period Selector */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{formatPeriodLabel(selectedPeriod)}</h2>
              <p className="text-sm text-muted-foreground">
                Select a time period to view insights
              </p>
            </div>
            <TimePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>

          {/* Empty state for no transactions in period */}
          {!hasData && (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={<BarChart3 className="h-8 w-8" />}
                  title="No transactions in this period"
                  description={`You don't have any transactions for ${formatPeriodLabel(
                    selectedPeriod
                  ).toLowerCase()}. Add some transactions to see insights.`}
                />
              </CardContent>
            </Card>
          )}

          {/* Show insights when there's data */}
          {hasData && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                {/* Total Income */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    {Object.entries(totalIncome).length === 0 ? (
                      <div className="text-2xl font-bold text-muted-foreground">
                        {getCurrencySymbol(currentAccount.defaultCurrency)}0.00
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(totalIncome).map(([currency, amount]) => (
                          <div key={currency} className="text-2xl font-bold text-green-600">
                            {getCurrencySymbol(currency)}
                            {amount.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPeriodLabel(selectedPeriod)}
                    </p>
                  </CardContent>
                </Card>

                {/* Total Expenses */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    {Object.entries(totalExpenses).length === 0 ? (
                      <div className="text-2xl font-bold text-muted-foreground">
                        {getCurrencySymbol(currentAccount.defaultCurrency)}0.00
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(totalExpenses).map(([currency, amount]) => (
                          <div key={currency} className="text-2xl font-bold text-red-600">
                            {getCurrencySymbol(currency)}
                            {amount.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPeriodLabel(selectedPeriod)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Breakdown - Show for each currency */}
              {Object.entries(expensesByCategory).map(([currency, categoryData]) => (
                <div key={currency} className="mb-8">
                  {Object.keys(expensesByCategory).length > 1 && (
                    <h3 className="text-lg font-semibold mb-4">
                      {currency} Expenses
                    </h3>
                  )}

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Expenses by Category
                        </CardTitle>
                        <CardDescription>
                          Distribution of your spending across categories
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ExpensesPieChart data={categoryData} currency={currency} />
                      </CardContent>
                    </Card>

                    {/* Category Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Category Breakdown
                        </CardTitle>
                        <CardDescription>
                          Detailed breakdown with amounts and percentages
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CategoryBreakdown data={categoryData} currency={currency} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}

              {/* Empty state for no expenses */}
              {Object.keys(expensesByCategory).length === 0 && (
                <Card>
                  <CardContent className="py-12">
                    <EmptyState
                      icon={<PieChart className="h-8 w-8" />}
                      title="No expenses in this period"
                      description={`You don't have any expenses for ${formatPeriodLabel(
                        selectedPeriod
                      ).toLowerCase()}.`}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </AuthenticatedLayout>
  );
}
