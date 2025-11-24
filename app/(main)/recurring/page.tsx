import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Repeat, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { getAllUserTransactions } from "@/actions/transactions";
import { getFxRates, getUserCurrency } from "@/actions/currency";
import CreateTransactionDrawer from "@/components/create-transaction-drawer";
import { formatDisplayCurrency, formatDisplayNumber, type DisplayCurrency } from "@/lib/currency";
import { Breadcrumb } from "@/components/breadcrumb";
import { categoryColors } from "@/data/categories";

// Define proper types
interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  name?: string;
  description?: string;
  date: Date | string;
  category: string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  nextRecurringDate?: Date | string;
}

async function getRecurringTransactions(transactions: Transaction[]) {
  // Filter for recurring transactions
  return transactions.filter(t => t.isRecurring);
}

// Get recurring data
export default async function RecurringPage() {
  const [allTransactions, fx, userCurrency] = await Promise.all([
    getAllUserTransactions(),
    getFxRates(),
    getUserCurrency(),
  ]);

  const displayCurrency = userCurrency as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  const recurring = await getRecurringTransactions(allTransactions);

  const recurringData = recurring;

  const monthlyIncome = recurringData
    .filter(r => r.type === "INCOME" && r.recurringInterval === "MONTHLY")
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyExpenses = recurringData
    .filter(r => r.type === "EXPENSE" && r.recurringInterval === "MONTHLY")
    .reduce((sum, r) => sum + r.amount, 0);

  const netMonthly = monthlyIncome - monthlyExpenses;

  const now = new Date();
  const tenDaysAhead = new Date();
  tenDaysAhead.setDate(now.getDate() + 10);

  const upcomingWindow = recurringData.filter((r) => {
    const nextDate = r.nextRecurringDate ? new Date(r.nextRecurringDate) : new Date(r.date);
    return nextDate >= now && nextDate <= tenDaysAhead;
  });

  const upcomingIncome = upcomingWindow
    .filter((r) => r.type === "INCOME")
    .reduce((sum, r) => sum + r.amount, 0);

  const upcomingExpenses = upcomingWindow
    .filter((r) => r.type === "EXPENSE")
    .reduce((sum, r) => sum + r.amount, 0);

  const upcomingNet = upcomingIncome - upcomingExpenses;

  const upcomingRecurring = recurringData
    .sort((a: Transaction, b: Transaction) => {
      const aDate = a.nextRecurringDate ? new Date(a.nextRecurringDate) : new Date(a.date);
      const bDate = b.nextRecurringDate ? new Date(b.nextRecurringDate) : new Date(b.date);
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
            Recurring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your recurring income and expenses.
          </p>
        </div>
        <CreateTransactionDrawer>
          <Button className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Add Recurring
          </Button>
        </CreateTransactionDrawer>
      </div>

      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatDisplayCurrency(monthlyIncome, displayCurrency, nprPerUsd)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {recurringData.filter((r: Transaction) => r.type === "INCOME").length} recurring sources
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatDisplayCurrency(monthlyExpenses, displayCurrency, nprPerUsd)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {recurringData.filter((r: Transaction) => r.type === "EXPENSE").length} recurring expenses
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Monthly</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                netMonthly >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatDisplayCurrency(netMonthly, displayCurrency, nprPerUsd)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                After recurring transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next 10 days cashflow</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span>Incoming</span>
                  <span className="font-medium text-emerald-600">
                    {formatDisplayCurrency(upcomingIncome, displayCurrency, nprPerUsd)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span>Outgoing</span>
                  <span className="font-medium text-red-600">
                    {formatDisplayCurrency(upcomingExpenses, displayCurrency, nprPerUsd)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-700 mt-1">
                  <span>Net</span>
                  <span
                    className={`font-semibold ${
                      upcomingNet >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {formatDisplayCurrency(upcomingNet, displayCurrency, nprPerUsd)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Based on upcoming recurring items in the next 10 days.
                </p>
                <p className="text-[11px] text-purple-700 mt-1 font-medium">
                  You have {formatDisplayCurrency(upcomingExpenses, displayCurrency, nprPerUsd)} of
                  recurring expenses coming in the next 10 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed border-slate-200 bg-slate-50/60">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Smart recurring assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-700 space-y-2">
            <p>
              Categories are color-coded so you can quickly see where your recurring money goes
              each month.
            </p>
            <p>
              Upcoming bills are highlighted using each transaction&apos;s next recurring date so you
              can treat this page as a bill reminder dashboard.
            </p>
            <p>
              Over time, simple pattern detection can identify repeated transactions and suggest
              marking them as recurring. Future updates can also add retry logic for failed
              auto-payments and better handling when you change recurring amounts mid-cycle.
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Recurring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Recurring Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recurringData.length > 0 ? upcomingRecurring.map((item: Transaction) => {
                const nextDate = item.nextRecurringDate || item.date;
                const frequency = item.recurringInterval || 'MONTHLY';
                return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      item.type === "INCOME" 
                        ? "bg-green-100" 
                        : "bg-red-100"
                    }`}>
                      <Repeat className={`h-5 w-5 ${
                        item.type === "INCOME" ? "text-green-600" : "text-red-600"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.name || item.description || 'Unnamed Transaction'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {frequency}
                        </Badge>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white shadow-sm"
                          style={{ background: categoryColors[item.category] || "#4b5563" }}
                        >
                          {item.category}
                        </span>
                        <span className="text-sm text-gray-600">
                          Next: {new Date(nextDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      item.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}>
                      {item.type === "INCOME" ? "+" : "-"}
                      {formatDisplayCurrency(item.amount, displayCurrency, nprPerUsd)}
                    </div>
                  </div>
                </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-500">
                  <Repeat className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                  <p>No recurring transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Recurring Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>All Recurring Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recurringData.map((item: Transaction) => {
                const nextDate = item.nextRecurringDate || item.date;
                const frequency = item.recurringInterval || 'MONTHLY';
                return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.type === "INCOME" 
                        ? "bg-green-100" 
                        : "bg-red-100"
                    }`}>
                      {item.type === "INCOME" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.name || item.description || 'Unnamed Transaction'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {frequency}
                        </Badge>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white shadow-sm"
                          style={{ background: categoryColors[item.category] || "#4b5563" }}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      item.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}>
                      {item.type === "INCOME" ? "+" : "-"}
                      {formatDisplayCurrency(item.amount, displayCurrency, nprPerUsd)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Next: {new Date(nextDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}