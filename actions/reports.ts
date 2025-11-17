"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

interface MonthlyCashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface ReportsData {
  chartData: MonthlyCashflowPoint[];
  totalIncome: number;
  totalExpense: number;
  net: number;
}

const getReportsDataCached = unstable_cache(
  async (userId: string): Promise<ReportsData> => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const now = new Date();
    const startRange = subMonths(startOfMonth(now), 5);
    const endRange = endOfMonth(now);

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startRange,
          lte: endRange,
        },
      },
      orderBy: { date: "asc" },
    });

    const byMonth: Record<
      string,
      { monthKey: string; label: string; income: number; expense: number }
    > = {};

    transactions.forEach((tx) => {
      const monthKey = format(tx.date, "yyyy-MM-01");
      const label = format(tx.date, "MMM yyyy");
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          monthKey,
          label,
          income: 0,
          expense: 0,
        };
      }
      if (tx.type === "INCOME") {
        byMonth[monthKey].income += tx.amount.toNumber();
      } else {
        byMonth[monthKey].expense += tx.amount.toNumber();
      }
    });

    const chartData = Object.values(byMonth)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map((m) => ({
        month: m.label,
        income: m.income,
        expense: m.expense,
        net: m.income - m.expense,
      }));

    const totalIncome = chartData.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = chartData.reduce((sum, m) => sum + m.expense, 0);
    const net = totalIncome - totalExpense;

    return {
      chartData,
      totalIncome,
      totalExpense,
      net,
    };
  },
  ["reports-data"],
  {
    revalidate: 10,
    tags: ["reports"],
  }
);

export async function getReportsData(): Promise<ReportsData> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return getReportsDataCached(userId);
}
