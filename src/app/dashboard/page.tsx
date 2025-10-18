"use client";

import { useAuth } from "@/hooks/useAuth";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveGrid } from "@/components/layout/responsive-container";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const { user, logout, isLoggingOut } = useAuth();

  if (!user) {
    return <LoadingPage />;
  }

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name || user.email}!`}
        action={{
          label: "Add Transaction",
          onClick: () => console.log("Add transaction"),
        }}
      />

      {/* Overview Cards */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} className="mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,350.00</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,200.00</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,850.00</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Transfer Money
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Grocery Shopping</p>
                  <p className="text-sm text-muted-foreground">Food & Dining</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">-$85.50</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Salary</p>
                  <p className="text-sm text-muted-foreground">Income</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+$3,200.00</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Gas Station</p>
                  <p className="text-sm text-muted-foreground">Transportation</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">-$45.00</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Your spending vs budget this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Food & Dining</span>
                  <span className="text-sm text-muted-foreground">$285 / $400</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Transportation</span>
                  <span className="text-sm text-muted-foreground">$180 / $200</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Entertainment</span>
                  <span className="text-sm text-muted-foreground">$45 / $150</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
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
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.name && <p><strong>Name:</strong> {user.name}</p>}
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
    </AuthenticatedLayout>
  );
}