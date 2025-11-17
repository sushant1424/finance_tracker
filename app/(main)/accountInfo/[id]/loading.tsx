"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";

export default function AccountInfoLoading() {
  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="flex gap-4 items-end justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-md bg-muted" />
          <div className="h-4 w-32 rounded-md bg-muted" />
        </div>
        <div className="text-right pb-2 space-y-2">
          <div className="h-6 w-28 rounded-md bg-muted ml-auto" />
          <div className="h-3 w-32 rounded-md bg-muted ml-auto" />
        </div>
      </div>

      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <CardTitle className="h-4 w-40 rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-40 w-full rounded-md bg-muted" />
        </CardContent>
      </Card>

      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <CardTitle className="h-4 w-52 rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-9 w-full rounded-md bg-muted" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-4 w-20 rounded-md bg-muted" />
                <div className="h-4 flex-1 rounded-md bg-muted" />
                <div className="h-4 w-16 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
