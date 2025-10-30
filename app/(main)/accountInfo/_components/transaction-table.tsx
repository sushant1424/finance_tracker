"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns';
import React from 'react'
import { categoryColors } from '@/data/categories';

import { Tooltip,TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw } from 'lucide-react';



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
}

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }: { transactions: Transaction[] }) => {

  const handleSort = (p0: string) => {
    
  };

  const filteredAndSortedTransactions = transactions;

  return (
    <div className="space-y-4">

        <div className="rounded-md border">
        {/* Table Container */}
        <Table>
            
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">
                <Checkbox
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]" />
               
                </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length === 0?(
                <TableRow>
                  <TableCell className="h-24 text-center text-muted-foreground" colSpan={7}>
                    No transactions found.
                  </TableCell>
                </TableRow>
              ):(

                filteredAndSortedTransactions.map((transaction)=>(
                  <TableRow key={transaction.id}>
                    <TableCell >
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date),"PP")}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="capitalize">
                      <span style={
                        {
                          background:categoryColors[transaction.category],
                        }
                      }
                       className="rounded px-2 py-1 text-white text-sm">
                        {transaction.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right"
                    style={
                      {
                        color:transaction.type === "INCOME" ? "green" : "red"
                      }
                    }>
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
                                 Recurring
                              </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {format(
                                  new Date(transaction.nextRecurringDate ?? new Date()),
                                  "PPP"
                                ) }
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ):(
                        
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          One time
                        </Badge>
                      )}
                    </TableCell>
                   </TableRow>
                ))
                
              )}
                
            </TableBody>
        </Table>
        </div>
    </div>  
  )
}

export default TransactionTable