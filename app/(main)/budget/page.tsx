import React from "react";
import { getBudgetOverview } from "@/actions/budget";
import BudgetClient from "./_components/BudgetClient";

const BudgetPage = async () => {
  const overview = await getBudgetOverview();

  return (
    <BudgetClient overview={overview} />
  );
};

export default BudgetPage;