"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { subDays, subMonths, startOfDay, startOfMonth, endOfMonth, format } from "date-fns";
import { unstable_cache } from "next/cache";

interface AdminUserStats {
  totalUsers: number;
  newUsersLast7d: number;
  activeUsers24h: number;
  activeUsers7d: number;
}

interface AdminTransactionTrendPoint {
  monthKey: string;
  month: string;
  count: number;
}

interface AdminTransactionStats {
  totalTransactions: number;
  transactionsToday: number;
  monthlyTransactionTrend: AdminTransactionTrendPoint[];
}

interface AdminCashflowPoint {
  monthKey: string;
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface AdminCashflowStats {
  totalIncome: number;
  totalExpense: number;
  monthlyNetCashflow: AdminCashflowPoint[];
}

export interface AdminDashboardData {
  userStats: AdminUserStats;
  transactionStats: AdminTransactionStats;
  cashflowStats: AdminCashflowStats;
}

interface DailyCountPoint {
  date: string;
  count: number;
}

interface DailyActiveUsersPoint {
  date: string;
  activeUsers: number;
}

interface MonthlyUserGrowthPoint {
  monthKey: string;
  month: string;
  newUsers: number;
}

interface PopularCategoryPoint {
  category: string;
  totalAmount: number;
  transactionCount: number;
}

export interface AdminAnalyticsData {
  dailyNewUsers: DailyCountPoint[];
  dailyNewTransactions: DailyCountPoint[];
  dailyActiveUsers: DailyActiveUsersPoint[];
  monthlyUserGrowth: MonthlyUserGrowthPoint[];
  popularCategories: PopularCategoryPoint[];
  avgMonthlySpendingPerUser: number;
  avgTransactionsPerUser: number;
}

async function ensureAuthenticated() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await ensureAuthenticated();

  const getCached = unstable_cache(
    async () => {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const startToday = startOfDay(now);
      const rangeStart = subMonths(startOfMonth(now), 5);
      const rangeEnd = endOfMonth(now);

      const [
        totalUsers,
        newUsersLast7d,
        totalTransactions,
        transactionsToday,
        transactionsInRange,
        active24hGroups,
        active7dGroups,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        }),
        db.transaction.count(),
        db.transaction.count({
          where: {
            date: {
              gte: startToday,
            },
          },
        }),
        db.transaction.findMany({
          where: {
            date: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          select: {
            type: true,
            amount: true,
            date: true,
            userId: true,
          },
          orderBy: {
            date: "asc",
          },
        }),
        db.transaction.groupBy({
          by: ["userId"],
          where: {
            date: {
              gte: subDays(now, 1),
            },
          },
          _count: {
            _all: true,
          },
        }),
        db.transaction.groupBy({
          by: ["userId"],
          where: {
            date: {
              gte: sevenDaysAgo,
            },
          },
          _count: {
            _all: true,
          },
        }),
      ]);

      const activeUsers24h = active24hGroups.length;
      const activeUsers7d = active7dGroups.length;

      const byMonth: Record<
        string,
        {
          monthKey: string;
          label: string;
          transactionCount: number;
          income: number;
          expense: number;
        }
      > = {};

      let totalIncome = 0;
      let totalExpense = 0;

      for (const tx of transactionsInRange) {
        const monthKey = format(tx.date, "yyyy-MM-01");
        const label = format(tx.date, "MMM yyyy");

        if (!byMonth[monthKey]) {
          byMonth[monthKey] = {
            monthKey,
            label,
            transactionCount: 0,
            income: 0,
            expense: 0,
          };
        }

        const amountNumber = tx.amount.toNumber();

        byMonth[monthKey].transactionCount += 1;

        if (tx.type === "INCOME") {
          byMonth[monthKey].income += amountNumber;
          totalIncome += amountNumber;
        } else {
          byMonth[monthKey].expense += amountNumber;
          totalExpense += amountNumber;
        }
      }

      const monthlyPoints = Object.values(byMonth).sort((a, b) =>
        a.monthKey.localeCompare(b.monthKey)
      );

      const monthlyTransactionTrend: AdminTransactionTrendPoint[] = monthlyPoints.map(
        (m) => ({
          monthKey: m.monthKey,
          month: m.label,
          count: m.transactionCount,
        })
      );

      const monthlyNetCashflow: AdminCashflowPoint[] = monthlyPoints.map((m) => ({
        monthKey: m.monthKey,
        month: m.label,
        income: m.income,
        expense: m.expense,
        net: m.income - m.expense,
      }));

