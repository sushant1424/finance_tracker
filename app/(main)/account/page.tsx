import { getUserAccounts } from '@/actions/accounts'
import { getFxRates, getUserCurrency } from '@/actions/currency'
import type { DisplayCurrency } from '@/lib/currency'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'
import AccountCard from './_components/AccountCard'

const AccountPage = async () => {
  const [accounts, fx, userCurrency] = await Promise.all([
    getUserAccounts(),
    getFxRates(),
    getUserCurrency(),
  ])

  const displayCurrency = userCurrency as DisplayCurrency
  const nprPerUsd = fx.nprPerUsd

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <CreateAccountDrawer>
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed h-full flex flex-col">
          <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground pt-5">
            <Plus className="h-10 w-10 mb-2" />
            <p className="font-medium text-sm">Create New Account</p>
          </CardContent>
        </Card>
      </CreateAccountDrawer>

      {accounts.length > 0 && accounts?.map((account) => {
        return (
          <AccountCard
            key={account.id}
            account={account}
            displayCurrency={displayCurrency}
            nprPerUsd={nprPerUsd}
          />
        )
      })}

      
    </div>
  )
}

export default AccountPage