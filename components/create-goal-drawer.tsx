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
import { createGoal, type CreateGoalResult } from "@/actions/goals";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

type GoalFormValues = z.input<typeof goalSchema>;

interface CreateGoalDrawerProps {
  children: React.ReactNode;
}

const CreateGoalDrawer = ({ children }: CreateGoalDrawerProps) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      targetAmount: "",
      currentAmount: "",
      dueDate: "",
      description: "",
    },
  });

  const {
    data: newGoal,
    loading: createGoalLoading,
    error,
    fn: createGoalFn,
  } = useFetch<CreateGoalResult>(createGoal);

  const onSubmit = async (values: GoalFormValues) => {
    await createGoalFn({
      title: values.title,
      description: values.description,
      targetAmount: values.targetAmount,
      currentAmount:
        values.currentAmount && values.currentAmount !== ""
          ? values.currentAmount
          : undefined,
      dueDate: values.dueDate || undefined,
    });
  };

  useEffect(() => {
    if (newGoal?.success) {
      toast.success("Goal created successfully");
      reset();
      setOpen(false);
    }
  }, [newGoal, reset]);

  useEffect(() => {
    if (error) {
      toast.error(
        (error as { message?: string })?.message ||
          String(error) ||
          "Failed to create goal"
      );
    }
  }, [error]);

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create Goal</DrawerTitle>
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
                  disabled={!!createGoalLoading}
                >
                  {createGoalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Goal"
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

export default CreateGoalDrawer;
