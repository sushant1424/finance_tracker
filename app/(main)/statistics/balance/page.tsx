import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserAccounts } from "@/actions/accounts";
import BalanceDistributionChart from "./_components/balance-distribution-chart";
import { formatIndianCurrency } from "@/lib/currency";

interface UserAccount {
  id: string;
  name: string;
  type: "SAVINGS" | "INCOME" | "EXPENSE";
  balance?: number | null;
  isDefault?: boolean | null;
}

const BalancePage = async () => {
  const accounts = (await getUserAccounts()) as UserAccount[];

  const totalBalance = accounts.reduce((sum: number, acc) => sum + Number(acc.balance ?? 0), 0);
  const defaultAccount = accounts.find((acc) => acc.isDefault);

  const totalAccounts = accounts.length;

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

      <BalanceDistributionChart
        accounts={accounts.map((acc) => ({
          id: acc.id,
          name: acc.name,
          type: acc.type,
          balance: Number(acc.balance ?? 0),
        }))}
      />
    </div>
  );
};

export default BalancePage;
