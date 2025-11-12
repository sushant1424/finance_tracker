"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get all accounts with transaction count
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get recent transactions (last 4)
    const recentTransactions = await db.transaction.findMany({
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
      take: 4,
    });

    // Get current month's transactions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate statistics
    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance.toNumber(),
      0
    );

    const monthIncome = monthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const monthExpense = monthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    // Get category-wise statistics based on transaction counts and total amount
    const categoryStats = monthTransactions.reduce<
      Record<string, { category: string; amount: number; count: number }>
    >((acc, transaction) => {
      const category = transaction.category || "uncategorized";
      if (!acc[category]) {
        acc[category] = {
          category,
          amount: 0,
          count: 0,
        };
      }
      acc[category].amount += transaction.amount.toNumber();
      acc[category].count += 1;
      return acc;
    }, {});

    const categoryBreakdown = Object.values(categoryStats)
      .sort((a, b) => {
        if (b.count === a.count) {
          return b.amount - a.amount;
        }
        return b.count - a.count;
      })
      .slice(0, 5);

    const categoryBreakdownTotal = categoryBreakdown.reduce(
      (sum, category) => sum + category.amount,
      0
    );

    return {
      totalBalance,
      monthIncome,
      monthExpense,
      accountsCount: accounts.length,
      transactionsCount: recentTransactions.length,
      accounts: accounts.map(serializeTransaction),
      recentTransactions: recentTransactions.map((t) => ({
        ...serializeTransaction(t),
        account: t.account,
      })),
      categoryBreakdown,
      categoryBreakdownTotal,
    };
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
}
