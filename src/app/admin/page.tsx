"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import {
  Users,
  Target,
  Coins,
  Lock,
  Zap,
  FileCheck2,
  Clock,
  XCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Activity,
  ClipboardList,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintToggling, setMintToggling] = useState(false);
  const [stakingToggling, setStakingToggling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("[Admin Overview Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleToggleMint = async () => {
    if (!data) return;
    setMintToggling(true);
    const newStatus = !data.mintStatus;
    try {
      const res = await fetch("/api/admin/mint", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setData({ ...data, mintStatus: newStatus });
        setToastMessage(`NFT Mint is now ${newStatus ? "ACTIVE (OPEN)" : "DISABLED (CLOSED)"}`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to toggle mint:", err);
    } finally {
      setMintToggling(false);
    }
  };

  const handleToggleStaking = async () => {
    if (!data) return;
    setStakingToggling(true);
    const newStatus = !data.stakingStatus;
    try {
      const res = await fetch("/api/admin/staking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setData({ ...data, stakingStatus: newStatus });
        setToastMessage(`Staking Vault is now ${newStatus ? "ACTIVE (OPEN)" : "DISABLED (CLOSED)"}`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to toggle staking:", err);
    } finally {
      setStakingToggling(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="Admin Command Center"
        subtitle="Real-time telemetry, master module switches, and waitlist submission activity."
        onRefresh={fetchOverview}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto flex-1">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 text-xs font-bold text-stonks-green flex items-center gap-2 shadow-neon-green">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 9 REAL DATABASE OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Total Users */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-stonks-green/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Total Users</span>
              <Users className="w-4 h-4 text-stonks-green" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data ? formatNumber(data.totalUsers) : "..."}
            </div>
            <div className="text-[11px] text-muted">Registered in database</div>
          </div>

          {/* 2. Total Waitlist Entries */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-stonks-cyan/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Total Waitlist Entries</span>
              <ClipboardList className="w-4 h-4 text-stonks-cyan" />
            </div>
            <div className="text-2xl font-black text-stonks-cyan font-mono">
              {data ? formatNumber(data.totalWaitlistEntries) : "..."}
            </div>
            <div className="text-[11px] text-muted">Total task submissions logged</div>
          </div>

          {/* 3. Completed / Approved Entries */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-stonks-green/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Completed Entries</span>
              <CheckCircle2 className="w-4 h-4 text-stonks-green" />
            </div>
            <div className="text-2xl font-black text-stonks-green font-mono">
              {data ? formatNumber(data.completedEntries) : "..."}
            </div>
            <div className="text-[11px] text-stonks-green font-mono">Approved & verified</div>
          </div>

          {/* 4. Pending Entries */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Pending Entries</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {data ? formatNumber(data.pendingEntries) : "..."}
            </div>
            <div className="text-[11px] text-amber-400">Awaiting moderator review</div>
          </div>

          {/* 5. Rejected Entries */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-stonks-red/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Rejected Entries</span>
              <XCircle className="w-4 h-4 text-stonks-red" />
            </div>
            <div className="text-2xl font-black text-stonks-red font-mono">
              {data ? formatNumber(data.rejectedEntries) : "..."}
            </div>
            <div className="text-[11px] text-muted">Failed verification</div>
          </div>

          {/* 6. Total Points Awarded */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-stonks-green/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Total Points Awarded</span>
              <Zap className="w-4 h-4 text-stonks-green" />
            </div>
            <div className="text-2xl font-black text-stonks-green font-mono">
              {data ? `${formatNumber(data.totalPointsAwarded)} PTS` : "..."}
            </div>
            <div className="text-[11px] text-muted">Distributed to community</div>
          </div>

          {/* 7. Active Tasks */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Active Tasks</span>
              <Target className="w-4 h-4 text-stonks-cyan" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data ? `${data.activeTasks} Tasks` : "..."}
            </div>
            <div className="text-[11px] text-muted">Live on public waitlist</div>
          </div>

          {/* 8. Mint Status */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-purple-500/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Mint Status</span>
              <Coins className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono">
              <span className={data?.mintStatus ? "text-stonks-green" : "text-stonks-red"}>
                {data?.mintStatus ? "● LIVE (OPEN)" : "○ CLOSED"}
              </span>
            </div>
            <div className="text-[11px] text-muted">
              {data?.mintSettings?.priceEth || 0.08} ETH / Max {data?.mintSettings?.maxSupply || 3333}
            </div>
          </div>

          {/* 9. Staking Status */}
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-blue-500/25 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase">Staking Status</span>
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono">
              <span className={data?.stakingStatus ? "text-stonks-cyan" : "text-stonks-red"}>
                {data?.stakingStatus ? "● ACTIVE (OPEN)" : "○ CLOSED"}
              </span>
            </div>
            <div className="text-[11px] text-muted">
              {data?.stakingSettings?.apyPercent || 42.5}% APY Vault
            </div>
          </div>
        </div>

        {/* QUICK CONTROL TOGGLES: MINT & STAKING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mint Control Switch */}
          <div className="p-6 rounded-3xl bg-[#0B130E] border border-surface-border flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">NFT Mint Status</h3>
                  <p className="text-xs text-muted">Toggle public mint availability.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleMint}
                disabled={mintToggling}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors cursor-pointer ${
                  data?.mintStatus ? "bg-stonks-green shadow-neon-green" : "bg-[#172A1F]"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-black font-mono font-bold text-[10px] flex items-center justify-center transition-transform ${
                    data?.mintStatus ? "translate-x-9 text-stonks-green" : "translate-x-1 text-white"
                  }`}
                >
                  {data?.mintStatus ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs font-mono">
              <span className="text-muted">
                Status:{" "}
                <strong className={data?.mintStatus ? "text-stonks-green" : "text-stonks-red"}>
                  {data?.mintStatus ? "LIVE (OPEN)" : "DISABLED (CLOSED)"}
                </strong>
              </span>
              <Link href="/admin/mint" className="text-stonks-green hover:underline flex items-center gap-1">
                <span>Configure Parameters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Staking Control Switch */}
          <div className="p-6 rounded-3xl bg-[#0B130E] border border-surface-border flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-stonks-cyan/10 text-stonks-cyan border border-stonks-cyan/20">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Staking Vault Status</h3>
                  <p className="text-xs text-muted">Toggle token yield staking.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleStaking}
                disabled={stakingToggling}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors cursor-pointer ${
                  data?.stakingStatus ? "bg-stonks-cyan shadow-neon-cyan" : "bg-[#172A1F]"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-black font-mono font-bold text-[10px] flex items-center justify-center transition-transform ${
                    data?.stakingStatus ? "translate-x-9 text-stonks-cyan" : "translate-x-1 text-white"
                  }`}
                >
                  {data?.stakingStatus ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs font-mono">
              <span className="text-muted">
                Status:{" "}
                <strong className={data?.stakingStatus ? "text-stonks-cyan" : "text-stonks-red"}>
                  {data?.stakingStatus ? "ACTIVE (OPEN)" : "DISABLED (CLOSED)"}
                </strong>
              </span>
              <Link href="/admin/staking" className="text-stonks-cyan hover:underline flex items-center gap-1">
                <span>Configure Parameters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* RECENT SUBMISSIONS FEED */}
        <div className="p-6 rounded-3xl bg-[#0B130E] border border-surface-border space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Waitlist Submissions</h2>
              <p className="text-xs text-muted">Real-time user waitlist applications from database.</p>
            </div>
            <Link
              href="/admin/waitlist"
              className="text-xs text-stonks-green font-bold hover:underline flex items-center gap-1"
            >
              <span>Manage Full Waitlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-surface-border text-muted uppercase text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Wallet</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
                  data.recentSubmissions.map((s: any) => (
                    <tr key={s.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3 px-4 font-bold text-stonks-cyan">{s.user}</td>
                      <td className="py-3 px-4 text-muted">{shortenAddress(s.walletAddress, 4)}</td>
                      <td className="py-3 px-4 text-white truncate max-w-xs">{s.taskTitle}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === "APPROVED"
                              ? "bg-stonks-green/15 text-stonks-green border border-stonks-green/30"
                              : s.status === "PENDING"
                              ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                              : "bg-stonks-red/15 text-stonks-red border border-stonks-red/30"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-stonks-green">
                        +{s.points} PTS
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No waitlist submissions recorded in database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
