import { z } from 'zod'
export const accountSchema = z.object({
    name : z.string().min(5,"Name is required"),
    type : z.enum(['SAVINGS','EXPENSE','INCOME']),
    balance : z.string().min(1,"Initial balance is required"),
    isDefault : z.boolean().default(false),
});