"use client"

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { Clock, MoreHorizontal, RefreshCw, Trash } from 'lucide-react';
import { formatIndianNumber } from '@/lib/currency';
import React, { useState } from 'react';
import { Transaction, RECURRING_INTERVALS } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    onDelete([transaction.id]);
    setConfirmOpen(false);
  };

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
        className={`text-right font-semibold ${
          transaction.type === "EXPENSE" ? "text-red-600" : "text-green-600"
        }`}
      >
        {transaction.type === "EXPENSE" ? "-" : "+"}NPR {formatIndianNumber(transaction.amount)}
      </TableCell>

      <TableCell>
        {transaction.isRecurring ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
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
          </TooltipProvider>
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
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive" 
              onSelect={(event) => {
                event.preventDefault();
                setConfirmOpen(true);
              }}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                Delete Transaction
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently remove <strong>{transaction.description || 'this transaction'}</strong> from the account history. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};
