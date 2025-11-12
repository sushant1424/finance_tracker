import React from 'react'
import { Breadcrumb } from '@/components/breadcrumb'

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your accounts
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default AccountLayout