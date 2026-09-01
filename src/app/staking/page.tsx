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
  Loader2,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";
import { getExplorerTxUrl, getExplorerAddressUrl } from "@/lib/contracts";

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
  const { address, isConnected, balance, isDemoMode, providerName, switchNetwork } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [stakingConfig, setStakingConfig] = useState<StakingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"STAKE" | "UNSTAKE" | "CLAIM">("STAKE");
  const [stakeAmount, setStakeAmount] = useState<string>("0.5");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
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

    if (!stakingConfig || !stakingConfig.isActive) {
      setErrorMessage("Staking pool is currently closed.");
      return;
    }

    setErrorMessage(null);
    setActionSuccess(null);
    setLastTxHash(null);
    setIsProcessing(true);

    try {
      let txHash = "";

      // If in Real Web3 Mode, request wallet transaction
      if (!isDemoMode && typeof window !== "undefined" && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;

        if (activeTab === "STAKE") {
          const ethAmount = Number(stakeAmount) || 0;
          if (ethAmount < stakingConfig.minStake) {
            throw new Error(`Minimum stake is ${stakingConfig.minStake} ETH.`);
          }

          const weiAmount = BigInt(Math.round(ethAmount * 1e18));
          const valueHex = `0x${weiAmount.toString(16)}`;

          // Trigger wallet confirmation popup
          txHash = await ethereum.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: address,
                to: stakingConfig.contractAddress || "0x99A87C6F67e0eD40360a0a86B91054E83b4Bf2F1",
                value: valueHex,
              },
            ],
          });
        }
      }

      // Sync with backend API
      const res = await fetch("/api/staking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activeTab,
          walletAddress: address,
          amount: activeTab === "STAKE" ? Number(stakeAmount) : 0,
          txHash: txHash || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Staking transaction failed.");
      } else {
        const hashToDisplay = txHash || json.data?.txHash;
        setLastTxHash(hashToDisplay);
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
    } catch (err: any) {
      console.error("Staking action error:", err);
      if (
        err?.code === 4001 ||
        err?.message?.includes("User rejected") ||
        err?.message?.includes("User denied") ||
        err?.message?.includes("rejected") ||
        err?.message?.includes("cancelled")
      ) {
        setErrorMessage("Transaction cancelled: You rejected the request in your wallet.");
      } else {
        setErrorMessage(err.message || "Network error during staking transaction.");
      }
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
          /* STAKING IS CURRENTLY CLOSED */
          <div className="relative p-10 sm:p-14 rounded-3xl bg-[#0B130E]/90 border border-stonks-red/30 backdrop-blur-xl text-center space-y-6 shadow-[0_0_40px_rgba(255,59,105,0.15)] overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-stonks-red/10 border border-stonks-red/30 flex items-center justify-center text-stonks-red mx-auto shadow-neon-red">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-stonks-red/15 text-stonks-red border border-stonks-red/30 uppercase tracking-wider">
                ● STATUS: VAULT PAUSED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                STAKING IS CURRENTLY CLOSED
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                Staking deposits and reward emissions are not active right now. Please check back later or participate in the community waitlist.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/waitlist"
                className="px-6 py-3 rounded-xl bg-stonks-cyan text-black font-bold text-xs uppercase tracking-wider hover:bg-stonks-cyan/90 transition-colors shadow-neon-cyan"
              >
                Join Waitlist for Rewards
              </a>
              <a
                href="https://x.com/HypeStonks"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-surface-subtle border border-surface-border text-white hover:text-stonks-cyan text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <span>Follow Announcements</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* STAKING IS ACTIVE */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stats Sidebar */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-[#0B130E] border border-stonks-cyan/30 space-y-4 shadow-neon-cyan">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted uppercase">Pool APY</span>
                  <TrendingUp className="w-4 h-4 text-stonks-cyan" />
                </div>
                <div className="text-4xl font-black text-stonks-cyan font-mono">
                  {stakingConfig.apyPercent}%
                </div>
                <p className="text-[11px] text-muted">Auto-compounding annual percentage yield.</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0B130E] border border-surface-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted uppercase">Total Value Locked</span>
                  <Lock className="w-4 h-4 text-stonks-green" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {formatNumber(stakingConfig.totalStaked)} ETH
                </div>
                <p className="text-[11px] text-muted">Staked across all community participants.</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0B130E] border border-surface-border space-y-3 font-mono text-xs text-muted">
                <div className="flex items-center justify-between">
                  <span>Lock Period:</span>
                  <span className="text-white font-bold">{stakingConfig.lockDurationDays} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Min Stake:</span>
                  <span className="text-white font-bold">{stakingConfig.minStake} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network:</span>
                  <span className="text-stonks-cyan font-bold">{stakingConfig.chain}</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Staking Card */}
            <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0B130E]/90 border border-stonks-cyan/30 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-2xl">
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex p-1 rounded-2xl bg-[#070D0A] border border-surface-border font-mono text-xs">
                  {(["STAKE", "UNSTAKE", "CLAIM"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab);
                        setErrorMessage(null);
                        setActionSuccess(null);
                      }}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                        activeTab === tab
                          ? "bg-stonks-cyan text-black shadow-neon-cyan"
                          : "text-muted hover:text-white"
                      }`}
                    >
                      {tab === "STAKE" ? "Deposit Stake" : tab === "UNSTAKE" ? "Withdraw" : "Claim Yield"}
                    </button>
                  ))}
                </div>

                {activeTab === "STAKE" ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-surface-border space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted uppercase">Amount to Stake</span>
                        <span className="text-muted">
                          Wallet Balance: <strong className="text-white">{balance || "0.00 ETH"}</strong>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <input
                          type="number"
                          step="0.01"
                          min={stakingConfig.minStake}
                          max={stakingConfig.maxStake}
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="w-full bg-transparent text-2xl font-black font-mono text-white outline-none"
                          placeholder="0.0"
                        />
                        <button
                          type="button"
                          onClick={() => setStakeAmount("1.0")}
                          className="px-3 py-1 rounded-lg bg-[#070D0A] border border-surface-border text-xs font-mono font-bold text-stonks-cyan hover:border-stonks-cyan transition-colors"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#070D0A] border border-surface-border space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Est. Daily Earnings:</span>
                        <span className="text-stonks-cyan font-bold">
                          +{((Number(stakeAmount || 0) * (stakingConfig.apyPercent / 100)) / 365).toFixed(4)} ETH / Day
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Reward Token:</span>
                        <span className="text-stonks-green font-bold">{stakingConfig.rewardTokenSymbol}</span>
                      </div>
                    </div>
                  </div>
                ) : activeTab === "UNSTAKE" ? (
                  <div className="p-6 rounded-2xl bg-surface-subtle/80 border border-surface-border text-center space-y-3">
                    <span className="text-xs font-mono text-muted uppercase">Your Currently Staked Balance</span>
                    <div className="text-3xl font-black text-white font-mono">{userStaked.toFixed(2)} ETH</div>
                    <p className="text-xs text-muted">
                      {userStaked > 0
                        ? "Unstaking will return your deposit and settle accrued rewards to your wallet."
                        : "You currently have no active staked deposits in this vault."}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-surface-subtle/80 border border-surface-border text-center space-y-3">
                    <span className="text-xs font-mono text-muted uppercase">Unclaimed Reward Balance</span>
                    <div className="text-3xl font-black text-stonks-cyan font-mono">
                      {userPendingRewards.toFixed(1)} {stakingConfig.rewardTokenSymbol}
                    </div>
                    <p className="text-xs text-muted">
                      Claim accrued reward tokens directly into your connected wallet.
                    </p>
                  </div>
                )}
              </div>

              {/* Status & Error */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-stonks-red/10 border border-stonks-red/30 text-xs text-stonks-red flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 rounded-xl bg-stonks-cyan/10 border border-stonks-cyan/40 text-xs text-white space-y-1">
                  <div className="flex items-center gap-1.5 text-stonks-cyan font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionSuccess}</span>
                  </div>
                  {lastTxHash && (
                    <div className="font-mono text-[10px] text-muted truncate">
                      Tx: {lastTxHash}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {isConnected && address ? (
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black bg-stonks-cyan hover:bg-stonks-cyan/90 transition-all shadow-neon-cyan flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AUTHORIZING IN WALLET...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>
                        {activeTab === "STAKE"
                          ? `STAKE ${stakeAmount} ETH IN VAULT`
                          : activeTab === "UNSTAKE"
                          ? "WITHDRAW STAKE"
                          : `CLAIM ${stakingConfig.rewardTokenSymbol}`}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-surface-subtle hover:bg-surface-border border border-stonks-cyan/40 hover:border-stonks-cyan transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-stonks-cyan" />
                  <span>Connect Wallet to Access Vault</span>
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
