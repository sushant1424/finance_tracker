"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import { subMonths, startOfMonth } from "date-fns";

interface SpendingCategoryPoint {
  category: string;
  amount: number;
}

interface SpendingStats {
  chartData: SpendingCategoryPoint[];
  total: number;
  topCategory: string | null;
}

const getSpendingByCategoryCached = unstable_cache(
  async (userId: string): Promise<SpendingStats> => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const now = new Date();
    const since = subMonths(startOfMonth(now), 2); // last 3 months including current

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: since,
          lte: now,
        },
      },
      orderBy: { date: "desc" },
    });

    const byCategory: Record<string, number> = {};

    transactions.forEach((tx) => {
      const key = tx.category || "Uncategorized";
      const amount = tx.amount.toNumber();
      byCategory[key] = (byCategory[key] || 0) + amount;
    });

    const chartData = Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const total = chartData.reduce((sum, item) => sum + item.amount, 0);
    const topCategory = chartData[0]?.category ?? null;

    return {
      chartData,
      total,
      topCategory,
    };
  },
  ["spending-by-category"],
  {
    revalidate: 10,
    tags: ["statistics", "spending"],
  }
);

export async function getSpendingByCategory(): Promise<SpendingStats> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return getSpendingByCategoryCached(userId);
}
