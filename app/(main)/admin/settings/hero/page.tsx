import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getSiteSettings } from "@/actions/site-settings";
import { HeroSettingsClient } from "../_components/site-settings-client";

const HeroSettingsPage = async () => {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Hero section
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage hero headline, copy, flip words and hero images.
        </p>
      </div>

      <HeroSettingsClient initialSettings={settings} />
    </div>
  );
};

export default HeroSettingsPage;
