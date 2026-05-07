"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { EditTransactionForm } from "@/components/forms/EditTransactionForm";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { Transaction } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function TransactionsPage() {
  const { data: accounts } = useAccounts();
  const currentAccount = useCurrentAccount(accounts || []);
  const currentAccountId = currentAccount?.id;
  const { data: transactions, isLoading } = useTransactions(currentAccountId);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditSheetOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleAddSuccess = () => {
    setAddSheetOpen(false);
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setSelectedTransaction(null);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Transactions"
        description="Track your income and expenses"
        action={{
          label: "Add Transaction",
          onClick: () => setAddSheetOpen(true),
        }}
      />

      <TransactionList
        transactions={transactions || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyAction={{
          label: "Add Transaction",
          onClick: () => setAddSheetOpen(true),
        }}
      />

      {/* Add Transaction Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Transaction</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <AddTransactionForm
              defaultAccountId={currentAccountId}
              onSuccess={handleAddSuccess}
              onCancel={() => setAddSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Transaction Sheet */}
      {selectedTransaction && (
        <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <EditTransactionForm
                transaction={selectedTransaction}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={selectedTransaction}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </AuthenticatedLayout>
  );
}