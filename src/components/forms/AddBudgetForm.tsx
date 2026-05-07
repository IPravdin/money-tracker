"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCreateBudget } from "@/hooks/useBudgets";
import { useAccounts } from "@/hooks/useAccounts";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import {
  createBudgetSchema,
  CreateBudgetInput,
} from "@/lib/validations/budget";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/validations/account";
import { AlertCircle, CheckCircle } from "lucide-react";
import { CategoryPicker, CreateCategoryDialog } from "@/components/categories";
import { TransactionType } from "@/types/enums";
import { CategoryDefinition } from "@/lib/categories";

interface AddBudgetFormProps {
  defaultAccountId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AddBudgetForm({
  defaultAccountId,
  onSuccess,
  onCancel,
  className,
}: AddBudgetFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const createBudgetMutation = useCreateBudget();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { customCategories, addCategory } = useCustomCategories();

  const form = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      category: "",
      monthlyLimit: 0,
      currency: "USD",
      accountId: defaultAccountId || "",
    },
  });

  const selectedAccountId = form.watch("accountId");

  // Handle custom category creation
  const handleCreateCategory = (category: CategoryDefinition) => {
    addCategory(category);
    form.setValue("category", category.name);
    setShowCreateCategory(false);
  };

  // Update currency when account changes
  const handleAccountChange = (accountId: string) => {
    form.setValue("accountId", accountId);
    const account = accounts?.find((a) => a.id === accountId);
    if (account) {
      form.setValue("currency", account.defaultCurrency as (typeof SUPPORTED_CURRENCIES)[number]);
    }
  };

  const onSubmit = async (data: CreateBudgetInput) => {
    try {
      setError(null);
      await createBudgetMutation.mutateAsync(data);
      form.reset({
        category: "",
        monthlyLimit: 0,
        currency: data.currency,
        accountId: data.accountId,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget");
    }
  };

  if (accountsLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner className="h-8 w-8" />
        </CardContent>
      </Card>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to create an account first before adding budgets.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create Budget</CardTitle>
        <CardDescription>Set a monthly spending limit for a category</CardDescription>
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
            <Label htmlFor="accountId">Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={handleAccountChange}
              disabled={createBudgetMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accountId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.accountId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <CategoryPicker
              value={form.watch("category")}
              onChange={(value) => form.setValue("category", value)}
              type={TransactionType.EXPENSE}
              customCategories={customCategories}
              onCreateCategory={() => setShowCreateCategory(true)}
              disabled={createBudgetMutation.isPending}
              label="Category"
            />
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyLimit">Monthly Limit</Label>
              <Input
                id="monthlyLimit"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("monthlyLimit", { valueAsNumber: true })}
                disabled={createBudgetMutation.isPending}
              />
              {form.formState.errors.monthlyLimit && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.monthlyLimit.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={form.watch("currency")}
                onValueChange={(value) =>
                  form.setValue("currency", value as (typeof SUPPORTED_CURRENCIES)[number])
                }
                disabled={createBudgetMutation.isPending}
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
              {form.formState.errors.currency && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currency.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={createBudgetMutation.isPending}
              className="flex-1"
            >
              {createBudgetMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Budget
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createBudgetMutation.isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Create Category Dialog */}
        <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
          <DialogContent className="max-w-2xl">
            <CreateCategoryDialog
              defaultType={TransactionType.EXPENSE}
              customCategories={customCategories}
              onCreateCategory={handleCreateCategory}
              onCancel={() => setShowCreateCategory(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
