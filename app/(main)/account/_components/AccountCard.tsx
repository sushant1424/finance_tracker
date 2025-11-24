"use client"
import { updateDefaultAccount, deleteAccount } from '@/actions/accounts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowUpRight, Trash2} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner';
import { formatDisplayNumber, getCurrencySymbol, type DisplayCurrency } from '@/lib/currency';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
type AccountCardProps = {
  account: {
    id: string;
    name: string;
    type: string;
    balance: number;
    isDefault: boolean;
  };
  displayCurrency: DisplayCurrency;
  nprPerUsd: number;
};

const AccountCard = ({ account, displayCurrency, nprPerUsd }: AccountCardProps) => {
    const { name, type, balance, id, isDefault } = account;

    const router = useRouter();

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const {data:updatedAccount,
        loading:updateDefaultLoading,
        error,
        fn:updateAccountFn} = useFetch(updateDefaultAccount)

    const {data:deletedAccount,
        loading:deleteLoading,
        error:deleteError,
        fn:deleteAccountFn} = useFetch(deleteAccount)

    const handleDefaultChange = async (event: React.MouseEvent<HTMLButtonElement>) =>{
        event.preventDefault();

        if(isDefault){
            toast.warning("You need atleast one default account")
            return;//Dont allow unchecking the default account
        }

        await updateAccountFn(id);
    }

     useEffect(() => {
        if (updatedAccount && typeof updatedAccount === 'object' && 'success' in updatedAccount && updatedAccount.success) {
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

    const handleDelete = async () => {
        await deleteAccountFn(id);
        setDeleteConfirmOpen(false);
    };

    useEffect(() => {
        if (deletedAccount && typeof deletedAccount === 'object' && 'success' in deletedAccount && deletedAccount.success) {
            toast.success("Account deleted successfully");
            router.refresh();
        }
    }, [deletedAccount, router]);

    useEffect(() => {
        if (deleteError) {
            const errorMsg =
                typeof deleteError === "object" && deleteError !== null && "message" in deleteError
                    ? (deleteError as { message?: string }).message
                    : undefined;
            toast.error(errorMsg || "Failed to delete account");
        }
    }, [deleteError]);

    const symbol = getCurrencySymbol(displayCurrency);
    const formattedBalance = formatDisplayNumber(balance, displayCurrency, nprPerUsd);

    return (
        <div>
        <Card className="hover:shadow-md transition-shadow group relative h-full flex flex-col">
            <Link href = {`/accountInfo/${id}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                <div className="flex items-center gap-2">
                    <Switch checked={isDefault} onClick={handleDefaultChange} disabled={!!updateDefaultLoading}/>        
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {symbol} {formattedBalance}
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
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <Button
                    variant="ghost"
                    className="h-9 px-4 text-destructive hover:text-destructive border border-destructive/20 hover:border-destructive/40 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-2"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirmOpen(true);
                    }}
                    disabled={deleteLoading}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Delete</span>
                </Button>
            </div>
        </Card>

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>{name}</strong>? This action will permanently remove the account and all associated transactions. You can&apos;t undo this.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}

export default AccountCard