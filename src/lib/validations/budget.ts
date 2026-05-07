import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "./account";

export const createBudgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  monthlyLimit: z
    .number()
    .positive("Monthly limit must be greater than 0")
    .max(999999999.99, "Monthly limit is too large"),
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: "Please select a supported currency" }),
  }),
  accountId: z.string().min(1, "Account is required"),
});

export const updateBudgetSchema = z.object({
  category: z.string().min(1, "Category is required").optional(),
  monthlyLimit: z
    .number()
    .positive("Monthly limit must be greater than 0")
    .max(999999999.99, "Monthly limit is too large")
    .optional(),
  currency: z.enum(SUPPORTED_CURRENCIES).optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
