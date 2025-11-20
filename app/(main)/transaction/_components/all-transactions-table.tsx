"use client"

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/use-fetch';
import { bulkDeleteTransactions } from '@/actions/transactions';
import { toast } from 'sonner';
import { BarLoader } from 'react-spinners';
import { AllTransactionFilters } from './all-transaction-filters';
import { AllTransactionTableHeader } from './all-transaction-table-header';
import { AllTransactionRow } from './all-transaction-row';
import { DeleteConfirmationDialog } from '@/components/deleteConfirmationDialog';
import type { DisplayCurrency } from '@/lib/currency';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

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
  account: Account;
  accountId: string;
}

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface AllTransactionsTableProps {
  transactions: Transaction[];
  accounts: { id: string; name: string; type: string }[];
  displayCurrency: DisplayCurrency;
  nprPerUsd: number;
}

const AllTransactionsTable: React.FC<AllTransactionsTableProps> = ({ 
  transactions, 
  accounts,
  displayCurrency,
  nprPerUsd,
}) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);

  const handleSort = (field: string) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) => 
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((transaction) => transaction.id)
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setAccountFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    if (accountFilter) {
      result = result.filter((transaction) => transaction.accountId === accountFilter);
    }

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
        case "account":
          comparison = a.account.name.localeCompare(b.account.name);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, accountFilter, sortConfig]);

  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / itemsPerPage
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedTransactions, currentPage, itemsPerPage]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const openBulkDeleteDialog = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    deleteFn(selectedIds);
    setBulkDeleteOpen(false);
  };

  useEffect(() => {
    if (deleted?.success && !deleteLoading) {
      toast.success("Transactions deleted successfully");
      setSelectedIds([]);
      router.refresh();
    }
  }, [deleted, deleteLoading, router]);

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}

      <AllTransactionFilters
        searchTerm={searchTerm}
        setSearchTerm={(value: string) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        typeFilter={typeFilter}
        setTypeFilter={(value: string) => {
          setTypeFilter(value);
          setCurrentPage(1);
        }}
        recurringFilter={recurringFilter}
        setRecurringFilter={(value: string) => {
          setRecurringFilter(value);
          setCurrentPage(1);
        }}
        accountFilter={accountFilter}
        setAccountFilter={(value: string) => {
          setAccountFilter(value);
          setCurrentPage(1);
        }}
        accounts={accounts}
        selectedCount={selectedIds.length}
        onBulkDelete={openBulkDeleteDialog}
        onClearFilters={handleClearFilters}
      />

      <DeleteConfirmationDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        count={selectedIds.length}
        onConfirm={confirmBulkDelete}
        loading={deleteLoading}
      />

      <div className="rounded-md border">
        <Table>
          <AllTransactionTableHeader
            sortConfig={sortConfig}
            onSort={handleSort}
            allSelected={
              selectedIds.length === paginatedTransactions.length &&
              paginatedTransactions.length > 0
            }
            onSelectAll={handleSelectAll}
          />
          
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={8}>
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <AllTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedIds.includes(transaction.id)}
                  onSelect={handleSelect}
                  onDelete={deleteFn}
                  displayCurrency={displayCurrency}
                  nprPerUsd={nprPerUsd}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>  
  );
};

export default AllTransactionsTable;
