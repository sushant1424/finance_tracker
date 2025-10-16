import React, {Suspense} from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'


const DashboardLayout = () => {
  return (
   
    <div className = "px-8 py-6 min-h-screen bg-gradient-to-b from-white to-gray-50">
      
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                 Dashboard
            </h1>
        </div>

        {/* Dashboard Page */}
        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
            <DashboardPage />
        </Suspense>
    </div>
  )
}

export default DashboardLayout