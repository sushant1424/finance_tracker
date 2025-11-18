import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/currency";
import { getSpendingByCategory } from "@/actions/statistics";
import SpendingByCategoryChart from "./_components/spending-by-category-chart";

const SpendingPage = async () => {
  const { chartData, total, topCategory } = await getSpendingByCategory();

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
              {formatIndianCurrency(total)}
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

      <SpendingByCategoryChart data={chartData} />
    </div>
  );
};

export default SpendingPage;
