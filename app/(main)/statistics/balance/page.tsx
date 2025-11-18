import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserAccounts } from "@/actions/accounts";
import { getAllUserTransactions } from "@/actions/transactions";
import BalanceDistributionChart from "./_components/balance-distribution-chart";
import BalanceTrendChart from "./_components/balance-trend-chart";
import { formatIndianCurrency } from "@/lib/currency";
import { format } from "date-fns";

interface UserAccount {
  id: string;
  name: string;
  type: "SAVINGS" | "INCOME" | "EXPENSE";
  balance?: number | null;
  isDefault?: boolean | null;
}

interface UserTransaction {
  id: string;
  date: string | Date;
  type: "INCOME" | "EXPENSE";
  amount: number;
}

const BalancePage = async () => {
  const accounts = (await getUserAccounts()) as UserAccount[];
  const transactions = (await getAllUserTransactions()) as UserTransaction[];

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance ?? 0),
    0
  );
  const defaultAccount = accounts.find((acc) => acc.isDefault);

  const totalAccounts = accounts.length;

  const sortedTransactions = transactions
    .map((tx) => ({
      ...tx,
      date: new Date(tx.date),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let totalNetChange = 0;
  const dailyNetMap = new Map<string, number>();

  for (const tx of sortedTransactions) {
    const amount = Number(tx.amount ?? 0);
    if (!amount) continue;

    const change = tx.type === "INCOME" ? amount : -amount;
    totalNetChange += change;

    const dateKey = format(tx.date, "yyyy-MM-dd");
    dailyNetMap.set(dateKey, (dailyNetMap.get(dateKey) ?? 0) + change);
  }

  const initialBalance = totalBalance - totalNetChange;

  const balanceTimeline: { date: string; label: string; balance: number }[] = [];

  if (dailyNetMap.size === 0) {
    const today = new Date();
    balanceTimeline.push({
      date: today.toISOString(),
      label: format(today, "MMM dd"),
      balance: totalBalance,
    });
  } else {
    let runningBalance = initialBalance;

    const entries = Array.from(dailyNetMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    for (const [dateKey, netChange] of entries) {
      runningBalance += netChange;
      const dateObj = new Date(dateKey);
      balanceTimeline.push({
        date: dateObj.toISOString(),
        label: format(dateObj, "MMM dd"),
        balance: runningBalance,
      });
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Balance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Snapshot of your balances across all accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatIndianCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{totalAccounts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Default account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {defaultAccount ? defaultAccount.name : "No default account set"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BalanceTrendChart data={balanceTimeline} />
        <BalanceDistributionChart
          accounts={accounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            balance: Number(acc.balance ?? 0),
          }))}
        />
      </div>
    </div>
  );
};

export default BalancePage;
