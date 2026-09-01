"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";
import { StatsCounter } from "@/components/StatsCounter";
import { WalletModal } from "@/components/WalletModal";
import { useWeb3 } from "@/lib/web3";
import { shortenAddress } from "@/lib/utils";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Coins,
  Lock,
  ChevronRight,
  ExternalLink,
  Target,
  ClipboardList,
} from "lucide-react";

export default function HomePage() {
  const { address, isConnected } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [mintStatus, setMintStatus] = useState<boolean>(false);
  const [stakingStatus, setStakingStatus] = useState<boolean>(false);

  useEffect(() => {
    // Fetch live module statuses for cards
    async function loadModuleStatus() {
      try {
        const [mintRes, stakingRes] = await Promise.all([
          fetch("/api/mint"),
          fetch("/api/staking"),
        ]);
        const mintJson = await mintRes.json();
        const stakingJson = await stakingRes.json();
        if (mintJson.success && mintJson.data) setMintStatus(mintJson.data.isActive);
        if (stakingJson.success && stakingJson.data) setStakingStatus(stakingJson.data.isActive);
      } catch (err) {
        console.error("Failed to load module status:", err);
      }
    }
    loadModuleStatus();
  }, []);

  return (
    <PublicLayout>
      <div className="space-y-24 sm:space-y-32">
        {/* HERO SECTION */}
        <section className="relative text-center max-w-5xl mx-auto pt-6 sm:pt-12">
          {/* Season Live Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-subtle/90 border border-stonks-green/30 shadow-[0_0_20px_rgba(0,255,163,0.15)] mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stonks-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-stonks-green"></span>
            </span>
            <span className="text-xs font-mono font-bold text-stonks-green uppercase tracking-wider">
              SEASON 1 WAITLIST IS LIVE
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Trade the Hype.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stonks-green via-stonks-cyan to-white drop-shadow-[0_0_30px_rgba(0,255,163,0.3)]">
              Earn Your Position.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            A community-powered Web3 platform where activity, participation, and conviction turn into verified waitlist allocations, NFT passes, and staking yield.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/waitlist"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green hover:shadow-[0_0_35px_rgba(0,255,163,0.6)] flex items-center justify-center gap-2.5 group"
            >
              <span>Join Waitlist</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {isConnected && address ? (
              <Link
                href="/waitlist"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-surface-subtle/80 hover:bg-surface-border border border-stonks-green/30 hover:border-stonks-green transition-all flex items-center justify-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-stonks-green animate-pulse" />
                <span>Connected ({shortenAddress(address)})</span>
              </Link>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-surface-subtle/80 hover:bg-surface-border border border-surface-border hover:border-stonks-green/40 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-stonks-green" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </section>

        {/* DYNAMIC STATS SECTION */}
        <section className="relative">
          <div className="text-center mb-8">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-stonks-green">
              Live Network Metrics
            </h2>
          </div>
          <StatsCounter />
        </section>

        {/* HOW IT WORKS */}
        <section className="relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 bg-stonks-green/10 text-stonks-green text-xs font-mono font-bold uppercase tracking-wider rounded-full border border-stonks-green/20">
              Protocol Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
              How Hype Stonks Works
            </h2>
            <p className="text-sm text-muted mt-2">
              Three seamless steps from initial conviction to verified Web3 rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-[#0B130E]/80 border border-surface-border hover:border-stonks-green/40 transition-all group overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect EVM Wallet</h3>
              <p className="text-sm text-muted leading-relaxed">
                Connect your MetaMask, Coinbase, or injected Web3 wallet to establish your decentralized identity and secure your on-chain score.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-[#0B130E]/80 border border-surface-border hover:border-stonks-cyan/40 transition-all group overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-stonks-cyan/10 border border-stonks-cyan/30 flex items-center justify-center text-stonks-cyan font-mono font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Complete Waitlist Tasks</h3>
              <p className="text-sm text-muted leading-relaxed">
                Follow X channels, like & repost official announcements, contribute comments, and engage across Discord and Telegram.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-[#0B130E]/80 border border-surface-border hover:border-stonks-green/40 transition-all group overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Spot & Ascend</h3>
              <p className="text-sm text-muted leading-relaxed">
                Accumulate conviction points, earn referral bonuses, and secure your guaranteed whitelist allocation for upcoming releases.
              </p>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM PREVIEW: MINT & STAKING MODULES */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mint Card Preview */}
          <div className="relative p-8 rounded-3xl bg-[#0B130E]/85 border border-surface-border hover:border-stonks-green/30 transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Coins className="w-6 h-6" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    mintStatus
                      ? "bg-stonks-green/15 text-stonks-green border border-stonks-green/30"
                      : "bg-surface-subtle text-muted border border-surface-border"
                  }`}
                >
                  {mintStatus ? "● Mint Open" : "○ Mint Closed"}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Hype Stonks Gen-1 Pass</h3>
              <p className="text-sm text-muted leading-relaxed">
                Limited collection of 3,333 generative access passes offering boosted staking multiplier APY, governance rights, and zero-fee airdrop claims.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-border flex items-center justify-between">
              <div>
                <div className="text-[11px] text-muted uppercase font-semibold">Mint Status</div>
                <div className="text-sm font-bold text-white">
                  {mintStatus ? "Active Public Sale" : "Closed / Standby"}
                </div>
              </div>
              <Link
                href="/mint"
                className="px-5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-white hover:text-stonks-green transition-all flex items-center gap-1.5"
              >
                <span>View Mint Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Staking Card Preview */}
          <div className="relative p-8 rounded-3xl bg-[#0B130E]/85 border border-surface-border hover:border-stonks-cyan/30 transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-stonks-cyan/10 text-stonks-cyan border border-stonks-cyan/20">
                  <Lock className="w-6 h-6" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    stakingStatus
                      ? "bg-stonks-cyan/15 text-stonks-cyan border border-stonks-cyan/30"
                      : "bg-surface-subtle text-muted border border-surface-border"
                  }`}
                >
                  {stakingStatus ? "● Vault Active" : "○ Staking Soon"}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Yield Vault & $STONKS Rewards</h3>
              <p className="text-sm text-muted leading-relaxed">
                Lock your positions to harvest automated yield in $STONKS reward tokens with dynamic APY pools and flexible lock tiers.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-border flex items-center justify-between">
              <div>
                <div className="text-[11px] text-muted uppercase font-semibold">Projected APY</div>
                <div className="text-sm font-bold text-stonks-cyan">Up to 42.5%</div>
              </div>
              <Link
                href="/staking"
                className="px-5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-cyan/40 text-xs font-bold text-white hover:text-stonks-cyan transition-all flex items-center gap-1.5"
              >
                <span>View Staking Pool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* COMMUNITY CTA */}
        <section className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-[#0B130E] to-[#060B09] border border-stonks-green/30 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-trading-grid opacity-40 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Claim Your Position?
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Join thousands of Web3 traders, collectors, and early contributors securing their verified waitlist spots every day.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/waitlist"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green"
              >
                Join Official Waitlist
              </Link>
              <a
                href="https://x.com/HypeStonks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-surface-subtle hover:bg-surface-border border border-surface-border transition-all flex items-center justify-center gap-1.5"
              >
                <span>Follow @HypeStonks</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </PublicLayout>
  );
}
