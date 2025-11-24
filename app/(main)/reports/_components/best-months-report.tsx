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
import { Download } from "lucide-react";
import { formatDisplayCurrency, type DisplayCurrency } from "@/lib/currency";

interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface BestMonthsReportProps {
  data: CashflowPoint[];
  displayCurrency: DisplayCurrency;
  nprPerUsd: number;
}

const BestMonthsReport: React.FC<BestMonthsReportProps> = ({
  data,
  displayCurrency,
  nprPerUsd,
}) => {
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
    link.setAttribute("download", "best-months-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              Your strongest months
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Months with the highest positive net cash-flow.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={handleExportCSV}
            disabled={!hasData}
          >
            <Download className="h-3 w-3" />
            <span className="text-xs">Export CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        {hasData ? (
          <Table className="min-w-[320px] text-xs">
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
                    {formatDisplayCurrency(row.income, displayCurrency, nprPerUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDisplayCurrency(row.expense, displayCurrency, nprPerUsd)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    +{formatDisplayCurrency(row.net, displayCurrency, nprPerUsd)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            Not enough data yet to highlight your strongest months.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BestMonthsReport;
