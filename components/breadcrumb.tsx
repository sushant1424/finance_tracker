"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumb = () => {
  const pathname = usePathname();
  
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Home", href: "/dashboard", id: "home" }];
    
    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Skip UUID-like paths and format labels
      if (path.length === 36 || path.match(/^[a-f0-9-]+$/)) {
        return;
      }
      
      const label = path
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      
      breadcrumbs.push({
        label,
        href: currentPath,
        id: `${path}-${index}`,
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          {index === 0 ? (
            <Link
              href={crumb.href}
              className="flex items-center hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
