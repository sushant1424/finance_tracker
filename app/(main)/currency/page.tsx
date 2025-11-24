import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getFxRates, getUserCurrency } from "@/actions/currency";
import CurrencySettings from "./_components/currency-settings";
import FxInsights from "./_components/fx-insights";

const CurrencyPage = async () => {
  const [defaultCurrency, fx] = await Promise.all([
    getUserCurrency(),
    getFxRates(),
  ]);

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Currency
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your default display currency and explore live FX data for NPR
          and major world currencies.
        </p>
      </div>

      <div className="space-y-4">
        <CurrencySettings defaultCurrency={defaultCurrency} fx={fx} />
        <FxInsights fx={fx} />
      </div>
    </div>
  );
};

export default CurrencyPage;
