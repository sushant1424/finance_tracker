"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryColors } from '@/data/categories';
import { formatIndianNumber } from '@/lib/currency';
import { TrendingDown } from 'lucide-react';
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Category {
  category: string;
  amount: number;
  count: number;
}

interface TopCategoriesProps {
  categories: Category[];
}

export const TopCategories: React.FC<TopCategoriesProps> = ({
  categories,
}) => {
  const chartData = useMemo(() => {
    if (!categories.length) return [];
    const palette = Object.values(categoryColors);
    return categories.map((cat, index) => {
      const color =
        categoryColors[cat.category] || palette[index % palette.length] || '#6366f1';
      return {
        name: cat.category,
        value: cat.amount,
        color,
        count: cat.count,
      };
    });
  }, [categories]);

  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="h-full border border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingDown className="h-4 w-4 text-amber-500" />
            Top Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-10 text-sm">
            No expenses this month yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg ring-1 ring-amber-200">
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </div>
          <span>Top Spending Categories</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          This month&apos;s breakdown
        </p>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col h-full">
        <div className="h-52">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `NPR. ${formatIndianNumber(value as number)}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {chartData.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: cat.color }}
                />
                <div>
                  <p className="text-xs font-semibold capitalize text-gray-900">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {totalAmount > 0
                      ? `${((cat.value / totalAmount) * 100).toFixed(1)}% • ${cat.count} tx`
                      : `${cat.count} tx`}
                  </p>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-900">
                NPR.{formatIndianNumber(cat.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
