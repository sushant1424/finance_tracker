"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";

export type BudgetPeriod = "MONTHLY" | "WEEKLY" | "YEARLY";

export interface CategoryBudgetStat {
  category: string;
  budgetAmount: number | null;
  spent: number;
  remaining: number;
  overspent: boolean;
}

export interface BudgetOverview {
  period: BudgetPeriod;
  year: number;
  month?: number;
  week?: number;
  budgetAmount: number | null;
  spent: number;
  remaining: number;
  overspent: boolean;
  categories: CategoryBudgetStat[];
  rolloverLeftover?: number | null;
  autoSuggestedTotal?: number | null;
  autoSuggestedCategories?: { category: string; amount: number }[];
  projectedSpend?: number | null;
  projectedOverBy?: number | null;
}

interface SaveBudgetCategoryInput {
  category: string;
  amount: string | number;
}

export interface SaveBudgetInput {
  period?: BudgetPeriod;
  year?: number;
  month?: number;
  week?: number;
  amount: string | number;
  categories?: SaveBudgetCategoryInput[];
}

function getPeriodFromDate(period: BudgetPeriod, baseDate: Date) {
  const year = baseDate.getFullYear();
  if (period === "MONTHLY") {
    return {
      period,
      year,
      month: baseDate.getMonth() + 1,
      week: undefined,
    };
  }
  if (period === "YEARLY") {
    return {
      period,
      year,
      month: undefined,
      week: undefined,
    };
  }
  const onejan = new Date(baseDate.getFullYear(), 0, 1);
  const millisInDay = 24 * 60 * 60 * 1000;
  const week = Math.ceil(
    ((baseDate.getTime() - onejan.getTime()) / millisInDay + onejan.getDay() + 1) /
      7
  );
  return {
    period,
    year,
    month: undefined,
    week,
  };
}

function getDateRangeForPeriod(period: BudgetPeriod, year: number, month?: number, week?: number) {
  if (period === "MONTHLY") {
    const m = month ?? new Date().getMonth() + 1;
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59, 999);
    return { start, end };
  }
  if (period === "YEARLY") {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return { start, end };
  }
  const base = new Date(year, 0, 1);
  const millisInDay = 24 * 60 * 60 * 1000;
  const targetWeek = week ?? 1;
  const start = new Date(base.getTime() + (targetWeek - 1) * 7 * millisInDay);
  const end = new Date(start.getTime() + 6 * millisInDay);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getPreviousPeriod(
  period: BudgetPeriod,
  year: number,
  month?: number,
  week?: number
) {
  if (period === "MONTHLY") {
    const m = month ?? new Date().getMonth() + 1;
    let prevYear = year;
    let prevMonth = m - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    return { year: prevYear, month: prevMonth, week: undefined as number | undefined };
  }

  if (period === "YEARLY") {
    return { year: year - 1, month: undefined as number | undefined, week: undefined as number | undefined };
  }

  const currentWeek = week ?? 1;
  if (currentWeek > 1) {
    return { year, month: undefined as number | undefined, week: currentWeek - 1 };
  }

  // Simple fallback: go to previous year, last week number approximation
  return { year: year - 1, month: undefined as number | undefined, week: 52 };
}

