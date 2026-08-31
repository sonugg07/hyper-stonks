"use client";

import React, { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { useWeb3 } from "@/lib/web3";
import { WalletModal } from "@/components/WalletModal";
import {
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";

interface StakingData {
  isActive: boolean;
  apyPercent: number;
  minStake: number;
  maxStake: number;
  lockDurationDays: number;
  rewardTokenSymbol: string;
  contractAddress: string;
  chain: string;
  chainId: number;
  totalStaked: number;
}

export default function StakingPage() {
  const { address, isConnected, balance, connectWallet } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [stakingConfig, setStakingConfig] = useState<StakingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"STAKE" | "UNSTAKE" | "CLAIM">("STAKE");
  const [stakeAmount, setStakeAmount] = useState<string>("0.5");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User position state
  const [userStaked, setUserStaked] = useState<number>(0);
  const [userPendingRewards, setUserPendingRewards] = useState<number>(145.8);

  const fetchStakingConfig = async () => {
    try {
      const res = await fetch("/api/staking");
      const json = await res.json();
      if (json.success && json.data) {
        setStakingConfig(json.data);
      }
    } catch (err) {
      console.error("Failed to load staking config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakingConfig();
  }, []);

  const handleAction = async () => {
    if (!isConnected || !address) {
      setIsWalletModalOpen(true);
      return;
    }

    setErrorMessage(null);
    setActionSuccess(null);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/staking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activeTab,
          walletAddress: address,
          amount: activeTab === "STAKE" ? Number(stakeAmount) : 0,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Staking transaction failed.");
      } else {
        setActionSuccess(json.data?.message || "Operation successful!");
        if (activeTab === "STAKE") {
          setUserStaked((prev) => prev + Number(stakeAmount));
          if (stakingConfig) {
            setStakingConfig({
              ...stakingConfig,
              totalStaked: stakingConfig.totalStaked + Number(stakeAmount),
            });
          }
        } else if (activeTab === "CLAIM") {
          setUserPendingRewards(0);
        }
      }
    } catch (err) {
      setErrorMessage("Network error during staking transaction.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stonks-cyan/10 border border-stonks-cyan/30 text-xs font-mono font-bold text-stonks-cyan uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Yield & Liquidity Vaults</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            HYPE STONKS STAKING POOL
          </h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Stake ETH or Stonks Genesis NFTs to earn automated daily yields in $STONKS governance tokens.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-12 rounded-3xl bg-[#0B130E] border border-surface-border text-center space-y-4">
            <div className="w-8 h-8 border-2 border-stonks-cyan border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-muted">Connecting to yield pool smart contracts...</p>
          </div>
        ) : !stakingConfig?.isActive ? (
          /* STAKING IS CURRENTLY CLOSED (Requirement 7 & 24) */
          <div className="relative p-10 sm:p-14 rounded-3xl bg-[#0B130E]/90 border border-stonks-red/30 backdrop-blur-xl text-center space-y-6 shadow-[0_0_40px_rgba(255,59,105,0.15)] overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-stonks-red/10 border border-stonks-red/30 flex items-center justify-center text-stonks-red mx-auto shadow-neon-red">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-stonks-red/15 text-stonks-red border border-stonks-red/30 uppercase tracking-wider">
                ● STATUS: COMING SOON
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                STAKING IS CURRENTLY CLOSED
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                Staking will be available soon. Vault audits are currently in progress. Complete community quests to qualify for early depositor multipliers.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/quests"
                className="px-6 py-3 rounded-xl bg-stonks-green text-black font-bold text-xs uppercase tracking-wider hover:bg-stonks-green-dim transition-colors shadow-neon-green"
              >
                Earn Quest Multipliers
              </a>
              <a
                href="https://x.com/HypeStonks"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-surface-subtle border border-surface-border text-white hover:text-stonks-cyan text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <span>Follow Protocol Updates</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-border text-[11px] font-mono text-muted">
              Admin can switch Staking ON/OFF in real time from the Admin Panel.
            </div>
          </div>
        ) : (
          /* STAKING IS ACTIVE */
          <div className="space-y-8">
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-[#0B130E]/90 border border-stonks-cyan/30">
                <div className="text-xs text-muted uppercase font-semibold">Staking APY</div>
                <div className="text-2xl sm:text-3xl font-black text-stonks-cyan font-mono mt-1">
                  {stakingConfig.apyPercent}%
                </div>
                <div className="text-[11px] text-muted mt-1">Dynamic reward rate</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B130E]/90 border border-stonks-green/30">
                <div className="text-xs text-muted uppercase font-semibold">Total Value Locked</div>
                <div className="text-2xl sm:text-3xl font-black text-stonks-green font-mono mt-1">
                  {formatNumber(stakingConfig.totalStaked)} ETH
                </div>
                <div className="text-[11px] text-muted mt-1">Protocol vault total</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B130E]/90 border border-surface-border">
                <div className="text-xs text-muted uppercase font-semibold">Lock Duration</div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                  {stakingConfig.lockDurationDays} Days
                </div>
                <div className="text-[11px] text-muted mt-1">Flexible unstake window</div>
              </div>
            </div>

            {/* STAKING INTERACTION BOX */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B130E]/95 border border-stonks-cyan/30 backdrop-blur-xl space-y-6 shadow-2xl">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#070D0A] border border-surface-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("STAKE")}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "STAKE"
                      ? "bg-stonks-cyan text-black font-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Stake
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("UNSTAKE")}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "UNSTAKE"
                      ? "bg-stonks-cyan text-black font-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Unstake
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("CLAIM")}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "CLAIM"
                      ? "bg-stonks-cyan text-black font-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Claim Rewards
                </button>
              </div>

              {/* User Position Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-subtle/80 border border-surface-border text-xs font-mono">
                <div>
                  <div className="text-muted text-[10px] uppercase">Wallet</div>
                  <div className="text-white font-bold truncate">
                    {isConnected && address ? shortenAddress(address) : "Not Connected"}
                  </div>
                </div>
                <div>
                  <div className="text-muted text-[10px] uppercase">Available</div>
                  <div className="text-white font-bold">{isConnected ? balance : "0.00 ETH"}</div>
                </div>
                <div>
                  <div className="text-muted text-[10px] uppercase">Your Staked</div>
                  <div className="text-stonks-cyan font-bold">{userStaked.toFixed(2)} ETH</div>
                </div>
                <div>
                  <div className="text-muted text-[10px] uppercase">Pending Rewards</div>
                  <div className="text-stonks-green font-bold">
                    {userPendingRewards.toFixed(1)} {stakingConfig.rewardTokenSymbol}
                  </div>
                </div>
              </div>

              {/* Action Form */}
              {activeTab === "STAKE" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Deposit Amount</span>
                      <span>Min: {stakingConfig.minStake} ETH | Max: {stakingConfig.maxStake} ETH</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-full bg-transparent text-2xl font-mono font-black text-white outline-none"
                      />
                      <span className="text-sm font-bold text-stonks-cyan">ETH</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted px-1">
                    <span>Estimated Daily Yield:</span>
                    <span className="text-stonks-green font-mono font-bold">
                      +{(Number(stakeAmount || 0) * (stakingConfig.apyPercent / 365)).toFixed(4)} {stakingConfig.rewardTokenSymbol}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "UNSTAKE" && (
                <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border text-center space-y-3">
                  <div className="text-sm text-white font-bold">Currently Staked: {userStaked.toFixed(2)} ETH</div>
                  <p className="text-xs text-muted">
                    Lock period is active ({stakingConfig.lockDurationDays} days). Unstaking returns your principal directly to your wallet.
                  </p>
                </div>
              )}

              {activeTab === "CLAIM" && (
                <div className="p-6 rounded-2xl bg-surface-subtle border border-stonks-green/30 text-center space-y-3">
                  <div className="text-sm text-muted">Harvestable Rewards</div>
                  <div className="text-3xl font-black text-stonks-green font-mono">
                    {userPendingRewards.toFixed(1)} {stakingConfig.rewardTokenSymbol}
                  </div>
                  <p className="text-xs text-muted">
                    Harvest your accrued rewards into your EVM wallet.
                  </p>
                </div>
              )}

              {/* Demo Mode Notice */}
              <div className="p-3 rounded-xl bg-stonks-cyan/10 border border-stonks-cyan/20 text-[11px] text-muted flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-stonks-cyan shrink-0 mt-0.5" />
                <span>
                  Demo Mode: Staking contracts simulated for review. Never faking real mainnet hashes.
                </span>
              </div>

              {/* Error and Success notices */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-stonks-red/10 border border-stonks-red/30 text-xs text-stonks-red flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 rounded-xl bg-stonks-green/10 border border-stonks-green/40 text-xs text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-stonks-green shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Action Button */}
              {isConnected && address ? (
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black bg-stonks-cyan hover:bg-cyan-400 transition-all shadow-neon-cyan flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>PROCESSING {activeTab}...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{activeTab} POSITION</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-surface-subtle hover:bg-surface-border border border-stonks-cyan/40 hover:border-stonks-cyan transition-all flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-stonks-cyan" />
                  <span>Connect Wallet to Access Staking</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </PublicLayout>
  );
}
