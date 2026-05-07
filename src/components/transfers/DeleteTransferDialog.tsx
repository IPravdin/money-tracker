"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTransfer } from "@/hooks/useTransfers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DeleteTransferDialogProps {
  transfer: {
    id: string;
    sourceAccount: {
      name: string;
    } | null;
    targetAccount: {
      name: string;
    } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTransferDialog({
  transfer,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTransferDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteTransferMutation = useDeleteTransfer();

  const handleDelete = async () => {
    if (!transfer) return;

    try {
      setError(null);
      await deleteTransferMutation.mutateAsync(transfer.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transfer");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transfer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transfer from{" "}
            <strong>{transfer?.sourceAccount?.name}</strong> to{" "}
            <strong>{transfer?.targetAccount?.name}</strong>? This will also
            delete the associated transactions in both accounts. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTransferMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTransferMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteTransferMutation.isPending ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
