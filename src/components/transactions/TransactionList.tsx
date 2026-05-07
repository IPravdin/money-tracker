"use client";

import { Transaction } from "@/types";
import { TransactionItem } from "./TransactionItem";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CreditCard } from "lucide-react";

interface TransactionListProps {
  transactions: (Transaction & {
    account?: {
      id: string;
      name: string;
      type: string;
    };
  })[];
  isLoading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onClick?: (transaction: Transaction) => void;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export function TransactionList({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  onClick,
  emptyMessage = "No transactions yet",
  emptyAction,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className="h-6 w-6 text-muted-foreground" />}
        title={emptyMessage}
        description="Start tracking your finances by adding your first transaction."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
