"use client"

import { HeroSection } from "@/components/blocks/hero-section"
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"
import { FlipWords } from "@/components/ui/flip-words"

export function HeroSectionDemo() {
  return (
    <HeroSection
      
      title={
        <div className="text-neutral-800">
          <div className="text-lg text-gray-500 mb-2">Welcome to Welth</div>
          <TypewriterEffectSmooth
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            words={[
              { text: "Build smart financial" },
              { text: "habits with us.", className: "text-blue-600" },
            ]}
          />
        </div>
      }
      description={
        <div className=" text-lg text-neutral-600 space-y-4 max-w-3xl">
          <p>
            Track your accounts, categorize transactions, set goals, and make better decisions with clarity.
          </p>
          <p>
            Build <FlipWords words={["better", "smarter", "simpler", "confident"]} /> decisions with clarity.
          </p>
        </div>
      }
      actions={[
        {
          text: "Get Started",
          href: "/dashboard",
          variant: "default",
        },
      ]}
      image={{
        light: "https://www.launchuicomponents.com/app-light.png",
        dark: "https://www.launchuicomponents.com/app-light.png",
        alt: "Finance Tracker preview",
      }}
    />
  )
}
