import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";

import { getReportsData } from "@/actions/reports";

const ReportsPage = async () => {
  const { totalIncome, totalExpense, net } = await getReportsData();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trends of your income and expenses over the last 6 months
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-medium">Total income: </span>
          {totalIncome}
        </div>
        <div>
          <span className="font-medium">Total expense: </span>
          {totalExpense}
        </div>
        <div>
          <span className="font-medium">Net: </span>
          {net}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
