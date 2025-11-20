-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NPR', 'USD');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "defaultCurrency" "Currency" NOT NULL DEFAULT 'NPR';
