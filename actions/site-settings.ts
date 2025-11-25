"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export type NavLink = {
  label: string;
  href: string;
};

export type HeaderSettings = {
  brandName: string;
  navLinks: NavLink[];
};

export type HeroTitleWord = {
  text: string;
  highlight?: boolean;
};

export type HeroSettings = {
  eyebrow: string;
  titleWords: HeroTitleWord[];
  primaryDescription: string;
  secondaryPrefix: string;
  flipWords: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  imageLightUrl: string;
  imageDarkUrl: string;
  imageAlt: string;
};

export type FeatureCardIcon =
  | "PieChart"
  | "TrendingUp"
  | "Target"
  | "Bell"
  | "BarChart3"
  | "Repeat";

export type FeatureCardSettings = {
  icon: FeatureCardIcon;
  title: string;
  description: string;
  color: string;
};

export type FeaturesSettings = {
  heading: string;
  subheading: string;
  items: FeatureCardSettings[];
};

export type PricingFeature = {
  name: string;
  free: boolean;
  paid: boolean;
};

export type PricingPlanSettings = {
  id: string;
  name: string;
  priceLabel: string;
  priceSubLabel: string;
  description: string;
  highlightBadge?: string;
  ctaLabel: string;
  ctaHref: string;
};

export type PricingSettings = {
  heading: string;
  subheading: string;
  plans: PricingPlanSettings[];
  features: PricingFeature[];
  note: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterSettings = {
  brandText: string;
  description: string;
  columns: FooterColumn[];
  bottomLeft: string;
  bottomRight: string;
};

export type SiteSettingsData = {
  header: HeaderSettings;
  hero: HeroSettings;
  features: FeaturesSettings;
  pricing: PricingSettings;
  footer: FooterSettings;
};

async function ensureAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const claims: any = sessionClaims ?? {};
  const metadata = (claims.metadata as any) || (claims.publicMetadata as any) || {};
  const role = typeof metadata.role === "string" ? metadata.role : undefined;

  if (role && role !== "admin") {
    throw new Error("Forbidden");
  }
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  header: {
    brandName: "MoneyNest",
    navLinks: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  hero: {
    eyebrow: "Welcome to Welth",
    titleWords: [
      { text: "Build smart financial" },
      { text: "habits with us.", highlight: true },
    ],
    primaryDescription:
      "Track your accounts, categorize transactions, set goals, and make better decisions with clarity.",
    secondaryPrefix: "Build",
    flipWords: ["better", "smarter", "simpler", "confident"],
    primaryCtaLabel: "Get Started",
    primaryCtaHref: "/dashboard",
    imageLightUrl: "https://www.launchuicomponents.com/app-light.png",
    imageDarkUrl: "https://www.launchuicomponents.com/app-light.png",
    imageAlt: "Finance Tracker preview",
  },
  features: {
    heading: "Everything you need to succeed",
    subheading: "Powerful features to help you take control of your financial future",
    items: [
      {
        icon: "PieChart",
        title: "Smart Budgeting",
        description:
          "Create custom budgets that adapt to your spending patterns and financial goals.",
        color: "from-blue-500 to-cyan-500",
      },
      {
        icon: "TrendingUp",
        title: "Expense Tracking",
        description:
          "Automatically categorize transactions and track where your money goes.",
        color: "from-purple-500 to-pink-500",
      },
      {
        icon: "Target",
        title: "Financial Goals",
        description:
          "Set and achieve your financial goals with personalized recommendations.",
        color: "from-green-500 to-emerald-500",
      },
      {
        icon: "Bell",
        title: "Smart Alerts",
        description:
          "Get notified about bill due dates, unusual spending, and budget limits.",
        color: "from-orange-500 to-red-500",
      },
      {
        icon: "BarChart3",
        title: "Detailed Reports",
        description: "Visualize your financial data with beautiful charts and insights.",
        color: "from-teal-500 to-cyan-500",
      },
      {
        icon: "Repeat",
        title: "Recurring Transactions",
        description:
          "Automate recurring income and expenses for effortless tracking.",
        color: "from-violet-500 to-purple-500",
      },
    ],
  },
  pricing: {
    heading: "Choose Your Plan",
    subheading: "Start free and upgrade when you need more advanced features",
    plans: [
      {
        id: "free",
        name: "Free Plan",
        priceLabel: "$0",
        priceSubLabel: "/month",
        description: "Perfect for getting started with personal finance tracking",
        ctaLabel: "Get Started Free",
        ctaHref: "/dashboard",
      },
      {
        id: "pro",
        name: "Pro Plan",
        priceLabel: "$9.99",
        priceSubLabel: "/month",
        description: "Advanced features for serious financial management",
        highlightBadge: "Most Popular",
        ctaLabel: "Start Pro Trial",
        ctaHref: "/dashboard",
      },
    ],
    features: [
      { name: "Transaction Tracking", free: true, paid: true },
      { name: "Account Management", free: true, paid: true },
      { name: "Basic Reports", free: true, paid: true },
      { name: "Category Management", free: true, paid: true },
      { name: "Advanced Analytics", free: false, paid: true },
      { name: "Budget Planning", free: false, paid: true },
      { name: "Investment Tracking", free: false, paid: true },
      { name: "Export to Excel/PDF", free: false, paid: true },
      { name: "Priority Support", free: false, paid: true },
      { name: "Custom Categories", free: false, paid: true },
    ],
    note: "All plans include 30-day money-back guarantee",
  },
  footer: {
    brandText: "MoneyNest",
    description:
      "Smart, simple money tracking to help you stay on top of your savings, spending and goals.",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Transactions", href: "/transaction" },
          { label: "Goals", href: "/goals" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Contact", href: "mailto:hello@example.com" },
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
    bottomLeft: "© MoneyNest. All rights reserved.",
    bottomRight:
      "Built for individuals who want clarity and control over their finances.",
  },
};

function normalizeSettings(row: any | null): SiteSettingsData {
  if (!row) {
    return DEFAULT_SETTINGS;
  }

  return {
    header: (row.header as HeaderSettings) ?? DEFAULT_SETTINGS.header,
    hero: (row.hero as HeroSettings) ?? DEFAULT_SETTINGS.hero,
    features: (row.features as FeaturesSettings) ?? DEFAULT_SETTINGS.features,
    pricing: (row.pricing as PricingSettings) ?? DEFAULT_SETTINGS.pricing,
    footer: (row.footer as FooterSettings) ?? DEFAULT_SETTINGS.footer,
  };
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const prismaAny = db as any;

  // If Prisma client has not been regenerated yet, gracefully fall back
  if (!prismaAny.siteSettings || typeof prismaAny.siteSettings.findFirst !== "function") {
    return DEFAULT_SETTINGS;
  }

  const existing = await prismaAny.siteSettings.findFirst();
  if (!existing) {
    const created = await prismaAny.siteSettings.create({
      data: {
        header: DEFAULT_SETTINGS.header,
        hero: DEFAULT_SETTINGS.hero,
        features: DEFAULT_SETTINGS.features,
        pricing: DEFAULT_SETTINGS.pricing,
        footer: DEFAULT_SETTINGS.footer,
      },
    });
    return normalizeSettings(created);
  }

  return normalizeSettings(existing);
}

export async function updateSiteSettings(
  partial: Partial<SiteSettingsData>
): Promise<SiteSettingsData> {
  await ensureAdmin();

  const prismaAny = db as any;

  const existing =
    prismaAny.siteSettings && typeof prismaAny.siteSettings.findFirst === "function"
      ? await prismaAny.siteSettings.findFirst()
      : null;

  const base = normalizeSettings(existing);

  const merged: SiteSettingsData = {
    header: { ...base.header, ...(partial.header ?? {}) },
    hero: { ...base.hero, ...(partial.hero ?? {}) },
    features: {
      ...base.features,
      ...(partial.features ?? {}),
      items: partial.features?.items ?? base.features.items,
    },
    pricing: {
      ...base.pricing,
      ...(partial.pricing ?? {}),
      plans: partial.pricing?.plans ?? base.pricing.plans,
      features: partial.pricing?.features ?? base.pricing.features,
    },
    footer: {
      ...base.footer,
      ...(partial.footer ?? {}),
      columns: partial.footer?.columns ?? base.footer.columns,
    },
  };

  if (!prismaAny.siteSettings) {
    // Client not generated yet; return merged settings in-memory only
    return merged;
  }

  const row = existing
    ? await prismaAny.siteSettings.update({
        where: { id: existing.id },
        data: {
          header: merged.header,
          hero: merged.hero,
          features: merged.features,
          pricing: merged.pricing,
          footer: merged.footer,
        },
      })
    : await prismaAny.siteSettings.create({
        data: {
          header: merged.header,
          hero: merged.hero,
          features: merged.features,
          pricing: merged.pricing,
          footer: merged.footer,
        },
      });

  return normalizeSettings(row);
}
