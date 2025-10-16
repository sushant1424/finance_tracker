"use client"
import { updateDefaultAccount } from '@/actions/accounts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowUpRight} from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import { toast } from 'sonner';
import { useEffect } from 'react';
type AccountCardProps = {
  account: any; 
};

const AccountCard = ({ account }: AccountCardProps) => {
    const { name, type, balance, id, isDefault } = account;

  

    const {data:updatedAccount,
        loading:updateDefaultLoading,
        error,
        fn:updateAccountFn} = useFetch(updateDefaultAccount)

    const handleDefaultChange = async (event: React.MouseEvent<HTMLButtonElement>) =>{
        event.preventDefault();

        if(isDefault){
            toast.warning("You need atleast one default account")
            return;//Dont allow unchecking the default account
        }

        await updateAccountFn(id);
    }

     useEffect(() => {
        // Since updatedAccount could be undefined or an object, and to avoid type errors,
        // check if updatedAccount exists and treat as type any for success property access
        if ((updatedAccount as any)?.success) {
            toast.success("Default account updated successfully");
        }
     }, [updatedAccount]);


    useEffect(() => {
        if (error) {
            // If error is unknown type, safely check for message property
            const errorMsg =
                typeof error === "object" && error !== null && "message" in error
                    ? (error as { message?: string }).message
                    : undefined;
            toast.error(errorMsg || "Failed to update default account");
        }
    }, [error]);
    return (
        <div>
        <Card className="hover:shadow-md transition-shadow group relative">
            <Link href = {`/accountInfo/${id}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                <Switch checked={isDefault} onClick={handleDefaultChange} disabled={!!updateDefaultLoading}/>        
            </CardHeader>
            <CardContent>
                
                <div className="text-2xl font-bold">
                    {parseFloat(balance).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                    {type.charAt(0)+ type.slice(1).toLowerCase()} Account
                </p>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>
                        Income
                   
                </div>
                <div className="flex items-center">
                    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500"/>
                        Expense
                    
                </div>
            </CardFooter>
            </Link>
        </Card>
    </div>
  )
}

export default AccountCard