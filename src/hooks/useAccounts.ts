import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Account } from "@/types";
import { CreateAccountInput, UpdateAccountInput } from "@/lib/validations/account";

// Fetch all accounts
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      const response = await fetch("/api/accounts");
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const data = await response.json();
      return data.accounts;
    },
  });
}

// Fetch a specific account
export function useAccount(accountId: string) {
  return useQuery({
    queryKey: ["accounts", accountId],
    queryFn: async (): Promise<Account> => {
      const response = await fetch(`/api/accounts/${accountId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch account");
      }
      const data = await response.json();
      return data.account;
    },
    enabled: !!accountId,
  });
}

// Create account mutation
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountInput): Promise<{ account: Account; isFirstAccount: boolean }> => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create account");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// Update account mutation
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, data }: { accountId: string; data: UpdateAccountInput }): Promise<Account> => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update account");
      }

      const result = await response.json();
      return result.account;
    },
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts", account.id] });
    },
  });
}

// Delete account mutation
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string): Promise<void> => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}