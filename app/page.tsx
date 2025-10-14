
import Header from "@/components/header";

import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { FlipWords } from "@/components/ui/flip-words";
import Link from "next/link";


export default function Home() {
  return (
    <div>
      {/*Header*/}
      <Header />

      <section className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-white">
        
        <div className="relative z-10 max-w-5xl px-4 text-center">
          <p className="mb-6 text-sm uppercase tracking-widest text-neutral-500">Welcome to welth</p>
          <div className="text-neutral-800">
            <TypewriterEffectSmooth
              words={[{ text: "Build smart financial" }, { text: "habits with us." , className: "text-blue-600"}]}
            />
          </div>
          <div className="mt-4 text-lg text-neutral-600">
            Build <FlipWords words={["better", "smarter", "simpler", "confident"]} /> decisions.
          </div>
          <p className="mx-auto mt-6 max-w-xl text-neutral-600">Track your accounts, categorize transactions, set goals, and make better decisions with clarity.</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/dashboard" className="rounded-md bg-black px-5 py-3 text-white">Explore</Link>
            
          </div>
        </div>
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
