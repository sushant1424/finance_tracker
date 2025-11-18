"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";

export default function SpendingStatisticsLoading() {
  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="flex gap-4 items-end justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-md bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted" />
        </div>
        <div className="text-right pb-2 space-y-2">
          <div className="h-6 w-32 rounded-md bg-muted ml-auto" />
          <div className="h-3 w-40 rounded-md bg-muted ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse">
            <CardHeader>
              <CardTitle className="h-4 w-40 rounded-md bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-28 rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <CardTitle className="h-4 w-64 rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
