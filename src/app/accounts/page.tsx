"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { AddAccountForm } from "@/components/forms/AddAccountForm";
import { EditAccountForm } from "@/components/forms/EditAccountForm";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrentAccount, useAccountSwitcher } from "@/hooks/useCurrentAccount";
import { getAccountTypeDisplayName, getCurrencySymbol } from "@/lib/validations/account";
import { Account } from "@/types";
import { Wallet, Settings, Eye } from "lucide-react";

export default function AccountsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { data: accounts, isLoading, error } = useAccounts();
  const currentAccount = useCurrentAccount(accounts);
  const { switchAccount } = useAccountSwitcher();

  const handleAddAccountSuccess = (account: Account) => {
    setShowAddForm(false);
    // Switch to the newly created account
    switchAccount(account.id);
  };

  const handleEditAccountSuccess = () => {
    setEditingAccount(null);
  };

  const handleDeleteAccount = () => {
    setEditingAccount(null);
    // If the deleted account was the current account, the useCurrentAccount hook
    // will automatically switch to the first available account
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <PageHeader title="Accounts" description="Manage your financial accounts" />
        <EmptyState
          icon={<Wallet className="h-6 w-6" />}
          title="Failed to load accounts"
          description="There was an error loading your accounts. Please try again."
        />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Accounts"
        description="Manage your financial accounts and settings"
        action={{
          label: "Add Account",
          onClick: () => setShowAddForm(true),
        }}
      />

      <div className="space-y-6">
        {/* Add Account Form */}
        {showAddForm && (
          <AddAccountForm
            onSuccess={handleAddAccountSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Edit Account Form */}
        {editingAccount && (
          <EditAccountForm
            account={editingAccount}
            onSuccess={handleEditAccountSuccess}
            onDelete={handleDeleteAccount}
            onCancel={() => setEditingAccount(null)}
          />
        )}

        {/* Accounts List */}
        {!accounts || accounts.length === 0 ? (
          !showAddForm && (
            <EmptyState
              icon={<Wallet className="h-6 w-6" />}
              title="No accounts found"
              description="Create your first account to start tracking your finances."
              action={{
                label: "Create Account",
                onClick: () => setShowAddForm(true),
              }}
            />
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className={`transition-all hover:shadow-md ${
                  currentAccount?.id === account.id
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>
                          {getAccountTypeDisplayName(account.type)}
                        </CardDescription>
                      </div>
                    </div>
                    {currentAccount?.id === account.id && (
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                        <Eye className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          Current
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">
                        {getCurrencySymbol(account.defaultCurrency)} {account.defaultCurrency}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {currentAccount?.id !== account.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => switchAccount(account.id)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Switch To
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAccount(account)}
                        className={currentAccount?.id === account.id ? "flex-1" : ""}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}