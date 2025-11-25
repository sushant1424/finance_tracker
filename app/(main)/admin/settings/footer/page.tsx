import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { getSiteSettings } from "@/actions/site-settings";
import { FooterSettingsClient } from "../_components/site-settings-client";

const FooterSettingsPage = async () => {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb />

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-title">
          Footer section
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage footer content, columns and bottom copy.
        </p>
      </div>

      <FooterSettingsClient initialSettings={settings} />
    </div>
  );
};

export default FooterSettingsPage;
