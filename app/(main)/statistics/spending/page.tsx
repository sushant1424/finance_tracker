import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayCurrency, type DisplayCurrency } from "@/lib/currency";
import { getSpendingByCategory } from "@/actions/statistics";
import { getAllUserTransactions } from "@/actions/transactions";
import { getFxRates, getUserCurrency } from "@/actions/currency";
import SpendingByCategoryChart from "./_components/spending-by-category-chart";

interface ExpenseTransaction {
  id: string;
  date: string | Date;
  type: "INCOME" | "EXPENSE";
  category: string | null;
  amount: number;
}

const SpendingPage = async () => {
  const [spendingData, allTransactions, fx, userCurrency] = await Promise.all([
    getSpendingByCategory(),
    getAllUserTransactions(),
    getFxRates(),
    getUserCurrency(),
  ]);

  const displayCurrency = userCurrency as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  const { chartData, total, topCategory } = spendingData;

  const expenseTransactions = allTransactions.filter(
    (tx) => tx.type === "EXPENSE"
  );

  const categoriesCount = chartData.length;

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Spending
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          See which categories drive most of your spending.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total spending (last 3 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatDisplayCurrency(total, displayCurrency, nprPerUsd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top spending category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {topCategory ?? "No data yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Active categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{categoriesCount}</p>
          </CardContent>
        </Card>
      </div>

      <SpendingByCategoryChart
        transactions={expenseTransactions}
        displayCurrency={displayCurrency}
        nprPerUsd={nprPerUsd}
      />
    </div>
  );
};

export default SpendingPage;
