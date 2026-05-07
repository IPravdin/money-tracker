"use client";

import { Transaction } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTransactionAmount } from "@/lib/validations/transaction";
import { TransactionType } from "@/types/enums";
import { Edit, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";

interface TransactionItemProps {
  transaction: Transaction & {
    account?: {
      id: string;
      name: string;
      type: string;
    };
  };
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onClick?: (transaction: Transaction) => void;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  onClick,
}: TransactionItemProps) {
  const isIncome = transaction.type === TransactionType.INCOME;
  const formattedAmount = formatTransactionAmount(
    transaction.amount,
    transaction.currency,
    transaction.type
  );

  return (
    <Card
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onClick?.(transaction)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          >
            {isIncome ? (
              <ArrowUpCircle className="h-5 w-5" />
            ) : (
              <ArrowDownCircle className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{transaction.category}</p>
              {transaction.account && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {transaction.account.name}
                </span>
              )}
            </div>
            {transaction.description && (
              <p className="text-sm text-muted-foreground truncate">
                {transaction.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(transaction.date), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p
              className={`font-semibold ${
                isIncome ? "text-green-600" : "text-red-600"
              }`}
            >
              {formattedAmount}
            </p>
          </div>

          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(transaction)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(transaction)}
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
