"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  formatDisplayCurrency,
  formatDisplayNumber,
  getCurrencySymbol,
  type DisplayCurrency,
} from "@/lib/currency";

interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyNetCashflowChartProps {
  data: CashflowPoint[];
  displayCurrency: DisplayCurrency;
  nprPerUsd: number;
}

const MonthlyNetCashflowChart: React.FC<MonthlyNetCashflowChartProps> = ({
  data,
  displayCurrency,
  nprPerUsd,
}) => {
  const hasData = data.some(
    (point) =>
      point.income !== 0 || point.expense !== 0 || point.net !== 0
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">
          Monthly net cashflow
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Income, expenses and net cashflow aggregated across all users.
        </p>
      </CardHeader>
      <CardContent className="h-[320px] flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const formatted = formatDisplayNumber(
                    value as number,
                    displayCurrency,
                    nprPerUsd
                  );
                  const integerPart = formatted.split(".")[0];
                  const symbol = getCurrencySymbol(displayCurrency);
                  return `${symbol} ${integerPart}`;
                }}
              />
              <Tooltip
                formatter={(value: number) =>
                  formatDisplayCurrency(
                    value as number,
                    displayCurrency,
                    nprPerUsd
                  )
                }
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#22c55e"
                fill="#22c55e33"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#ef4444"
                fill="#ef444433"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="net"
                name="Net"
                stroke="#3b82f6"
                fill="#3b82f633"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Not enough data yet to build a cashflow trend for the app.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyNetCashflowChart;
