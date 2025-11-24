import React from "react";
import { getBudgetOverview } from "@/actions/budget";
import BudgetClient from "./_components/BudgetClient";

const BudgetPage = async () => {
  const overview = await getBudgetOverview();

  return (
    <div className="space-y-4">
      <BudgetClient overview={overview} />
    </div>
  );
};

export default BudgetPage;