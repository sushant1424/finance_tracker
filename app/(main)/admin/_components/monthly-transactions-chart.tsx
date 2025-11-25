"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyTransactionsPoint {
  month: string;
  count: number;
}

interface MonthlyTransactionsChartProps {
  data: MonthlyTransactionsPoint[];
}

const MonthlyTransactionsChart: React.FC<MonthlyTransactionsChartProps> = ({
  data,
}) => {
  const hasData = data.some((point) => point.count > 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">
          Monthly transaction volume
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Number of transactions recorded across the app each month.
        </p>
      </CardHeader>
      <CardContent className="h-[320px] flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: number) => `${value.toString()} transactions`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Transactions"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Not enough transaction history yet to show a monthly trend.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyTransactionsChart;
