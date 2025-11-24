"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDisplayCurrency,
  type DisplayCurrency,
} from "@/lib/currency";

interface CashflowPoint {
  monthKey: string;
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface PeriodSummary {
  id: string;
  label: string;
  type: "month" | "quarter" | "year";
  income: number;
  expense: number;
  net: number;
}

interface PeriodCompareProps {
  data: CashflowPoint[];
  displayCurrency: DisplayCurrency;
  nprPerUsd: number;
}

const PeriodCompare: React.FC<PeriodCompareProps> = ({
  data,
  displayCurrency,
  nprPerUsd,
}) => {
  const { months, quarters, years } = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    const months: PeriodSummary[] = sorted.map((m) => ({
      id: `month:${m.monthKey}`,
      label: m.month,
      type: "month",
      income: m.income,
      expense: m.expense,
      net: m.net,
    }));

    const quarterMap = new Map<string, PeriodSummary>();
    const yearMap = new Map<string, PeriodSummary>();

    sorted.forEach((m) => {
      const d = new Date(m.monthKey);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const quarter = Math.floor(monthIndex / 3) + 1;
      const quarterKey = `${year}-Q${quarter}`;

      if (!quarterMap.has(quarterKey)) {
        quarterMap.set(quarterKey, {
          id: `quarter:${quarterKey}`,
          label: `Q${quarter} ${year}`,
          type: "quarter",
          income: 0,
          expense: 0,
          net: 0,
        });
      }
      const q = quarterMap.get(quarterKey)!;
      q.income += m.income;
      q.expense += m.expense;
      q.net += m.net;

      const yearKey = `${year}`;
      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, {
          id: `year:${yearKey}`,
          label: yearKey,
          type: "year",
          income: 0,
          expense: 0,
          net: 0,
        });
      }
      const y = yearMap.get(yearKey)!;
      y.income += m.income;
      y.expense += m.expense;
      y.net += m.net;
    });

    const quarters = Array.from(quarterMap.values()).sort((a, b) =>
      a.id.localeCompare(b.id)
    );
    const years = Array.from(yearMap.values()).sort((a, b) => a.id.localeCompare(b.id));

    return { months, quarters, years };
  }, [data]);

  const [mode, setMode] = useState<"month" | "quarter" | "year">("month");
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const options = mode === "month" ? months : mode === "quarter" ? quarters : years;

  useEffect(() => {
    if (options.length >= 2) {
      setLeftId(options[0].id);
      setRightId(options[options.length - 1].id);
    } else if (options.length === 1) {
      setLeftId(options[0].id);
      setRightId(options[0].id);
    }
  }, [mode, options]);

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Compare periods</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Not enough history yet to compare two different periods. Add more months of
          data and come back.
        </CardContent>
      </Card>
    );
  }

  const left = options.find((o) => o.id === leftId) || options[0];
  const right = options.find((o) => o.id === rightId) || options[options.length - 1];

  const diffNet = right.net - left.net;
  const diffNetLabel = diffNet >= 0 ? "higher" : "lower";

  return (
    <Card>
      <CardHeader className="pb-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Compare periods</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Pick two months, quarters or years to see how income, expenses and net
              cashflow changed.
            </p>
          </div>
          <div className="inline-flex rounded-full border bg-muted/40 p-0.5 text-[11px]">
            <button
              type="button"
              className={`px-2 py-1 rounded-full transition-colors ${
                mode === "month"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setMode("month")}
            >
              Months
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded-full transition-colors ${
                mode === "quarter"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setMode("quarter")}
            >
              Quarters
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded-full transition-colors ${
                mode === "year"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setMode("year")}
            >
              Years
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs sm:text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">Period A</p>
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">Period B</p>
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
              {left.label}
            </p>
            <p>
              Income: {" "}
              <span className="font-medium">
                {formatDisplayCurrency(left.income, displayCurrency, nprPerUsd)}
              </span>
            </p>
            <p>
              Expense: {" "}
              <span className="font-medium">
                {formatDisplayCurrency(left.expense, displayCurrency, nprPerUsd)}
              </span>
            </p>
            <p>
              Net: {" "}
              <span
                className={`font-semibold ${
                  left.net >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatDisplayCurrency(left.net, displayCurrency, nprPerUsd)}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
              {right.label}
            </p>
            <p>
              Income: {" "}
              <span className="font-medium">
                {formatDisplayCurrency(right.income, displayCurrency, nprPerUsd)}
              </span>
            </p>
            <p>
              Expense: {" "}
              <span className="font-medium">
                {formatDisplayCurrency(right.expense, displayCurrency, nprPerUsd)}
              </span>
            </p>
            <p>
              Net: {" "}
              <span
                className={`font-semibold ${
                  right.net >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatDisplayCurrency(right.net, displayCurrency, nprPerUsd)}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-muted-foreground">
          <p>
            Net cashflow in <span className="font-medium">{right.label}</span> is
            {" "}
            <span
              className={
                diffNet >= 0 ? "font-semibold text-green-600" : "font-semibold text-red-600"
              }
            >
              {formatDisplayCurrency(Math.abs(diffNet), displayCurrency, nprPerUsd)}
            </span>
            {" "}
            {diffNetLabel} than in {" "}
            <span className="font-medium">{left.label}</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodCompare;
