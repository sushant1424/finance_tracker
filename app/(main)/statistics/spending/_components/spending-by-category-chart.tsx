"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIndianNumber } from "@/lib/currency";
import { endOfDay, startOfDay, subDays } from "date-fns";

interface ExpenseTransaction {
  id: string;
  date: string | Date;
  type: "INCOME" | "EXPENSE";
  category: string | null;
  amount: number;
}

interface CategoryPoint {
  category: string;
  amount: number;
  [key: string]: string | number;
}

interface SpendingByCategoryChartProps {
  transactions: ExpenseTransaction[];
}

const DATE_RANGES = {
  "7D": { label: "Last 7 days", days: 7 },
  "1M": { label: "Last month", days: 30 },
  "3M": { label: "Last 3 months", days: 90 },
  "6M": { label: "Last 6 months", days: 180 },
  ALL: { label: "All time", days: null as number | null },
};

type DateRangeKey = keyof typeof DATE_RANGES;

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#e11d48",
  "#0ea5e9",
  "#a855f7",
  "#0f766e",
  "#7c3aed",
];

const SpendingByCategoryChart = ({ transactions }: SpendingByCategoryChartProps) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>("3M");

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const range = DATE_RANGES[dateRange];
    if (!range.days) return transactions;

    const now = new Date();
    const startDate = startOfDay(subDays(now, range.days));

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= endOfDay(now);
    });
  }, [transactions, dateRange]);

  const categoryData: CategoryPoint[] = useMemo(() => {
    const map = new Map<string, number>();

    filteredTransactions.forEach((tx) => {
      if (tx.type !== "EXPENSE") return;
      const key = tx.category || "Uncategorized";
      const amount = Number(tx.amount ?? 0);
      if (!amount) return;
      map.set(key, (map.get(key) ?? 0) + amount);
    });

    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const hasData = categoryData.length > 0;

  const pieData = categoryData;
  const barData = categoryData.slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-1 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">
            Spending by category
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Explore how your expenses are distributed and how they change over time.
          </p>
        </div>
        <Select
          defaultValue={dateRange}
          onValueChange={(value) => setDateRange(value as DateRangeKey)}
        >
          <SelectTrigger className="w-[150px] h-8 text-xs">
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
      <CardContent className="h-[360px] flex items-center justify-center">
        {hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 10, right: 16, left: 60, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `Rs ${formatIndianNumber(value as number)}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    fontSize={12}
                    width={120}
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
                  <Bar
                    dataKey="amount"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Not enough expense transactions yet to show spending by category.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingByCategoryChart;
