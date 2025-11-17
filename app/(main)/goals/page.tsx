import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatIndianCurrency } from "@/lib/currency";
import CreateGoalDrawer from "@/components/create-goal-drawer";
import { getUserGoals, type GoalDTO } from "@/actions/goals";

const GoalsPage = async () => {
  const goals = await getUserGoals();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
            Goals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and track your financial goals with real progress.
          </p>
        </div>

        <CreateGoalDrawer>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Goal
          </Button>
        </CreateGoalDrawer>
      </div>

      {goals.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal: GoalDTO) => {
            const target = goal.targetAmount || 0;
            const current = goal.currentAmount || 0;
            const progress =
              target > 0
                ? Math.min(100, Math.max(0, (current / target) * 100))
                : 0;

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    {goal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goal.description && (
                    <p className="text-xs text-muted-foreground">
                      {goal.description}
                    </p>
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

                  {goal.dueDate && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Target date: {new Date(goal.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
