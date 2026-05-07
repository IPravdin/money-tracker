"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import {
  CategoryDefinition,
  PREDEFINED_EXPENSE_CATEGORIES,
  PREDEFINED_INCOME_CATEGORIES,
} from "@/lib/categories";
import { TransactionType } from "@/types/enums";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryManagementProps {
  customCategories: CategoryDefinition[];
  onAddCategory: (category: CategoryDefinition) => void;
  onDeleteCategory: (categoryId: string) => void;
  className?: string;
}

export function CategoryManagement({
  customCategories,
  onAddCategory,
  onDeleteCategory,
  className,
}: CategoryManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const customExpenseCategories = customCategories.filter(
    (cat) => cat.type === TransactionType.EXPENSE
  );
  const customIncomeCategories = customCategories.filter(
    (cat) => cat.type === TransactionType.INCOME
  );

  const handleCreateCategory = (category: CategoryDefinition) => {
    onAddCategory(category);
    setShowCreateDialog(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    onDeleteCategory(categoryId);
    setDeleteConfirm(null);
  };

  const renderCategoryList = (
    categories: CategoryDefinition[],
    title: string,
    type: TransactionType
  ) => {
    const predefinedCategories =
      type === TransactionType.EXPENSE
        ? PREDEFINED_EXPENSE_CATEGORIES
        : PREDEFINED_INCOME_CATEGORIES;
    const customCats = categories.filter((cat) => cat.type === type);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {predefinedCategories.length} predefined,{" "}
                {customCats.length} custom
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setSelectedType(type);
                setShowCreateDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Custom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Predefined Categories */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                Predefined Categories
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {predefinedCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded"
                        style={{ backgroundColor: category.color }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="flex-1 font-medium">{category.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Categories */}
            {customCats.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Custom Categories
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {customCats.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded"
                          style={{ backgroundColor: category.color }}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="flex-1 font-medium">
                          {category.name}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(category.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {customCats.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No custom categories yet. Click "Add Custom" to create one.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Category Management</h2>
        <p className="text-muted-foreground">
          Manage your transaction categories. Create custom categories to better
          organize your finances.
        </p>
      </div>

      <div className="space-y-4">
        {renderCategoryList(
          customCategories,
          "Expense Categories",
          TransactionType.EXPENSE
        )}
        {renderCategoryList(
          customCategories,
          "Income Categories",
          TransactionType.INCOME
        )}
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <CreateCategoryDialog
            defaultType={selectedType}
            customCategories={customCategories}
            onCreateCategory={handleCreateCategory}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this custom category? This action
              cannot be undone. Existing transactions with this category will be
              set to "Uncategorized".
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteCategory(deleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
