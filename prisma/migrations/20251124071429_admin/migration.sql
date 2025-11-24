-- CreateTable
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "logoText" TEXT,
    "heroTitle" TEXT,
    "heroSubheading" TEXT,
    "heroCtaText" TEXT,
    "heroCtaHref" TEXT,
    "heroImageLight" TEXT,
    "heroImageDark" TEXT,
    "footerText" TEXT,
    "footerSubtext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);
