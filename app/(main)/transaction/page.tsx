import React, { Suspense } from 'react';
import { getUserAccounts } from '@/actions/accounts';
import { getAllUserTransactions } from '@/actions/transactions';
import { getFxRates, getUserCurrency } from '@/actions/currency';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AllTransactionsTable from './_components/all-transactions-table';
import { Breadcrumb } from '@/components/breadcrumb';
import CreateTransactionDrawer from '@/components/create-transaction-drawer';
import type { DisplayCurrency } from '@/lib/currency';

export default async function TransactionsPage() {
  const [transactions, accounts, fx, userCurrency] = await Promise.all([
    getAllUserTransactions(),
    getUserAccounts(),
    getFxRates(),
    getUserCurrency(),
  ]);

  const displayCurrency = userCurrency as DisplayCurrency;
  const nprPerUsd = fx.nprPerUsd;

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your transactions across all accounts
          </p>
        </div>
        
        <CreateTransactionDrawer>
          <Button className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </CreateTransactionDrawer>
      </div>
      
      {/* Transactions Table */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <AllTransactionsTable 
          transactions={transactions} 
          accounts={accounts.map((acc) => ({ 
            id: acc.id, 
            name: acc.name, 
            type: acc.type 
          }))}
          displayCurrency={displayCurrency}
          nprPerUsd={nprPerUsd}
        />
      </Suspense>
    </div>
  );
}
