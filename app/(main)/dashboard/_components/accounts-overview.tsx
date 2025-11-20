"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { formatDisplayNumber, getCurrencySymbol, type DisplayCurrency } from '@/lib/currency';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  _count: {
    transactions: number;
  };
}

interface AccountsOverviewProps {
  accounts: Account[];
  displayCurrency: DisplayCurrency;
  nprPerUsd: number;
}

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({
  accounts,
  displayCurrency,
  nprPerUsd,
}) => {
  const sortedAccounts = [...accounts].sort(
    (a, b) => b._count.transactions - a._count.transactions
  );

  if (accounts.length === 0) {
    return (
      <Card className="h-full border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg shadow-sm ring-1 ring-blue-200">
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
            <span className="truncate">Accounts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full mb-3 shadow-sm">
              <Wallet className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-4">
              No accounts yet. Create your first account!
            </p>
            <Link href="/account" className="block">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-gray-200 shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
        <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg shadow-sm ring-1 ring-blue-200">
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <span className="truncate">Accounts</span>
        </CardTitle>
        <Link href="/account">
          <Button variant="ghost" size="sm" className="text-xs h-8 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            View All →
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {sortedAccounts.map((account) => (
            <Link key={account.id} href={`/accountInfo/${account.id}`}>
              <div className="p-3 sm:p-4 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/40 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{account.name}</h4>
                      {account.isDefault && (
                        <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 bg-blue-100 text-blue-700 border-0 shadow-sm ring-1 ring-blue-200 whitespace-nowrap">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                      <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium capitalize">
                        {account.type.toLowerCase()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-300">•</span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">
                        {account._count.transactions} transactions
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">
                      {getCurrencySymbol(displayCurrency)}{' '}
                      {formatDisplayNumber(account.balance, displayCurrency, nprPerUsd)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
