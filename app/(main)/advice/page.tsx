import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReportsData } from "@/actions/reports";
import { formatIndianCurrency } from "@/lib/currency";

const AdvicePage = async () => {
  const { chartData, totalIncome, totalExpense, net } = await getReportsData();

  const months = chartData.length || 1;
  const avgNet = net / months;
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
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Savings rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-lg font-bold ${
                savingsRate >= 20
                  ? "text-green-600"
                  : savingsRate >= 10
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {isNaN(savingsRate) ? "—" : `${savingsRate.toFixed(1)}%`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A healthy target is usually 20%+ of your income.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Average monthly net</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-lg font-bold ${
                avgNet >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatIndianCurrency(avgNet)} / month
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Positive net means you are living below your means.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Spending vs income (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Income: <span className="font-medium">{formatIndianCurrency(totalIncome)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Expenses: <span className="font-medium">{formatIndianCurrency(totalExpense)}</span>
            </p>
            <p
              className={`mt-1 text-xs font-medium ${
                net >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Net: {formatIndianCurrency(net)}
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
                {bestMonth.month} with a net of {formatIndianCurrency(bestMonth.net)}.
              </div>
            )}

            {worstMonth && (
              <div>
                <span className="font-medium text-red-700">Your toughest month:</span>{" "}
                {worstMonth.month} with a net of {formatIndianCurrency(worstMonth.net)}.
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
    </div>
  );
};

export default AdvicePage;
