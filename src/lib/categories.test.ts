import { describe, it, expect } from "@jest/globals";
import {
  getCategoriesByType,
  findCategoryByName,
  findCategoryById,
  validateCategoryName,
  getCategoryOrFallback,
  createCustomCategory,
  PREDEFINED_EXPENSE_CATEGORIES,
  PREDEFINED_INCOME_CATEGORIES,
  UNCATEGORIZED_CATEGORY,
} from "./categories";
import { TransactionType } from "@/types/enums";
import { HelpCircle } from "lucide-react";

describe("Category System", () => {
  describe("getCategoriesByType", () => {
    it("should return expense categories for EXPENSE type", () => {
      const categories = getCategoriesByType(TransactionType.EXPENSE);
      expect(categories).toHaveLength(PREDEFINED_EXPENSE_CATEGORIES.length);
      expect(categories[0].name).toBe("Food & Dining");
    });

    it("should return income categories for INCOME type", () => {
      const categories = getCategoriesByType(TransactionType.INCOME);
      expect(categories).toHaveLength(PREDEFINED_INCOME_CATEGORIES.length);
      expect(categories[0].name).toBe("Salary");
    });

    it("should include custom categories when provided", () => {
      const customCategory = createCustomCategory(
        "Pet Care",
        TransactionType.EXPENSE
      );
      const categories = getCategoriesByType(TransactionType.EXPENSE, [
        customCategory,
      ]);
      expect(categories).toHaveLength(
        PREDEFINED_EXPENSE_CATEGORIES.length + 1
      );
      expect(categories[categories.length - 1].name).toBe("Pet Care");
    });
  });

  describe("findCategoryByName", () => {
    it("should find predefined category by name", () => {
      const category = findCategoryByName("Food & Dining");
      expect(category).toBeDefined();
      expect(category?.name).toBe("Food & Dining");
    });

    it("should find category case-insensitively", () => {
      const category = findCategoryByName("food & dining");
      expect(category).toBeDefined();
      expect(category?.name).toBe("Food & Dining");
    });

    it("should return undefined for non-existent category", () => {
      const category = findCategoryByName("Non-existent");
      expect(category).toBeUndefined();
    });

    it("should find custom category", () => {
      const customCategory = createCustomCategory(
        "Pet Care",
        TransactionType.EXPENSE
      );
      const category = findCategoryByName("Pet Care", [customCategory]);
      expect(category).toBeDefined();
      expect(category?.name).toBe("Pet Care");
      expect(category?.isCustom).toBe(true);
    });
  });

  describe("findCategoryById", () => {
    it("should find predefined category by ID", () => {
      const category = findCategoryById("food-dining");
      expect(category).toBeDefined();
      expect(category?.name).toBe("Food & Dining");
    });

    it("should find custom category by ID", () => {
      const customCategory = createCustomCategory(
        "Pet Care",
        TransactionType.EXPENSE
      );
      const category = findCategoryById(customCategory.id, [customCategory]);
      expect(category).toBeDefined();
      expect(category?.name).toBe("Pet Care");
    });

    it("should return undefined for non-existent ID", () => {
      const category = findCategoryById("non-existent");
      expect(category).toBeUndefined();
    });
  });

  describe("validateCategoryName", () => {
    it("should validate a new category name", () => {
      const result = validateCategoryName("Pet Care");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject empty category name", () => {
      const result = validateCategoryName("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Category name is required");
    });

    it("should reject whitespace-only category name", () => {
      const result = validateCategoryName("   ");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Category name is required");
    });

    it("should reject category name that is too long", () => {
      const longName = "a".repeat(51);
      const result = validateCategoryName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "Category name must be less than 50 characters"
      );
    });

    it("should reject duplicate predefined category name", () => {
      const result = validateCategoryName("Food & Dining");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Category already exists");
    });

    it("should reject duplicate custom category name", () => {
      const customCategory = createCustomCategory(
        "Pet Care",
        TransactionType.EXPENSE
      );
      const result = validateCategoryName("Pet Care", [customCategory]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Category already exists");
    });

    it("should reject duplicate category name case-insensitively", () => {
      const result = validateCategoryName("food & dining");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Category already exists");
    });
  });

  describe("getCategoryOrFallback", () => {
    it("should return the category if it exists", () => {
      const category = getCategoryOrFallback("Food & Dining");
      expect(category.name).toBe("Food & Dining");
    });

    it("should return Uncategorized for null category", () => {
      const category = getCategoryOrFallback(null);
      expect(category).toEqual(UNCATEGORIZED_CATEGORY);
    });

    it("should return Uncategorized for undefined category", () => {
      const category = getCategoryOrFallback(undefined);
      expect(category).toEqual(UNCATEGORIZED_CATEGORY);
    });

    it("should return Uncategorized for empty string", () => {
      const category = getCategoryOrFallback("");
      expect(category).toEqual(UNCATEGORIZED_CATEGORY);
    });

    it("should return Uncategorized for non-existent category", () => {
      const category = getCategoryOrFallback("Non-existent");
      expect(category).toEqual(UNCATEGORIZED_CATEGORY);
    });

    it("should find custom category", () => {
      const customCategory = createCustomCategory(
        "Pet Care",
        TransactionType.EXPENSE
      );
      const category = getCategoryOrFallback("Pet Care", [customCategory]);
      expect(category.name).toBe("Pet Care");
      expect(category.isCustom).toBe(true);
    });
  });

  describe("createCustomCategory", () => {
    it("should create a custom expense category", () => {
      const category = createCustomCategory("Pet Care", TransactionType.EXPENSE);
      expect(category.name).toBe("Pet Care");
      expect(category.type).toBe(TransactionType.EXPENSE);
      expect(category.isCustom).toBe(true);
      expect(category.id).toBe("custom-pet-care");
    });

    it("should create a custom income category", () => {
      const category = createCustomCategory("Bonus", TransactionType.INCOME);
      expect(category.name).toBe("Bonus");
      expect(category.type).toBe(TransactionType.INCOME);
      expect(category.isCustom).toBe(true);
      expect(category.id).toBe("custom-bonus");
    });

    it("should use default icon and color if not provided", () => {
      const category = createCustomCategory("Pet Care", TransactionType.EXPENSE);
      expect(category.icon).toBe(HelpCircle);
      expect(category.color).toBe("#6b7280");
    });

    it("should handle category names with multiple spaces", () => {
      const category = createCustomCategory(
        "Pet   Care",
        TransactionType.EXPENSE
      );
      expect(category.id).toBe("custom-pet-care");
    });
  });

  describe("Predefined Categories", () => {
    it("should have all required expense categories", () => {
      const categoryNames = PREDEFINED_EXPENSE_CATEGORIES.map((c) => c.name);
      expect(categoryNames).toContain("Food & Dining");
      expect(categoryNames).toContain("Transportation");
      expect(categoryNames).toContain("Shopping");
      expect(categoryNames).toContain("Entertainment");
      expect(categoryNames).toContain("Bills & Utilities");
      expect(categoryNames).toContain("Healthcare");
      expect(categoryNames).toContain("Travel");
      expect(categoryNames).toContain("Education");
      expect(categoryNames).toContain("Gifts & Donations");
      expect(categoryNames).toContain("Personal Care");
    });

    it("should have all required income categories", () => {
      const categoryNames = PREDEFINED_INCOME_CATEGORIES.map((c) => c.name);
      expect(categoryNames).toContain("Salary");
      expect(categoryNames).toContain("Freelance");
      expect(categoryNames).toContain("Investment");
      expect(categoryNames).toContain("Gift");
      expect(categoryNames).toContain("Refund");
      expect(categoryNames).toContain("Other Income");
    });

    it("should have icons and colors for all predefined categories", () => {
      [...PREDEFINED_EXPENSE_CATEGORIES, ...PREDEFINED_INCOME_CATEGORIES].forEach(
        (category) => {
          expect(category.icon).toBeDefined();
          expect(category.color).toBeDefined();
          expect(category.color).toMatch(/^#[0-9a-f]{6}$/i);
        }
      );
    });
  });
});
