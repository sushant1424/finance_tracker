"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface DailyExpensePoint {
  date: string;
  expense: number;
}

interface SpendingHeatmapProps {
  dailyExpenses: DailyExpensePoint[];
}

const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({ dailyExpenses }) => {
  const { cells, maxExpense, monthLabel } = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const map = new Map<string, number>();
    dailyExpenses.forEach((d) => {
      const parsed = new Date(d.date + "T00:00:00");
      if (
        parsed.getFullYear() === currentYear &&
        parsed.getMonth() === currentMonth
      ) {
        const key = format(parsed, "yyyy-MM-dd");
        map.set(key, (map.get(key) || 0) + d.expense);
      }
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstDayWeekday = firstDay.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const totalCells = 42;
    const result: {
      date: Date;
      inCurrentMonth: boolean;
      expense: number | null;
    }[] = [];

    let max = 0;

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - firstDayWeekday + 1;
      const cellDate = new Date(currentYear, currentMonth, dayOffset);
      const inCurrentMonth = cellDate.getMonth() === currentMonth;

      let expense: number | null = null;
      if (inCurrentMonth && dayOffset >= 1 && dayOffset <= daysInMonth) {
        const key = format(cellDate, "yyyy-MM-dd");
        const value = map.get(key) || 0;
        expense = value;
        if (value > max) max = value;
      }

      result.push({ date: cellDate, inCurrentMonth, expense });
    }

    const label = format(firstDay, "MMMM yyyy");

    return { cells: result, maxExpense: max, monthLabel: label };
  }, [dailyExpenses]);

  const getIntensityClass = (expense: number | null) => {
    if (expense === null) return "bg-transparent";
    if (expense === 0) return "bg-slate-100 dark:bg-slate-900/40";
    if (!maxExpense || maxExpense <= 0) return "bg-emerald-100";

    const ratio = expense / maxExpense;
    if (ratio > 0.9) return "bg-red-600"; // extreme days
    if (ratio > 0.6) return "bg-emerald-500";
    if (ratio > 0.3) return "bg-emerald-300";
    return "bg-emerald-200";
  };

  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-1">
        <CardTitle className="text-sm font-semibold">Spending heatmap</CardTitle>
        <p className="text-xs text-muted-foreground">
          Daily spending for {monthLabel}. Darker squares mean higher spend.
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground">
          {weekdayLabels.map((d, idx) => (
            <div key={`${d}-${idx}`} className="text-center font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-[10px]">
          {cells.map((cell, idx) => {
            const dayNumber = cell.date.getDate();
            const title = cell.inCurrentMonth
              ? `${format(cell.date, "MMM d")}: ${cell.expense ?? 0}`
              : "";
            return (
              <div
                key={idx}
                title={title}
                className={`aspect-square rounded-md border border-transparent flex items-center justify-center ${
                  cell.inCurrentMonth ? getIntensityClass(cell.expense) : ""
                }`}
              >
                {cell.inCurrentMonth ? (
                  <span className="text-[9px] font-medium text-slate-900 dark:text-slate-100">
                    {dayNumber}
                  </span>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
          <span>Low</span>
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-900/40" />
            <span className="w-3 h-3 rounded-sm bg-emerald-200" />
            <span className="w-3 h-3 rounded-sm bg-emerald-300" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="w-3 h-3 rounded-sm bg-red-600" />
          </div>
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingHeatmap;
