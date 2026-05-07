import { TransactionType } from "@/types/enums";
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  Plane,
  GraduationCap,
  Gift,
  Sparkles,
  DollarSign,
  Briefcase,
  TrendingUp,
  Package,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: TransactionType;
  isCustom: boolean;
}

// Predefined expense categories with icons and colors
export const PREDEFINED_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  {
    id: "food-dining",
    name: "Food & Dining",
    icon: Utensils,
    color: "#ef4444", // red-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: Car,
    color: "#3b82f6", // blue-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: ShoppingBag,
    color: "#ec4899", // pink-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: Film,
    color: "#8b5cf6", // violet-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "bills-utilities",
    name: "Bills & Utilities",
    icon: Receipt,
    color: "#f59e0b", // amber-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Heart,
    color: "#10b981", // emerald-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "travel",
    name: "Travel",
    icon: Plane,
    color: "#06b6d4", // cyan-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    color: "#6366f1", // indigo-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "gifts-donations",
    name: "Gifts & Donations",
    icon: Gift,
    color: "#f43f5e", // rose-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
  {
    id: "personal-care",
    name: "Personal Care",
    icon: Sparkles,
    color: "#a855f7", // purple-500
    type: TransactionType.EXPENSE,
    isCustom: false,
  },
];

// Predefined income categories with icons and colors
export const PREDEFINED_INCOME_CATEGORIES: CategoryDefinition[] = [
  {
    id: "salary",
    name: "Salary",
    icon: DollarSign,
    color: "#22c55e", // green-500
    type: TransactionType.INCOME,
    isCustom: false,
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: Briefcase,
    color: "#14b8a6", // teal-500
    type: TransactionType.INCOME,
    isCustom: false,
  },
  {
    id: "investment",
    name: "Investment",
    icon: TrendingUp,
    color: "#3b82f6", // blue-500
    type: TransactionType.INCOME,
    isCustom: false,
  },
  {
    id: "gift",
    name: "Gift",
    icon: Gift,
    color: "#f43f5e", // rose-500
    type: TransactionType.INCOME,
    isCustom: false,
  },
  {
    id: "refund",
    name: "Refund",
    icon: Package,
    color: "#8b5cf6", // violet-500
    type: TransactionType.INCOME,
    isCustom: false,
  },
  {
    id: "other-income",
    name: "Other Income",
    icon: DollarSign,
    color: "#10b981", // emerald-500
    type: TransactionType.INCOME,
    isCustom: false,
  },
];

// Uncategorized fallback
export const UNCATEGORIZED_CATEGORY: CategoryDefinition = {
  id: "uncategorized",
  name: "Uncategorized",
  icon: HelpCircle,
  color: "#6b7280", // gray-500
  type: TransactionType.EXPENSE,
  isCustom: false,
};

// All predefined categories
export const PREDEFINED_CATEGORIES = [
  ...PREDEFINED_EXPENSE_CATEGORIES,
  ...PREDEFINED_INCOME_CATEGORIES,
  UNCATEGORIZED_CATEGORY,
];

/**
 * Get categories by transaction type
 */
export function getCategoriesByType(
  type: TransactionType,
  customCategories: CategoryDefinition[] = []
): CategoryDefinition[] {
  const predefined =
    type === TransactionType.INCOME
      ? PREDEFINED_INCOME_CATEGORIES
      : PREDEFINED_EXPENSE_CATEGORIES;

  const custom = customCategories.filter((cat) => cat.type === type);

  return [...predefined, ...custom];
}

/**
 * Get all categories (predefined + custom)
 */
export function getAllCategories(
  customCategories: CategoryDefinition[] = []
): CategoryDefinition[] {
  return [...PREDEFINED_CATEGORIES, ...customCategories];
}

/**
 * Find category by name
 */
export function findCategoryByName(
  name: string,
  customCategories: CategoryDefinition[] = []
): CategoryDefinition | undefined {
  const allCategories = getAllCategories(customCategories);
  return allCategories.find(
    (cat) => cat.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Find category by ID
 */
export function findCategoryById(
  id: string,
  customCategories: CategoryDefinition[] = []
): CategoryDefinition | undefined {
  const allCategories = getAllCategories(customCategories);
  return allCategories.find((cat) => cat.id === id);
}

/**
 * Validate category name
 */
export function validateCategoryName(
  name: string,
  customCategories: CategoryDefinition[] = []
): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Category name is required" };
  }

  if (name.length > 50) {
    return { valid: false, error: "Category name must be less than 50 characters" };
  }

  const existingCategory = findCategoryByName(name, customCategories);
  if (existingCategory) {
    return { valid: false, error: "Category already exists" };
  }

  return { valid: true };
}

/**
 * Get category or fallback to Uncategorized
 */
export function getCategoryOrFallback(
  categoryName: string | null | undefined,
  customCategories: CategoryDefinition[] = []
): CategoryDefinition {
  if (!categoryName) {
    return UNCATEGORIZED_CATEGORY;
  }

  const category = findCategoryByName(categoryName, customCategories);
  return category || UNCATEGORIZED_CATEGORY;
}

/**
 * Get category names for validation (backward compatibility)
 */
export function getCategoryNames(type: TransactionType): string[] {
  const categories = getCategoriesByType(type);
  return categories.map((cat) => cat.name);
}

/**
 * Generate a unique ID for custom category
 */
export function generateCategoryId(name: string): string {
  return `custom-${name.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Create a custom category
 */
export function createCustomCategory(
  name: string,
  type: TransactionType,
  icon: LucideIcon = HelpCircle,
  color: string = "#6b7280"
): CategoryDefinition {
  return {
    id: generateCategoryId(name),
    name,
    icon,
    color,
    type,
    isCustom: true,
  };
}

/**
 * Get available colors for custom categories
 */
export const CATEGORY_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Gray", value: "#6b7280" },
];

/**
 * Get available icons for custom categories
 */
export const CATEGORY_ICONS = [
  { name: "Utensils", icon: Utensils },
  { name: "Car", icon: Car },
  { name: "Shopping Bag", icon: ShoppingBag },
  { name: "Film", icon: Film },
  { name: "Receipt", icon: Receipt },
  { name: "Heart", icon: Heart },
  { name: "Plane", icon: Plane },
  { name: "Graduation Cap", icon: GraduationCap },
  { name: "Gift", icon: Gift },
  { name: "Sparkles", icon: Sparkles },
  { name: "Dollar Sign", icon: DollarSign },
  { name: "Briefcase", icon: Briefcase },
  { name: "Trending Up", icon: TrendingUp },
  { name: "Package", icon: Package },
  { name: "Help Circle", icon: HelpCircle },
];
