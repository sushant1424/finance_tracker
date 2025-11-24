-- CreateEnum
CREATE TYPE "GoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "maxTargetAmount" DECIMAL(65,30),
ADD COLUMN     "minTargetAmount" DECIMAL(65,30),
ADD COLUMN     "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM';
