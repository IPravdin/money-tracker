"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  validateCategoryName,
  CategoryDefinition,
} from "@/lib/categories";
import { TransactionType } from "@/types/enums";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  color: z.string().min(1, "Please select a color"),
  iconName: z.string().min(1, "Please select an icon"),
});

type CreateCategoryInput = z.infer<typeof createCategorySchema>;

interface CreateCategoryDialogProps {
  defaultType: TransactionType;
  customCategories: CategoryDefinition[];
  onCreateCategory: (category: CategoryDefinition) => void;
  onCancel: () => void;
  className?: string;
}

export function CreateCategoryDialog({
  defaultType,
  customCategories,
  onCreateCategory,
  onCancel,
  className,
}: CreateCategoryDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: defaultType,
      color: CATEGORY_COLORS[0].value,
      iconName: CATEGORY_ICONS[0].name,
    },
  });

  const selectedColor = form.watch("color");
  const selectedIconName = form.watch("iconName");
  const selectedIcon = CATEGORY_ICONS.find((i) => i.name === selectedIconName);
  const SelectedIconComponent = selectedIcon?.icon;

  const onSubmit = async (data: CreateCategoryInput) => {
    try {
      setError(null);
      setIsSubmitting(true);

      // Validate category name
      const validation = validateCategoryName(data.name, customCategories);
      if (!validation.valid) {
        setError(validation.error || "Invalid category name");
        setIsSubmitting(false);
        return;
      }

      // Find the selected icon
      const icon = CATEGORY_ICONS.find((i) => i.name === data.iconName);
      if (!icon) {
        setError("Invalid icon selected");
        setIsSubmitting(false);
        return;
      }

      // Create the category
      const newCategory: CategoryDefinition = {
        id: `custom-${data.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: data.name,
        icon: icon.icon,
        color: data.color,
        type: data.type,
        isCustom: true,
      };

      onCreateCategory(newCategory);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Create Custom Category</h3>
        <p className="text-sm text-muted-foreground">
          Add a new category with a custom name, icon, and color
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            placeholder="e.g., Pet Care, Subscriptions"
            {...form.register("name")}
            disabled={isSubmitting}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(value) => form.setValue("type", value as TransactionType)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
              <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-destructive">
              {form.formState.errors.type.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORY_ICONS.map((iconOption) => {
              const IconComponent = iconOption.icon;
              const isSelected = iconOption.name === selectedIconName;

              return (
                <button
                  key={iconOption.name}
                  type="button"
                  onClick={() => form.setValue("iconName", iconOption.name)}
                  disabled={isSubmitting}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-md border-2 transition-colors hover:bg-accent",
                    isSelected
                      ? "border-primary bg-accent"
                      : "border-transparent"
                  )}
                >
                  <IconComponent className="h-6 w-6" />
                </button>
              );
            })}
          </div>
          {form.formState.errors.iconName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.iconName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="grid grid-cols-6 gap-2">
            {CATEGORY_COLORS.map((colorOption) => {
              const isSelected = colorOption.value === selectedColor;

              return (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => form.setValue("color", colorOption.value)}
                  disabled={isSubmitting}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md border-2 transition-all",
                    isSelected
                      ? "border-primary scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                >
                  {isSelected && <Check className="h-5 w-5 text-white" />}
                </button>
              );
            })}
          </div>
          {form.formState.errors.color && (
            <p className="text-sm text-destructive">
              {form.formState.errors.color.message}
            </p>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <Label className="text-sm text-muted-foreground">Preview</Label>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: selectedColor }}
            >
              {SelectedIconComponent && (
                <SelectedIconComponent className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {form.watch("name") || "Category Name"}
              </p>
              <p className="text-sm text-muted-foreground">
                {form.watch("type") === TransactionType.INCOME
                  ? "Income"
                  : "Expense"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
