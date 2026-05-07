import { z } from "zod";
import { TransactionType } from "@/types/enums";
import { SUPPORTED_CURRENCIES } from "./account";

// Transaction validation schema
export const createTransactionSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a valid number"),
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: "Please select a supported currency" }),
  }),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  date: z.coerce.date().refine(
    (date) => date <= new Date(),
    "Date cannot be in the future"
  ),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE], {
    errorMap: () => ({ message: "Please select a valid transaction type" }),
  }),
  accountId: z.string().min(1, "Account is required"),
});

export const updateTransactionSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a valid number")
    .optional(),
  currency: z.enum(SUPPORTED_CURRENCIES).optional(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  date: z.coerce
    .date()
    .refine((date) => date <= new Date(), "Date cannot be in the future")
    .optional(),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

// Predefined categories (kept for backward compatibility)
export const PREDEFINED_CATEGORIES = {
  EXPENSE: [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Travel",
    "Education",
    "Gifts & Donations",
    "Personal Care",
    "Uncategorized",
  ],
  INCOME: [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Refund",
    "Other Income",
  ],
} as const;

// Helper function to get categories by transaction type (backward compatibility)
export const getCategoriesByType = (type: TransactionType): readonly string[] => {
  return type === TransactionType.INCOME
    ? PREDEFINED_CATEGORIES.INCOME
    : PREDEFINED_CATEGORIES.EXPENSE;
};

/**
 * Validate category against predefined and custom categories
 * Returns the category name or "Uncategorized" if empty/invalid
 */
export const validateAndNormalizeCategory = (
  category: string | undefined | null,
  type: TransactionType,
  customCategories: string[] = []
): string => {
  // If no category provided, return Uncategorized
  if (!category || category.trim().length === 0) {
    return "Uncategorized";
  }

  const trimmedCategory = category.trim();
  
  // Get predefined categories for the type
  const predefinedCategories = getCategoriesByType(type);
  
  // Check if it's a valid predefined or custom category
  const allCategories = [...predefinedCategories, ...customCategories];
  const isValid = allCategories.some(
    (cat) => cat.toLowerCase() === trimmedCategory.toLowerCase()
  );
  
  // Return the category if valid, otherwise return Uncategorized
  return isValid ? trimmedCategory : "Uncategorized";
};

// Helper function to format transaction amount with currency
// Uses the centralized currency service for consistent formatting
export const formatTransactionAmount = (
  amount: number,
  currency: string,
  type: TransactionType
): string => {
  const { formatCurrency } = require("@/lib/currency");
  const sign = type === TransactionType.EXPENSE ? -1 : 1;
  return formatCurrency(amount * sign, currency, { showSign: true });
};
