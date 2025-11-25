"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  UserCheck,
  Activity,
  ReceiptText,
  BarChart3,
  Target,
} from "lucide-react";

const iconMap = {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  UserCheck,
  Activity,
  ReceiptText,
  BarChart3,
  Target,
};

interface AdminStatCardProps {
  title: string;
  value: string;
  iconName: keyof typeof iconMap;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  iconName,
  iconColor,
  iconBg,
  trend,
}) => {
  const Icon = iconMap[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-slate-50 to-slate-100/40 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 sm:p-5 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {title}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {value}
              </h3>
              {trend && (
                <p
                  className={`mt-1.5 text-[11px] sm:text-xs font-medium flex items-center gap-1 ${
                    trend.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  <span>{trend.isPositive ? "↑" : "↓"}</span>
                  {trend.value}
                </p>
              )}
            </div>
            <div
              className={`p-2.5 sm:p-3 rounded-xl ${iconBg} shadow-md ring-1 ring-white/60 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
