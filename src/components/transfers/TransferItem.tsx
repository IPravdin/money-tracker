"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Edit, Trash2, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";

interface TransferItemProps {
  transfer: {
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
  };
  onEdit?: (transfer: any) => void;
  onDelete?: (transfer: any) => void;
  onClick?: (transfer: any) => void;
}

export function TransferItem({
  transfer,
  onEdit,
  onDelete,
  onClick,
}: TransferItemProps) {
  const isCrossCurrency = transfer.sourceCurrency !== transfer.targetCurrency;
  
  // Find the target amount from transactions
  const targetTransaction = transfer.transactions.find(
    (t) => t.type === "INCOME"
  );
  const targetAmount = targetTransaction?.amount || transfer.amount;

  return (
    <Card
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onClick?.(transfer)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
            <ArrowRightLeft className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {transfer.sourceAccount?.name} → {transfer.targetAccount?.name}
              </p>
              {isCrossCurrency && (
                <span className="text-xs text-muted-foreground bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                  Cross-currency
                </span>
              )}
            </div>
            {transfer.description && (
              <p className="text-sm text-muted-foreground truncate">
                {transfer.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(transfer.date), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold text-blue-600">
              {formatCurrency(transfer.amount, transfer.sourceCurrency)}
            </p>
            {isCrossCurrency && (
              <p className="text-xs text-muted-foreground">
                → {formatCurrency(targetAmount, transfer.targetCurrency)}
              </p>
            )}
            {transfer.exchangeRate && (
              <p className="text-xs text-muted-foreground">
                Rate: {transfer.exchangeRate.toFixed(6)}
              </p>
            )}
          </div>

          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(transfer)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(transfer)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
