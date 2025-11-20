"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getFxRates } from "./currency";

const serializeTransaction = (obj: any): any => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

interface TransactionData {
  type: "INCOME" | "EXPENSE";
  amount: string | number;
  description?: string;
  date: string;
  category: string;
  accountId: string;
  isRecurring?: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  status?: "PENDING" | "COMPLETED" | "FAILED";
  currency?: "NPR" | "USD";
}

interface UpdateTransactionData extends TransactionData {
  id: string;
}

const getAllUserTransactionsCached = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      include: {
        account: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const serializedTransactions = transactions.map((transaction) => ({
      ...serializeTransaction(transaction),
      account: transaction.account,
    }));

    return serializedTransactions;
  },
  ["all-user-transactions"],
  {
    revalidate: 10,
    tags: ["transactions", "recurring"],
  }
);

export async function getAllUserTransactions() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await getAllUserTransactionsCached(userId);
  } catch (error: any) {
    console.error(error.message);
    return [];
  }
}

export async function bulkDeleteTransactions(transactionIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc: Record<string, number>, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount.toNumber()
          : -transaction.amount.toNumber();
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {} as Record<string, number>);

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    revalidatePath("/accountInfo");
    revalidatePath("/transaction");
    revalidateTag("dashboard");
    revalidateTag("transactions");
    revalidateTag("accounts");
    revalidateTag("account-detail");
    revalidateTag("recurring");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTransaction(data: TransactionData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const account = await db.account.findFirst({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account not found");

    const amountFloat = parseFloat(data.amount.toString());
    if (isNaN(amountFloat) || amountFloat <= 0) {
      throw new Error("Invalid amount");
    }

    const currency = data.currency ?? "NPR";
    let normalizedAmount = amountFloat;

    if (currency === "USD") {
      const fx = await getFxRates();
      normalizedAmount = amountFloat * fx.nprPerUsd;
    }

    const transactionDate = new Date(data.date);

    let nextRecurringDate: Date | null = null;
    if (data.isRecurring && data.recurringInterval) {
      nextRecurringDate = new Date(transactionDate);
      switch (data.recurringInterval) {
        case "DAILY":
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 1);
          break;
        case "WEEKLY":
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 7);
          break;
        case "MONTHLY":
          nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 1);
          break;
        case "YEARLY":
          nextRecurringDate.setFullYear(nextRecurringDate.getFullYear() + 1);
          break;
      }
    }

    const result = await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: normalizedAmount,
          description: data.description || null,
          date: transactionDate,
          category: data.category,
          accountId: data.accountId,
          userId: user.id,
          isRecurring: data.isRecurring || false,
          recurringInterval: data.recurringInterval || null,
          nextRecurringDate: nextRecurringDate,
          status: data.status || "COMPLETED",
        },
      });

      const balanceChange =
        data.type === "INCOME" ? normalizedAmount : -normalizedAmount;
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return transaction;
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    revalidatePath("/accountInfo");
    revalidatePath("/transaction");
    revalidateTag("dashboard");
    revalidateTag("transactions");
    revalidateTag("accounts");
    revalidateTag("account-detail");
    revalidateTag("recurring");

    return { success: true, data: serializeTransaction(result) };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateTransaction(data: UpdateTransactionData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const existing = await db.transaction.findFirst({
      where: {
        id: data.id,
        userId: user.id,
      },
    });

    if (!existing) throw new Error("Transaction not found");

    const targetAccount = await db.account.findFirst({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!targetAccount) throw new Error("Account not found");

    const amountFloat = parseFloat(data.amount.toString());
    if (isNaN(amountFloat) || amountFloat <= 0) {
      throw new Error("Invalid amount");
    }

    const currency = data.currency ?? "NPR";
    let normalizedAmount = amountFloat;

    if (currency === "USD") {
      const fx = await getFxRates();
      normalizedAmount = amountFloat * fx.nprPerUsd;
    }

    const transactionDate = new Date(data.date);

    let nextRecurringDate: Date | null = null;
    if (data.isRecurring && data.recurringInterval) {
      nextRecurringDate = new Date(transactionDate);
      switch (data.recurringInterval) {
        case "DAILY":
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 1);
          break;
        case "WEEKLY":
          nextRecurringDate.setDate(nextRecurringDate.getDate() + 7);
          break;
        case "MONTHLY":
          nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 1);
          break;
        case "YEARLY":
          nextRecurringDate.setFullYear(nextRecurringDate.getFullYear() + 1);
          break;
      }
    }

    const originalAmount = existing.amount.toNumber();
    const originalSign = existing.type === "INCOME" ? 1 : -1;
    const newSign = data.type === "INCOME" ? 1 : -1;

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: existing.id },
        data: {
          type: data.type,
          amount: normalizedAmount,
          description: data.description || null,
          date: transactionDate,
          category: data.category,
          accountId: data.accountId,
          isRecurring: data.isRecurring || false,
          recurringInterval: data.recurringInterval || null,
          nextRecurringDate,
          status: data.status || "COMPLETED",
        },
      });

      if (existing.accountId === data.accountId) {
        const delta = newSign * normalizedAmount - originalSign * originalAmount;

        if (delta !== 0) {
          await tx.account.update({
            where: { id: data.accountId },
            data: {
              balance: {
                increment: delta,
              },
            },
          });
        }
      } else {
        await tx.account.update({
          where: { id: existing.accountId },
          data: {
            balance: {
              increment: -originalSign * originalAmount,
            },
          },
        });

        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: newSign * normalizedAmount,
            },
          },
        });
      }

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    revalidatePath("/accountInfo");
    revalidatePath("/transaction");
    revalidateTag("dashboard");
    revalidateTag("transactions");
    revalidateTag("accounts");
    revalidateTag("account-detail");
    revalidateTag("recurring");

    return { success: true, data: serializeTransaction(result) };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
