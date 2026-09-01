"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Shield, Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // If on login page, skip authentication check
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      return;
    }

    // Check admin session cookie
    const hasSessionCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith("stonks_admin_session="));

    if (!hasSessionCookie) {
      router.push("/admin/login");
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, router]);

  // If on login page, render without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#060B09] flex items-center justify-center text-muted font-mono text-xs">
        <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mr-2" />
        Verifying admin session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B09] flex flex-col md:flex-row text-foreground antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#080E0B] border-b border-stonks-green/15 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-stonks-green" />
          <span className="font-black text-sm text-white tracking-wider">HYPE STONKS ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-surface-subtle text-muted hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md">
          <div className="w-72 bg-[#080E0B] h-full shadow-2xl">
            <div className="p-4 flex justify-end border-b border-surface-border">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div onClick={() => setMobileOpen(false)}>
              <AdminSidebar />
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
