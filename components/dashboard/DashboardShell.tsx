"use client";
import React, { useMemo } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, PiggyBank, Target, Wallet, BarChart3, Repeat, LineChart, MessageSquare, PlusCircle } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

const SidebarContent = () => {
  const links = useMemo(() => [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Create Transaction", href: "/transaction/create", icon: <PlusCircle className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Transactions", href: "/transaction", icon: <ReceiptText className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Accounts", href: "/account", icon: <Wallet className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Reports", href: "/reports", icon: <BarChart3 className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Budget", href: "/budget", icon: <PiggyBank className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Recurring", href: "/recurring", icon: <Repeat className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Goals", href: "/goals", icon: <Target className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Investments", href: "/investments", icon: <LineChart className="h-5 w-5 shrink-0 text-neutral-700"/> },
    { label: "Advice", href: "/advice", icon: <MessageSquare className="h-5 w-5 shrink-0 text-neutral-700"/> },
  ], []);

  const { user } = useUser();
  const { open, animate } = useSidebar();
  const firstName = user?.firstName || user?.username ;
  const lastName = user?.lastName || "";

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
      <Link href="/dashboard" className="flex items-center gap-2 px-1">
        <span className="text-[18px] font-semibold tracking-wide text-neutral-800">welth</span>
      </Link>
      <div className="mt-8 flex flex-col gap-2">
        {links.map((link, idx) => (
          <SidebarLink key={idx} link={link as any} />
        ))}
      </div>
      <div className="mt-auto pt-6">
        <div className="flex items-center gap-2 py-2">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-7 h-7" },
            }}
          />
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="text-sm text-neutral-700 whitespace-pre"
          >
            {`${firstName} ${lastName}`}
          </motion.span>
        </div>
      </div>
    </div>
  );
};

const RightPane: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { open } = useSidebar();
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Only show header on dashboard route
  const isDashboardRoute = pathname === '/dashboard';

  return (
    <motion.div
      animate={{ paddingLeft: isDesktop ? (open ? 300 : 60) : 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full min-h-screen bg-neutral-100"
    >
      {isDashboardRoute && <DashboardHeader />}
      <div className={`px-6 py-6 bg-white ${isDashboardRoute ? 'min-h-[calc(100vh-64px)]' : 'min-h-screen'}`}>
        {children}
      </div>
    </motion.div>
  );
};

const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sidebar>
      <div className="flex">
        <SidebarBody className="fixed left-0 top-0 h-screen justify-between gap-6 border-r border-neutral-200 bg-neutral-100 z-50">
          <SidebarContent />
        </SidebarBody>
        <RightPane>{children}</RightPane>
      </div>
    </Sidebar>
  );
};

export default DashboardShell;


