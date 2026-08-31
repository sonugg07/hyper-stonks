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
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintToggling, setMintToggling] = useState(false);
  const [stakingToggling, setStakingToggling] = useState(false);

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
      console.error("Admin overview fetch failed:", err);
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
      }
    } catch (err) {
      console.error("Failed to toggle staking:", err);
    } finally {
      setStakingToggling(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Admin Command Overview"
        subtitle="Real-time telemetry, master module switches, and recent community submissions."
        onRefresh={fetchOverview}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* KPI STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0B130E] border border-stonks-green/25">
            <div className="flex items-center justify-between text-xs text-muted mb-2">
              <span className="font-semibold uppercase">Total Users</span>
              <Users className="w-4 h-4 text-stonks-green" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data ? formatNumber(data.totalUsers) : "..."}
            </div>
            <div className="text-[11px] text-stonks-green mt-1">Verified on-chain participants</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B130E] border border-stonks-cyan/25">
            <div className="flex items-center justify-between text-xs text-muted mb-2">
              <span className="font-semibold uppercase">Active Quests</span>
              <Target className="w-4 h-4 text-stonks-cyan" />
            </div>
            <div className="text-2xl font-black text-stonks-cyan font-mono">
              {data ? `${data.activeQuests} Tasks` : "..."}
            </div>
            <div className="text-[11px] text-muted mt-1">Out of {data?.totalQuests || 6} total created</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B130E] border border-surface-border">
            <div className="flex items-center justify-between text-xs text-muted mb-2">
              <span className="font-semibold uppercase">Completed Quests</span>
              <FileCheck2 className="w-4 h-4 text-muted" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data ? formatNumber(data.completedQuests) : "..."}
            </div>
            <div className="text-[11px] text-muted mt-1">{data?.pendingSubmissions || 0} pending review</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B130E] border border-surface-border">
            <div className="flex items-center justify-between text-xs text-muted mb-2">
              <span className="font-semibold uppercase">Total Points Pool</span>
              <Zap className="w-4 h-4 text-stonks-green" />
            </div>
            <div className="text-2xl font-black text-stonks-green font-mono">
              {data ? formatNumber(data.totalPoints) : "..."} PTS
            </div>
            <div className="text-[11px] text-muted mt-1">Total points in circulation</div>
          </div>
        </div>

        {/* QUICK CONTROL SWITCHES: MINT & STAKING */}
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
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
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
                Status: <strong className={data?.mintStatus ? "text-stonks-green" : "text-stonks-red"}>{data?.mintStatus ? "LIVE (OPEN)" : "DISABLED (CLOSED)"}</strong>
              </span>
              <Link href="/admin/mint" className="text-stonks-green hover:underline flex items-center gap-1">
                <span>Manage Mint Settings</span>
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
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
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
                Status: <strong className={data?.stakingStatus ? "text-stonks-cyan" : "text-stonks-red"}>{data?.stakingStatus ? "ACTIVE (OPEN)" : "DISABLED (CLOSED)"}</strong>
              </span>
              <Link href="/admin/staking" className="text-stonks-cyan hover:underline flex items-center gap-1">
                <span>Manage Staking Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* RECENT SUBMISSIONS TABLE */}
        <div className="p-6 rounded-3xl bg-[#0B130E] border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Submissions Feed</h2>
              <p className="text-xs text-muted">Latest quest tasks recorded from the community.</p>
            </div>
            <Link
              href="/admin/submissions"
              className="text-xs text-stonks-green font-bold hover:underline flex items-center gap-1"
            >
              <span>View All Submissions</span>
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
              <tbody className="divide-y divide-surface-border">
                {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
                  data.recentSubmissions.map((s: any) => (
                    <tr key={s.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{s.user}</td>
                      <td className="py-3 px-4 text-muted">{shortenAddress(s.walletAddress)}</td>
                      <td className="py-3 px-4 text-muted truncate max-w-xs">{s.taskTitle}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === "APPROVED"
                              ? "bg-stonks-green/15 text-stonks-green"
                              : s.status === "PENDING"
                              ? "bg-amber-400/15 text-amber-300"
                              : "bg-stonks-red/15 text-stonks-red"
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
                    <td colSpan={5} className="py-6 text-center text-muted">
                      No recent quest submissions recorded yet.
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
