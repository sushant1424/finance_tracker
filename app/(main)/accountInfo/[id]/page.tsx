import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/accounts";
import { BarLoader } from "react-spinners";
import { notFound } from "next/navigation";
import TransactionTable from "../_components/transaction-table";
import { Breadcrumb } from '@/components/breadcrumb';
import { formatIndianNumber } from '@/lib/currency';
import TransactionBarChart from "../_components/transaction-bar-chart";

interface AccountPageProps {
  params: {
    id: string;
  };
}

export default async function AccountPage({ params }: AccountPageProps) {
  
  const { id } = await params; 
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />
      
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-lg sm:text-xl font-bold">
            NPR {formatIndianNumber(parseFloat(account.balance))}
          </div>
          <p className="text-xs text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <TransactionBarChart transactions={transactions} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <TransactionTable transactions={transactions} />
      </Suspense>
      
    </div>
  );
}