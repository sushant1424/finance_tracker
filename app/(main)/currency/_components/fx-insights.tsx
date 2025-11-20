"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FxSummaryProps {
  nprPerUsd: number;
  usdPerNpr: number;
  updatedAt: string;
  nextUpdateAt: string;
  rates: Record<string, number>;
}

interface FxInsightsProps {
  fx: FxSummaryProps;
}

const MAJOR_CODES = ["USD", "NPR", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"] as const;

type MajorCode = (typeof MAJOR_CODES)[number];

export default function FxInsights({ fx }: FxInsightsProps) {
  const tableRows = MAJOR_CODES.map((code) => {
    const rateFromUsd = code === "USD" ? 1 : fx.rates[code] ?? null;

    if (code !== "USD" && rateFromUsd === null) return null;

    const ratePerUsd = rateFromUsd ?? 1;

    const perNpr = code === "NPR" ? 1 : ratePerUsd / fx.nprPerUsd;

    return {
      code,
      perUsd: ratePerUsd,
      perNpr,
    };
  }).filter((row): row is { code: MajorCode; perUsd: number; perNpr: number } => !!row);

  const barData = tableRows.map((row) => {
    let nprPerUnit: number;

    if (row.code === "NPR") {
      nprPerUnit = 1;
    } else if (row.code === "USD") {
      nprPerUnit = fx.nprPerUsd;
    } else {
      // 1 USD = fx.nprPerUsd NPR and = row.perUsd of this currency
      // => 1 unit of this currency = (fx.nprPerUsd / row.perUsd) NPR
      nprPerUnit = fx.nprPerUsd / row.perUsd;
    }

    return {
      code: row.code,
      nprPerUnit,
    };
  });

  const maxNpr = Math.max(...barData.map((d) => d.nprPerUnit));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border border-muted/60 bg-gradient-to-br from-background to-muted/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Major currencies snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-xs sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Code</TableHead>
                <TableHead>1 USD =</TableHead>
                <TableHead>1 NPR =</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={row.code}>
                  <TableCell className="font-semibold">
                    {row.code}
                    {row.code === "USD" && (
                      <span className="ml-1 text-[10px] rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                        Base
                      </span>
                    )}
                    {row.code === "NPR" && (
                      <span className="ml-1 text-[10px] rounded-full bg-purple-100 text-purple-700 px-2 py-0.5">
                        Your base
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.perUsd.toFixed(4)} {row.code}
                  </TableCell>
                  <TableCell>
                    {row.perNpr.toFixed(6)} {row.code}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border border-muted/60 bg-gradient-to-br from-background to-sky-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Value of 1 unit in NPR
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Compare how much 1 unit of each currency is worth in NPR, using the
            latest USD-based FX data.
          </p>
        </CardHeader>
        <CardContent className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="code" fontSize={11} tickLine={false} />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (!maxNpr) return value.toString();
                  if (maxNpr > 1000) {
                    return `${Math.round((value as number) / 1000)}k`;
                  }
                  return (value as number).toFixed(0);
                }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(4)} NPR`,
                  "1 unit =",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="nprPerUnit"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
