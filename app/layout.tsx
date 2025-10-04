import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "The only app you need to track your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>

      <html lang="en">
        <body className={`${inter.className}`}>
          {/*Header*/}
          <Header />

          <main className = "min-h-screen">
            {children}
          </main>
          

          {/*Footer*/}
          <footer className="bg-blue-50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>&copy; {new Date().getFullYear()} Finance Tracker. All rights reserved.</p>
                <p className="mt-2">
                  Built with Next.js and Tailwind CSS.
                </p>
              </div>
          </footer>


        </body>
      </html>
   </ClerkProvider>
  );
}
