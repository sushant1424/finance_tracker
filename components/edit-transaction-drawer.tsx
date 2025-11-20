"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { transactionSchema } from "@/app/(main)/lib/schema";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { getUserAccounts } from "@/actions/accounts";
import { updateTransaction } from "@/actions/transactions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { defaultCategories } from "@/data/categories";
import { formatIndianNumber } from "@/lib/currency";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import type { z } from "zod";

type TransactionFormValues = z.input<typeof transactionSchema>;

interface AccountOption {
  id: string;
  name: string;
  type: string;
  isDefault?: boolean;
}

interface EditableTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string | null;
  date: string;
  category: string;
  accountId: string;
  isRecurring?: boolean | null;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  status?: "PENDING" | "COMPLETED" | "FAILED" | null;
}

interface EditTransactionDrawerProps {
  transaction: EditableTransaction;
  children: React.ReactNode;
}

const EditTransactionDrawer = ({ transaction, children }: EditTransactionDrawerProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCategoryColor, setSelectedCategoryColor] = useState<string>("");

  const initialValues: TransactionFormValues = {
    type: transaction.type,
    amount: transaction.amount.toString(),
    description: transaction.description ?? "",
    date: new Date(transaction.date).toISOString().split("T")[0],
    category: transaction.category,
    accountId: transaction.accountId,
    isRecurring: Boolean(transaction.isRecurring),
    recurringInterval: transaction.recurringInterval ?? undefined,
    status: (transaction.status as TransactionFormValues["status"]) ?? "COMPLETED",
    currency: "NPR",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialValues,
  });

  const transactionType = watch("type");
  const selectedCategory = watch("category");
  const isRecurring = watch("isRecurring");

  const availableCategories = defaultCategories.filter((cat) => cat.type === transactionType);

  useEffect(() => {
    if (selectedCategory) {
      const category = defaultCategories.find((cat) => cat.id === selectedCategory);
      setSelectedCategoryColor(category?.color || "");
    } else {
      setSelectedCategoryColor("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    reset(initialValues);
  }, [transaction.id, reset]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userAccounts = await getUserAccounts();
        setAccounts(userAccounts);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    };

    if (open) {
      fetchAccounts();
    }
  }, [open]);

  const {
    data: updatedTransaction,
    loading: updateLoading,
    error,
    fn: updateTransactionFn,
  } = useFetch(updateTransaction);

  const onSubmit: SubmitHandler<TransactionFormValues> = async () => {
    setConfirmOpen(true);
  };

  const confirmUpdate = async () => {
    const formData = watch();
    await updateTransactionFn({ id: transaction.id, ...formData });
    setConfirmOpen(false);
  };

  useEffect(() => {
    if (updatedTransaction?.success) {
      toast.success("Transaction updated successfully");
      setOpen(false);
      router.refresh();
    }
  }, [updatedTransaction, router]);

  useEffect(() => {
    if (error) {
      const message = (error as { message?: string })?.message || String(error) || "Failed to update transaction";
      toast.error(message);
    }
  }, [error]);

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-4">
            <DrawerTitle>Edit Transaction</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 120px)" }}>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="type">Transaction Type *</Label>
                    <Select
                      onValueChange={(value: "INCOME" | "EXPENSE") => setValue("type", value)}
                      value={watch("type")}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="flex-1"
                        {...register("amount")}
                      />
                      <div className="w-[110px]">
                        <Select
                          value={watch("currency")}
                          onValueChange={(value: "NPR" | "USD") => setValue("currency", value)}
                        >
                          <SelectTrigger id="currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NPR">NPR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" {...register("date")}/>
                    {errors.date && (
                      <p className="text-sm text-red-600">{errors.date.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountId">Account *</Label>
                    <Select
                      onValueChange={(value) => setValue("accountId", value)}
                      value={watch("accountId")}
                    >
                      <SelectTrigger id="accountId">
                        <SelectValue placeholder="Select Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({account.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.accountId && (
                      <p className="text-sm text-red-600">{errors.accountId.message as string}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      onValueChange={(value) => setValue("category", value)}
                      value={watch("category")}
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category.message as string}</p>
                    )}
                    {selectedCategory && selectedCategoryColor && (
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedCategoryColor }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {defaultCategories.find((c) => c.id === selectedCategory)?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter description (optional)"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      onValueChange={(value: "PENDING" | "COMPLETED" | "FAILED") => setValue("status", value)}
                      value={watch("status")}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-600">{errors.status.message as string}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="isRecurring" className="cursor-pointer">
                        Recurring Transaction
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Set this transaction to repeat automatically
                      </p>
                    </div>
                    <Switch
                      id="isRecurring"
                      onCheckedChange={(checked: boolean) => setValue("isRecurring", checked)}
                      checked={watch("isRecurring")}
                    />
                  </div>

                  {isRecurring && (
                    <div className="space-y-2">
                      <Label htmlFor="recurringInterval">Recurring Interval *</Label>
                      <Select
                        onValueChange={(value: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY") =>
                          setValue("recurringInterval", value)
                        }
                        value={watch("recurringInterval")}
                      >
                        <SelectTrigger id="recurringInterval">
                          <SelectValue placeholder="Select Interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Daily</SelectItem>
                          <SelectItem value="WEEKLY">Weekly</SelectItem>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.recurringInterval && (
                        <p className="text-sm text-red-600">{errors.recurringInterval.message as string}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-3 border-t mt-4">
                <DrawerClose asChild>
                  <Button type="button" className="flex-1" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!!updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this {watch("type")?.toLowerCase()} transaction of {watch("currency")} {formatIndianNumber(parseFloat(watch("amount") || "0"))}
              {watch("category") &&
                ` in the ${defaultCategories.find((c) => c.id === watch("category"))?.name} category`}?
              {isRecurring &&
                watch("recurringInterval") &&
                ` This will repeat ${watch("recurringInterval")?.toLowerCase()}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdate}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditTransactionDrawer;
