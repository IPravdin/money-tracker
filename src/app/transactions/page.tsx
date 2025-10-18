"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { CreditCard } from "lucide-react"

export default function TransactionsPage() {
  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Transactions"
        description="Track your income and expenses"
        action={{
          label: "Add Transaction",
          onClick: () => console.log("Add transaction"),
        }}
      />
      
      <EmptyState
        icon={<CreditCard className="h-6 w-6 text-muted-foreground" />}
        title="No transactions yet"
        description="Start tracking your finances by adding your first transaction."
        action={{
          label: "Add Transaction",
          onClick: () => console.log("Add transaction"),
        }}
      />
    </AuthenticatedLayout>
  )
}