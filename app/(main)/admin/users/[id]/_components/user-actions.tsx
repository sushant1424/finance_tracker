"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { suspendUser, unsuspendUser, deleteUserCompletely } from "@/actions/admin";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserAdminActionsProps {
  userId: string;
  isSuspended: boolean;
}

const UserAdminActions: React.FC<UserAdminActionsProps> = ({ userId, isSuspended }) => {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    loading: suspendLoading,
    fn: suspendFn,
  } = useFetch(suspendUser);

  const {
    loading: unsuspendLoading,
    fn: unsuspendFn,
  } = useFetch(unsuspendUser);

  const {
    loading: deleteLoading,
    fn: deleteFn,
  } = useFetch(deleteUserCompletely);

  const handleSuspendToggle = async () => {
    if (isSuspended) {
      await unsuspendFn(userId);
      toast.success("User unsuspended");
    } else {
      await suspendFn(userId);
      toast.success("User suspended");
    }
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteFn(userId);
    toast.success("User deleted");
    router.push("/admin/users");
  };

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button
        type="button"
        variant={isSuspended ? "outline" : "destructive"}
        size="sm"
        onClick={handleSuspendToggle}
        disabled={suspendLoading || unsuspendLoading || deleteLoading}
        className="gap-1.5"
      >
        {isSuspended ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            Unsuspend
          </>
        ) : (
          <>
            <ShieldAlert className="h-3.5 w-3.5" />
            Suspend
          </>
        )}
      </Button>
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          disabled={deleteLoading || suspendLoading || unsuspendLoading}
          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                Delete user permanently
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this user and all of their data from the
                system. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </div>
  );
};

export default UserAdminActions;
