"use client";
import React, { useMemo, useState } from "react";
import { Sidebar, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { LayoutDashboard, ReceiptText, PiggyBank, Target, Wallet, BarChart3, Repeat, LineChart, MessageSquare, Menu, X, LogOut } from "lucide-react";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SidebarContent = ({ onLinkClick, isMobile = false }: { onLinkClick?: () => void; isMobile?: boolean }) => {
  const links = useMemo(() => [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
    { label: "Transactions", href: "/transaction", icon: <ReceiptText className="h-5 w-5 shrink-0" /> },
    { label: "Accounts", href: "/account", icon: <Wallet className="h-5 w-5 shrink-0" /> },
    { label: "Reports", href: "/reports", icon: <BarChart3 className="h-5 w-5 shrink-0" /> },
    { label: "Budget", href: "/budget", icon: <PiggyBank className="h-5 w-5 shrink-0" /> },
    { label: "Recurring", href: "/recurring", icon: <Repeat className="h-5 w-5 shrink-0" /> },
    { label: "Goals", href: "/goals", icon: <Target className="h-5 w-5 shrink-0" /> },
    { label: "Investments", href: "/investments", icon: <LineChart className="h-5 w-5 shrink-0" /> },
    { label: "Advice", href: "/advice", icon: <MessageSquare className="h-5 w-5 shrink-0" /> },
  ], []);

  const { user } = useUser();
  const { open, animate } = useSidebar();
  const { signOut } = useClerk();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const firstName = user?.firstName || user?.username ;
  const lastName = user?.lastName || "";

  const handleLogout = () => {
    setLogoutOpen(false);
    signOut();
  };

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto sidebar-scroll text-white">
      {!isMobile && (
        <Link href="/dashboard" className="flex items-center gap-2 px-1 text-white">
          <span className="text-[18px] font-semibold tracking-wide text-white">welth</span>
        </Link>
      )}
      <div className={`${!isMobile ? 'mt-8' : ''} flex flex-col gap-2`}>
        {links.map((link, idx) => (
          <div key={idx} onClick={onLinkClick}>
            <SidebarLink link={link} forceLabel={isMobile} />
          </div>
        ))}
      </div>
      <div className="mt-auto pt-6 space-y-3">
        <div className="flex items-center gap-2 py-2">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-7 h-7" },
            }}
          />
          {isMobile ? (
            <span className="text-sm text-white whitespace-pre">
              {`${firstName} ${lastName}`}
            </span>
          ) : (
            <motion.span
              animate={{
                display: animate ? (open ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="text-sm text-white/80 whitespace-pre"
            >
              {`${firstName} ${lastName}`}
            </motion.span>
          )}
        </div>
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            {isMobile ? (
              <span className="text-sm">Log out</span>
            ) : (
              <motion.span
                animate={{
                  display: animate ? (open ? "inline-flex" : "none") : "inline-flex",
                  opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-sm"
              >
                Log out
              </motion.span>
            )}
          </Button>
          <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Sign out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end your session? Any unsaved progress will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Log out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

const DashboardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { open, setOpen } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      <div className="flex">
        {/* Desktop Sidebar Only */}
        <motion.div
          className="hidden md:flex fixed left-0 top-0 h-screen justify-between gap-6 border-r border-white/10 bg-[#050b20] z-50 px-4 py-4 flex-col text-white"
          animate={{
            width: open ? "300px" : "60px",
          }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <SidebarContent />
        </motion.div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed left-0 top-0 h-screen w-[280px] bg-[#050b20] border-r border-white/10 text-white z-50 md:hidden overflow-y-auto"
              >
                <div className="flex flex-col h-full p-6 sidebar-scroll overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-white">
                      <span className="text-[18px] font-semibold tracking-wide text-white">welth</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} isMobile={true} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          animate={{ paddingLeft: isDesktop ? (open ? 300 : 60) : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="w-full min-h-screen bg-neutral-100"
        >
          {/* Mobile Header with Hamburger */}
          <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/dashboard" className="flex items-center text-[#0b1220]">
              <span className="text-lg font-semibold tracking-wide text-[#0b1220]">welth</span>
            </Link>
          </div>
          
          <div className="px-3 sm:px-6 py-4 sm:py-6 bg-white min-h-screen">
            {children}
          </div>
        </motion.div>
      </div>
    </>
  );
};

const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sidebar>
      <DashboardContent>{children}</DashboardContent>
    </Sidebar>
  );
};

export default DashboardShell;


