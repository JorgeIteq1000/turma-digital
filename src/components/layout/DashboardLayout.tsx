import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function DashboardLayout({
  children,
  isAdmin = false,
  userName,
  userEmail,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:pl-64">
        <Header
          userName={userName}
          userEmail={userEmail}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="container px-4 py-6 pb-24 md:pb-6">{children}</main>
      </div>

      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}
