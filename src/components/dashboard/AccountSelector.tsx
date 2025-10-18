"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { AddAccountForm } from "@/components/forms/AddAccountForm";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrentAccount, useAccountSwitcher } from "@/hooks/useCurrentAccount";
import { getAccountTypeDisplayName, getCurrencySymbol } from "@/lib/validations/account";
import { Account } from "@/types";
import { Plus, Wallet, Settings } from "lucide-react";

interface AccountSelectorProps {
  onAccountChange?: (accountId: string) => void;
  showAddButton?: boolean;
  className?: string;
}

export function AccountSelector({ onAccountChange, showAddButton = true, className }: AccountSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: accounts, isLoading, error } = useAccounts();
  const currentAccount = useCurrentAccount(accounts);
  const { switchAccount } = useAccountSwitcher();

  const handleAccountChange = (accountId: string) => {
    switchAccount(accountId);
    onAccountChange?.(accountId);
  };

  const handleAddAccountSuccess = (account: Account) => {
    setShowAddForm(false);
    // Switch to the newly created account
    switchAccount(account.id);
    onAccountChange?.(account.id);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-6">
          <LoadingSpinner className="mr-2" />
          Loading accounts...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title="Failed to load accounts"
            description="There was an error loading your accounts. Please try again."
          />
        </CardContent>
      </Card>
    );
  }

  if (!accounts || accounts.length === 0) {
    if (showAddForm) {
      return (
        <AddAccountForm
          onSuccess={handleAddAccountSuccess}
          onCancel={() => setShowAddForm(false)}
          className={className}
        />
      );
    }

    return (
      <Card className={className}>
        <CardContent className="py-6">
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title="No accounts found"
            description="Create your first account to start tracking your finances."
            action={{
              label: "Create Account",
              onClick: () => setShowAddForm(true),
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (showAddForm) {
    return (
      <AddAccountForm
        onSuccess={handleAddAccountSuccess}
        onCancel={() => setShowAddForm(false)}
        className={className}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Current Account</CardTitle>
            <CardDescription>Select an account to view its data</CardDescription>
          </div>
          {showAddButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={currentAccount?.id || ""}
            onValueChange={handleAccountChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an account">
                {currentAccount && (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="font-medium">{currentAccount.name}</span>
                    <span className="text-muted-foreground">
                      ({getAccountTypeDisplayName(currentAccount.type)})
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="font-medium">{account.name}</span>
                    <span className="text-muted-foreground">
                      ({getAccountTypeDisplayName(account.type)})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getCurrencySymbol(account.defaultCurrency)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentAccount && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentAccount.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getAccountTypeDisplayName(currentAccount.type)} • {getCurrencySymbol(currentAccount.defaultCurrency)} {currentAccount.defaultCurrency}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}