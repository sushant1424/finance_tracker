"use client"

import { HeroSection } from "@/components/blocks/hero-section"
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"
import { FlipWords } from "@/components/ui/flip-words"
import type { HeroSettings } from "@/actions/site-settings"

const FALLBACK_HERO: HeroSettings = {
  eyebrow: "Welcome to MoneyNest",
  titleWords: [
    { text: "Build smart financial" },
    { text: "habits with us.", highlight: true },
  ],
  primaryDescription:
    "Track your accounts, categorize transactions, set goals, and make better decisions with clarity.",
  secondaryPrefix: "Build",
  flipWords: ["better", "smarter", "simpler", "confident"],
  primaryCtaLabel: "Get Started",
  primaryCtaHref: "/dashboard",
  imageLightUrl: "https://www.launchuicomponents.com/app-light.png",
  imageDarkUrl: "https://www.launchuicomponents.com/app-light.png",
  imageAlt: "Finance Tracker preview",
}

export function HeroSectionDemo({ settings }: { settings?: HeroSettings }) {
  const hero = settings ?? FALLBACK_HERO

  return (
    <HeroSection
      title={
        <div className="text-neutral-800">
          <div className="text-lg text-gray-500 mb-2">{hero.eyebrow}</div>
          <TypewriterEffectSmooth
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            words={hero.titleWords.map((word) => ({
              text: word.text,
              className: word.highlight ? "text-blue-600" : undefined,
            }))}
          />
        </div>
      }
      description={
        <div className=" text-lg text-neutral-600 space-y-4 max-w-3xl">
          <p>{hero.primaryDescription}</p>
          <p>
            {hero.secondaryPrefix}{" "}
            <FlipWords words={hero.flipWords} /> decisions with clarity.
          </p>
        </div>
      }
      actions={[
        {
          text: hero.primaryCtaLabel,
          href: hero.primaryCtaHref,
          variant: "default",
        },
      ]}
      image={{
        light: hero.imageLightUrl,
        dark: hero.imageDarkUrl,
        alt: hero.imageAlt,
      }}
    />
  )
}
