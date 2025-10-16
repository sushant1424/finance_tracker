"use client";
import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";
import Link from "next/link";

export default function WobbleFinanceSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full px-4">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-blue-900 to-indigo-800 min-h-[500px] lg:min-h-[300px]"
        className=""
      >
        <div className="max-w-xs">
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Track all your accounts in one place
          </h2>
          <p className="mt-4 text-left text-base/6 text-neutral-200">
            Connect checking, savings, and more. See balances and recent activity at a glance.
          </p>
          <div className="mt-6">
            <Link href="/account" className="inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-white hover:bg-white/20">
              View accounts
            </Link>
          </div>
        </div>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-emerald-700 to-emerald-800">
        <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Budget that adapts to you
        </h2>
        <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
          Set flexible limits by category and get gentle nudges before overspending.
        </p>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-br from-fuchsia-800 to-pink-700 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm">
          <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Insights that actually help you save
          </h2>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            Real-time trends, cash flow, and recommendations to reach goals faster.
          </p>
        </div>
      </WobbleCard>
    </div>
  );
}


