import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateGoalDrawer from "@/components/create-goal-drawer";
import { getUserGoals } from "@/actions/goals";
import GoalsList from "./_components/GoalsList";

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
      <GoalsList goals={goals} />
    </div>
  );
};

export default GoalsPage;
