import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <CurrencySettings defaultCurrency={defaultCurrency} fx={fx} />
          <FxInsights fx={fx} />
        </div>

        <Card className="h-full border border-muted/60 bg-gradient-to-b from-background to-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Data source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Exchange rates are fetched from the open access endpoint of
              {" "}
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                ExchangeRate-API
              </a>
              .
            </p>
            <p>
              Rates typically update once per day. Values shown in charts and
              summaries are approximate and for informational purposes only.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Rates By
              {" "}
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Exchange Rate API
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrencyPage;
