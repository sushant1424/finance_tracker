"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatIndianNumber } from "@/lib/currency";

interface SpendingCategoryPoint {
  category: string;
  amount: number;
}

interface SpendingByCategoryChartProps {
  data: SpendingCategoryPoint[];
}

const SpendingByCategoryChart = ({ data }: SpendingByCategoryChartProps) => {
  const hasData = data.length > 0;

  const chartData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">
          Spending by category (last 3 months)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Identify where most of your money is going.
        </p>
      </CardHeader>
      <CardContent className="h-[320px] flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 16, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rs ${formatIndianNumber(value as number)}`}
              />
              <YAxis
                type="category"
                dataKey="category"
                fontSize={12}
                width={120}
              />
              <Tooltip
                formatter={(value: number) => `NPR ${formatIndianNumber(value as number)}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
