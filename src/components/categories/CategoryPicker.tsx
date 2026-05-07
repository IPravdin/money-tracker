"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CategoryDefinition,
  getCategoriesByType,
  getCategoryOrFallback,
} from "@/lib/categories";
import { TransactionType } from "@/types/enums";
import { Check, ChevronDown, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
  type: TransactionType;
  customCategories?: CategoryDefinition[];
  onCreateCategory?: () => void;
  disabled?: boolean;
  className?: string;
}

export function CategoryPicker({
  value,
  onChange,
  type,
  customCategories = [],
  onCreateCategory,
  disabled = false,
  className,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);

  const categories = getCategoriesByType(type, customCategories);
  const selectedCategory = getCategoryOrFallback(value, customCategories);
  const SelectedIcon = selectedCategory.icon;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Category</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded"
                style={{ backgroundColor: selectedCategory.color }}
              >
                <SelectedIcon className="h-4 w-4 text-white" />
              </div>
              <span>{selectedCategory.name}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              <div className="grid gap-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = category.name === value;

                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 h-auto py-2",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => {
                        onChange(category.name);
                        setOpen(false);
                      }}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded"
                        style={{ backgroundColor: category.color }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="flex-1 text-left">{category.name}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </Button>
                  );
                })}
              </div>

              {onCreateCategory && (
                <>
                  <div className="my-2 border-t" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setOpen(false);
                      onCreateCategory();
                    }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-dashed border-muted-foreground">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span>Create Custom Category</span>
                  </Button>
                </>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
