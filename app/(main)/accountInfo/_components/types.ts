export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  isRecurring?: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  nextRecurringDate?: string; 
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
} as const;
