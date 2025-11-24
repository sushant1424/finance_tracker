import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayCurrency, type DisplayCurrency } from "@/lib/currency";
import { getReportsData } from "@/actions/reports";
import { getFxRates, getUserCurrency } from "@/actions/currency";
import CashflowAreaChart from "./_components/cashflow-area-chart";

const CashflowPage = async () => {
  const [reports, fx, userCurrency] = await Promise.all([
    getReportsData(),
    getFxRates(),
    getUserCurrency(),
  ]);

  const { chartData, totalIncome, totalExpense, net } = reports;
  const displayCurrency = userCurrency as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  const months = chartData.length || 1;
  const avgNet = net / months;

  const recent = chartData.slice(-3);
  const base = recent[0];
  const last = recent[recent.length - 1];

  const incomeDelta = base && last ? last.income - base.income : 0;
  const expenseDelta = base && last ? last.expense - base.expense : 0;
  const netDelta = base && last ? last.net - base.net : 0;

  const getTrendArrow = (delta: number) =>
    delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  const getTrendLabel = (delta: number) =>
    delta > 0 ? "Increasing" : delta < 0 ? "Decreasing" : "Flat";
  const getTrendColor = (delta: number) =>
    delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-muted-foreground";

  const recentMonths = chartData.slice(-6);

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Cash-flow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Understand how money moves in and out of your accounts each month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total income (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatDisplayCurrency(totalIncome, displayCurrency, nprPerUsd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total expenses (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatDisplayCurrency(totalExpense, displayCurrency, nprPerUsd)}
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
              {formatDisplayCurrency(avgNet, displayCurrency, nprPerUsd)} / month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
        <CashflowAreaChart
          data={chartData}
          displayCurrency={displayCurrency}
          nprPerUsd={nprPerUsd}
        />
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Cashflow trends</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wide">
                Trend indicators (last few months)
              </p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-2 ${getTrendColor(incomeDelta)}`}>
                  <span>{getTrendArrow(incomeDelta)}</span>
                  <span>Income is {getTrendLabel(incomeDelta).toLowerCase()}.</span>
                </li>
                <li className={`flex items-center gap-2 ${getTrendColor(-expenseDelta)}`}>
                  <span>{getTrendArrow(expenseDelta)}</span>
                  <span>Expenses are {getTrendLabel(expenseDelta).toLowerCase()}.</span>
                </li>
                <li className={`flex items-center gap-2 ${getTrendColor(netDelta)}`}>
                  <span>{getTrendArrow(netDelta)}</span>
                  <span>Net cashflow is {getTrendLabel(netDelta).toLowerCase()}.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-1 mt-2">
              <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wide">
                Recent months
              </p>
              <div className="space-y-1">
                {recentMonths.map((m) => {
                  const isSurplus = m.income > m.expense;
                  const isDeficit = m.expense > m.income;
                  return (
                    <div
                      key={m.monthKey}
                      className="flex items-center justify-between rounded-md border border-muted px-2 py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            isDeficit ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                        <span className="text-xs font-medium">{m.month}</span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          isDeficit ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {isSurplus ? "Surplus" : isDeficit ? "Deficit" : "Balanced"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashflowPage;
