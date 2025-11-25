import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getSiteSettings } from "@/actions/site-settings";
import { PricingSettingsClient } from "../_components/site-settings-client";

const PricingSettingsPage = async () => {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Pricing section
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control pricing section headline, plans and feature matrix.
        </p>
      </div>

      <PricingSettingsClient initialSettings={settings} />
    </div>
  );
};

export default PricingSettingsPage;
