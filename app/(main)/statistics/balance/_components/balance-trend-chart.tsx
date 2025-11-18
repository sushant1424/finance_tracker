"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIndianNumber } from "@/lib/currency";
import { endOfDay, startOfDay, subDays } from "date-fns";

const DATE_RANGES = {
  "7D": { label: "Last 7 days", days: 7 },
  "1M": { label: "Last month", days: 30 },
  "3M": { label: "Last 3 months", days: 90 },
  "6M": { label: "Last 6 months", days: 180 },
  ALL: { label: "All time", days: null as number | null },
};

type DateRangeKey = keyof typeof DATE_RANGES;

interface BalancePoint {
  date: string;
  label: string;
  balance: number;
}

interface BalanceTrendChartProps {
  data: BalancePoint[];
}

const BalanceTrendChart = ({ data }: BalanceTrendChartProps) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>("3M");

  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    const range = DATE_RANGES[dateRange];
    if (!range.days) return data;

    const now = new Date();
    const startDate = startOfDay(subDays(now, range.days));

    return data.filter((point) => {
      const pointDate = new Date(point.date);
      return pointDate >= startDate && pointDate <= endOfDay(now);
    });
  }, [data, dateRange]);

  const hasData = filteredData.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-1 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">
            Balance over time
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Track how your total balance evolves across all accounts.
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
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `Rs ${formatIndianNumber(value as number)}`
                }
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
                dataKey="balance"
                name="Total balance"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Not enough data yet to show a balance trend.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceTrendChart;
