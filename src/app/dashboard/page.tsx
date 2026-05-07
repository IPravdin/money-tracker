"use client";

import { useAuth } from "@/hooks/useAuth";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveGrid } from "@/components/layout/responsive-container";
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading-spinner";
import { AccountSelector } from "@/components/dashboard/AccountSelector";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { useTransactions } from "@/hooks/useTransactions";
import { EmptyState } from "@/components/ui/empty-state";
import { useBudgetProgress } from "@/hooks/useBudgetProgress";
import { BudgetAlerts } from "@/components/budgets";
import { Wallet, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user, logout, isLoggingOut } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const currentAccount = useCurrentAccount(accounts);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(
    currentAccount?.id
  );
  const { data: budgetProgress, isLoading: budgetsLoading } = useBudgetProgress(
    currentAccount?.id
  );

  if (!user) {
    return <LoadingPage />;
  }

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name || user.email}!`}
      />

      {/* Account Selector */}
      <div className="mb-6">
        <AccountSelector />
      </div>

      {/* Show loading state while fetching data */}
      {(accountsLoading || transactionsLoading) && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner className="mr-2" />
            Loading dashboard data...
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
              description="Please create or select an account to view your dashboard"
            />
          </CardContent>
        </Card>
      )}

      {/* Show dashboard content when account is selected and data is loaded */}
      {!accountsLoading && !transactionsLoading && currentAccount && (
        <>
          {/* Budget Alerts */}
          <div className="mb-6">
            <BudgetAlerts accountId={currentAccount.id} />
          </div>

          {/* Monthly Overview Cards */}
          <MonthlyOverview
            transactions={transactions || []}
            defaultCurrency={currentAccount.defaultCurrency}
            className="mb-6"
          />

          {/* Quick Actions */}
          <QuickActions currentAccountId={currentAccount.id} className="mb-6" />

          {/* Recent Activity */}
          <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
            <RecentTransactions transactions={transactions || []} limit={5} />

            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Your spending vs budget this month</CardDescription>
              </CardHeader>
              <CardContent>
                {budgetsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner className="h-6 w-6" />
                  </div>
                ) : !budgetProgress || budgetProgress.length === 0 ? (
                  <EmptyState
                    icon={<TrendingUp className="h-6 w-6" />}
                    title="No budgets set"
                    description="Create budgets to track your spending"
                    action={{
                      label: "Create Budget",
                      onClick: () => window.location.href = "/budgets",
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {budgetProgress.slice(0, 3).map((progress) => (
                      <div key={progress.budget.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{progress.budget.category}</span>
                          <span className={progress.isExceeded ? "text-destructive font-semibold" : ""}>
                            {progress.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div 
                            className={`h-full transition-all ${
                              progress.isExceeded ? "bg-destructive" : 
                              progress.isWarning ? "bg-yellow-500" : 
                              "bg-primary"
                            }`}
                            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {budgetProgress.length > 3 && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => window.location.href = "/budgets"}
                      >
                        View All Budgets
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </ResponsiveGrid>

          {/* Debug info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>User session details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                {user.name && (
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                )}
                {currentAccount && (
                  <>
                    <p>
                      <strong>Current Account:</strong> {currentAccount.name}
                    </p>
                    <p>
                      <strong>Account Currency:</strong> {currentAccount.defaultCurrency}
                    </p>
                    <p>
                      <strong>Transactions:</strong> {transactions?.length || 0}
                    </p>
                  </>
                )}
              </div>
              <Button
                onClick={() => logout()}
                disabled={isLoggingOut}
                variant="destructive"
                className="mt-4"
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </AuthenticatedLayout>
  );
}