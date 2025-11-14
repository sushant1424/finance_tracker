import { z } from 'zod'
export const accountSchema = z.object({
    name : z.string().min(5,"Name is required"),
    type : z.enum(['SAVINGS','EXPENSE','INCOME']),
    balance : z.string().min(1,"Initial balance is required"),
    isDefault : z.boolean().default(false),
});

export const transactionSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE'], {
        message: "Transaction type is required",
    }),
    amount: z.string().min(1, "Amount is required").refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Amount must be a positive number"
    ),
    description: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    category: z.string().min(1, "Category is required"),
    accountId: z.string().min(1, "Account is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).default('COMPLETED'),
});