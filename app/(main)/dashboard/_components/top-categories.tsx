"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { categoryColors } from '@/data/categories';
import { formatIndianNumber } from '@/lib/currency';
import { TrendingDown } from 'lucide-react';
import React from 'react';

interface Category {
  category: string;
  amount: number;
}

interface TopCategoriesProps {
  categories: Category[];
  totalExpense: number;
}

export const TopCategories: React.FC<TopCategoriesProps> = ({
  categories,
  totalExpense,
}) => {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Top Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No expenses this month yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          Top Spending Categories
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          This month's breakdown
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((cat) => {
            const percentage = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: categoryColors[cat.category] }}
                    />
                    <span className="text-sm font-medium capitalize">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Rs.{formatIndianNumber(cat.amount)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-1.5"
                  style={{
                    // @ts-ignore
                    '--progress-background': categoryColors[cat.category]
                  }}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
