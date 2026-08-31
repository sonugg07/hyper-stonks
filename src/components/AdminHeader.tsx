"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, ExternalLink, RefreshCw } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isLoading,
}) => {
  const router = useRouter();

  const handleLogout = () => {
    // Delete cookie and redirect
    document.cookie = "stonks_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  return (
    <header className="bg-[#080E0B]/80 backdrop-blur-xl border-b border-stonks-green/15 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span className="w-2 h-2 rounded-full bg-stonks-green animate-pulse" />
        </h1>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-surface-subtle border border-surface-border text-muted hover:text-stonks-green hover:border-stonks-green/40 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-stonks-green" : ""}`} />
          </button>
        )}

        <div className="px-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-muted flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-stonks-green" />
          <span className="font-mono text-white">SuperAdmin</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-stonks-red/10 border border-stonks-red/30 text-stonks-red hover:bg-stonks-red/20 transition-colors"
          title="Sign Out of Admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
