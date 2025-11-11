"use client"

import { Checkbox } from '@/components/ui/checkbox';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { SortConfig } from './types';

interface TransactionTableHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  allSelected: boolean;
  onSelectAll: () => void;
}

export const TransactionTableHeader: React.FC<TransactionTableHeaderProps> = ({
  sortConfig,
  onSort,
  allSelected,
  onSelectAll,
}) => {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">
          <Checkbox
            onCheckedChange={onSelectAll}
            checked={allSelected}
          />
        </TableHead>
        
        <TableHead
          className="cursor-pointer"
          onClick={() => onSort("date")}
        >
          <div className="flex items-center">
            Date
            <SortIcon field="date" />
          </div>
        </TableHead>
        
        <TableHead>Description</TableHead>
        
        <TableHead
          className="cursor-pointer"
          onClick={() => onSort("category")}
        >
          <div className="flex items-center">
            Category
            <SortIcon field="category" />
          </div>
        </TableHead>
        
        <TableHead
          className="cursor-pointer text-right"
          onClick={() => onSort("amount")}
        >
          <div className="flex items-center justify-end">
            Amount
            <SortIcon field="amount" />
          </div>
        </TableHead>
        
        <TableHead>Recurring</TableHead>
        
        <TableHead className="w-[50px]" />
      </TableRow>
    </TableHeader>
  );
};
