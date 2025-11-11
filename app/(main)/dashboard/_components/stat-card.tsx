"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

const iconMap = {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
};

interface StatCardProps {
  title: string;
  value: string;
  iconName: keyof typeof iconMap;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor: string;
  iconBg: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconName,
  trend,
  iconColor,
  iconBg,
}) => {
  const Icon = iconMap[iconName];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-white to-gray-50/30 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 sm:p-5 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{value}</h3>
              {trend && (
                <p
                  className={`text-xs mt-2 flex items-center gap-1 font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  {trend.value}
                </p>
              )}
            </div>
            <div
              className={`p-2.5 sm:p-3 rounded-xl ${iconBg} shadow-lg ring-1 ring-white/50 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
