"use client";

import React from "react";
import { TrendingUp, Flame, Zap, Shield, Sparkles } from "lucide-react";

export const TradingTicker: React.FC = () => {
  const tickerItems = [
    { symbol: "$STONKS", change: "+148.2%", isUp: true, label: "Community Token" },
    { symbol: "QUESTS ACTIVE", change: "6 LIVE", isUp: true, label: "Earn Points" },
    { symbol: "REGISTERED USERS", change: "14,892+", isUp: true, label: "Ecosystem" },
    { symbol: "POINTS AWARDED", change: "2,450,000+", isUp: true, label: "Total Distributed" },
    { symbol: "ETH / USD", change: "$3,420.50 (+4.2%)", isUp: true, label: "Market" },
    { symbol: "SEASON 1 AIRDROP", change: "UPCOMING", isUp: true, label: "Whitelist Allocation" },
  ];

  return (
    <div className="w-full bg-[#070D0A] border-y border-stonks-green/10 py-2.5 overflow-hidden flex items-center select-none relative z-20">
      <div className="flex items-center gap-2 px-4 bg-[#0B130E] border-r border-stonks-green/20 z-10 shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stonks-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-stonks-green"></span>
        </span>
        <span className="text-[11px] font-bold tracking-wider text-stonks-green uppercase">Live Ticker</span>
      </div>

      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee pl-4">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs font-mono">
              <span className="text-white font-bold">{item.symbol}</span>
              <span className="text-[11px] text-muted hidden sm:inline">({item.label})</span>
              <span
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                  item.isUp
                    ? "bg-stonks-green/15 text-stonks-green"
                    : "bg-stonks-red/15 text-stonks-red"
                }`}
              >
                {item.isUp ? <TrendingUp className="w-3 h-3" /> : null}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
