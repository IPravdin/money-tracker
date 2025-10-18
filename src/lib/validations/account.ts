import { z } from "zod";
import { AccountType } from "@/types/enums";

// Supported currencies
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "UAH"] as const;

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50, "Account name must be less than 50 characters"),
  type: z.enum([
    AccountType.PERSONAL,
    AccountType.FAMILY,
    AccountType.SAVINGS,
    AccountType.BUSINESS,
    AccountType.INVESTMENT,
    AccountType.EMERGENCY_FUND,
  ], {
    errorMap: () => ({ message: "Please select a valid account type" }),
  }),
  defaultCurrency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: "Please select a supported currency" }),
  }),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50, "Account name must be less than 50 characters").optional(),
  type: z.enum([
    AccountType.PERSONAL,
    AccountType.FAMILY,
    AccountType.SAVINGS,
    AccountType.BUSINESS,
    AccountType.INVESTMENT,
    AccountType.EMERGENCY_FUND,
  ]).optional(),
  defaultCurrency: z.enum(SUPPORTED_CURRENCIES).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

// Helper function to get currency symbol
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    UAH: "₴",
  };
  return symbols[currency] || currency;
};

// Helper function to get account type display name
export const getAccountTypeDisplayName = (type: AccountType): string => {
  const displayNames: Record<AccountType, string> = {
    [AccountType.PERSONAL]: "Personal",
    [AccountType.FAMILY]: "Family",
    [AccountType.SAVINGS]: "Savings",
    [AccountType.BUSINESS]: "Business",
    [AccountType.INVESTMENT]: "Investment",
    [AccountType.EMERGENCY_FUND]: "Emergency Fund",
  };
  return displayNames[type];
};