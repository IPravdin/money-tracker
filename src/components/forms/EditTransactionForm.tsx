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
import { useUpdateTransaction } from "@/hooks/useTransactions";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import {
  updateTransactionSchema,
  UpdateTransactionInput,
} from "@/lib/validations/transaction";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/validations/account";
import { TransactionType } from "@/types/enums";
import { Transaction } from "@/types";
import { AlertCircle, Save } from "lucide-react";
import { CategoryPicker, CreateCategoryDialog } from "@/components/categories";
import { CategoryDefinition } from "@/lib/categories";

interface EditTransactionFormProps {
  transaction: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function EditTransactionForm({
  transaction,
  onSuccess,
  onCancel,
  className,
}: EditTransactionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const updateTransactionMutation = useUpdateTransaction();
  const { customCategories, addCategory } = useCustomCategories();

  const form = useForm<UpdateTransactionInput>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      amount: transaction.amount,
      currency: transaction.currency as (typeof SUPPORTED_CURRENCIES)[number],
      category: transaction.category,
      description: transaction.description || "",
      date: new Date(transaction.date),
      type: transaction.type,
    },
  });

  const selectedType = form.watch("type") || transaction.type;

  // Handle custom category creation
  const handleCreateCategory = (category: CategoryDefinition) => {
    addCategory(category);
    form.setValue("category", category.name);
    setShowCreateCategory(false);
  };

  const onSubmit = async (data: UpdateTransactionInput) => {
    try {
      setError(null);
      await updateTransactionMutation.mutateAsync({
        transactionId: transaction.id,
        data,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transaction");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Edit Transaction</CardTitle>
        <CardDescription>Update transaction details</CardDescription>
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
              disabled={updateTransactionMutation.isPending}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
                disabled={updateTransactionMutation.isPending}
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
                disabled={updateTransactionMutation.isPending}
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
              value={form.watch("category") || ""}
              onChange={(value) => form.setValue("category", value)}
              type={selectedType}
              customCategories={customCategories}
              onCreateCategory={() => setShowCreateCategory(true)}
              disabled={updateTransactionMutation.isPending}
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
              disabled={updateTransactionMutation.isPending}
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
              disabled={updateTransactionMutation.isPending}
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
              disabled={updateTransactionMutation.isPending}
              className="flex-1"
            >
              {updateTransactionMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={updateTransactionMutation.isPending}
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
