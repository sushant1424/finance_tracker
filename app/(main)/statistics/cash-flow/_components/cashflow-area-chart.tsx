"use client";

import { useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIndianNumber } from "@/lib/currency";

interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CashflowAreaChartProps {
  data: CashflowPoint[];
}

const DATE_RANGES = {
  "3M": { label: "Last 3 months", points: 3 },
  "6M": { label: "Last 6 months", points: 6 },
  ALL: { label: "All data", points: null as number | null },
};

type DateRangeKey = keyof typeof DATE_RANGES;

const CashflowAreaChart = ({ data }: CashflowAreaChartProps) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>("6M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];

    if (!range.points || data.length <= range.points) {
      return data;
    }

    return data.slice(-range.points);
  }, [data, dateRange]);

  const hasData = filteredData.some(
    (point) => point.income !== 0 || point.expense !== 0 || point.net !== 0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-1 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">
            Cash-flow over time
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Income, expenses and net cash-flow trends month by month.
          </p>
        </div>
        <Select
          defaultValue={dateRange}
          onValueChange={(value) => setDateRange(value as DateRangeKey)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[320px] flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
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
                formatter={(value: number) => `NPR ${formatIndianNumber(value as number)}`}
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
            Not enough transactions yet to build a cash-flow chart.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CashflowAreaChart;
