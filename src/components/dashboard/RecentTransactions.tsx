"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types";
import { TransactionType } from "@/types/enums";
import { getCurrencySymbol } from "@/lib/validations/account";
import { getRecentTransactions, formatRelativeDate } from "@/lib/utils/dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
  className?: string;
}

export function RecentTransactions({
  transactions,
  limit = 5,
  className,
}: RecentTransactionsProps) {
  const recentTransactions = useMemo(
    () => getRecentTransactions(transactions, limit),
    [transactions, limit]
  );

  if (recentTransactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Receipt className="h-6 w-6" />}
            title="No transactions yet"
            description="Start tracking your finances by adding your first transaction"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {transaction.description || transaction.category}
                </p>
                <p className="text-sm text-muted-foreground">{transaction.category}</p>
              </div>
              <div className="text-right ml-4">
                <p
                  className={`font-medium ${
                    transaction.type === TransactionType.INCOME
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === TransactionType.INCOME ? "+" : "-"}
                  {getCurrencySymbol(transaction.currency)}
                  {transaction.amount.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatRelativeDate(transaction.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
