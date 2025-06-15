import { z } from "zod";

// Transaction Schema
export const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z
    .string()
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  category: z.string().min(1, "Category is required"),
  date: z.date(),
  isRecurring: z.boolean(),
  recurringInterval: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional()
    .nullable(),
  splits: z
    .array(
      z.object({
        name: z.string().min(1, "Name required"),
        amount: z
          .string()
          .refine((val) => parseFloat(val) > 0, {
            message: "Split amount must be greater than 0",
          }),
        paid: z.boolean().optional(),
      })
    )
    .optional(),
});

// Account Schema
export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  balance: z
    .number()
    .nonnegative("Balance must be 0 or greater"),
});
