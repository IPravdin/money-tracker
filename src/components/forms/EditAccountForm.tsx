"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUpdateAccount, useDeleteAccount } from "@/hooks/useAccounts";
import { updateAccountSchema, UpdateAccountInput, SUPPORTED_CURRENCIES, getAccountTypeDisplayName, getCurrencySymbol } from "@/lib/validations/account";
import { AccountType } from "@/types/enums";
import { Account } from "@/types";
import { AlertCircle, CheckCircle, Trash2, AlertTriangle } from "lucide-react";

interface EditAccountFormProps {
  account: Account;
  onSuccess?: (account: Account) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function EditAccountForm({ account, onSuccess, onDelete, onCancel, className }: EditAccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const form = useForm<UpdateAccountInput>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: account.name,
      type: account.type,
      defaultCurrency: account.defaultCurrency as typeof SUPPORTED_CURRENCIES[number],
    },
  });

  // Reset form when account changes
  useEffect(() => {
    form.reset({
      name: account.name,
      type: account.type,
      defaultCurrency: account.defaultCurrency as typeof SUPPORTED_CURRENCIES[number],
    });
  }, [account, form]);

  const onSubmit = async (data: UpdateAccountInput) => {
    try {
      setError(null);
      const updatedAccount = await updateAccountMutation.mutateAsync({
        accountId: account.id,
        data,
      });
      onSuccess?.(updatedAccount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteAccountMutation.mutateAsync(account.id);
      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setShowDeleteConfirm(false);
    }
  };

  const accountTypes = Object.values(AccountType);
  const isLoading = updateAccountMutation.isPending || deleteAccountMutation.isPending;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Edit Account</CardTitle>
        <CardDescription>
          Update your account settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Personal Checking, Savings, etc."
              {...form.register("name")}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as AccountType)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getAccountTypeDisplayName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultCurrency">Default Currency</Label>
            <Select
              value={form.watch("defaultCurrency")}
              onValueChange={(value) => form.setValue("defaultCurrency", value as typeof SUPPORTED_CURRENCIES[number])}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {getCurrencySymbol(currency)} {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.defaultCurrency && (
              <p className="text-sm text-destructive">
                {form.formState.errors.defaultCurrency.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This will only affect new transactions. Existing transactions will keep their original currency.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {updateAccountMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Account
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Delete Account Section */}
        <div className="mt-8 pt-6 border-t border-destructive/20">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete this account and all its data.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action cannot be undone. This will permanently delete the account and all associated transactions, budgets, and data.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {deleteAccountMutation.isPending ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Yes, Delete Account
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}