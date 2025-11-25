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
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DailyMetricsPoint {
  date: string;
  newUsers: number;
  newTransactions: number;
  activeUsers: number;
}

interface DailyMetricsChartProps {
  data: DailyMetricsPoint[];
}

const DailyMetricsChart: React.FC<DailyMetricsChartProps> = ({ data }) => {
  const hasData = data.some(
    (point) => point.newUsers > 0 || point.newTransactions > 0 || point.activeUsers > 0
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">
          Daily metrics (last 30 days)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          New users, new transactions and active users per day.
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
                dataKey="date"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="New users"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="newTransactions"
                name="New transactions"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Active users"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Not enough recent activity to display daily metrics.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyMetricsChart;
