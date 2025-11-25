import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getAdminUsers } from "@/actions/admin";
import UsersTable from "./_components/users-table";

const AdminUsersPage = async ({ searchParams }: { searchParams: { q?: string } }) => {
  const initialQuery = searchParams?.q ?? "";
  const users = await getAdminUsers(initialQuery || undefined);

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Users
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all users, inspect their data and debug issues.
        </p>
      </div>

      <UsersTable initialUsers={users} initialQuery={initialQuery} />
    </div>
  );
};

export default AdminUsersPage;
