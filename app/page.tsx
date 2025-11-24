
import Header from "@/components/header";
import WobbleFinanceSection from "@/components/landing/WobbleFinanceSection";
import { HeroSectionDemo } from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingCards from "@/components/landing/PricingCards";


export default function Home() {
  return (
    <div>
      {/*Header*/}
      <Header />

      <section
        id="hero"
        className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-white motion-safe:animate-appear-zoom"
      >
        <HeroSectionDemo />
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
        <FeaturesSection />
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="scroll-mt-24 motion-safe:animate-appear"
      >
        <PricingCards />
      </section>


      {/*Footer*/}
      <footer className="bg-blue-50 py-12 mt-16 border-t">
        <div className="container mx-auto px-4 text-gray-700">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="space-y-2 max-w-sm">
              <p className="text-xl font-semibold text-neutral-900">MoneyNest</p>
              <p className="text-sm text-gray-600">
                Smart, simple money tracking to help you stay on top of your savings,
                spending and goals.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">Product</p>
                <ul className="space-y-1 text-gray-600">
                  <li><a href="/dashboard" className="hover:text-blue-600">Dashboard</a></li>
                  <li><a href="/transaction" className="hover:text-blue-600">Transactions</a></li>
                  <li><a href="/goals" className="hover:text-blue-600">Goals</a></li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">Resources</p>
                <ul className="space-y-1 text-gray-600">
                  <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                  <li><a href="#pricing" className="hover:text-blue-600">Pricing</a></li>
                  <li><a href="#faq" className="hover:text-blue-600">FAQ</a></li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">Company</p>
                <ul className="space-y-1 text-gray-600">
                  <li><a href="mailto:hello@example.com" className="hover:text-blue-600">Contact</a></li>
                  <li><a href="/privacy" className="hover:text-blue-600">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-blue-600">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} MoneyNest. All rights reserved.</p>
            <p>Built for individuals who want clarity and control over their finances.</p>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
