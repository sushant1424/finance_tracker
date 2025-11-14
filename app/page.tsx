
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

      <section className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-white">
        
        <HeroSectionDemo/>
      </section>


      

      {/*Wobble Finance Section*/}
      <section className = "bg-gray-50">
        <WobbleFinanceSection />
      </section>


       {/* Features Section */}
       <section >
          <FeaturesSection />
      </section>

      {/* Features Section */}
       <section >
          <PricingCards />
      </section>


      {/*Footer*/}
      <footer className="bg-blue-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Finance Tracker. All rights reserved.</p>         
        </div>
      </footer>
      
    </div>
  );
}
