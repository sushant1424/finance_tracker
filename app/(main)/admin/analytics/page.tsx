import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getAdminAnalyticsData } from "@/actions/admin";
import { getFxRates } from "@/actions/currency";
import { type DisplayCurrency, formatDisplayCurrency } from "@/lib/currency";
import DailyMetricsChart from "../_components/daily-metrics-chart";
import MonthlyUserGrowthChart from "../_components/monthly-user-growth-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatCard } from "../_components/admin-stat-card";

const AdminAnalyticsPage = async () => {
  const [analytics, fx] = await Promise.all([
    getAdminAnalyticsData(),
    getFxRates(),
  ]);

  const displayCurrency = "NPR" as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  const dailyData = analytics.dailyNewUsers.map((u, index) => ({
    date: u.date,
    newUsers: u.count,
    newTransactions: analytics.dailyNewTransactions[index]?.count ?? 0,
    activeUsers: analytics.dailyActiveUsers[index]?.activeUsers ?? 0,
  }));

  const avgDailyNewUsers =
    analytics.dailyNewUsers.reduce((sum, d) => sum + d.count, 0) /
    (analytics.dailyNewUsers.length || 1);
  const avgDailyActiveUsers =
    analytics.dailyActiveUsers.reduce((sum, d) => sum + d.activeUsers, 0) /
    (analytics.dailyActiveUsers.length || 1);
  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Admin Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Usage and growth insights across the entire app.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminStatCard
          title="Avg monthly spending / user"
          value={formatDisplayCurrency(
            analytics.avgMonthlySpendingPerUser,
            displayCurrency,
            nprPerUsd
          )}
          iconName="TrendingDown"
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
        <AdminStatCard
          title="Avg transactions / user"
          value={analytics.avgTransactionsPerUser.toFixed(1)}
          iconName="ReceiptText"
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />
        <AdminStatCard
          title="Avg new users / day (30d)"
          value={avgDailyNewUsers.toFixed(1)}
          iconName="Users"
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <AdminStatCard
          title="Avg active users / day (30d)"
          value={avgDailyActiveUsers.toFixed(1)}
          iconName="Activity"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyMetricsChart data={dailyData} />
        <MonthlyUserGrowthChart data={analytics.monthlyUserGrowth} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Most popular categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {analytics.popularCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Not enough data yet to determine popular categories.
            </p>
          ) : (
            <div className="space-y-1">
              {analytics.popularCategories.slice(0, 10).map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                >
                  <div className="truncate">
                    <span className="font-medium truncate">{cat.category}</span>
                    <span className="ml-1 text-muted-foreground">
                      ({cat.transactionCount} transactions)
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatDisplayCurrency(
                      cat.totalAmount,
                      displayCurrency,
                      nprPerUsd
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
