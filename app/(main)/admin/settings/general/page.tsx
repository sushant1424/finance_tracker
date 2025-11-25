import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getSiteSettings } from "@/actions/site-settings";
import { GeneralSettingsClient } from "../_components/site-settings-client";

const GeneralSettingsPage = async () => {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          General settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage brand name and main navigation links.
        </p>
      </div>

      <GeneralSettingsClient initialSettings={settings} />
    </div>
  );
};

export default GeneralSettingsPage;