const getBudgetOverviewCached = unstable_cache(
  async (
    userId: string,
    period: BudgetPeriod,
    year: number,
    month?: number,
    week?: number
  ): Promise<BudgetOverview> => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { start, end } = getDateRangeForPeriod(period, year, month, week);

    const prevKeys = getPreviousPeriod(period, year, month, week);
    const { start: prevStart, end: prevEnd } = getDateRangeForPeriod(
      period,
      prevKeys.year,
      prevKeys.month,
      prevKeys.week
    );

    const historyStart = new Date(start);
    historyStart.setMonth(historyStart.getMonth() - 3);

    const [
      budget,
      transactions,
      previousBudget,
      previousTransactions,
      historyTransactions,
    ] = await Promise.all([
      db.budget.findFirst({
        where: {
          userId: user.id,
          period,
          year,
          month: period === "MONTHLY" ? month : null,
          week: period === "WEEKLY" ? week : null,
        },
        include: {
          categories: true,
        },
      }),
      db.transaction.findMany({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
      db.budget.findFirst({
        where: {
          userId: user.id,
          period,
          year: prevKeys.year,
          month: period === "MONTHLY" ? prevKeys.month : null,
          week: period === "WEEKLY" ? prevKeys.week : null,
        },
      }),
      db.transaction.findMany({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: prevStart,
            lte: prevEnd,
          },
        },
      }),
      db.transaction.findMany({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: historyStart,
            lte: end,
          },
        },
      }),
    ]);

    const budgetAmount = budget ? budget.amount.toNumber() : null;

    const spent = transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);
    const remaining = budgetAmount !== null ? budgetAmount - spent : 0;
    const overspent = budgetAmount !== null ? spent > budgetAmount : false;

    const spentByCategory = transactions.reduce<Record<string, number>>((acc, t) => {
      const category = t.category || "uncategorized";
      acc[category] = (acc[category] || 0) + t.amount.toNumber();
      return acc;
    }, {});

    const categoryStats: CategoryBudgetStat[] = [];

    const budgetCategories = budget?.categories ?? [];

    for (const bc of budgetCategories) {
      const category = bc.category;
      const catBudgetAmount = bc.amount.toNumber();
      const catSpent = spentByCategory[category] ?? 0;
      const catRemaining = catBudgetAmount - catSpent;
      const catOverspent = catSpent > catBudgetAmount;
      categoryStats.push({
        category,
        budgetAmount: catBudgetAmount,
        spent: catSpent,
        remaining: catRemaining,
        overspent: catOverspent,
      });
      delete spentByCategory[category];
    }

    for (const [category, catSpent] of Object.entries(spentByCategory)) {
      categoryStats.push({
        category,
        budgetAmount: null,
        spent: catSpent,
        remaining: -catSpent,
        overspent: false,
      });
    }

    categoryStats.sort((a, b) => b.spent - a.spent);

    // Rollover from previous period
    let rolloverLeftover: number | null = null;
    if (previousBudget) {
      const prevBudgetAmount = previousBudget.amount.toNumber();
      const prevSpent = previousTransactions.reduce(
        (sum, t) => sum + t.amount.toNumber(),
        0
      );
      const leftover = prevBudgetAmount - prevSpent;
      if (leftover > 0) {
        rolloverLeftover = leftover;
      }
    }

    // Auto-budget suggestions from last ~3 months
    const historyTotals = historyTransactions.reduce<Record<string, number>>((acc, t) => {
      const category = t.category || "uncategorized";
      acc[category] = (acc[category] || 0) + t.amount.toNumber();
      return acc;
    }, {});

    const monthsWindow = 3;
    const autoSuggestedCategories = Object.entries(historyTotals)
      .map(([category, total]) => ({
        category,
        amount: total / monthsWindow,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    const autoSuggestedTotal = autoSuggestedCategories.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    // Mid-period projection (only for current month budget)
    let projectedSpend: number | null = null;
    let projectedOverBy: number | null = null;
    if (period === "MONTHLY" && month) {
      const now = new Date();
      if (now.getFullYear() === year && now.getMonth() + 1 === month && budgetAmount && budgetAmount > 0) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const today = now.getDate();
        if (today > 0 && today <= daysInMonth) {
          projectedSpend = (spent / today) * daysInMonth;
          const over = projectedSpend - budgetAmount;
          if (over > 0) {
            projectedOverBy = over;
          }
        }
      }
    }

    return {
      period,
      year,
      month,
      week,
      budgetAmount,
      spent,
      remaining,
      overspent,
      categories: categoryStats,
      rolloverLeftover,
      autoSuggestedTotal:
        autoSuggestedCategories.length > 0 ? autoSuggestedTotal : null,
      autoSuggestedCategories:
        autoSuggestedCategories.length > 0 ? autoSuggestedCategories : undefined,
      projectedSpend,
      projectedOverBy,
    };
  },
  ["budget-overview"],
  {
    revalidate: 15,
    tags: ["budget", "transactions"],
  }
);

export async function getBudgetOverview(period: BudgetPeriod = "MONTHLY") {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const { year, month, week } = getPeriodFromDate(period, now);

  return getBudgetOverviewCached(userId, period, year, month, week);
}

export async function saveBudget(input: SaveBudgetInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const period: BudgetPeriod = input.period ?? "MONTHLY";
  const baseDate = new Date();
  const derivedPeriod = getPeriodFromDate(period, baseDate);

  const year = input.year ?? derivedPeriod.year;
  const month = period === "MONTHLY" ? input.month ?? derivedPeriod.month : undefined;
  const week = period === "WEEKLY" ? input.week ?? derivedPeriod.week : undefined;

  const amountFloat = parseFloat(input.amount.toString());
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new Error("Budget amount must be a positive number");
  }

  const categories = (input.categories ?? [])
    .map((c) => ({
      category: c.category.trim(),
      amount: parseFloat(c.amount.toString()),
    }))
    .filter((c) => c.category && !isNaN(c.amount) && c.amount > 0);

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.budget.findFirst({
      where: {
        userId: user.id,
        period,
        year,
        month: period === "MONTHLY" ? month : null,
        week: period === "WEEKLY" ? week : null,
      },
      include: {
        categories: true,
      },
    });

    if (existing) {
      await tx.budgetCategory.deleteMany({
        where: { budgetId: existing.id },
      });

      const updated = await tx.budget.update({
        where: { id: existing.id },
        data: {
          amount: amountFloat,
          categories: {
            create: categories.map((c) => ({
              category: c.category,
              amount: c.amount,
            })),
          },
        },
        include: { categories: true },
      });

      return updated;
    }

    const created = await tx.budget.create({
      data: {
        userId: user.id,
        period,
        year,
        month: period === "MONTHLY" ? month : null,
        week: period === "WEEKLY" ? week : null,
        amount: amountFloat,
        categories: {
          create: categories.map((c) => ({
            category: c.category,
            amount: c.amount,
          })),
        },
      },
      include: { categories: true },
    });

    return created;
  });

  revalidatePath("/budget");
  revalidateTag("budget");
  revalidateTag("dashboard");

  return {
    success: true,
    data: {
      id: result.id,
    },
  };
}
