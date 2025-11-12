import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

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
        <body className={`${inter.className}`} suppressHydrationWarning>
          <NextTopLoader color="#000000" showSpinner={false} height={3} />
          <main className = "min-h-screen">
            {children}
          </main>
          <Toaster richColors/>
        </body>
      </html>
   </ClerkProvider>
  );
}
