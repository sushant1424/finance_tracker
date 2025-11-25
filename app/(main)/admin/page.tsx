import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getAdminDashboardData, getAdminAnalyticsData } from "@/actions/admin";
import { getFxRates } from "@/actions/currency";
import { type DisplayCurrency, formatDisplayCurrency } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyTransactionsChart from "./_components/monthly-transactions-chart";
import MonthlyNetCashflowChart from "./_components/monthly-net-cashflow-chart";
import { AdminStatCard } from "./_components/admin-stat-card";

const AdminDashboardPage = async () => {
  const [dashboard, analytics, fx] = await Promise.all([
    getAdminDashboardData(),
    getAdminAnalyticsData(),
    getFxRates(),
  ]);

  const displayCurrency = "NPR" as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          App-wide overview of users, transactions and cashflow.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminStatCard
          title="Total users"
          value={dashboard.userStats.totalUsers.toString()}
          iconName="Users"
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <AdminStatCard
          title="New users (7 days)"
          value={dashboard.userStats.newUsersLast7d.toString()}
          iconName="UserCheck"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        <AdminStatCard
          title="Active users (24h)"
          value={dashboard.userStats.activeUsers24h.toString()}
          iconName="Activity"
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <AdminStatCard
          title="Total transactions"
          value={dashboard.transactionStats.totalTransactions.toString()}
          iconName="ReceiptText"
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <AdminStatCard
          title="Total income recorded"
          value={formatDisplayCurrency(
            dashboard.cashflowStats.totalIncome,
            displayCurrency,
            nprPerUsd
          )}
          iconName="TrendingUp"
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <AdminStatCard
          title="Total expenses recorded"
          value={formatDisplayCurrency(
            dashboard.cashflowStats.totalExpense,
            displayCurrency,
            nprPerUsd
          )}
          iconName="TrendingDown"
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
        <AdminStatCard
          title="Net cashflow (all time)"
          value={formatDisplayCurrency(
            dashboard.cashflowStats.totalIncome -
              dashboard.cashflowStats.totalExpense,
            displayCurrency,
            nprPerUsd
          )}
          iconName="BarChart3"
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyTransactionsChart
          data={dashboard.transactionStats.monthlyTransactionTrend.map((m) => ({
            month: m.month,
            count: m.count,
          }))}
        />
        <MonthlyNetCashflowChart
          data={dashboard.cashflowStats.monthlyNetCashflow.map((m) => ({
            month: m.month,
            income: m.income,
            expense: m.expense,
            net: m.net,
          }))}
          displayCurrency={displayCurrency}
          nprPerUsd={nprPerUsd}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Average monthly spending per user
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatDisplayCurrency(
                analytics.avgMonthlySpendingPerUser,
                displayCurrency,
                nprPerUsd
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on the last few months of expense data across all users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Average transactions per user
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {analytics.avgTransactionsPerUser.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total transactions divided by total registered users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Top categories across app
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.popularCategories.slice(0, 5).map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate font-medium">
                  {cat.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {cat.transactionCount} transactions
                </span>
              </div>
            ))}
            {analytics.popularCategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Not enough data yet to determine popular categories.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
