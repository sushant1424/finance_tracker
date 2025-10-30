"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { categoryColors } from '@/data/categories';

import { Tooltip,TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { fi } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



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

  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
   const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const handleSort = (field:any) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id:any) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) => 
      current.length === filteredAndSortedTransactions.length
      ? []
      : filteredAndSortedTransactions.map((transaction) => transaction.id)
    )
  }


  const handleBulkDelete = () => {};

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    
  };
 

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

     // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  return (
    <div className="space-y-4">


        {/*Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-8"
            />
          </div>
          <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
              
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                 <Trash className="h-4 w-4 mr-2 text-white" />
                <span className="text-white">Delete Selected({selectedIds.length})</span> 
              </Button>
            </div>
          )}

           {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
          </div>
        </div>

        
        {/*Transactions*/ }
        <div className="rounded-md border">
        {/* Table Container */}
        <Table>
            
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">
                <Checkbox
                onCheckedChange={handleSelectAll}
                checked={selectedIds.length === filteredAndSortedTransactions.length &&
                  filteredAndSortedTransactions.length > 0
                }
                
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
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
                      <Checkbox onCheckedChange= {()=> handleSelect(transaction.id)}
                        checked={selectedIds.includes(transaction.id)}/>
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

                    <TableCell>
                      <DropdownMenu >
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal  className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel
                          onClick={() => 
                            router.push(`/transaction/create?id=${transaction.id}`)
                          }
                          >Edit</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" 
                          //</DropdownMenuContent>onClick={()=>deleteFn([transaction.id])}
                          >Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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