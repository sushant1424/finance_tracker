"use client";

import { useEffect } from "react";
import type { BudgetOverview, CategoryBudgetStat, BudgetPeriod } from "@/actions/budget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatIndianCurrency } from "@/lib/currency";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { saveBudget } from "@/actions/budget";
import useFetch from "@/hooks/use-fetch";
import { useRouter } from "next/navigation";

interface BudgetClientProps {
  overview: BudgetOverview;
}

interface CategoryFormValue {
  category: string;
  amount: string;
}

interface BudgetFormValues {
  amount: string;
  categories: CategoryFormValue[];
}

function buildInitialCategories(categories: CategoryBudgetStat[]): CategoryFormValue[] {
  const withBudget = categories.filter((c) => c.budgetAmount !== null);
  if (withBudget.length === 0) {
    return [
      {
        category: "Food",
        amount: "0",
      },
      {
        category: "Transport",
        amount: "0",
      },
    ];
  }
  return withBudget.map((c) => ({
    category: c.category,
    amount: (c.budgetAmount ?? 0).toString(),
  }));
}

const BudgetClient = ({ overview }: BudgetClientProps) => {
  const router = useRouter();
  const defaultAmount = overview.budgetAmount ?? 0;

  const form = useForm<BudgetFormValues>({
    defaultValues: {
      amount: defaultAmount.toString(),
      categories: buildInitialCategories(overview.categories),
    },
  });

  const { control, register, handleSubmit, reset, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  });

  const {
    fn: saveBudgetFn,
    data,
    loading,
    error,
  } = useFetch(saveBudget);

  const onSubmit = async (values: BudgetFormValues) => {
    await saveBudgetFn({
      period: overview.period as BudgetPeriod,
      amount: values.amount,
      categories: values.categories,
    });
  };

  useEffect(() => {
    reset({
      amount: (overview.budgetAmount ?? 0).toString(),
      categories: buildInitialCategories(overview.categories),
    });
  }, [overview, reset]);

  useEffect(() => {
    if (data && typeof data === "object" && "success" in data && data.success) {
      toast.success("Budget updated");
      router.refresh();
    }
  }, [data, router]);

  useEffect(() => {
    if (error) {
      const message =
        (error as { message?: string })?.message ||
        String(error) ||
        "Failed to save budget";
      toast.error(message);
    }
  }, [error]);

  const spent = overview.spent;
  const budgetAmount = overview.budgetAmount;
  const remaining = overview.remaining;
  const usagePercent =
    budgetAmount && budgetAmount > 0
      ? Math.min(150, Math.max(0, (spent / budgetAmount) * 100))
      : 0;

  const handleApplyRollover = async () => {
    if (!overview.rolloverLeftover || overview.rolloverLeftover <= 0) return;
    const baseAmount = budgetAmount ?? 0;
    const categories = getValues("categories");
    await saveBudgetFn({
      period: overview.period as BudgetPeriod,
      amount: (baseAmount + overview.rolloverLeftover).toString(),
      categories,
    });
  };

  const handleApplyAutoSuggestion = async () => {
    if (!overview.autoSuggestedTotal || !overview.autoSuggestedCategories) return;
    await saveBudgetFn({
      period: overview.period as BudgetPeriod,
      amount: overview.autoSuggestedTotal.toString(),
      categories: overview.autoSuggestedCategories.map((c) => ({
        category: c.category,
        amount: c.amount.toString(),
      })),
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        {overview.rolloverLeftover && overview.rolloverLeftover > 0 && (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm font-semibold text-amber-800">
                  You have leftover budget from last period
                </CardTitle>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
                disabled={!!loading}
                onClick={handleApplyRollover}
              >
                Add {formatIndianCurrency(overview.rolloverLeftover)} to this budget
              </Button>
            </CardHeader>
            <CardContent className="text-[11px] text-amber-800 space-y-1">
              <p>
                We detected unspent budget from your previous {overview.period.toLowerCase()}.
              </p>
              <p>
                You can roll it over into this period to increase your available budget while still
                keeping control.
              </p>
            </CardContent>
          </Card>
        )}

        {overview.autoSuggestedCategories &&
          overview.autoSuggestedCategories.length > 0 &&
          overview.autoSuggestedTotal && (
            <Card className="border-sky-200 bg-sky-50/70">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-sky-900">
                    Smart budget suggestion
                  </CardTitle>
                  <p className="text-[11px] text-sky-800 mt-1">
                    Based on your last few months of spending, here&apos;s a suggested total and
                    category split.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-sky-300 text-sky-900 hover:bg-sky-100"
                  disabled={!!loading}
                  onClick={handleApplyAutoSuggestion}
                >
                  Use suggested budget
                </Button>
              </CardHeader>
              <CardContent className="text-[11px] text-sky-900 space-y-2">
                <p>
                  Suggested total:{" "}
                  <span className="font-semibold">
                    {formatIndianCurrency(overview.autoSuggestedTotal || 0)}
                  </span>
                </p>
                <div className="space-y-1">
                  {overview.autoSuggestedCategories.slice(0, 5).map((c) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span className="capitalize text-sky-900">{c.category}</span>
                      <span className="font-medium">
                        {formatIndianCurrency(c.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {budgetAmount !== null && overview.overspent && (
          <Card className="border-red-200 bg-red-50/60">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <CardTitle className="text-sm font-semibold text-red-700">
                You are over budget this period
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-red-700 space-y-1">
              <p>
                You planned {formatIndianCurrency(budgetAmount)} but already spent {formatIndianCurrency(spent)}.
              </p>
              <p>
                You are over by {formatIndianCurrency(Math.abs(remaining))}.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              This period&apos;s budget overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Planned budget</p>
                <p className="text-lg font-semibold">
                  {budgetAmount !== null ? formatIndianCurrency(budgetAmount) : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Spent so far</p>
                <p className="text-lg font-semibold">
                  {formatIndianCurrency(spent)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold">
                  {budgetAmount !== null
                    ? formatIndianCurrency(remaining)
                    : "Set a budget to track"}
                </p>
              </div>
            </div>

            {budgetAmount !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Budget usage</span>
                  <span>{usagePercent.toFixed(1)}%</span>
                </div>
                <Progress value={usagePercent} />
                {overview.projectedSpend && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    At your current pace you&apos;re on track to spend
                    {" "}
                    <span className="font-semibold text-foreground">
                      {formatIndianCurrency(overview.projectedSpend)}
                    </span>
                    {" "}
                    this period.
                    {overview.projectedOverBy && overview.projectedOverBy > 0 && (
                      <>
                        {" "}
                        You may exceed your budget by
                        {" "}
                        <span className="font-semibold text-red-600">
                          {formatIndianCurrency(overview.projectedOverBy)}
                        </span>
                        . Consider trimming discretionary categories.
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Category breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            {overview.categories.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                No expenses recorded for this period yet.
              </p>
            ) : (
              overview.categories.map((cat) => {
                const hasBudget = cat.budgetAmount !== null;
                const percent = hasBudget && cat.budgetAmount && cat.budgetAmount > 0
                  ? Math.min(150, Math.max(0, (cat.spent / (cat.budgetAmount as number)) * 100))
                  : 0;
                return (
                  <div
                    key={cat.category}
                    className="space-y-1 border-b last:border-b-0 border-dashed border-border/40 pb-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-muted-foreground">
                        {cat.category}
                      </span>
                      <span
                        className={
                          cat.overspent
                            ? "text-xs font-semibold text-red-600"
                            : "text-xs font-semibold text-foreground"
                        }
                      >
                        {formatIndianCurrency(cat.spent)}
                        {hasBudget && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            / {formatIndianCurrency(cat.budgetAmount as number)}
                          </span>
                        )}
                      </span>
                    </div>
                    {hasBudget && (
                      <Progress value={percent} />
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Set budget and category limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label htmlFor="amount" className="text-xs font-medium">
                Total budget for this period
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Category limits
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({
                      category: "",
                      amount: "0",
                    })
                  }
                >
                  Add category
                </Button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_auto] gap-2 items-center"
                  >
                    <Input
                      placeholder="Category (e.g. Food)"
                      {...register(`categories.${index}.category` as const)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      {...register(`categories.${index}.amount` as const)}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!!loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save budget"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetClient;
