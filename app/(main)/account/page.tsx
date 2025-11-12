import { getUserAccounts } from '@/actions/accounts'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'
import AccountCard from './_components/AccountCard'

 const AccountPage = async () => {

  const accounts = await getUserAccounts()
 

  return (
    <div className ="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <CreateAccountDrawer>
        <Card className="cursor-pointer hover:shadow-md transition-shadow  border-dashed ">
          <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
            <Plus className = "h-10 w-10 mb-2"/>
            <p className="font-medium text-sm">Create New Account</p>
          </CardContent>
        </Card>
      </CreateAccountDrawer>

      {accounts.length > 0 && accounts?.map((account) => {
        return <AccountCard key={account.id} account={account} />
      })}

      
    </div>
  )
}

export default AccountPage