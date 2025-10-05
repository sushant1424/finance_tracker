import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { LayoutDashboard, PenBox } from "lucide-react"


const Header = () => {
  return (
    <div className = "fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="flex items-center justify-between container mx-auto px-2 py-4">
        <Link href="/">
            <Image
              src={"/image.png"}
              alt="Welth Logo"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
            />
        </Link>

        <div className="flex items-center space-x-4">
            
            {/*User Actions After Login*/}
            <SignedIn>
              <Link href={"/dashboard"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <Button variant="outline">
                  <LayoutDashboard size={18}/>  
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>

              <Link href={"/transaction/create"} >
                <Button className="flex items-center gap-2">
                  <PenBox size={18}/>  
                  <span className="hidden md:inline">Create Transaction</span>
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