"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { AccountType } from "@/lib/generated/prisma";

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

interface AccountData {
  name: string;
  type: AccountType;
  balance: string | number;
  isDefault?: boolean;
}

const getUserAccountsCached = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;
  },
  ["user-accounts"],
  {
    revalidate: 10,
    tags: ["accounts"],
  }
);

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await getUserAccountsCached(userId);
  } catch (error: any) {
    console.error(error.message);
    return [];
  }
}

export async function createAccount(data: AccountData){
  try{
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) throw new Error("User not found");

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance.toString());
    if (isNaN(balanceFloat)){ 
      throw new Error("Invalid Balance");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: {userId: user.id}
    })

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/account");
    revalidateTag("dashboard");
    revalidateTag("accounts");
    return { success: true, data: serializedAccount };
  } catch (error: any){
    throw new Error(error.message);
  }  
}

export async function updateDefaultAccount(accountId: string) {
  try{
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where:{
        id: accountId,
        userId: user.id
      },
      data:{
        isDefault: true
      }
    })

    revalidatePath("/account");
    revalidateTag("dashboard");
    revalidateTag("accounts");
    return {success:true, data: serializeTransaction(account)};
  }
  catch(error: any){
    return {success:false, error: error.message};
  }
}

const getAccountWithTransactionsCached = unstable_cache(
  async (userId: string, accountId: string) => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) return null;

    const serializedAccount = serializeTransaction(account);
    serializedAccount.transactions = account.transactions.map(serializeTransaction);

    return serializedAccount;
  },
  ["account-with-transactions"],
  {
    revalidate: 10,
    tags: ["account-detail"],
  }
);

export async function getAccountWithTransactions(accountId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return getAccountWithTransactionsCached(userId, accountId);
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

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc: Record<string, number>, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount.toNumber()
          : -transaction.amount.toNumber();
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
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
}

export async function createTransaction(data: TransactionData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Verify account belongs to user
    const account = await db.account.findFirst({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account not found");

    // Convert amount to decimal
    const amountFloat = parseFloat(data.amount.toString());
    if (isNaN(amountFloat) || amountFloat <= 0) {
      throw new Error("Invalid amount");
    }

    // Parse date
    const transactionDate = new Date(data.date);

    // Calculate next recurring date if applicable
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

    // Create transaction and update account balance in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: amountFloat,
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

      // Update account balance
      const balanceChange = data.type === "INCOME" ? amountFloat : -amountFloat;
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

export async function deleteAccount(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Verify account belongs to user
    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account not found");

    // Check if this is the only account
    const allAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    if (allAccounts.length === 1) {
      throw new Error("Cannot delete the only account. Please create another account first.");
    }

    // Check if this is the default account
    if (account.isDefault) {
      // Find another account to set as default
      const otherAccount = allAccounts.find((acc) => acc.id !== accountId);
      if (otherAccount) {
        await db.account.update({
          where: { id: otherAccount.id },
          data: { isDefault: true },
        });
      }
    }

    // Delete account and all associated transactions in a transaction
    await db.$transaction(async (tx) => {
      // Delete all transactions associated with this account
      await tx.transaction.deleteMany({
        where: { accountId: accountId },
      });

      // Delete the account
      await tx.account.delete({
        where: { id: accountId },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/account");
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
    throw new Error(error.message);
  }
}