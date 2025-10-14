import DashboardShell from '@/components/dashboard/DashboardShell';
import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({children}: MainLayoutProps) => {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}

export default MainLayout