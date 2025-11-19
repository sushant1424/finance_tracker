"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatIndianNumber } from "@/lib/currency";

interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CashflowLineChartProps {
  data: CashflowPoint[];
}

const CashflowLineChart = ({ data }: CashflowLineChartProps) => {
  const hasData = data.some(
    (point) => point.income !== 0 || point.expense !== 0 || point.net !== 0
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">
          Cash Flow Over Time
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Monthly income, expenses and net cashflow based on your real
          transactions
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
                tickFormatter={(value) => {
                  const formatted = formatIndianNumber(value as number);
                  const integerPart = formatted.split(".")[0];
                  return `Rs ${integerPart}`;
                }}
              />
              <Tooltip
                formatter={(value: number) =>
                  `NPR ${formatIndianNumber(value as number)}`
                }
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Net"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            No transactions found for the last 6 months.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CashflowLineChart;
