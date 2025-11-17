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
  return serialized;
};

interface GoalPayload {
  title: string;
  description?: string;
  targetAmount: string | number;
  currentAmount?: string | number;
  dueDate?: string; // ISO string from input
}

type GoalStatusType = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface GoalDTO {
  id: string;
  title: string;
  description?: string | null;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string | Date | null;
  status: GoalStatusType;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateGoalResult {
  success: boolean;
  data: GoalDTO;
}

const getUserGoalsCached = unstable_cache(
  async (userId: string): Promise<GoalDTO[]> => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
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

    const dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const goal = await db.goal.create({
      data: {
        title: data.title,
        description: data.description || null,
        targetAmount: targetFloat,
        currentAmount: currentFloat,
        dueDate,
        status: "ACTIVE",
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
