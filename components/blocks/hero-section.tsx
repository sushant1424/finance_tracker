"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// ---- Action button props ----
interface HeroAction {
  text: string;
  href: string;
  icon?: ReactNode;
  variant?:
    | "default"
    | "link"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost";
}

// ---- Hero section props ----
interface HeroProps {
  badge?: {
    text: string;
    action?: {
      text: string;
      href: string;
    };
  };
  title: ReactNode;          // ✅ ReactNode instead of string
  description: ReactNode;    // ✅ ReactNode instead of string
  actions?: HeroAction[];
  image?: {
    light: string;
    dark: string;
    alt: string;
  };
}

// ---- Component ----
export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
}: HeroProps) {
  const { resolvedTheme } = useTheme();
  const imageSrc = resolvedTheme === "light" ? image?.light : image?.dark;

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex max-w-container flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-1 text-center sm:gap-2">
          
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              {badge.action && (
                <a href={badge.action.href} className="flex items-center gap-1">
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3" />
                </a>
              )}
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-5xl font-semibold leading-tight text-transparent sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight flex justify-center">
            {title}
          </h1>

          {/* Description */}
          <div className="text-lg relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-2xl">
            {description}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300 mt-6">
              {actions.map((action, index) => (
                <Button key={index} variant={action.variant} size="lg" asChild>
                  <a href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </a>
                </Button>
              ))}
            </div>
          )}

          {/* Image + Glow */}
          {image && (
            <div className="relative pt-12">
              <MockupFrame
                className="animate-appear opacity-0 delay-700"
                size="small"
              >
                <Mockup type="responsive">
                  <Image
                    src={imageSrc || image.light}
                    alt={image.alt}
                    width={1248}
                    height={765}
                    priority
                  />
                </Mockup>
              </MockupFrame>
              <Glow
                variant="top"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
