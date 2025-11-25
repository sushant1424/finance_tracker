-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "header" JSONB NOT NULL,
    "hero" JSONB NOT NULL,
    "features" JSONB NOT NULL,
    "pricing" JSONB NOT NULL,
    "footer" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
