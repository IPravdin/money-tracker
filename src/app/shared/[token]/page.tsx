"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { Eye, TrendingDown, TrendingUp, User } from "lucide-react";

interface Transaction {
  id: string;
  amount: string;
  currency: string;
  category: string;
  description: string | null;
  date: string;
  type: string;
  createdBy: {
    name: string | null;
    email: string;
  } | null;
}

interface Budget {
  id: string;
  category: string;
  monthlyLimit: string;
  currency: string;
}

interface SharedAccount {
  id: string;
  name: string;
  type: string;
  defaultCurrency: string;
  user: {
    name: string | null;
    email: string;
  };
  transactions: Transaction[];
  budgets: Budget[];
}

export default function SharedAccountPage() {
  const params = useParams();
  const token = params.token as string;
  const [account, setAccount] = useState<SharedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedAccount() {
      try {
        const response = await fetch(`/api/accounts/shared/${token}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load shared account");
        }

        const data = await response.json();
        setAccount(data.account);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchSharedAccount();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading shared account...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Account not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate totals
  const totalIncome = account.transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = account.transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <Badge variant="secondary">View Only</Badge>
        </div>
        <h1 className="text-3xl font-bold">{account.name}</h1>
        <p className="text-muted-foreground">
          Shared by {account.user.name || account.user.email}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, account.defaultCurrency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, account.defaultCurrency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance, account.defaultCurrency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets */}
      {account.budgets.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>Monthly budget limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {account.budgets.map((budget) => {
                const spent = account.transactions
                  .filter(t => t.type === "EXPENSE" && t.category === budget.category)
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                const limit = parseFloat(budget.monthlyLimit);
                const percentage = (spent / limit) * 100;

                return (
                  <div key={budget.id}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{budget.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(spent, budget.currency)} / {formatCurrency(limit, budget.currency)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 100 ? 'bg-red-600' : percentage >= 80 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {account.transactions.length} transaction{account.transactions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {account.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {account.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{transaction.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </p>
                      {transaction.createdBy && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{transaction.createdBy.name || transaction.createdBy.email}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(parseFloat(transaction.amount), transaction.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
