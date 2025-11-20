"use client"

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { formatDisplayNumber, getCurrencySymbol, type DisplayCurrency } from '@/lib/currency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  accountId: string;
  account: {
    name: string;
    type?: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts: {
    id: string;
    name: string;
  }[];
  displayCurrency: DisplayCurrency;
  nprPerUsd: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  accounts,
  displayCurrency,
  nprPerUsd,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const accountFilters = useMemo(
    () =>
      accounts.map((account) => ({
        id: account.id,
        label: account.name,
      })),
    [accounts]
  );

  const filteredTransactions = useMemo(() => {
    if (selectedAccount === 'all') return transactions;
    return transactions.filter(
      (transaction) => transaction.accountId === selectedAccount
    );
  }, [transactions, selectedAccount]);

  const visibleTransactions = filteredTransactions.slice(0, 4);

  if (transactions.length === 0) {
    return (
      <Card className="h-full border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg ring-1 ring-purple-200">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <span className="truncate">Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-10">
          <div className="text-center py-8 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              No transactions yet. Start by adding one!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-gray-200 shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg shadow-sm ring-1 ring-purple-200">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <span className="truncate">Recent Transactions</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[150px] h-8 text-xs border-gray-200">
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All accounts</SelectItem>
              {accountFilters.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col h-full">
        {visibleTransactions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500 flex-1">
            No transactions in this account yet.
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {visibleTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-xl border border-transparent hover:border-purple-100 hover:bg-purple-50/60 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg ${
                      transaction.type === 'INCOME'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    } transition-colors`}
                  >
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                      <span
                        className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md text-white shadow-sm"
                        style={{ background: categoryColors[transaction.category] }}
                      >
                        {transaction.category}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">
                        {transaction.account.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  {(() => {
                    const symbol = getCurrencySymbol(displayCurrency);
                    const formatted = formatDisplayNumber(
                      transaction.amount,
                      displayCurrency,
                      nprPerUsd
                    );
                    const sign = transaction.type === 'INCOME' ? '+' : '-';
                    return (
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          transaction.type === 'INCOME'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {sign}
                        {symbol} {formatted}
                      </p>
                    );
                  })()}
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-medium whitespace-nowrap">
                    {format(new Date(transaction.date), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
