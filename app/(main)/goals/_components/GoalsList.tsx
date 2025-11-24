"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIndianCurrency } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditGoalDrawer from "@/components/edit-goal-drawer";
import { updateGoalProgress, updateGoalStatus, deleteGoal } from "@/actions/goals";
import type { GoalDTO } from "@/actions/goals";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type GoalStatusType = "ACTIVE" | "COMPLETED" | "ARCHIVED";

type Goal = GoalDTO;

type FilterKey = "ALL" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

interface GoalsListProps {
  goals: Goal[];
}

const GoalsList: React.FC<GoalsListProps> = ({ goals }) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [progressValue, setProgressValue] = useState<string>("");

  const filteredGoals = useMemo(() => {
    if (activeFilter === "ACTIVE") {
      return goals.filter((goal) => goal.status === "ACTIVE");
    }
    if (activeFilter === "COMPLETED") {
      return goals.filter((goal) => goal.status === "COMPLETED");
    }
    if (activeFilter === "ARCHIVED") {
      return goals.filter((goal) => goal.status === "ARCHIVED");
    }
    return goals;
  }, [goals, activeFilter]);

  const sortedGoals = useMemo(() => {
    const priorityRank: Record<string, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    return [...filteredGoals].sort((a, b) => {
      const pa = priorityRank[a.priority || "MEDIUM"] || 2;
      const pb = priorityRank[b.priority || "MEDIUM"] || 2;
      if (pa !== pb) return pb - pa;
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });
  }, [filteredGoals]);

  const filterButtonClass = (key: FilterKey) =>
    key === activeFilter
      ? "bg-primary text-primary-foreground shadow-sm"
      : "bg-transparent text-muted-foreground hover:bg-muted";

  const handleStatusChange = async (goalId: string, status: GoalStatusType) => {
    try {
      await updateGoalStatus(goalId, status);
      toast.success("Goal status updated");
      router.refresh();
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        String(error) ||
        "Failed to update goal status";
      toast.error(message);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      const result = await deleteGoal(goalId);
      if (result?.success) {
        toast.success("Goal deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete goal");
      }
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        String(error) ||
        "Failed to delete goal";
      toast.error(message);
    }
  };

  const handleQuickProgress = (goal: Goal) => {
    const initial = goal.currentAmount || 0;
    setProgressGoal(goal);
    setProgressValue(initial.toString());
  };

  const handleConfirmProgress = async () => {
    if (!progressGoal) return;

    const value = parseFloat(progressValue);
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid non-negative number");
      return;
    }

    try {
      await updateGoalProgress(progressGoal.id, value);
      toast.success("Goal progress updated");
      setProgressGoal(null);
      router.refresh();
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        String(error) ||
        "Failed to update progress";
      toast.error(message);
    }
  };

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any goals yet.
          </p>
          <p className="text-xs text-muted-foreground">
            Click &quot;Create Goal&quot; to set your first savings or payoff target.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex rounded-full border bg-background p-1 text-xs sm:text-sm">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={`rounded-full px-3 ${filterButtonClass("ALL")}`}
            onClick={() => setActiveFilter("ALL")}
          >
            All
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={`rounded-full px-3 ${filterButtonClass("ACTIVE")}`}
            onClick={() => setActiveFilter("ACTIVE")}
          >
            Active
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={`rounded-full px-3 ${filterButtonClass("COMPLETED")}`}
            onClick={() => setActiveFilter("COMPLETED")}
          >
            Completed
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={`rounded-full px-3 ${filterButtonClass("ARCHIVED")}`}
            onClick={() => setActiveFilter("ARCHIVED")}
          >
            Archived
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filteredGoals.length} of {goals.length} goals
        </p>
      </div>

      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="py-8 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-sm text-muted-foreground">
              No goals in this view.
            </p>
            <p className="text-xs text-muted-foreground">
              Try switching to another filter to see more goals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGoals.map((goal) => {
            const target = goal.targetAmount || 0;
            const current = goal.currentAmount || 0;
            const progress =
              target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;

            const minTarget = goal.minTargetAmount || null;
            const maxTarget = goal.maxTargetAmount || null;
            const priorityLabel = (goal.priority || "MEDIUM").toLowerCase();
            const priorityClass =
              goal.priority === "HIGH"
                ? "text-xs font-medium text-red-600"
                : goal.priority === "LOW"
                ? "text-xs font-medium text-emerald-600"
                : "text-xs font-medium text-amber-600";

            const now = new Date();
            let timelineText: string | null = null;
            if (goal.dueDate && target > current) {
              const due = new Date(goal.dueDate);
              const msPerDay = 24 * 60 * 60 * 1000;
              const daysLeft = Math.round((due.getTime() - now.getTime()) / msPerDay);
              const remainingAmount = target - current;
              if (daysLeft > 0 && remainingAmount > 0) {
                const perDay = remainingAmount / daysLeft;
                const perMonth = perDay * 30;
                timelineText = `To finish on time, save about ${formatIndianCurrency(
                  perMonth
                )} per month.`;
              }
            }

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
                    <span className="truncate">{goal.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={
                            goal.status === "COMPLETED"
                              ? "text-xs font-medium text-green-600"
                              : goal.status === "ARCHIVED"
                              ? "text-xs font-medium text-gray-500"
                              : "text-xs font-medium text-blue-600"
                          }
                        >
                          {goal.status.toLowerCase()}
                        </span>
                        <span className={priorityClass}>{priorityLabel} priority</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => handleQuickProgress(goal)}
                          >
                            Update progress
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(goal.id, "COMPLETED")}
                          >
                            Mark as completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(goal.id, "ACTIVE")}
                          >
                            Mark as active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(goal.id, "ARCHIVED")}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteGoalId(goal.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goal.description && (
                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                  )}

                  <Progress value={progress} />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">
                      Saved: {formatIndianCurrency(current)}
                    </span>
                    <span className="text-muted-foreground">
                      Target: {formatIndianCurrency(target)}
                    </span>
                  </div>
                  <p className="text-xs font-medium mt-1">
                    {Math.round(progress)}% of goal
                  </p>

                  {(minTarget || maxTarget) && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Range:
                      {" "}
                      {minTarget && maxTarget
                        ? `${formatIndianCurrency(minTarget)} – ${formatIndianCurrency(maxTarget)}`
                        : minTarget
                        ? `at least ${formatIndianCurrency(minTarget)}`
                        : maxTarget
                        ? `up to ${formatIndianCurrency(maxTarget)}`
                        : ""}
                    </p>
                  )}

                  {goal.dueDate && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Target date: {new Date(goal.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  {timelineText && (
                    <p className="text-[11px] text-amber-700 mt-1">
                      {timelineText}
                    </p>
                  )}

                  <div className="flex justify-end pt-1">
                    <EditGoalDrawer goal={goal}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        Edit goal
                      </Button>
                    </EditGoalDrawer>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <AlertDialog
        open={!!progressGoal}
        onOpenChange={(open) => {
          if (!open) setProgressGoal(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update goal progress</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the current saved amount for this goal. We&apos;ll update your
              progress and mark it completed automatically once it reaches the
              target.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-3 space-y-2">
            <label htmlFor="goal-progress" className="text-xs font-medium">
              Current amount
            </label>
            <Input
              id="goal-progress"
              type="number"
              step="0.01"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmProgress}>
              Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!deleteGoalId}
        onOpenChange={(open) => {
          if (!open) setDeleteGoalId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Delete goal
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal and its progress. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (!deleteGoalId) return;
                const id = deleteGoalId;
                setDeleteGoalId(null);
                await handleDelete(id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GoalsList;
