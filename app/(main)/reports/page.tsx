import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayCurrency, type DisplayCurrency } from "@/lib/currency";
import MonthlyOverviewReport from "./_components/reports-export-table";
import LossMonthsReport from "./_components/loss-months-report";
import BestMonthsReport from "./_components/best-months-report";
import CashflowLineChart from "./_components/cashflow-line-chart";

import { getReportsData } from "@/actions/reports";
import { getFxRates, getUserCurrency } from "@/actions/currency";

const ReportsPage = async () => {
  const [reports, fx, userCurrency] = await Promise.all([
    getReportsData(),
    getFxRates(),
    getUserCurrency(),
  ]);

  const { chartData, totalIncome, totalExpense, net } = reports;
  const displayCurrency = userCurrency as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

  const lossMonths = chartData.filter((m) => m.expense > m.income);
  const bestMonths = [...chartData]
    .filter((m) => m.net > 0)
    .sort((a, b) => b.net - a.net)
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Focused reports to help you see where money is going and where you can improve.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-semibold">Net (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-lg font-bold ${
                net >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatDisplayCurrency(net, displayCurrency, nprPerUsd)}
            </p>
          </CardContent>
        </Card>

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
              Aim for 20%+ over time to steadily build savings.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CashflowLineChart
          data={chartData}
          displayCurrency={displayCurrency}
          nprPerUsd={nprPerUsd}
        />
        <MonthlyOverviewReport
          data={chartData}
          displayCurrency={displayCurrency}
          nprPerUsd={nprPerUsd}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <LossMonthsReport data={lossMonths} />
        <BestMonthsReport
          data={bestMonths}
          displayCurrency={displayCurrency}
          nprPerUsd={nprPerUsd}
        />
      </div>
    </div>
  );
};

export default ReportsPage;