      return {
        userStats: {
          totalUsers,
          newUsersLast7d,
          activeUsers24h,
          activeUsers7d,
        },
        transactionStats: {
          totalTransactions,
          transactionsToday,
          monthlyTransactionTrend,
        },
        cashflowStats: {
          totalIncome,
          totalExpense,
          monthlyNetCashflow,
        },
      } satisfies AdminDashboardData;
    },
    ["admin-dashboard-data"],
    { revalidate: 30, tags: ["admin-dashboard"] }
  );

  return getCached();
}

export async function getAdminAnalyticsData(): Promise<AdminAnalyticsData> {
  await ensureAuthenticated();

  const getCached = unstable_cache(
    async () => {
      const now = new Date();
      const start30 = subDays(startOfDay(now), 29);
      const start6M = subMonths(startOfMonth(now), 5);
      const endRange = endOfMonth(now);

      const [usersLast6M, transactionsLast6M, totalUsers, totalTransactions] =
        await Promise.all([
          db.user.findMany({
            where: {
              createdAt: {
                gte: start6M,
                lte: endRange,
              },
            },
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          }),
          db.transaction.findMany({
            where: {
              date: {
                gte: start6M,
                lte: endRange,
              },
            },
            select: {
              date: true,
              type: true,
              amount: true,
              category: true,
              userId: true,
            },
            orderBy: {
              date: "asc",
            },
          }),
          db.user.count(),
          db.transaction.count(),
        ]);

      const byDayUsers: Record<string, number> = {};

      for (const user of usersLast6M) {
        const dateKey = format(user.createdAt, "yyyy-MM-dd");
        byDayUsers[dateKey] = (byDayUsers[dateKey] || 0) + 1;
      }

      const byDayTransactions: Record<string, number> = {};
      const dailyActiveMap: Record<string, Set<string>> = {};

      const byMonthTransactions: Record<
        string,
        {
          monthKey: string;
          label: string;
          income: number;
          expense: number;
          transactionCount: number;
        }
      > = {};

      const categoryStats: Record<string, PopularCategoryPoint> = {};
      const spendingUsers = new Set<string>();

      for (const tx of transactionsLast6M) {
        const dateKey = format(tx.date, "yyyy-MM-dd");
        const monthKey = format(tx.date, "yyyy-MM-01");
        const monthLabel = format(tx.date, "MMM yyyy");

        if (!byMonthTransactions[monthKey]) {
          byMonthTransactions[monthKey] = {
            monthKey,
            label: monthLabel,
            income: 0,
            expense: 0,
            transactionCount: 0,
          };
        }

        const amountNumber = tx.amount.toNumber();

        byMonthTransactions[monthKey].transactionCount += 1;

        if (tx.type === "INCOME") {
          byMonthTransactions[monthKey].income += amountNumber;
        } else {
          byMonthTransactions[monthKey].expense += amountNumber;
          spendingUsers.add(tx.userId);

          if (!categoryStats[tx.category]) {
            categoryStats[tx.category] = {
              category: tx.category,
              totalAmount: 0,
              transactionCount: 0,
            };
          }

          categoryStats[tx.category].totalAmount += amountNumber;
          categoryStats[tx.category].transactionCount += 1;
        }

        if (tx.date >= start30) {
          byDayTransactions[dateKey] = (byDayTransactions[dateKey] || 0) + 1;

          if (!dailyActiveMap[dateKey]) {
            dailyActiveMap[dateKey] = new Set<string>();
          }

          dailyActiveMap[dateKey].add(tx.userId);
        }
      }

      const dailyNewUsers: DailyCountPoint[] = [];
      const dailyNewTransactions: DailyCountPoint[] = [];
      const dailyActiveUsers: DailyActiveUsersPoint[] = [];

      for (let i = 0; i < 30; i += 1) {
        const date = subDays(now, 29 - i);
        const dateKey = format(date, "yyyy-MM-dd");

        dailyNewUsers.push({
          date: dateKey,
          count: byDayUsers[dateKey] || 0,
        });

        dailyNewTransactions.push({
          date: dateKey,
          count: byDayTransactions[dateKey] || 0,
        });

        const activeSet = dailyActiveMap[dateKey];

        dailyActiveUsers.push({
          date: dateKey,
          activeUsers: activeSet ? activeSet.size : 0,
        });
      }

      const monthlyUserGrowthMap: Record<string, MonthlyUserGrowthPoint> = {};

      for (const user of usersLast6M) {
        const monthKey = format(user.createdAt, "yyyy-MM-01");
        const label = format(user.createdAt, "MMM yyyy");

        if (!monthlyUserGrowthMap[monthKey]) {
          monthlyUserGrowthMap[monthKey] = {
            monthKey,
            month: label,
            newUsers: 0,
          };
        }

        monthlyUserGrowthMap[monthKey].newUsers += 1;
      }

      const monthlyUserGrowth: MonthlyUserGrowthPoint[] = Object.values(
        monthlyUserGrowthMap
      ).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

      const monthlyTransactionPoints = Object.values(byMonthTransactions).sort(
        (a, b) => a.monthKey.localeCompare(b.monthKey)
      );

      const expenseMonths = monthlyTransactionPoints.filter((m) => m.expense > 0);

      const monthsWithExpenses = expenseMonths.length || 1;

      const totalExpenseAmount = expenseMonths.reduce(
        (sum, m) => sum + m.expense,
        0
      );

      const spendingUsersCount = spendingUsers.size || 1;

      const avgMonthlySpendingPerUser =
        totalExpenseAmount / (monthsWithExpenses * spendingUsersCount);

      const avgTransactionsPerUser =
        totalUsers > 0 ? totalTransactions / totalUsers : 0;

      const popularCategories = Object.values(categoryStats).sort((a, b) => {
        if (b.transactionCount === a.transactionCount) {
          return b.totalAmount - a.totalAmount;
        }

        return b.transactionCount - a.transactionCount;
      });

      return {
        dailyNewUsers,
        dailyNewTransactions,
        dailyActiveUsers,
        monthlyUserGrowth,
        popularCategories,
        avgMonthlySpendingPerUser,
        avgTransactionsPerUser,
      } satisfies AdminAnalyticsData;
    },
    ["admin-analytics-data"],
    { revalidate: 60, tags: ["admin-analytics"] }
  );

  return getCached();
}

