/*
  Warnings:

  - You are about to drop the `site_settings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `year` to the `budgets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('MONTHLY', 'WEEKLY', 'YEARLY');

-- DropIndex
DROP INDEX "public"."budgets_userId_idx";

-- DropIndex
DROP INDEX "public"."budgets_userId_key";

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "month" INTEGER,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "period" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "week" INTEGER,
ADD COLUMN     "year" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."site_settings";

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budget_categories_budgetId_idx" ON "budget_categories"("budgetId");

-- CreateIndex
CREATE INDEX "budgets_userId_period_year_month_week_idx" ON "budgets"("userId", "period", "year", "month", "week");

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
