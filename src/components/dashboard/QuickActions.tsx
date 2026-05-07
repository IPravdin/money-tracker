"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { TransactionType } from "@/types/enums";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";

interface QuickActionsProps {
  currentAccountId?: string;
  className?: string;
}

export function QuickActions({ currentAccountId, className }: QuickActionsProps) {
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const handleIncomeSuccess = () => {
    setAddIncomeOpen(false);
  };

  const handleExpenseSuccess = () => {
    setAddExpenseOpen(false);
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Add transactions quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAddIncomeOpen(true)}
              disabled={!currentAccountId}
              className="bg-green-600 hover:bg-green-700"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Add Income
            </Button>
            <Button
              variant="outline"
              onClick={() => setAddExpenseOpen(true)}
              disabled={!currentAccountId}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button
              variant="outline"
              disabled={!currentAccountId}
              title="Transfer functionality coming soon"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer Money
            </Button>
          </div>
          {!currentAccountId && (
            <p className="text-sm text-muted-foreground mt-2">
              Please select or create an account to add transactions
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Income Sheet */}
      <Sheet open={addIncomeOpen} onOpenChange={setAddIncomeOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Income</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <AddTransactionForm
              defaultAccountId={currentAccountId}
              defaultType={TransactionType.INCOME}
              onSuccess={handleIncomeSuccess}
              onCancel={() => setAddIncomeOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Expense Sheet */}
      <Sheet open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Expense</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <AddTransactionForm
              defaultAccountId={currentAccountId}
              defaultType={TransactionType.EXPENSE}
              onSuccess={handleExpenseSuccess}
              onCancel={() => setAddExpenseOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
