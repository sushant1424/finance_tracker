"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import type { SiteSettingsData } from "@/actions/site-settings";
import { updateSiteSettings } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HeroSectionDemo } from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingCards from "@/components/landing/PricingCards";
import LandingFooter from "@/components/landing/FooterSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Failed to save settings";
}

interface Props {
  initialSettings: SiteSettingsData;
}

type SectionKey = "general" | "hero" | "features" | "pricing" | "footer";

const SiteSettingsClient: React.FC<Props> = ({ initialSettings }) => {
  const [draft, setDraft] = useState<SiteSettingsData>(initialSettings);
  const [activeSection, setActiveSection] = useState<SectionKey>("general");
  const [isPending, startTransition] = useTransition();

  const handleSave = (section: SectionKey) => {
    startTransition(async () => {
      try {
        const partial: Partial<SiteSettingsData> = {};
        if (section === "general") {
          partial.header = draft.header;
        } else if (section === "hero") {
          partial.hero = draft.hero;
        } else if (section === "features") {
          partial.features = draft.features;
        } else if (section === "pricing") {
          partial.pricing = draft.pricing;
        } else if (section === "footer") {
          partial.footer = draft.footer;
        }

        const updated = await updateSiteSettings(partial);
        setDraft(updated);
        toast.success("Settings saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  const navItems: { key: SectionKey; label: string }[] = [
    { key: "general", label: "General" },
    { key: "hero", label: "Hero" },
    { key: "features", label: "Features" },
    { key: "pricing", label: "Pricing" },
    { key: "footer", label: "Footer" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveSection(item.key)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors whitespace-nowrap ${
                activeSection === item.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-4">
          {activeSection === "general" && (
            <GeneralSection draft={draft} setDraft={setDraft} onSave={() => handleSave("general")} saving={isPending} />
          )}
          {activeSection === "hero" && (
            <HeroSection draft={draft} setDraft={setDraft} onSave={() => handleSave("hero")} saving={isPending} />
          )}
          {activeSection === "features" && (
            <FeaturesSettingsSection draft={draft} setDraft={setDraft} onSave={() => handleSave("features")} saving={isPending} />
          )}
          {activeSection === "pricing" && (
            <PricingSettingsSection draft={draft} setDraft={setDraft} onSave={() => handleSave("pricing")} saving={isPending} />
          )}
          {activeSection === "footer" && (
            <FooterSettingsSection draft={draft} setDraft={setDraft} onSave={() => handleSave("footer")} saving={isPending} />
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-muted p-2 sm:p-4">
        <div className="rounded-xl border bg-background overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-neutral-900">
                {draft.header.brandName}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                {activeSection === "general"
                  ? "Header preview"
                  : activeSection === "hero"
                  ? "Hero preview"
                  : activeSection === "features"
                  ? "Features preview"
                  : activeSection === "pricing"
                  ? "Pricing preview"
                  : "Footer preview"}
              </span>
            </div>
          </div>

          <div className="bg-white">
            {activeSection === "general" && (
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-neutral-900">
                    {draft.header.brandName}
                  </span>
                  <div className="hidden md:flex gap-4 text-sm text-muted-foreground">
                    {draft.header.navLinks.map((link) => (
                      <span key={link.href}>{link.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "hero" && (
              <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden">
                <HeroSectionDemo settings={draft.hero} />
              </section>
            )}

            {activeSection === "features" && (
              <section className="scroll-mt-24">
                <FeaturesSection settings={draft.features} />
              </section>
            )}

            {activeSection === "pricing" && (
              <section className="scroll-mt-24">
                <PricingCards settings={draft.pricing} />
              </section>
            )}

            {activeSection === "footer" && <LandingFooter settings={draft.footer} />}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  draft: SiteSettingsData;
  setDraft: React.Dispatch<React.SetStateAction<SiteSettingsData>>;
  onSave: () => void;
  saving: boolean;
}

const SectionCollapsible: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{title}</span>
        <span className="text-[11px] text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <div className="border-t px-3 py-3 space-y-3">{children}</div>}
    </div>
  );
};

export const GeneralSection: React.FC<SectionProps> = ({ draft, setDraft, onSave, saving }) => {
  const header = draft.header;

  const updateNavLabel = (index: number, field: "label" | "href", value: string) => {
    setDraft((prev) => {
      const next = { ...prev };
      const links = [...next.header.navLinks];
      if (!links[index]) return prev;
      links[index] = { ...links[index], [field]: value };
      next.header = { ...next.header, navLinks: links };
      return next;
    });
  };

  return (
    <div id="general" className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">General</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Brand name and main navigation links shown in the landing page header.
        </p>
      </div>

      <SectionCollapsible title="General settings">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Brand name</label>
            <Input
              value={header.brandName}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  header: { ...prev.header, brandName: e.target.value },
                }))
              }
            />
          </div>

          {header.navLinks.map((link, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-2 items-center"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Link {idx + 1} label</label>
                <Input
                  value={link.label}
                  onChange={(e) => updateNavLabel(idx, "label", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Link {idx + 1} href</label>
                <Input
                  value={link.href}
                  onChange={(e) => updateNavLabel(idx, "href", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCollapsible>

      <div className="pt-2 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save general"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save general settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the site header shown on the landing page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSave} disabled={saving}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export const HeroSection: React.FC<SectionProps> = ({ draft, setDraft, onSave, saving }) => {
  const hero = draft.hero;

  const titleLine1 = hero.titleWords[0]?.text ?? "";
  const titleLine2 = hero.titleWords[1]?.text ?? "";

  const handleImageUpload = (
    field: "imageLightUrl" | "imageDarkUrl",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setDraft((prev) => ({
          ...prev,
          hero: { ...prev.hero, [field]: result },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="hero" className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Hero</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Main marketing headline, description, hero image and primary call-to-action.
        </p>
      </div>

      <SectionCollapsible title="Hero content">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Eyebrow text</label>
            <Input
              value={hero.eyebrow}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, eyebrow: e.target.value },
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Title line 1</label>
            <Input
              value={titleLine1}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    titleWords: [
                      { text: e.target.value },
                      prev.hero.titleWords[1] ?? { text: "" },
                    ],
                  },
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Title line 2 (highlighted)</label>
            <Input
              value={titleLine2}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    titleWords: [
                      prev.hero.titleWords[0] ?? { text: "" },
                      { text: e.target.value, highlight: true },
                    ],
                  },
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Primary description</label>
            <Textarea
              rows={3}
              value={hero.primaryDescription}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, primaryDescription: e.target.value },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Secondary prefix</label>
              <Input
                value={hero.secondaryPrefix}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, secondaryPrefix: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Flip words (comma separated)</label>
              <Input
                value={hero.flipWords.join(", ")}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hero: {
                      ...prev.hero,
                      flipWords: e.target.value
                        .split(",")
                        .map((w) => w.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Primary CTA label</label>
              <Input
                value={hero.primaryCtaLabel}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryCtaLabel: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Primary CTA href</label>
              <Input
                value={hero.primaryCtaHref}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryCtaHref: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Hero image (light)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload("imageLightUrl", e)}
              />
              {hero.imageLightUrl && (
                <div className="mt-1 h-24 w-full rounded-md border overflow-hidden relative">
                  <Image
                    src={hero.imageLightUrl}
                    alt="Hero light preview"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Hero image (dark)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload("imageDarkUrl", e)}
              />
              {hero.imageDarkUrl && (
                <div className="mt-1 h-24 w-full rounded-md border overflow-hidden relative">
                  <Image
                    src={hero.imageDarkUrl}
                    alt="Hero dark preview"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCollapsible>

      <div className="pt-2 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save hero"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save hero settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the main hero section on the landing page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSave} disabled={saving}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export const FeaturesSettingsSection: React.FC<SectionProps> = ({ draft, setDraft, onSave, saving }) => {
  const features = draft.features;

  const updateFeature = (index: number, field: "title" | "description", value: string) => {
    setDraft((prev) => {
      const next = { ...prev };
      const items = [...next.features.items];
      if (!items[index]) return prev;
      items[index] = { ...items[index], [field]: value };
      next.features = { ...next.features, items };
      return next;
    });
  };

  return (
    <div id="features" className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Features</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Edit the features section headline and card texts.
        </p>
      </div>

      <SectionCollapsible title="Features content">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Heading</label>
            <Input
              value={features.heading}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  features: { ...prev.features, heading: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Subheading</label>
            <Textarea
              rows={2}
              value={features.subheading}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  features: { ...prev.features, subheading: e.target.value },
                }))
              }
            />
          </div>

          <div className="space-y-3">
            {features.items.map((item, idx) => (
              <div key={idx} className="rounded-lg border p-3 space-y-2 bg-muted/40">
                <p className="text-xs font-semibold text-muted-foreground">
                  Feature {idx + 1}
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Title</label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateFeature(idx, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Description</label>
                  <Textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateFeature(idx, "description", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCollapsible>

      <div className="pt-2 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save features"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save features settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the features section cards and texts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSave} disabled={saving}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export const PricingSettingsSection: React.FC<SectionProps> = ({ draft, setDraft, onSave, saving }) => {
  const pricing = draft.pricing;

  const updatePlan = (
    index: number,
    field: "name" | "priceLabel" | "priceSubLabel" | "description" | "ctaLabel" | "ctaHref" | "highlightBadge",
    value: string
  ) => {
    setDraft((prev) => {
      const next = { ...prev };
      const plans = [...next.pricing.plans];
      if (!plans[index]) return prev;
      plans[index] = { ...plans[index], [field]: value };
      next.pricing = { ...next.pricing, plans };
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Pricing</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Control pricing section headline and plan details.
        </p>
      </div>

      <SectionCollapsible title="Pricing content">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Heading</label>
            <Input
              value={pricing.heading}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  pricing: { ...prev.pricing, heading: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Subheading</label>
            <Textarea
              rows={2}
              value={pricing.subheading}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  pricing: { ...prev.pricing, subheading: e.target.value },
                }))
              }
            />
          </div>

          {pricing.plans.map((plan, idx) => (
            <div key={plan.id} className="rounded-lg border p-3 space-y-2 bg-muted/40">
              <p className="text-xs font-semibold text-muted-foreground">
                Plan {idx + 1}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Name</label>
                  <Input
                    value={plan.name}
                    onChange={(e) => updatePlan(idx, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Price label</label>
                  <Input
                    value={plan.priceLabel}
                    onChange={(e) => updatePlan(idx, "priceLabel", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Price sub label</label>
                  <Input
                    value={plan.priceSubLabel}
                    onChange={(e) => updatePlan(idx, "priceSubLabel", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">CTA label</label>
                  <Input
                    value={plan.ctaLabel}
                    onChange={(e) => updatePlan(idx, "ctaLabel", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">CTA href</label>
                  <Input
                    value={plan.ctaHref}
                    onChange={(e) => updatePlan(idx, "ctaHref", e.target.value)}
                  />
                </div>
                {idx === 1 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Highlight badge</label>
                    <Input
                      value={plan.highlightBadge ?? ""}
                      onChange={(e) => updatePlan(idx, "highlightBadge", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Description</label>
                <Textarea
                  rows={2}
                  value={plan.description}
                  onChange={(e) => updatePlan(idx, "description", e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Footer note</label>
            <Input
              value={pricing.note}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  pricing: { ...prev.pricing, note: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </SectionCollapsible>

      <div className="pt-2 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save pricing"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save pricing settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will update plans and pricing content on the landing page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSave} disabled={saving}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export const FooterSettingsSection: React.FC<SectionProps> = ({ draft, setDraft, onSave, saving }) => {
  const footer = draft.footer;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Footer</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Brand footer text, description and bottom copy.
        </p>
      </div>

      <SectionCollapsible title="Footer content">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Brand text</label>
            <Input
              value={footer.brandText}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, brandText: e.target.value },
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Description</label>
            <Textarea
              rows={3}
              value={footer.description}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, description: e.target.value },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Bottom left</label>
              <Input
                value={footer.bottomLeft}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, bottomLeft: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Bottom right</label>
              <Input
                value={footer.bottomRight}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, bottomRight: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      </SectionCollapsible>

      <div className="pt-2 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save footer"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save footer settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the footer content on the landing page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSave} disabled={saving}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export const GeneralSettingsClient: React.FC<{ initialSettings: SiteSettingsData }> = ({ initialSettings }) => {
  const [draft, setDraft] = useState<SiteSettingsData>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const partial: Partial<SiteSettingsData> = { header: draft.header };
        const updated = await updateSiteSettings(partial);
        setDraft(updated);
        toast.success("Settings saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
      <div className="rounded-xl border bg-card p-4">
        <GeneralSection draft={draft} setDraft={setDraft} onSave={handleSave} saving={isPending} />
      </div>

      <div className="rounded-xl border bg-muted p-2 sm:p-4">
        <div className="rounded-xl border bg-background overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-neutral-900">
                {draft.header.brandName}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                Header preview
              </span>
            </div>
          </div>

          <div className="bg-white">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-neutral-900">
                  {draft.header.brandName}
                </span>
                <div className="hidden md:flex gap-4 text-sm text-muted-foreground">
                  {draft.header.navLinks.map((link) => (
                    <span key={link.href}>{link.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroSettingsClient: React.FC<{ initialSettings: SiteSettingsData }> = ({ initialSettings }) => {
  const [draft, setDraft] = useState<SiteSettingsData>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const partial: Partial<SiteSettingsData> = { hero: draft.hero };
        const updated = await updateSiteSettings(partial);
        setDraft(updated);
        toast.success("Settings saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
      <div className="rounded-xl border bg-card p-4">
        <HeroSection draft={draft} setDraft={setDraft} onSave={handleSave} saving={isPending} />
      </div>

      <div className="rounded-xl border bg-muted p-2 sm:p-4">
        <div className="rounded-xl border bg-background overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-neutral-900">
                {draft.header.brandName}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                Hero preview
              </span>
            </div>
          </div>

          <div className="bg-white">
            <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden">
              <HeroSectionDemo settings={draft.hero} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeaturesSettingsClient: React.FC<{ initialSettings: SiteSettingsData }> = ({ initialSettings }) => {
  const [draft, setDraft] = useState<SiteSettingsData>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const partial: Partial<SiteSettingsData> = { features: draft.features };
        const updated = await updateSiteSettings(partial);
        setDraft(updated);
        toast.success("Settings saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
      <div className="rounded-xl border bg-card p-4">
        <FeaturesSettingsSection draft={draft} setDraft={setDraft} onSave={handleSave} saving={isPending} />
      </div>

      <div className="rounded-xl border bg-muted p-2 sm:p-4">
        <div className="rounded-xl border bg-background overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-neutral-900">
                {draft.header.brandName}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                Features preview
              </span>
            </div>
          </div>

          <div className="bg-white">
            <section className="scroll-mt-24">
              <FeaturesSection settings={draft.features} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PricingSettingsClient: React.FC<{ initialSettings: SiteSettingsData }> = ({ initialSettings }) => {
  const [draft, setDraft] = useState<SiteSettingsData>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const partial: Partial<SiteSettingsData> = { pricing: draft.pricing };
        const updated = await updateSiteSettings(partial);
        setDraft(updated);
        toast.success("Settings saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
      <div className="rounded-xl border bg-card p-4">
        <PricingSettingsSection draft={draft} setDraft={setDraft} onSave={handleSave} saving={isPending} />
      </div>

      <div className="rounded-xl border bg-muted p-2 sm:p-4">
        <div className="rounded-xl border bg-background overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-neutral-900">
                {draft.header.brandName}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                Pricing preview
              </span>
            </div>
          </div>

          <div className="bg-white">
            <section className="scroll-mt-24">
              <PricingCards settings={draft.pricing} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FooterSettingsClient: React.FC<{ initialSettings: SiteSettingsData }> = ({ initialSettings }) => {
  const [draft, setDraft] = useState<SiteSettingsData>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const partial: Partial<SiteSettingsData> = { footer: draft.footer };
        const updated = await updateSiteSettings(partial);
        setDraft(updated);
        toast.success("Settings saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
      <div className="rounded-xl border bg-card p-4">
        <FooterSettingsSection draft={draft} setDraft={setDraft} onSave={handleSave} saving={isPending} />
      </div>

      <div className="rounded-xl border bg-muted p-2 sm:p-4">
        <div className="rounded-xl border bg-background overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-neutral-900">
                {draft.header.brandName}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                Footer preview
              </span>
            </div>
          </div>

          <div className="bg-white">
            <LandingFooter settings={draft.footer} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsClient;
