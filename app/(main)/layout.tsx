"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({children}: MainLayoutProps) => {
  const pathname = usePathname();

  return (
    <DashboardShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </DashboardShell>
  )
}

export default MainLayout