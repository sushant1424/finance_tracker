"use client"

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors, defaultCategories } from '@/data/categories';
import { format } from 'date-fns';
import { Clock, RefreshCw, Trash, Pencil } from 'lucide-react';
import { formatIndianNumber } from '@/lib/currency';
import React, { useState } from 'react';
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
import EditTransactionDrawer from '@/components/edit-transaction-drawer';

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
} as const;

interface Account {
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  isRecurring?: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  nextRecurringDate?: string;
  accountId: string;
  account: Account;
}

interface AllTransactionRowProps {
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (ids: string[]) => void;
}

export const AllTransactionRow: React.FC<AllTransactionRowProps> = ({
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
      
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{transaction.account.name}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {transaction.account.type.toLowerCase()}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="capitalize">
        <span 
          style={{ background: categoryColors[transaction.category] || '#94a3b8' }}
          className="rounded px-2 py-1 text-white text-sm"
        >
          {defaultCategories.find((c) => c.id === transaction.category)?.name || transaction.category}
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
        <div className="flex justify-end gap-2">
          <EditTransactionDrawer transaction={transaction}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" />
            </Button>
          </EditTransactionDrawer>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                Delete Transaction
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently remove <strong>{transaction.description || 'this transaction'}</strong>. You can&apos;t undo this.
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
