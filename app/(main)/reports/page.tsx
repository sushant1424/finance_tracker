import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/currency";
import CashflowLineChart from "./_components/cashflow-line-chart";
import ReportsExportTable from "./_components/reports-export-table";

import { getReportsData } from "@/actions/reports";

const ReportsPage = async () => {
  const { chartData, totalIncome, totalExpense, net } = await getReportsData();

  const months = chartData.length || 1;
  const avgNet = net / months;
  const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your income, expenses and net cash-flow for the last 6 months.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total income (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatIndianCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total expenses (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatIndianCurrency(totalExpense)}
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
              {formatIndianCurrency(net)}
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
              A healthy long-term goal is usually 20%+ of your income.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <CashflowLineChart data={chartData} />
        </div>
        <ReportsExportTable data={chartData} />
      </div>
    </div>
  );
};

export default ReportsPage;
