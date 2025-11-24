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

      <CashflowAreaChart
        data={chartData}
        displayCurrency={displayCurrency}
        nprPerUsd={nprPerUsd}
      />
    </div>
  );
};

export default CashflowPage;
