"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Printer } from "lucide-react";
import { formatIndianNumber } from "@/lib/currency";

interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface ReportsExportTableProps {
  data: CashflowPoint[];
}

const ReportsExportTable: React.FC<ReportsExportTableProps> = ({ data }) => {
  const hasData = data.length > 0;

  const handleExportCSV = () => {
    if (!hasData) return;

    const header = ["Month", "Income", "Expense", "Net"];
    const rows = data.map((row) => [
      row.month,
      row.income.toString(),
      row.expense.toString(),
      row.net.toString(),
    ]);

    const csvContent = [header, ...rows]
      .map((cols) =>
        cols
          .map((col) => {
            const value = col.replace(/"/g, '""');
            return /[",\n]/.test(value) ? `"${value}"` : value;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cashflow-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!hasData) return;
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              Monthly breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Export your monthly income, expenses and net cash-flow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              className="gap-1"
              onClick={handleExportCSV}
              disabled={!hasData}
            >
              <Download className="h-3 w-3" />
              <span className="text-xs">CSV / Excel</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handlePrint}
              disabled={!hasData}
            >
              <Printer className="h-3 w-3" />
              <span className="text-xs">Print / PDF</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        {hasData ? (
          <Table className="min-w-[360px] text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Month</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expense</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">
                    NPR {formatIndianNumber(row.income)}
                  </TableCell>
                  <TableCell className="text-right">
                    NPR {formatIndianNumber(row.expense)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      row.net >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {row.net >= 0 ? "+" : "-"}NPR {formatIndianNumber(Math.abs(row.net))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            Not enough data yet to generate a detailed report. Add a few
            transactions and come back.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsExportTable;
