"use client"

import  { useEffect,useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { accountSchema } from '@/app/(main)/lib/schema'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import useFetch from '@/hooks/use-fetch'
import { createAccount } from '@/actions/accounts'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateAccountDrawerProps {
  children: React.ReactNode;
}

const CreateAccountDrawer = ({children}: CreateAccountDrawerProps) => {
   const [open,setOpen] = useState(false);

   const { register,handleSubmit,formState:{errors},setValue,watch,reset } = useForm({
    resolver: zodResolver(accountSchema),
        defaultValues:{
            name : '',
            type : 'SAVINGS',
            balance: '',
            isDefault : false,
        },
    })


    const {data:newAccount,loading:createAccountLoading,error,fn:createAccountFn} = useFetch(createAccount)


    const onSubmit = async (data: any) => {
        await createAccountFn(data);
    }

    useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error((error as { message?: string })?.message || String(error) || "Failed to create account");
    }
  }, [error]);
  return (
    <div>
        <Drawer open = {open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Create Account</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                    <form className="space-y-4" onSubmit = {handleSubmit(onSubmit)}>
                        <div className = "space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Account Name</label>
                            <Input id="name" placeholder='e.g. Main Checking'
                            {...register('name')}
                            />
                            {errors.name &&  (
                                <p className='text-sm text-red-600'>{errors.name.message}</p>
                            )
                            }
                        </div>

                        <div className = "space-y-2">
                            <label htmlFor="type" className="text-sm font-medium">Account Type</label>
                            <Select 
                            onValueChange = {(value: "SAVINGS" | "EXPENSE" | "INCOME") => setValue("type", value)}
                            defaultValue={watch("type")}>
                                
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                    <SelectItem value="INCOME">Income</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type &&  (
                                <p className='text-sm text-red-600'>{errors.type.message}</p>
                            )
                            }
                        </div>

                        <div className = "space-y-2">
                            <label htmlFor="balance" className="text-sm font-medium">Initial Balance</label>
                            <Input 
                            id="balance" 
                            type="number"
                            step="0.01"
                            placeholder="0.0"
                            {...register('balance')}
                            />
                            {errors.balance &&  (
                                <p className='text-sm text-red-600'>{errors.balance.message}</p>
                            )
                            }
                        </div>



                         <div className = "flex items-center justify-between rounded-lg border p-3">
                            
                            <div className="space-y-0.5">
                                <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                                    Set as Default
                                </label>

                                <p className="text-sm text-muted-foreground">This account will be selected by default for transactions.</p>
                            </div>

                            <Switch 
                            id="isDefault"
                            onCheckedChange = {(checked: boolean) => setValue("isDefault", checked)}
                            checked={watch("isDefault")}
                            />
                        </div>


                        <div className="flex gap-4 pt-4">
                            <DrawerClose asChild>
                                <Button type="button" className="flex-1" variant="outline">
                                    Cancel
                                </Button>
                            </DrawerClose>
                                <Button type="submit"
                                 className="flex-1" 
                                 disabled={!!createAccountLoading}>
                                    {createAccountLoading?( 
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating ...
                                    </>):
                                    ("Create Account")}
                                </Button>
                            
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    </div>
  )
}

export default CreateAccountDrawer


