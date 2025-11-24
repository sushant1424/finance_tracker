"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash, X } from 'lucide-react';
import React from 'react';

interface TableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  recurringFilter: string;
  setRecurringFilter: (value: string) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onClearFilters: () => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  recurringFilter,
  setRecurringFilter,
  selectedCount,
  onBulkDelete,
  onClearFilters,
}) => {
  return (
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
      
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={recurringFilter} onValueChange={setRecurringFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recurring">Recurring Only</SelectItem>
            <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
          </SelectContent>
        </Select>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
            >
              <Trash className="h-4 w-4 mr-2 text-white" />
              <span className="text-white">Delete Selected({selectedCount})</span> 
            </Button>
          </div>
        )}

        {(searchTerm || typeFilter || recurringFilter) && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClearFilters}
            title="Clear filters"
            aria-label="Clear filters"
          >
            <X className="h-4 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
