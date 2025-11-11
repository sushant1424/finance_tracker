import React, { Suspense } from 'react';
import { getAllUserTransactions, getUserAccounts } from '@/actions/accounts';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import AllTransactionsTable from './_components/all-transactions-table';
import { Breadcrumb } from '@/components/breadcrumb';

export default async function TransactionsPage() {
  const [transactions, accounts] = await Promise.all([
    getAllUserTransactions(),
    getUserAccounts(),
  ]);

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
        
        <Link href="/transaction/create">
          <Button className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>
      
      {/* Transactions Table */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <AllTransactionsTable 
          transactions={transactions} 
          accounts={accounts.map((acc: any) => ({ 
            id: acc.id, 
            name: acc.name, 
            type: acc.type 
          }))} 
        />
      </Suspense>
    </div>
  );
}
