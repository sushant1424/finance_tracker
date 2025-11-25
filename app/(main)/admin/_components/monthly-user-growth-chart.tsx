"use client";

import React from "react";
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

interface MonthlyUserGrowthPoint {
  monthKey: string;
  month: string;
  newUsers: number;
}

interface MonthlyUserGrowthChartProps {
  data: MonthlyUserGrowthPoint[];
}

const MonthlyUserGrowthChart: React.FC<MonthlyUserGrowthChartProps> = ({ data }) => {
  const hasData = data.some((point) => point.newUsers > 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">
          Monthly user growth
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          New users added each month over the last few months.
        </p>
      </CardHeader>
      <CardContent className="h-[320px] flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                formatter={(value: number) => `${value.toString()} users`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="newUsers" name="New users" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Not enough signups yet to display a growth chart.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyUserGrowthChart;
