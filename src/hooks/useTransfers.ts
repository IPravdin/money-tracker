import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transfer } from "@/types";
import { CreateTransferInput, UpdateTransferInput } from "@/lib/validations/transfer";

interface TransferWithAccounts extends Transfer {
  sourceAccount: {
    id: string;
    name: string;
    type: string;
    defaultCurrency: string;
  } | null;
  targetAccount: {
    id: string;
    name: string;
    type: string;
    defaultCurrency: string;
  } | null;
  transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    category: string;
    description?: string;
    date: Date;
    type: string;
    accountId: string;
    account: {
      id: string;
      name: string;
      type: string;
      defaultCurrency: string;
    };
  }>;
}

// Fetch all transfers
export function useTransfers(accountId?: string) {
  return useQuery({
    queryKey: accountId ? ["transfers", accountId] : ["transfers"],
    queryFn: async (): Promise<TransferWithAccounts[]> => {
      const url = accountId
        ? `/api/transfers?accountId=${accountId}`
        : "/api/transfers";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch transfers");
      }
      const data = await response.json();
      return data.transfers;
    },
  });
}

// Fetch a specific transfer
export function useTransfer(transferId: string) {
  return useQuery({
    queryKey: ["transfers", transferId],
    queryFn: async (): Promise<TransferWithAccounts> => {
      const response = await fetch(`/api/transfers/${transferId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transfer");
      }
      const data = await response.json();
      return data.transfer;
    },
    enabled: !!transferId,
  });
}

// Create transfer mutation
export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateTransferInput
    ): Promise<{ transfer: TransferWithAccounts }> => {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create transfer");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// Update transfer mutation
export function useUpdateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transferId,
      data,
    }: {
      transferId: string;
      data: UpdateTransferInput;
    }): Promise<TransferWithAccounts> => {
      const response = await fetch(`/api/transfers/${transferId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update transfer");
      }

      const result = await response.json();
      return result.transfer;
    },
    onSuccess: (transfer) => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transfers", transfer.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// Delete transfer mutation
export function useDeleteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferId: string): Promise<void> => {
      const response = await fetch(`/api/transfers/${transferId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete transfer");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
