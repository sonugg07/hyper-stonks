"use client";

import React, { useEffect, useState } from "react";
import { Users, Target, Zap, Award } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const StatsCounter: React.FC = () => {
  const [stats, setStats] = useState({
    registeredUsers: 14820,
    activeQuests: 6,
    totalPoints: 2850000,
    rewardsDistributed: "$150,000+",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load live stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statItems = [
    {
      label: "Registered Users",
      value: formatNumber(stats.registeredUsers),
      icon: Users,
      color: "text-stonks-green",
      borderColor: "border-stonks-green/20",
      glowColor: "group-hover:border-stonks-green/50",
      bgGlow: "bg-stonks-green/10",
      subtext: "Live on-chain & verified",
    },
    {
      label: "Active Quests",
      value: `${stats.activeQuests} Tasks`,
      icon: Target,
      color: "text-stonks-cyan",
      borderColor: "border-stonks-cyan/20",
      glowColor: "group-hover:border-stonks-cyan/50",
      bgGlow: "bg-stonks-cyan/10",
      subtext: "Instant points eligibility",
    },
    {
      label: "Total Points Earned",
      value: formatNumber(stats.totalPoints),
      icon: Zap,
      color: "text-stonks-green",
      borderColor: "border-stonks-green/20",
      glowColor: "group-hover:border-stonks-green/50",
      bgGlow: "bg-stonks-green/10",
      subtext: "Exchangeable for airdrop",
    },
    {
      label: "Rewards Distributed",
      value: stats.rewardsDistributed,
      icon: Award,
      color: "text-amber-400",
      borderColor: "border-amber-400/20",
      glowColor: "group-hover:border-amber-400/50",
      bgGlow: "bg-amber-400/10",
      subtext: "Season 1 community pool",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`relative group bg-[#0B130E]/80 backdrop-blur-xl border ${item.borderColor} ${item.glowColor} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
          >
            {/* Top right subtle background icon */}
            <div className="absolute top-2 right-2 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Icon className="w-20 h-20 text-white" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {item.label}
              </span>
              <div className={`p-2.5 rounded-xl ${item.bgGlow} ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:text-glow-green transition-all">
              {loading ? (
                <div className="h-8 w-28 bg-surface-subtle animate-pulse rounded" />
              ) : (
                item.value
              )}
            </div>

            <p className="text-[11px] text-muted mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stonks-green" />
              {item.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
