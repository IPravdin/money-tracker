"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUpdateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { updateBudgetSchema, UpdateBudgetInput } from "@/lib/validations/budget";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/validations/account";
import { Budget } from "@/types";
import { BudgetProgress } from "@/hooks/useBudgetProgress";
import { AlertCircle, Trash2, Save } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface EditBudgetDialogProps {
  budget: Budget;
  progress: BudgetProgress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBudgetDialog({
  budget,
  progress,
  open,
  onOpenChange,
}: EditBudgetDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const form = useForm<UpdateBudgetInput>({
    resolver: zodResolver(updateBudgetSchema),
    defaultValues: {
      category: budget.category,
      monthlyLimit: Number(budget.monthlyLimit),
      currency: budget.currency,
    },
  });

  const onSubmit = async (data: UpdateBudgetInput) => {
    try {
      setError(null);
      await updateBudgetMutation.mutateAsync({
        budgetId: budget.id,
        data,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update budget");
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteBudgetMutation.mutateAsync(budget.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete budget");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update your budget settings or delete this budget
          </DialogDescription>
        </DialogHeader>

        {/* Budget Progress Summary */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Progress</span>
            <span className={`font-semibold ${progress.isExceeded ? "text-destructive" : ""}`}>
              {progress.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent this month</span>
            <span className="font-medium">
              {formatCurrency(progress.spent, budget.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className={`font-medium ${progress.remaining < 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(Math.max(0, progress.remaining), budget.currency)}
            </span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...form.register("category")}
              disabled={updateBudgetMutation.isPending}
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
                {...form.register("monthlyLimit", { valueAsNumber: true })}
                disabled={updateBudgetMutation.isPending}
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
                disabled={updateBudgetMutation.isPending}
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {!showDeleteConfirm ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={updateBudgetMutation.isPending || deleteBudgetMutation.isPending}
                  className="sm:mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateBudgetMutation.isPending || deleteBudgetMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateBudgetMutation.isPending || deleteBudgetMutation.isPending}
                >
                  {updateBudgetMutation.isPending ? (
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
              </>
            ) : (
              <>
                <div className="w-full">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Are you sure you want to delete this budget? This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteBudgetMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteBudgetMutation.isPending}
                >
                  {deleteBudgetMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Confirm Delete
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
