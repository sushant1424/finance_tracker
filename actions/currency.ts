"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache, revalidateTag } from "next/cache";

export type SupportedCurrency = "NPR" | "USD";

interface FxRates {
  baseCode: string;
  nprPerUsd: number;
  usdPerNpr: number;
  updatedAt: string;
  nextUpdateAt: string;
  rates: Record<string, number>;
}

const FX_CACHE_KEY = ["fx-rates-usd"];

async function fetchFxRates(): Promise<FxRates> {
  const response = await fetch("https://open.er-api.com/v6/latest/USD", {
    // Data only updates once every 24h; we still cache explicitly via unstable_cache
    // but set a reasonable fetch timeout via Next's standard fetch.
    // No extra options needed here.
  });

  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await response.json();

  if (!data || data.result !== "success" || !data.rates) {
    throw new Error("Invalid exchange rate response");
  }

  const nprRate = data.rates["NPR"];
  if (typeof nprRate !== "number" || !isFinite(nprRate) || nprRate <= 0) {
    throw new Error("NPR rate not available in FX data");
  }

  return {
    baseCode: data.base_code ?? "USD",
    nprPerUsd: nprRate,
    usdPerNpr: 1 / nprRate,
    updatedAt: data.time_last_update_utc ?? "",
    nextUpdateAt: data.time_next_update_utc ?? "",
    rates: data.rates as Record<string, number>,
  };
}

const getFxRatesCached = unstable_cache(fetchFxRates, FX_CACHE_KEY, {
  // Cache for 24 hours; the upstream API updates once per day.
  revalidate: 60 * 60 * 24,
  tags: ["fx-rates"],
});

export async function getFxRates(): Promise<FxRates> {
  return getFxRatesCached();
}

export async function getUserCurrency(): Promise<SupportedCurrency> {
  const { userId } = await auth();

  if (!userId) {
    // Default for unauthenticated contexts
    return "NPR";
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const defaultCurrency = (user as any)?.defaultCurrency as
    | SupportedCurrency
    | undefined;

  if (!defaultCurrency) {
    return "NPR";
  }

  return defaultCurrency;
}

export async function setUserCurrency(currency: SupportedCurrency) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { clerkUserId: userId },
    data: { defaultCurrency: currency } as any,
  });

  // Currency preference affects many summaries; revalidate key cached data.
  revalidateTag("dashboard");
  revalidateTag("reports");
  revalidateTag("statistics");
  revalidateTag("spending");

  return { success: true };
}
