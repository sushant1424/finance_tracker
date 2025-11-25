"use client";

import React from "react";
import type { FooterSettings } from "@/actions/site-settings";

interface Props {
  settings: FooterSettings;
}

const LandingFooter: React.FC<Props> = ({ settings }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blue-50 py-12 mt-16 border-t">
      <div className="container mx-auto px-4 text-gray-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="space-y-2 max-w-sm">
            <p className="text-xl font-semibold text-neutral-900">
              {settings.brandText}
            </p>
            <p className="text-sm text-gray-600">
              {settings.description}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            {settings.columns.map((column) => (
              <div key={column.title} className="space-y-2">
                <p className="font-semibold text-gray-800">{column.title}</p>
                <ul className="space-y-1 text-gray-600">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <a href={link.href} className="hover:text-blue-600">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-gray-500">
          <p>{settings.bottomLeft.replace("{year}", String(year))}</p>
          <p>{settings.bottomRight}</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
