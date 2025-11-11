"use client"

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { Clock, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Transaction, RECURRING_INTERVALS } from './types';

interface TransactionRowProps {
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (ids: string[]) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const router = useRouter();

  return (
    <TableRow>
      <TableCell>
        <Checkbox 
          onCheckedChange={() => onSelect(transaction.id)}
          checked={isSelected}
        />
      </TableCell>
      
      <TableCell>
        {format(new Date(transaction.date), "PP")}
      </TableCell>
      
      <TableCell>{transaction.description}</TableCell>
      
      <TableCell className="capitalize">
        <span 
          style={{ background: categoryColors[transaction.category] }}
          className="rounded px-2 py-1 text-white text-sm"
        >
          {transaction.category}
        </span>
      </TableCell>
      
      <TableCell 
        className="text-right"
        style={{ color: transaction.type === "INCOME" ? "green" : "red" }}
      >
        {transaction.type === "EXPENSE" ? "-" : "+"}
        Rs.{transaction.amount.toFixed(2)}
      </TableCell>

      <TableCell>
        {transaction.isRecurring ? (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                <RefreshCw className="h-3 w-3" />
                {transaction.recurringInterval && RECURRING_INTERVALS[transaction.recurringInterval]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-medium">Next Date:</div>
                <div>
                  {format(
                    new Date(transaction.nextRecurringDate ?? new Date()),
                    "PPP"
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            One time
          </Badge>
        )}
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => router.push(`/transaction/create?id=${transaction.id}`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive" 
              onClick={() => onDelete([transaction.id])}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