export interface AdminUserListItem {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  isSuspended: boolean;
  totalTransactions: number;
  totalAccounts: number;
  totalBudgets: number;
  totalGoals: number;
}

export interface AdminUserDetail extends AdminUserListItem {
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    createdAt: string;
  }[];
  transactions: {
    id: string;
    date: string;
    description: string | null;
    type: "INCOME" | "EXPENSE";
    category: string;
    amount: number;
    isRecurring: boolean;
    recurringInterval: string | null;
    accountId: string;
    accountName: string;
    accountType: string;
  }[];
  recurringTransactions: {
    id: string;
    date: string;
    description: string | null;
    type: "INCOME" | "EXPENSE";
    category: string;
    amount: number;
    recurringInterval: string | null;
    nextRecurringDate: string | null;
    accountId: string;
    accountName: string;
  }[];
  budgets: {
    id: string;
    name: string | null;
    period: string;
    year: number;
    month: number | null;
    week: number | null;
    amount: number;
    createdAt: string;
  }[];
  goals: {
    id: string;
    title: string;
    description: string | null;
    targetAmount: number;
    currentAmount: number;
    status: string;
    dueDate: string | null;
    createdAt: string;
  }[];
  categorySpending: {
    category: string;
    amount: number;
    count: number;
  }[];
}

