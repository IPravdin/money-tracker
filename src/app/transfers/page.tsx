"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { TransferList } from "@/components/transfers/TransferList";
import { AddTransferForm } from "@/components/forms/AddTransferForm";
import { DeleteTransferDialog } from "@/components/transfers/DeleteTransferDialog";
import { useTransfers } from "@/hooks/useTransfers";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function TransfersPage() {
  const { data: accounts } = useAccounts();
  const currentAccount = useCurrentAccount(accounts || []);
  const currentAccountId = currentAccount?.id;
  const { data: transfers, isLoading } = useTransfers(currentAccountId);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);

  const handleDelete = (transfer: any) => {
    setSelectedTransfer(transfer);
    setDeleteDialogOpen(true);
  };

  const handleAddSuccess = () => {
    setAddSheetOpen(false);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedTransfer(null);
  };

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Transfers"
        description="Transfer money between your accounts"
        action={{
          label: "New Transfer",
          onClick: () => setAddSheetOpen(true),
        }}
      />

      <TransferList
        transfers={transfers || []}
        isLoading={isLoading}
        onDelete={handleDelete}
        emptyAction={{
          label: "Create Transfer",
          onClick: () => setAddSheetOpen(true),
        }}
      />

      {/* Add Transfer Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Transfer</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <AddTransferForm
              defaultSourceAccountId={currentAccountId}
              onSuccess={handleAddSuccess}
              onCancel={() => setAddSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Transfer Dialog */}
      <DeleteTransferDialog
        transfer={selectedTransfer}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </AuthenticatedLayout>
  );
}
