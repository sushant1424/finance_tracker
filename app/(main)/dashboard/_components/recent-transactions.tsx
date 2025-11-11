"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatIndianNumber } from '@/lib/currency';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  account: {
    name: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  if (transactions.length === 0) {
    return (
      <Card className="border border-gray-100 shadow-md bg-gradient-to-br from-white to-purple-50/10">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg shadow-sm ring-1 ring-purple-200">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <span className="truncate">Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full mb-3 shadow-sm">
              <Clock className="h-8 w-8 text-purple-400" />
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
    <Card className="border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
        <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg shadow-sm ring-1 ring-purple-200">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <span className="truncate">Recent Transactions</span>
        </CardTitle>
        <Link href="/transaction">
          <Button variant="ghost" size="sm" className="text-xs h-8 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            View All →
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {transactions.slice(0, 4).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-xl border border-transparent hover:border-purple-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div
                  className={`p-1.5 sm:p-2 rounded-lg shadow-sm ${
                    transaction.type === "INCOME"
                      ? "bg-green-50 group-hover:bg-green-100 ring-1 ring-green-100"
                      : "bg-red-50 group-hover:bg-red-100 ring-1 ring-red-100"
                  } transition-colors`}
                >
                  {transaction.type === "INCOME" ? (
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{transaction.description}</p>
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
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    transaction.type === "INCOME"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}Rs.{formatIndianNumber(transaction.amount)}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-medium whitespace-nowrap">
                  {format(new Date(transaction.date), "MMM dd")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
