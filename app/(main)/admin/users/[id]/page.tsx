import React from "react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { getAdminUserDetail } from "@/actions/admin";
import { getFxRates } from "@/actions/currency";
import { type DisplayCurrency, formatDisplayCurrency } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatCard } from "../../_components/admin-stat-card";
import UserAdminActions from "./_components/user-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminUserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AdminUserDetailPage = async ({ params }: AdminUserDetailPageProps) => {
  const { id } = await params;

  const [detail, fx] = await Promise.all([
    getAdminUserDetail(id),
    getFxRates(),
  ]);

  if (!detail) {
    notFound();
  }

  const displayCurrency = "NPR" as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
            {detail.name || detail.email}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {detail.email}
          </p>
          <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
            <p>Signup: {new Date(detail.createdAt).toLocaleString()}</p>
            <p>
              Last login: {detail.lastLoginAt ? new Date(detail.lastLoginAt).toLocaleString() : "—"}
            </p>
          </div>
        </div>
        <UserAdminActions userId={detail.id} isSuspended={detail.isSuspended} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminStatCard
          title="Total accounts"
          value={detail.totalAccounts.toString()}
          iconName="CreditCard"
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <AdminStatCard
          title="Total transactions"
          value={detail.totalTransactions.toString()}
          iconName="ReceiptText"
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <AdminStatCard
          title="Total budgets"
          value={detail.totalBudgets.toString()}
          iconName="Wallet"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        <AdminStatCard
          title="Total goals"
          value={detail.totalGoals.toString()}
          iconName="Target"
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.accounts.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell>{acc.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {acc.type}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatDisplayCurrency(acc.balance, displayCurrency, nprPerUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Category spending (expenses)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {detail.categorySpending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expense data yet.</p>
            ) : (
              <div className="space-y-1">
                {detail.categorySpending.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="truncate font-medium">{cat.category}</span>
                    <span className="text-muted-foreground">
                      {cat.count} transactions • {" "}
                      {formatDisplayCurrency(cat.amount, displayCurrency, nprPerUsd)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {detail.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Account</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.transactions.slice(0, 50).map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {tx.description || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {tx.type === "INCOME" ? "Income" : "Expense"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {tx.accountName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {tx.category}
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm font-semibold">
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatDisplayCurrency(tx.amount, displayCurrency, nprPerUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recurring transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.recurringTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recurring transactions.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.recurringTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {tx.description || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {tx.recurringInterval || "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm font-semibold">
                        {formatDisplayCurrency(tx.amount, displayCurrency, nprPerUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Budgets & goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div>
              <p className="font-semibold mb-1">Budgets</p>
              {detail.budgets.length === 0 ? (
                <p className="text-muted-foreground">No budgets.</p>
              ) : (
                <ul className="space-y-1">
                  {detail.budgets.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-medium truncate">
                          {b.name || `${b.period} budget`}
                        </span>
                        <span className="ml-1 text-muted-foreground">
                          ({b.year}
                          {b.month ? `/${b.month}` : ""}
                          {b.week ? ` wk ${b.week}` : ""})
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatDisplayCurrency(b.amount, displayCurrency, nprPerUsd)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="font-semibold mb-1">Goals</p>
              {detail.goals.length === 0 ? (
                <p className="text-muted-foreground">No goals.</p>
              ) : (
                <ul className="space-y-1">
                  {detail.goals.map((g) => (
                    <li key={g.id} className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-medium truncate">{g.title}</span>
                        {g.dueDate && (
                          <span className="ml-1 text-muted-foreground">
                            (due {new Date(g.dueDate).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {formatDisplayCurrency(g.currentAmount, displayCurrency, nprPerUsd)}
                        {" / "}
                        {formatDisplayCurrency(g.targetAmount, displayCurrency, nprPerUsd)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
