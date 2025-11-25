"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserListItem } from "@/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

interface UsersTableProps {
  initialUsers: AdminUserListItem[];
  initialQuery?: string;
}

const UsersTable: React.FC<UsersTableProps> = ({ initialUsers, initialQuery = "" }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...initialUsers];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((user) => {
        return (
          user.email.toLowerCase().includes(q) ||
          (user.name || "").toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((user) =>
        statusFilter === "suspended" ? user.isSuspended : !user.isSuspended
      );
    }

    result.sort((a, b) => {
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return result;
  }, [initialUsers, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage) || 1;

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

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
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleView = (id: string) => {
    router.push(`/admin/users/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or email"
            className="pl-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredAndSortedUsers.length} users
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Signup</TableHead>
              <TableHead className="hidden md:table-cell">Last login</TableHead>
              <TableHead className="hidden sm:table-cell">Totals</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate">{user.email}</span>
                      {user.name && (
                        <span className="text-xs text-muted-foreground truncate">
                          {user.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell align-top text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell align-top text-xs text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell align-top text-xs text-muted-foreground">
                    <div className="space-y-0.5">
                      <div>
                        <span className="font-medium">{user.totalTransactions}</span> transactions
                      </div>
                      <div>
                        <span className="font-medium">{user.totalAccounts}</span> accounts
                      </div>
                      <div>
                        <span className="font-medium">{user.totalBudgets}</span> budgets
                      </div>
                      <div>
                        <span className="font-medium">{user.totalGoals}</span> goals
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    {user.isSuspended ? (
                      <Badge variant="destructive" className="text-[11px]">
                        Suspended
                      </Badge>
                    ) : (
                      <Badge className="text-[11px]">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleView(user.id)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[72px] h-8 text-xs">
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
              Showing
              {" "}
              {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)}
              {" "}
              of {filteredAndSortedUsers.length}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-muted-foreground text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default UsersTable;
