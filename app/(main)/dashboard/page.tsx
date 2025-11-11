import React, { Suspense } from 'react';
import { getDashboardData } from '@/actions/dashboard';
import { StatCard } from './_components/stat-card';
import { RecentTransactions } from './_components/recent-transactions';
import { AccountsOverview } from './_components/accounts-overview';
import { BarLoader } from 'react-spinners';
import { Breadcrumb } from '@/components/breadcrumb';
import { formatIndianCurrency } from '@/lib/currency';

const DashboardPage = async () => {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />
      
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Your financial overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Balance"
          value={formatIndianCurrency(data.totalBalance)}
          iconName="Wallet"
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="This Month Income"
          value={formatIndianCurrency(data.monthIncome)}
          iconName="TrendingUp"
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="This Month Expenses"
          value={formatIndianCurrency(data.monthExpense)}
          iconName="TrendingDown"
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
        <StatCard
          title="Total Accounts"
          value={data.accountsCount.toString()}
          iconName="CreditCard"
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <Suspense fallback={<BarLoader width="100%" color="#9333ea" />}>
          <RecentTransactions transactions={data.recentTransactions} />
        </Suspense>

        {/* Accounts Overview */}
        <Suspense fallback={<BarLoader width="100%" color="#9333ea" />}>
          <AccountsOverview accounts={data.accounts} />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardPage;