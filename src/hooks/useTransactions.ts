import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@/types";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/lib/validations/transaction";

interface TransactionWithRelations extends Transaction {
  account: {
    id: string;
    name: string;
    type: string;
  };
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Fetch all transactions
export function useTransactions(accountId?: string) {
  return useQuery({
    queryKey: ["transactions", accountId],
    queryFn: async (): Promise<TransactionWithRelations[]> => {
      const url = accountId
        ? `/api/transactions?accountId=${accountId}`
        : "/api/transactions";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      return data.transactions;
    },
  });
}

// Fetch a specific transaction
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: ["transactions", transactionId],
    queryFn: async (): Promise<TransactionWithRelations> => {
      const response = await fetch(`/api/transactions/${transactionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transaction");
      }
      const data = await response.json();
      return data.transaction;
    },
    enabled: !!transactionId,
  });
}

// Create transaction mutation
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateTransactionInput
    ): Promise<TransactionWithRelations> => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create transaction");
      }

      const result = await response.json();
      return result.transaction;
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transactions", transaction.accountId],
      });
    },
  });
}

// Update transaction mutation
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: UpdateTransactionInput;
    }): Promise<TransactionWithRelations> => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update transaction");
      }

      const result = await response.json();
      return result.transaction;
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transactions", transaction.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", transaction.accountId],
      });
    },
  });
}

// Delete transaction mutation
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string): Promise<void> => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete transaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
