"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CheckSquare,
  FileCheck2,
  Activity,
  Coins,
  Lock,
  Settings,
  ArrowLeft,
  Shield,
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Waitlist", href: "/admin/waitlist", icon: ClipboardList },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Waitlist Tasks", href: "/admin/quests", icon: CheckSquare },
    { name: "Submissions", href: "/admin/submissions", icon: FileCheck2 },
    { name: "Activity Log", href: "/admin/activity", icon: Activity },
    { name: "NFT Mint", href: "/admin/mint", icon: Coins },
    { name: "Staking Vault", href: "/admin/staking", icon: Lock },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#080E0B] border-r border-stonks-green/15 flex flex-col min-h-screen shrink-0">
      {/* Header / Logo */}
      <div className="p-6 border-b border-surface-border flex items-center justify-between">
        <Logo size="sm" />
        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-stonks-green/20 text-stonks-green rounded border border-stonks-green/30">
          ADMIN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-wider text-muted font-bold">
          Platform Control
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-stonks-green/15 text-stonks-green border border-stonks-green/30 shadow-[0_0_15px_rgba(0,255,163,0.15)] font-bold"
                  : "text-muted hover:text-white hover:bg-surface-subtle"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-stonks-green" : "text-muted"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Back Link */}
      <div className="p-4 border-t border-surface-border space-y-2">
        <div className="px-3 py-1 bg-surface-subtle/50 rounded-lg flex items-center gap-2 text-[11px] font-mono text-muted">
          <Shield className="w-3.5 h-3.5 text-stonks-green" />
          <span>Auth: <strong className="text-white">Mewtwogg</strong></span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted hover:text-stonks-green rounded-lg hover:bg-surface-subtle transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Public Website</span>
        </Link>
      </div>
    </aside>
  );
};
