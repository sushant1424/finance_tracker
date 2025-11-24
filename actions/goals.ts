"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const serializeGoal = (obj: any): any => {
  const serialized = { ...obj };
  if (obj.targetAmount) {
    serialized.targetAmount = obj.targetAmount.toNumber();
  }
  if (obj.currentAmount) {
    serialized.currentAmount = obj.currentAmount.toNumber();
  }
  if (obj.minTargetAmount !== undefined && obj.minTargetAmount !== null) {
    serialized.minTargetAmount = obj.minTargetAmount.toNumber();
  }
  if (obj.maxTargetAmount !== undefined && obj.maxTargetAmount !== null) {
    serialized.maxTargetAmount = obj.maxTargetAmount.toNumber();
  }
  if (obj.priority) {
    serialized.priority = obj.priority;
  }
  return serialized;
};

interface GoalPayload {
  title: string;
  description?: string;
  targetAmount: string | number;
  currentAmount?: string | number;
  dueDate?: string; // ISO string from input
  minTargetAmount?: string | number;
  maxTargetAmount?: string | number;
  priority?: GoalPriorityType;
}

type GoalStatusType = "ACTIVE" | "COMPLETED" | "ARCHIVED";
type GoalPriorityType = "LOW" | "MEDIUM" | "HIGH";

export interface GoalDTO {
  id: string;
  title: string;
  description?: string | null;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string | Date | null;
  status: GoalStatusType;
   minTargetAmount?: number | null;
   maxTargetAmount?: number | null;
   priority: GoalPriorityType;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateGoalResult {
  success: boolean;
  data: GoalDTO;
}

export type UpdateGoalResult = CreateGoalResult;

export interface DeleteGoalResult {
  success: boolean;
}

interface UpdateGoalPayload extends GoalPayload {
  id: string;
}

const getUserGoalsCached = unstable_cache(
  async (userId: string): Promise<GoalDTO[]> => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return goals.map(serializeGoal) as GoalDTO[];
  },
  ["user-goals"],
  {
    revalidate: 10,
    tags: ["goals"],
  }
);

export async function getUserGoals(): Promise<GoalDTO[]> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await getUserGoalsCached(userId);
  } catch (error: any) {
    console.error(error.message);
    return [];
  }
}

export async function createGoal(data: GoalPayload): Promise<CreateGoalResult> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const targetFloat = parseFloat(data.targetAmount.toString());
    if (isNaN(targetFloat) || targetFloat <= 0) {
      throw new Error("Invalid target amount");
    }

    const currentFloat = data.currentAmount
      ? parseFloat(data.currentAmount.toString())
      : 0;
    if (isNaN(currentFloat) || currentFloat < 0) {
      throw new Error("Invalid current amount");
    }

    const minTargetFloat = data.minTargetAmount
      ? parseFloat(data.minTargetAmount.toString())
      : null;
    if (minTargetFloat !== null && (isNaN(minTargetFloat) || minTargetFloat <= 0)) {
      throw new Error("Invalid minimum target amount");
    }

    const maxTargetFloat = data.maxTargetAmount
      ? parseFloat(data.maxTargetAmount.toString())
      : null;
    if (maxTargetFloat !== null && (isNaN(maxTargetFloat) || maxTargetFloat <= 0)) {
      throw new Error("Invalid maximum target amount");
    }

    if (
      minTargetFloat !== null &&
      maxTargetFloat !== null &&
      minTargetFloat > maxTargetFloat
    ) {
      throw new Error("Minimum amount cannot be greater than maximum amount");
    }

    const dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const goal = await db.goal.create({
      data: {
        title: data.title,
        description: data.description || null,
        targetAmount: targetFloat,
        currentAmount: currentFloat,
        dueDate,
        status: "ACTIVE",
        minTargetAmount: minTargetFloat,
        maxTargetAmount: maxTargetFloat,
        priority: (data.priority as any) || "MEDIUM",
        userId: user.id,
      },
    });

    const serialized = serializeGoal(goal) as GoalDTO;

    revalidatePath("/goals");
    revalidateTag("goals");
    revalidateTag("dashboard");

    return { success: true, data: serialized };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateGoal(data: UpdateGoalPayload): Promise<UpdateGoalResult> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const existing = await db.goal.findFirst({
      where: {
        id: data.id,
        userId: user.id,
      },
    });

    if (!existing) throw new Error("Goal not found");

    const targetFloat = parseFloat(data.targetAmount.toString());
    if (isNaN(targetFloat) || targetFloat <= 0) {
      throw new Error("Invalid target amount");
    }

    const currentFloat = data.currentAmount
      ? parseFloat(data.currentAmount.toString())
      : 0;
    if (isNaN(currentFloat) || currentFloat < 0) {
      throw new Error("Invalid current amount");
    }

    const minTargetFloat = data.minTargetAmount
      ? parseFloat(data.minTargetAmount.toString())
      : null;
    if (minTargetFloat !== null && (isNaN(minTargetFloat) || minTargetFloat <= 0)) {
      throw new Error("Invalid minimum target amount");
    }

    const maxTargetFloat = data.maxTargetAmount
      ? parseFloat(data.maxTargetAmount.toString())
      : null;
    if (maxTargetFloat !== null && (isNaN(maxTargetFloat) || maxTargetFloat <= 0)) {
      throw new Error("Invalid maximum target amount");
    }

    if (
      minTargetFloat !== null &&
      maxTargetFloat !== null &&
      minTargetFloat > maxTargetFloat
    ) {
      throw new Error("Minimum amount cannot be greater than maximum amount");
    }

    const dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updated = await db.goal.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description || null,
        targetAmount: targetFloat,
        currentAmount: currentFloat,
        dueDate,
        // Keep existing status; status changes are handled explicitly via updateGoalStatus/updateGoalProgress
        status: existing.status,
        minTargetAmount: minTargetFloat,
        maxTargetAmount: maxTargetFloat,
        priority: (data.priority as any) || existing.priority,
      },
    });

    const serialized = serializeGoal(updated) as GoalDTO;

    revalidatePath("/goals");
    revalidateTag("goals");
    revalidateTag("dashboard");

    return { success: true, data: serialized };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateGoalProgress(goalId: string, currentAmount: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    if (currentAmount < 0 || isNaN(currentAmount)) {
      throw new Error("Invalid current amount");
    }

    const goal = await db.goal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    if (!goal) throw new Error("Goal not found");

    const updated = await db.goal.update({
      where: { id: goalId },
      data: {
        currentAmount,
        status:
          currentAmount >= goal.targetAmount.toNumber()
            ? "COMPLETED"
            : "ACTIVE",
      },
    });

    const serialized = serializeGoal(updated);

    revalidatePath("/goals");
    revalidateTag("goals");
    revalidateTag("dashboard");

    return { success: true, data: serialized };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteGoal(goalId: string): Promise<DeleteGoalResult> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const existing = await db.goal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    if (!existing) throw new Error("Goal not found");

    await db.goal.delete({
      where: { id: goalId },
    });

    revalidatePath("/goals");
    revalidateTag("goals");
    revalidateTag("dashboard");

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateGoalStatus(goalId: string, status: GoalStatusType) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const updated = await db.goal.update({
      where: {
        id: goalId,
      },
      data: {
        status,
      },
    });

    const serialized = serializeGoal(updated);

    revalidatePath("/goals");
    revalidateTag("goals");
    revalidateTag("dashboard");

    return { success: true, data: serialized };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
