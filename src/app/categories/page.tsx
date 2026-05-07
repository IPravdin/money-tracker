"use client";

import { CategoryManagement } from "@/components/categories";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CategoriesPage() {
  const { customCategories, isLoaded, addCategory, removeCategory } =
    useCustomCategories();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <CategoryManagement
        customCategories={customCategories}
        onAddCategory={addCategory}
        onDeleteCategory={removeCategory}
      />
    </div>
  );
}
