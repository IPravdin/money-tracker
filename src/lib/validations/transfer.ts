import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "./account";

// Transfer validation schema
export const createTransferSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a valid number"),
  sourceAccountId: z.string().min(1, "Source account is required"),
  targetAccountId: z.string().min(1, "Target account is required"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  date: z.coerce.date().refine(
    (date) => date <= new Date(),
    "Date cannot be in the future"
  ),
  exchangeRate: z
    .number()
    .positive("Exchange rate must be positive")
    .finite("Exchange rate must be a valid number")
    .optional(),
}).refine(
  (data) => data.sourceAccountId !== data.targetAccountId,
  {
    message: "Source and target accounts must be different",
    path: ["targetAccountId"],
  }
);

export const updateTransferSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a valid number")
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
  exchangeRate: z
    .number()
    .positive("Exchange rate must be positive")
    .finite("Exchange rate must be a valid number")
    .optional()
    .nullable(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type UpdateTransferInput = z.infer<typeof updateTransferSchema>;

/**
 * Calculate the target amount based on source amount and exchange rate
 */
export const calculateTargetAmount = (
  sourceAmount: number,
  exchangeRate: number
): number => {
  return sourceAmount * exchangeRate;
};

/**
 * Validate if exchange rate is required based on currencies
 */
export const isExchangeRateRequired = (
  sourceCurrency: string,
  targetCurrency: string
): boolean => {
  return sourceCurrency !== targetCurrency;
};

/**
 * Format transfer description with account names
 */
export const formatTransferDescription = (
  sourceAccountName: string,
  targetAccountName: string,
  customDescription?: string
): string => {
  const baseDescription = `Transfer from ${sourceAccountName} to ${targetAccountName}`;
  return customDescription
    ? `${baseDescription}: ${customDescription}`
    : baseDescription;
};
