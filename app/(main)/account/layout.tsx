import React, {Suspense} from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'
import AccountPage from './page'

const AccountLayout = () => {
  return (
    <div className = "px-8 py-6 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                 Account
            </h1>
        </div>

        {/* Account Page */}
        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
            <AccountPage />
        </Suspense>
    </div>
  )
}

export default AccountLayout