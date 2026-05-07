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
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import {
  createTransactionSchema,
  CreateTransactionInput,
} from "@/lib/validations/transaction";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/validations/account";
import { TransactionType } from "@/types/enums";
import { AlertCircle, CheckCircle } from "lucide-react";
import { CategoryPicker, CreateCategoryDialog } from "@/components/categories";
import { CategoryDefinition } from "@/lib/categories";

interface AddTransactionFormProps {
  defaultAccountId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AddTransactionForm({
  defaultAccountId,
  onSuccess,
  onCancel,
  className,
}: AddTransactionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const createTransactionMutation = useCreateTransaction();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { customCategories, addCategory } = useCustomCategories();

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: 0,
      currency: "USD",
      category: "",
      description: "",
      date: new Date(),
      type: TransactionType.EXPENSE,
      accountId: defaultAccountId || "",
    },
  });

  const selectedType = form.watch("type");
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

  const onSubmit = async (data: CreateTransactionInput) => {
    try {
      setError(null);
      await createTransactionMutation.mutateAsync(data);
      form.reset({
        amount: 0,
        currency: data.currency,
        category: "",
        description: "",
        date: new Date(),
        type: data.type,
        accountId: data.accountId,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
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
              You need to create an account first before adding transactions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
        <CardDescription>Record your income or expense</CardDescription>
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
            <Label htmlFor="type">Transaction Type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => {
                form.setValue("type", value as TransactionType);
                form.setValue("category", ""); // Reset category when type changes
              }}
              disabled={createTransactionMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
                <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={handleAccountChange}
              disabled={createTransactionMutation.isPending}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
                disabled={createTransactionMutation.isPending}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
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
                disabled={createTransactionMutation.isPending}
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

          <div className="space-y-2">
            <CategoryPicker
              value={form.watch("category")}
              onChange={(value) => form.setValue("category", value)}
              type={selectedType}
              customCategories={customCategories}
              onCreateCategory={() => setShowCreateCategory(true)}
              disabled={createTransactionMutation.isPending}
            />
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              {...form.register("date")}
              disabled={createTransactionMutation.isPending}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Add a note about this transaction"
              {...form.register("description")}
              disabled={createTransactionMutation.isPending}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={createTransactionMutation.isPending}
              className="flex-1"
            >
              {createTransactionMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Add Transaction
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createTransactionMutation.isPending}
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
              defaultType={selectedType}
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
