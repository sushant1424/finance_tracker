import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/currency";
import CashflowLineChart from "./_components/cashflow-line-chart";
import { getReportsData } from "@/actions/reports";

const ReportsPage = async () => {
  const { chartData, totalIncome, totalExpense, net } = await getReportsData();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trends of your income and expenses over the last 6 months
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Total Income (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatIndianCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Total Expenses (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatIndianCurrency(totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Net Cashflow</CardTitle>
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
      </div>

      <CashflowLineChart data={chartData} />
    </div>
  );
};

export default ReportsPage;
