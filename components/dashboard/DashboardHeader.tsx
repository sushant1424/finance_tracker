"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
const DashboardHeader = () => {
  const { user } = useUser();
  const firstName = user?.firstName || user?.username || "there";
  
  return (
    <div className="sticky top-0 z-40 w-full bg-neutral-100 border-b">
      <div className="px-6 py-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{`Welcome back, ${firstName}`}</h1>
      </div>
    </div>
  );
};

export default DashboardHeader;