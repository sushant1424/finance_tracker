"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatIndianNumber } from "@/lib/currency";

interface BalanceAccountPoint {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface BalanceDistributionChartProps {
  accounts: BalanceAccountPoint[];
}

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#e11d48", "#0ea5e9", "#a855f7"];

const BalanceDistributionChart = ({ accounts }: BalanceDistributionChartProps) => {
  const hasData = accounts.length > 0;

  const data = accounts.map((acc) => ({
    name: acc.name,
    value: acc.balance,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">
          Balance distribution by account
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          See how your total balance is spread across different accounts.
        </p>
      </CardHeader>
      <CardContent className="h-[320px] flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `NPR ${formatIndianNumber(value)}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            No accounts found. Create an account to see your balance distribution.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceDistributionChart;
