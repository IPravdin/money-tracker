import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Budget } from "@/types";
import { CreateBudgetInput, UpdateBudgetInput } from "@/lib/validations/budget";

interface BudgetWithAccount extends Budget {
  account: {
    id: string;
    name: string;
    type: string;
  };
}

// Fetch all budgets
export function useBudgets(accountId?: string) {
  return useQuery({
    queryKey: accountId ? ["budgets", accountId] : ["budgets"],
    queryFn: async (): Promise<BudgetWithAccount[]> => {
      const url = accountId ? `/api/budgets?accountId=${accountId}` : "/api/budgets";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }
      const data = await response.json();
      return data.budgets;
    },
  });
}

// Fetch a specific budget
export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: ["budgets", budgetId],
    queryFn: async (): Promise<BudgetWithAccount> => {
      const response = await fetch(`/api/budgets/${budgetId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch budget");
      }
      const data = await response.json();
      return data.budget;
    },
    enabled: !!budgetId,
  });
}

// Create budget mutation
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetInput): Promise<BudgetWithAccount> => {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create budget");
      }

      const result = await response.json();
      return result.budget;
    },
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", budget.accountId] });
    },
  });
}

// Update budget mutation
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ budgetId, data }: { budgetId: string; data: UpdateBudgetInput }): Promise<BudgetWithAccount> => {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update budget");
      }

      const result = await response.json();
      return result.budget;
    },
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", budget.id] });
      queryClient.invalidateQueries({ queryKey: ["budgets", budget.accountId] });
    },
  });
}

// Delete budget mutation
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetId: string): Promise<void> => {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete budget");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