export async function getAdminUsers(query?: string): Promise<AdminUserListItem[]> {
  await ensureAuthenticated();

  const whereClause = query
    ? {
        OR: [
          {
            email: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
          {
            name: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const users = await db.user.findMany({
    where: whereClause,
    include: {
      _count: {
        select: {
          transactions: true,
          accounts: true,
          budgets: true,
          goals: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const results: AdminUserListItem[] = [];

  for (const user of users) {
    let lastLoginAt: string | null = null;
    let isSuspended = false;

    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(user.clerkUserId);
      const last = clerkUser.lastSignInAt || clerkUser.createdAt;
      lastLoginAt = last ? new Date(last as any).toISOString() : null;
      const publicMetadata = clerkUser.publicMetadata as Record<string, unknown>;
      if (publicMetadata && typeof publicMetadata["suspended"] === "boolean") {
        isSuspended = Boolean(publicMetadata["suspended"]);
      }
    } catch {
      lastLoginAt = null;
      isSuspended = false;
    }

    results.push({
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name ?? null,
      imageUrl: user.imageUrl ?? null,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt,
      isSuspended,
      totalTransactions: user._count.transactions,
      totalAccounts: user._count.accounts,
      totalBudgets: user._count.budgets,
      totalGoals: user._count.goals,
    });
  }

  return results;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  await ensureAuthenticated();

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      budgets: true,
      goals: true,
      _count: {
        select: {
          transactions: true,
          accounts: true,
          budgets: true,
          goals: true,
        },
      },
    },
  });

  if (!user) return null;

  let lastLoginAt: string | null = null;
  let isSuspended = false;

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(user.clerkUserId);
    const last = clerkUser.lastSignInAt || clerkUser.createdAt;
    lastLoginAt = last ? new Date(last as any).toISOString() : null;
    const publicMetadata = clerkUser.publicMetadata as Record<string, unknown>;
    if (publicMetadata && typeof publicMetadata["suspended"] === "boolean") {
      isSuspended = Boolean(publicMetadata["suspended"]);
    }
  } catch {
    lastLoginAt = null;
    isSuspended = false;
  }

  const transactionsRaw = await db.transaction.findMany({
    where: { userId: user.id },
    include: {
      account: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const transactions = transactionsRaw.map((tx) => ({
    id: tx.id,
    date: tx.date.toISOString(),
    description: tx.description,
    type: tx.type,
    category: tx.category,
    amount: tx.amount.toNumber(),
    isRecurring: tx.isRecurring,
    recurringInterval: tx.recurringInterval ?? null,
    accountId: tx.accountId,
    accountName: tx.account.name,
    accountType: tx.account.type,
  }));

  const recurringTransactions = transactionsRaw
    .filter((tx) => tx.isRecurring)
    .map((tx) => ({
      id: tx.id,
      date: tx.date.toISOString(),
      description: tx.description,
      type: tx.type,
      category: tx.category,
      amount: tx.amount.toNumber(),
      recurringInterval: tx.recurringInterval ?? null,
      nextRecurringDate: tx.nextRecurringDate
        ? tx.nextRecurringDate.toISOString()
        : null,
      accountId: tx.accountId,
      accountName: tx.account.name,
    }));

  const categoryStats: Record<string, { category: string; amount: number; count: number }> = {};

  for (const tx of transactionsRaw) {
    if (tx.type !== "EXPENSE") continue;
    const key = tx.category || "Uncategorized";
    if (!categoryStats[key]) {
      categoryStats[key] = { category: key, amount: 0, count: 0 };
    }
    categoryStats[key].amount += tx.amount.toNumber();
    categoryStats[key].count += 1;
  }

  const categorySpending = Object.values(categoryStats).sort((a, b) => {
    if (b.amount === a.amount) {
      return b.count - a.count;
    }
    return b.amount - a.amount;
  });

  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name ?? null,
    imageUrl: user.imageUrl ?? null,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt,
    isSuspended,
    totalTransactions: user._count.transactions,
    totalAccounts: user._count.accounts,
    totalBudgets: user._count.budgets,
    totalGoals: user._count.goals,
    accounts: user.accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance.toNumber(),
      createdAt: acc.createdAt.toISOString(),
    })),
    transactions,
    recurringTransactions,
    budgets: user.budgets.map((b) => ({
      id: b.id,
      name: b.name,
      period: b.period,
      year: b.year,
      month: b.month,
      week: b.week,
      amount: b.amount.toNumber(),
      createdAt: b.createdAt.toISOString(),
    })),
    goals: user.goals.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      targetAmount: g.targetAmount.toNumber(),
      currentAmount: g.currentAmount.toNumber(),
      status: g.status,
      dueDate: g.dueDate ? g.dueDate.toISOString() : null,
      createdAt: g.createdAt.toISOString(),
    })),
    categorySpending,
  };
}

export async function suspendUser(userId: string) {
  await ensureAuthenticated();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const client = await clerkClient();

  await client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      suspended: true,
    },
  });

  return { success: true };
}

export async function unsuspendUser(userId: string) {
  await ensureAuthenticated();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const client = await clerkClient();

  await client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      suspended: false,
    },
  });

  return { success: true };
}

export async function deleteUserCompletely(userId: string) {
  await ensureAuthenticated();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const client = await clerkClient();

  await client.users.deleteUser(user.clerkUserId);

  await db.user.delete({
    where: { id: userId },
  });

  return { success: true };
}
