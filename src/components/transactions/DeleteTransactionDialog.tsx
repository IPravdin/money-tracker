"use client";

import { useState } from "react";
import { Transaction } from "@/types";
import { useDeleteTransaction } from "@/hooks/useTransactions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, Trash2 } from "lucide-react";
import { formatTransactionAmount } from "@/lib/validations/transaction";

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTransactionDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteTransactionMutation = useDeleteTransaction();

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setError(null);
      await deleteTransactionMutation.mutateAsync(transaction.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
    }
  };

  if (!transaction) return null;

  const formattedAmount = formatTransactionAmount(
    transaction.amount,
    transaction.currency,
    transaction.type
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Delete Transaction</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">{formattedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Category:</span>
              <span className="font-medium">{transaction.category}</span>
            </div>
            {transaction.description && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Description:</span>
                <span className="font-medium">{transaction.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date:</span>
              <span className="font-medium">
                {new Date(transaction.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteTransactionMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTransactionMutation.isPending}
          >
            {deleteTransactionMutation.isPending ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
