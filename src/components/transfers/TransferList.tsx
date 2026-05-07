"use client";

import { TransferItem } from "./TransferItem";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowRightLeft } from "lucide-react";

interface TransferListProps {
  transfers: Array<{
    id: string;
    amount: number;
    sourceCurrency: string;
    targetCurrency: string;
    exchangeRate?: number;
    description?: string;
    date: Date;
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
      type: string;
    }>;
  }>;
  isLoading?: boolean;
  onEdit?: (transfer: any) => void;
  onDelete?: (transfer: any) => void;
  onClick?: (transfer: any) => void;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export function TransferList({
  transfers,
  isLoading,
  onEdit,
  onDelete,
  onClick,
  emptyMessage = "No transfers yet",
  emptyAction,
}: TransferListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <EmptyState
        icon={<ArrowRightLeft className="h-6 w-6 text-muted-foreground" />}
        title={emptyMessage}
        description="Transfer money between your accounts to keep accurate records."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transfers.map((transfer) => (
        <TransferItem
          key={transfer.id}
          transfer={transfer}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
