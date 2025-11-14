"use client";
import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";
import Link from "next/link";

export default function WobbleFinanceSection() {
  return (
    <section className="py-20">
      {/* Section Header */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Master Your Money With Smart Insights
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
          Powerful tools that help you track, plan, and grow — all in one simple dashboard.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full px-4">
        
        {/* Card 1 */}
        <WobbleCard
          containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-blue-900 to-indigo-800 min-h-[500px] lg:min-h-[320px] p-8"
        >
          <div className="max-w-sm">
            <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold text-white">
              All Your Accounts, One Clear View
            </h3>
            <p className="mt-4 text-left text-base/6 text-neutral-200">
              Connect your bank accounts, cards, and wallets to see real-time balances and spending — instantly.
            </p>
            <div className="mt-6">
              <Link
                href="/account"
                className="inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition"
              >
                View Accounts
              </Link>
            </div>
          </div>
        </WobbleCard>

        {/* Card 2 */}
        <WobbleCard
          containerClassName="col-span-1 min-h-[320px] bg-gradient-to-br from-emerald-700 to-emerald-800 p-8"
        >
          <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold text-white">
            Budgets Built Around Your Life
          </h3>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            Create flexible budgets that adjust to your habits and keep you on track with gentle reminders.
          </p>
        </WobbleCard>

        {/* Card 3 */}
        <WobbleCard
          containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-br from-fuchsia-800 to-pink-700 min-h-[500px] lg:min-h-[360px] p-8"
        >
          <div className="max-w-md">
            <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold text-white">
              Insights That Make Saving Easy
            </h3>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
              Get personalized recommendations, spending breakdowns, and trends that actually help you save more.
            </p>
          </div>
        </WobbleCard>
      </div>
    </section>
  );
}
