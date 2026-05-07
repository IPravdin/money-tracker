"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wallet } from "lucide-react";
import { AddBudgetForm } from "@/components/forms/AddBudgetForm";
import { BudgetList } from "@/components/budgets";
import { useAccounts } from "@/hooks/useAccounts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function BudgetsPage() {
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const { data: accounts, isLoading } = useAccounts();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set spending limits and track your budget progress
          </p>
        </div>
        <Button onClick={() => setShowAddBudget(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Account Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Account</CardTitle>
          <CardDescription>
            View budgets for a specific account or all accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner className="h-6 w-6" />
            </div>
          ) : (
            <Select
              value={selectedAccountId || "all"}
              onValueChange={(value) => setSelectedAccountId(value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an account">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>
                      {selectedAccountId
                        ? accounts?.find((a) => a.id === selectedAccountId)?.name
                        : "All Accounts"}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>All Accounts</span>
                  </div>
                </SelectItem>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>{account.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Budget List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Month</h2>
        <BudgetList accountId={selectedAccountId} />
      </div>

      {/* Add Budget Dialog */}
      <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
        <DialogContent className="max-w-2xl">
          <AddBudgetForm
            defaultAccountId={selectedAccountId}
            onSuccess={() => setShowAddBudget(false)}
            onCancel={() => setShowAddBudget(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
