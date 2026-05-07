"use client";

import { useState, useEffect } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCreateTransfer } from "@/hooks/useTransfers";
import { useAccounts } from "@/hooks/useAccounts";
import {
  createTransferSchema,
  CreateTransferInput,
  calculateTargetAmount,
  isExchangeRateRequired,
} from "@/lib/validations/transfer";
import { getCurrencySymbol } from "@/lib/currency";
import { AlertCircle, ArrowRightLeft, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AddTransferFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  defaultSourceAccountId?: string;
}

export function AddTransferForm({
  onSuccess,
  onCancel,
  className,
  defaultSourceAccountId,
}: AddTransferFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const createTransferMutation = useCreateTransfer();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const form = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      amount: 0,
      sourceAccountId: defaultSourceAccountId || "",
      targetAccountId: "",
      description: "",
      date: new Date(),
      exchangeRate: undefined,
    },
  });

  const sourceAccountId = form.watch("sourceAccountId");
  const targetAccountId = form.watch("targetAccountId");
  const amount = form.watch("amount");
  const exchangeRate = form.watch("exchangeRate");

  const sourceAccount = accounts?.find((a) => a.id === sourceAccountId);
  const targetAccount = accounts?.find((a) => a.id === targetAccountId);

  const needsExchangeRate =
    sourceAccount &&
    targetAccount &&
    isExchangeRateRequired(
      sourceAccount.defaultCurrency,
      targetAccount.defaultCurrency
    );

  // Calculate target amount when amount or exchange rate changes
  useEffect(() => {
    if (amount && needsExchangeRate && exchangeRate) {
      setTargetAmount(calculateTargetAmount(amount, exchangeRate));
    } else if (amount && !needsExchangeRate) {
      setTargetAmount(amount);
    } else {
      setTargetAmount(null);
    }
  }, [amount, exchangeRate, needsExchangeRate]);

  const onSubmit = async (data: CreateTransferInput) => {
    try {
      setError(null);

      // Validate exchange rate for cross-currency transfers
      if (needsExchangeRate && !data.exchangeRate) {
        setError("Exchange rate is required for transfers between different currencies");
        return;
      }

      await createTransferMutation.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transfer");
    }
  };

  // Filter available target accounts (exclude source account)
  const availableTargetAccounts = accounts?.filter(
    (a) => a.id !== sourceAccountId
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Create Transfer
        </CardTitle>
        <CardDescription>
          Transfer money between your accounts
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
            <Label htmlFor="sourceAccountId">From Account</Label>
            <Select
              value={form.watch("sourceAccountId")}
              onValueChange={(value) => {
                form.setValue("sourceAccountId", value);
                // Reset target account if it's the same as source
                if (value === form.watch("targetAccountId")) {
                  form.setValue("targetAccountId", "");
                }
              }}
              disabled={createTransferMutation.isPending || accountsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({getCurrencySymbol(account.defaultCurrency)}{" "}
                    {account.defaultCurrency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.sourceAccountId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.sourceAccountId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAccountId">To Account</Label>
            <Select
              value={form.watch("targetAccountId")}
              onValueChange={(value) => form.setValue("targetAccountId", value)}
              disabled={
                createTransferMutation.isPending ||
                accountsLoading ||
                !sourceAccountId
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target account" />
              </SelectTrigger>
              <SelectContent>
                {availableTargetAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({getCurrencySymbol(account.defaultCurrency)}{" "}
                    {account.defaultCurrency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.targetAccountId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.targetAccountId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount{" "}
              {sourceAccount && (
                <span className="text-muted-foreground">
                  ({getCurrencySymbol(sourceAccount.defaultCurrency)})
                </span>
              )}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("amount", { valueAsNumber: true })}
              disabled={createTransferMutation.isPending}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {needsExchangeRate && (
            <>
              <div className="space-y-2">
                <Label htmlFor="exchangeRate">
                  Exchange Rate (1 {sourceAccount?.defaultCurrency} ={" "}
                  {targetAccount?.defaultCurrency})
                </Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  {...form.register("exchangeRate", { valueAsNumber: true })}
                  disabled={createTransferMutation.isPending}
                />
                {form.formState.errors.exchangeRate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.exchangeRate.message}
                  </p>
                )}
              </div>

              {targetAmount !== null && targetAccount && (
                <Alert>
                  <AlertDescription>
                    Target account will receive:{" "}
                    <strong>
                      {getCurrencySymbol(targetAccount.defaultCurrency)}
                      {targetAmount.toFixed(2)}
                    </strong>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date", {
                setValueAs: (value) => (value ? new Date(value) : new Date()),
              })}
              disabled={createTransferMutation.isPending}
              max={new Date().toISOString().split("T")[0]}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note about this transfer..."
              {...form.register("description")}
              disabled={createTransferMutation.isPending}
              rows={3}
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
              disabled={createTransferMutation.isPending}
              className="flex-1"
            >
              {createTransferMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Creating Transfer...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Transfer
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createTransferMutation.isPending}
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
