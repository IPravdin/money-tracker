"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCreateAccount } from "@/hooks/useAccounts";
import { createAccountSchema, CreateAccountInput, SUPPORTED_CURRENCIES, getAccountTypeDisplayName, getCurrencySymbol } from "@/lib/validations/account";
import { AccountType } from "@/types/enums";
import { Account } from "@/types";
import { AlertCircle, CheckCircle } from "lucide-react";

interface AddAccountFormProps {
  onSuccess?: (account: Account, isFirstAccount: boolean) => void;
  onCancel?: () => void;
  className?: string;
}

export function AddAccountForm({ onSuccess, onCancel, className }: AddAccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createAccountMutation = useCreateAccount();

  const form = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      type: AccountType.PERSONAL,
      defaultCurrency: "USD",
    },
  });

  const onSubmit = async (data: CreateAccountInput) => {
    try {
      setError(null);
      const result = await createAccountMutation.mutateAsync(data);
      form.reset();
      onSuccess?.(result.account, result.isFirstAccount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    }
  };

  const accountTypes = Object.values(AccountType);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create New Account</CardTitle>
        <CardDescription>
          Add a new account to organize your finances
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
              disabled={createAccountMutation.isPending}
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
              disabled={createAccountMutation.isPending}
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
              disabled={createAccountMutation.isPending}
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
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={createAccountMutation.isPending}
              className="flex-1"
            >
              {createAccountMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createAccountMutation.isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}