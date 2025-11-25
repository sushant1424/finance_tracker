
import Header from "@/components/header";
import WobbleFinanceSection from "@/components/landing/WobbleFinanceSection";
import { HeroSectionDemo } from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingCards from "@/components/landing/PricingCards";
import LandingFooter from "@/components/landing/FooterSection";
import { getSiteSettings } from "@/actions/site-settings";


export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <div>
      {/*Header*/}
      <Header settings={settings.header} />

      <section
        id="hero"
        className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-white motion-safe:animate-appear-zoom"
      >
        <HeroSectionDemo settings={settings.hero} />
      </section>

      {/*Wobble Finance Section*/}
      <section
        id="wobble"
        className="bg-gray-50 scroll-mt-24 motion-safe:animate-appear"
      >
        <WobbleFinanceSection />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="scroll-mt-24 motion-safe:animate-appear"
      >
        <FeaturesSection settings={settings.features} />
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="scroll-mt-24 motion-safe:animate-appear"
      >
        <PricingCards settings={settings.pricing} />
      </section>


      {/*Footer*/}
      <LandingFooter settings={settings.footer} />
      
    </div>
  );
}
