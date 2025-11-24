"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { goalSchema } from "@/app/(main)/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { updateGoal, type UpdateGoalResult, type GoalDTO } from "@/actions/goals";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { useRouter } from "next/navigation";

type GoalFormValues = z.input<typeof goalSchema>;

interface EditGoalDrawerProps {
  goal: GoalDTO;
  children: React.ReactNode;
}

const EditGoalDrawer = ({ goal, children }: EditGoalDrawerProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const dueDateValue =
    goal.dueDate instanceof Date
      ? goal.dueDate.toISOString().split("T")[0]
      : goal.dueDate
      ? new Date(goal.dueDate).toISOString().split("T")[0]
      : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal.title || "",
      targetAmount: goal.targetAmount?.toString() || "",
      currentAmount: goal.currentAmount?.toString() || "",
      dueDate: dueDateValue,
      description: goal.description || "",
      minTargetAmount:
        goal.minTargetAmount !== undefined && goal.minTargetAmount !== null
          ? goal.minTargetAmount.toString()
          : "",
      maxTargetAmount:
        goal.maxTargetAmount !== undefined && goal.maxTargetAmount !== null
          ? goal.maxTargetAmount.toString()
          : "",
      priority: goal.priority || "MEDIUM",
    },
  });

  const {
    data: updatedGoal,
    loading: updateGoalLoading,
    error,
    fn: updateGoalFn,
  } = useFetch<UpdateGoalResult>(updateGoal);

  const onSubmit = async (values: GoalFormValues) => {
    await updateGoalFn({
      id: goal.id,
      title: values.title,
      description: values.description,
      targetAmount: values.targetAmount,
      currentAmount:
        values.currentAmount && values.currentAmount !== ""
          ? values.currentAmount
          : undefined,
      dueDate: values.dueDate || undefined,
      minTargetAmount:
        values.minTargetAmount && values.minTargetAmount !== ""
          ? values.minTargetAmount
          : undefined,
      maxTargetAmount:
        values.maxTargetAmount && values.maxTargetAmount !== ""
          ? values.maxTargetAmount
          : undefined,
      priority: values.priority,
    });
  };

  useEffect(() => {
    if (updatedGoal?.success) {
      toast.success("Goal updated successfully");
      const updated = updatedGoal.data;
      const updatedDueDate = updated.dueDate
        ? new Date(updated.dueDate).toISOString().split("T")[0]
        : "";
      reset({
        title: updated.title || "",
        targetAmount: updated.targetAmount?.toString() || "",
        currentAmount: updated.currentAmount?.toString() || "",
        dueDate: updatedDueDate,
        description: updated.description || "",
        minTargetAmount:
          updated.minTargetAmount !== undefined && updated.minTargetAmount !== null
            ? updated.minTargetAmount.toString()
            : "",
        maxTargetAmount:
          updated.maxTargetAmount !== undefined && updated.maxTargetAmount !== null
            ? updated.maxTargetAmount.toString()
            : "",
        priority: updated.priority || "MEDIUM",
      });
      setOpen(false);
      router.refresh();
    }
  }, [updatedGoal, reset, router]);

  useEffect(() => {
    if (error) {
      toast.error(
        (error as { message?: string })?.message ||
          String(error) ||
          "Failed to update goal"
      );
    }
  }, [error]);

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Goal</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Goal Title
                </label>
                <Input
                  id="title"
                  placeholder="e.g. Emergency Fund"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">
                    {errors.title.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <select
                  id="priority"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("priority")}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                {errors.priority && (
                  <p className="text-sm text-red-600">
                    {errors.priority.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="targetAmount"
                  className="text-sm font-medium"
                >
                  Target Amount
                </label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("targetAmount")}
                />
                {errors.targetAmount && (
                  <p className="text-sm text-red-600">
                    {errors.targetAmount.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="minTargetAmount"
                    className="text-sm font-medium"
                  >
                    Min Target (optional)
                  </label>
                  <Input
                    id="minTargetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("minTargetAmount")}
                  />
                  {errors.minTargetAmount && (
                    <p className="text-sm text-red-600">
                      {errors.minTargetAmount.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="maxTargetAmount"
                    className="text-sm font-medium"
                  >
                    Max Target (optional)
                  </label>
                  <Input
                    id="maxTargetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("maxTargetAmount")}
                  />
                  {errors.maxTargetAmount && (
                    <p className="text-sm text-red-600">
                      {errors.maxTargetAmount.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="currentAmount"
                  className="text-sm font-medium"
                >
                  Current Amount (optional)
                </label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("currentAmount")}
                />
                {errors.currentAmount && (
                  <p className="text-sm text-red-600">
                    {errors.currentAmount.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Target Date (optional)
                </label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
                {errors.dueDate && (
                  <p className="text-sm text-red-600">
                    {errors.dueDate.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium"
                >
                  Description (optional)
                </label>
                <Input
                  id="description"
                  placeholder="Add a short note"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <DrawerClose asChild>
                  <Button type="button" className="flex-1" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!!updateGoalLoading}
                >
                  {updateGoalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default EditGoalDrawer;
