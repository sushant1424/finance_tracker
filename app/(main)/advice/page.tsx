import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReportsData } from "@/actions/reports";
import { getFxRates, getUserCurrency } from "@/actions/currency";
import { getBudgetOverview } from "@/actions/budget";
import { getUserGoals } from "@/actions/goals";
import type { GoalDTO } from "@/actions/goals";
import { getAllUserTransactions } from "@/actions/transactions";
import { formatDisplayCurrency, type DisplayCurrency } from "@/lib/currency";
import { differenceInCalendarMonths } from "date-fns";
import { TrendingUp, Wallet, PieChart } from "lucide-react";

interface AdviceTransaction {
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string | Date;
  isRecurring?: boolean;
}

const AdvicePage = async () => {
  const [reports, budgetOverview, goals, transactions, fx, userCurrency] =
    await Promise.all([
      getReportsData(),
      getBudgetOverview(),
      getUserGoals(),
      getAllUserTransactions(),
      getFxRates(),
      getUserCurrency(),
    ]);

  const { chartData, totalIncome, totalExpense, net } = reports;
  const displayCurrency = userCurrency as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  const months = chartData.length || 1;
  const avgNet = months > 0 ? net / months : 0;
  const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

  const worstMonth = chartData.reduce<null | (typeof chartData)[number]>((worst, m) => {
    if (!worst) return m;
    return m.net < worst.net ? m : worst;
  }, null);

  const bestMonth = chartData.reduce<null | (typeof chartData)[number]>((best, m) => {
    if (!best) return m;
    return m.net > best.net ? m : best;
  }, null);

  const recentTrend = chartData.slice(-3);
  const trendDirection =
    recentTrend.length >= 2
      ? recentTrend[recentTrend.length - 1].net -
          recentTrend[0].net
      : 0;

  const overspentCategories = budgetOverview.categories.filter(
    (c) => c.overspent
  );

  const typedGoals = Array.isArray(goals) ? (goals as GoalDTO[]) : [];
  const activeGoals = typedGoals.filter((g) => g.status === "ACTIVE");

  const primaryGoal = activeGoals[0];
  let primaryGoalMonthlyNeeded: number | null = null;

  if (primaryGoal) {
    const targetAmount = Number(primaryGoal.targetAmount) || 0;
    const currentAmount = Number(primaryGoal.currentAmount) || 0;
    const remaining = Math.max(0, targetAmount - currentAmount);
    const now = new Date();
    const due = primaryGoal.dueDate ? new Date(primaryGoal.dueDate) : null;

    if (due && due > now && remaining > 0) {
      const monthsLeft = Math.max(1, differenceInCalendarMonths(due, now));
      primaryGoalMonthlyNeeded = remaining / monthsLeft;
    }
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const typedTransactions = Array.isArray(transactions)
    ? (transactions as AdviceTransaction[])
    : [];

  const monthTransactions = typedTransactions.filter((t) => {
    const d = new Date(t.date);
    return d >= startOfMonth && d <= endOfMonth;
  });

  const recurringExpensesThisMonth = monthTransactions.filter(
    (t) => t.type === "EXPENSE" && t.isRecurring
  );

  const subscriptionTotal = recurringExpensesThisMonth.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Advice
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Data-driven tips based on your recent income and spending habits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-emerald-100 bg-emerald-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                Savings rate
              </CardTitle>
              <p className="text-[11px] text-emerald-800 mt-1">
                How much of your income you keep.
              </p>
            </div>
            <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={`text-xl font-bold ${
                savingsRate >= 20
                  ? "text-emerald-700"
                  : savingsRate >= 10
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {isNaN(savingsRate) ? "—" : `${savingsRate.toFixed(1)}%`}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/80">
              Aim for around 20%+ over time.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-sky-100 bg-sky-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                Average monthly net
              </CardTitle>
              <p className="text-[11px] text-sky-800 mt-1">
                What usually remains after expenses.
              </p>
            </div>
            <div className="p-2 rounded-full bg-sky-100 text-sky-700 shadow-sm">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={`text-xl font-bold ${
                avgNet >= 0 ? "text-sky-800" : "text-red-600"
              }`}
            >
              {formatDisplayCurrency(avgNet, displayCurrency, nprPerUsd)} / month
            </p>
            <p className="mt-1 text-[11px] text-sky-900/80">
              Positive net means you live below your means.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-violet-100 bg-violet-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-violet-900">
                Spending vs income (6 months)
              </CardTitle>
              <p className="text-[11px] text-violet-800 mt-1">
                High-level balance of inflow and outflow.
              </p>
            </div>
            <div className="p-2 rounded-full bg-violet-100 text-violet-700 shadow-sm">
              <PieChart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Income: <span className="font-medium">{formatDisplayCurrency(totalIncome, displayCurrency, nprPerUsd)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Expenses: <span className="font-medium">{formatDisplayCurrency(totalExpense, displayCurrency, nprPerUsd)}</span>
            </p>
            <p
              className={`mt-1 text-xs font-medium ${
                net >= 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              Net: {formatDisplayCurrency(net, displayCurrency, nprPerUsd)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Key insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {bestMonth && (
              <div>
                <span className="font-medium text-green-700">Your best month:</span>{" "}
                {bestMonth.month} with a net of {formatDisplayCurrency(bestMonth.net, displayCurrency, nprPerUsd)}.
              </div>
            )}

            {worstMonth && (
              <div>
                <span className="font-medium text-red-700">Your toughest month:</span>{" "}
                {worstMonth.month} with a net of {formatDisplayCurrency(worstMonth.net, displayCurrency, nprPerUsd)}.
              </div>
            )}

            {trendDirection > 0 && (
              <div>
                Your net cashflow has been <span className="font-medium text-green-700">improving</span>
                {" "}over the last few months. Try to keep expenses stable while increasing income or savings.
              </div>
            )}

            {trendDirection < 0 && (
              <div>
                Your net cashflow has been <span className="font-medium text-red-700">declining</span>
                {" "}recently. Review large, non-essential expenses and set monthly limits.
              </div>
            )}

            {trendDirection === 0 && chartData.length > 0 && (
              <div>
                Your net cashflow has been relatively stable. Consider automating a fixed monthly transfer to savings.
              </div>
            )}

            {chartData.length === 0 && (
              <div>
                Not enough data yet. Add transactions so we can generate personalised advice for you.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Suggested habits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Set a monthly spending limit so that your expenses stay below
                {" "}
                <span className="font-medium">80–90%</span> of your average income.
              </li>
              <li>
                When you have a positive net month, move a part of it into a
                dedicated savings or investment account.
              </li>
              <li>
                Review the categories that usually spike during your toughest
                months (e.g. dining out, shopping) and cap them with a budget.
              </li>
              <li>
                If your savings rate is below 10%, start with small changes like
                reducing one recurring non-essential subscription.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-muted/60 bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Next steps for this month
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-background/60 border px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Spend focus
            </p>
            <p className="mt-1">
              {overspentCategories.length > 0 ? (
                <>
                  Watch
                  {" "}
                  <span className="font-medium">
                    {overspentCategories[0].category}
                  </span>
                  {" "}
                  more closely this month.
                </>
              ) : (
                "Keep an eye on discretionary categories like food and shopping."
              )}
            </p>
          </div>

          <div className="rounded-lg bg-background/60 border px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Goal nudge
            </p>
            <p className="mt-1">
              {primaryGoal && primaryGoalMonthlyNeeded && !isNaN(primaryGoalMonthlyNeeded) ? (
                <>
                  Try to set aside
                  {" "}
                  <span className="font-medium">
                    {formatDisplayCurrency(
                      primaryGoalMonthlyNeeded,
                      displayCurrency,
                      nprPerUsd
                    )}
                  </span>
                  {" "}
                  towards
                  {" "}
                  <span className="font-medium">{primaryGoal.title}</span>
                  {" "}
                  this month.
                </>
              ) : (
                "Create or update one savings goal so we can guide you better."
              )}
            </p>
          </div>

          <div className="rounded-lg bg-background/60 border px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Subscriptions
            </p>
            <p className="mt-1">
              {subscriptionTotal > 0 ? (
                <>
                  You are paying
                  {" "}
                  <span className="font-medium">
                    {formatDisplayCurrency(
                      subscriptionTotal,
                      displayCurrency,
                      nprPerUsd
                    )}
                  </span>
                  {" "}
                  in recurring expenses this month. See if one can be paused.
                </>
              ) : (
                "As you add recurring expenses, we\'ll show how much goes into subscriptions."
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvicePage;
