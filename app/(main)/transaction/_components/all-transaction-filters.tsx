"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash, X } from 'lucide-react';
import React from 'react';

interface AllTransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  recurringFilter: string;
  setRecurringFilter: (value: string) => void;
  accountFilter: string;
  setAccountFilter: (value: string) => void;
  accounts: { id: string; name: string; type: string }[];
  selectedCount: number;
  onBulkDelete: () => void;
  onClearFilters: () => void;
}

export const AllTransactionFilters: React.FC<AllTransactionFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  recurringFilter,
  setRecurringFilter,
  accountFilter,
  setAccountFilter,
  accounts,
  selectedCount,
  onBulkDelete,
  onClearFilters,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={accountFilter || "all"} onValueChange={(value) => setAccountFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter || "all"} onValueChange={(value) => setRecurringFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
            >
              <Trash className="h-4 w-4 mr-2 text-white" />
              <span className="text-white">Delete ({selectedCount})</span> 
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter || accountFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
