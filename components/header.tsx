import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "./ui/button"
import { LayoutDashboard } from "lucide-react"
import type { HeaderSettings } from "@/actions/site-settings"

const FALLBACK_HEADER: HeaderSettings = {
  brandName: "MoneyNest",
  navLinks: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
}

const Header = ({ settings }: { settings?: HeaderSettings }) => {
  const header = settings ?? FALLBACK_HEADER

  return (
    <div className = "fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="flex items-center justify-between container mx-auto px-2 py-4">
        <Link href="/">
            <span className="text-[25px] font-semibold tracking-wide text-neutral-800">{header.brandName}</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-700">
          {header.navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-blue-600">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
            
            {/*User Actions After Login*/}
            <SignedIn>
              <Link href={"/dashboard"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <LayoutDashboard size={18}/>  
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>

             
            </SignedIn>


            {/* User Sign in and Sign out buttons*/}
            <SignedOut>
                <SignInButton forceRedirectUrl={"/dashboard"}>
                    <Button variant="outline">Log In</Button>
                </SignInButton>
                <SignUpButton forceRedirectUrl={"/dashboard"}>
                    <Button variant="default">Sign Up</Button>
                </SignUpButton>
            </SignedOut>

            <SignedIn>
                <UserButton
                   appearance={{
                    elements:{
                      avatarBox: "w-8 h-8 md:w-10 md:h-10",
                    },
                   }}
                />
            </SignedIn>
        </div>
        
      </nav>
    </div>
  )
}

export default Header