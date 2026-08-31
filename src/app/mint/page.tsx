"use client";

import React, { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { useWeb3 } from "@/lib/web3";
import { WalletModal } from "@/components/WalletModal";
import {
  Coins,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Wallet,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";

interface MintData {
  isActive: boolean;
  priceEth: number;
  maxSupply: number;
  mintedCount: number;
  maxPerWallet: number;
  contractAddress: string;
  chain: string;
  chainId: number;
}

export default function MintPage() {
  const { address, isConnected, connectWallet } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [mintConfig, setMintConfig] = useState<MintData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintSuccess, setMintSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMintConfig = async () => {
    try {
      const res = await fetch("/api/mint");
      const json = await res.json();
      if (json.success && json.data) {
        setMintConfig(json.data);
      }
    } catch (err) {
      console.error("Failed to load mint config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMintConfig();
  }, []);

  const handleMint = async () => {
    if (!isConnected || !address) {
      setIsWalletModalOpen(true);
      return;
    }

    setErrorMessage(null);
    setIsMinting(true);

    try {
      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          quantity,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Mint transaction failed.");
      } else {
        setMintSuccess(json.data);
        if (mintConfig) {
          setMintConfig({
            ...mintConfig,
            mintedCount: mintConfig.mintedCount + quantity,
          });
        }
      }
    } catch (err) {
      setErrorMessage("Network error during mint. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  const remaining = mintConfig ? mintConfig.maxSupply - mintConfig.mintedCount : 0;
  const progressPercent = mintConfig
    ? Math.min(100, Math.round((mintConfig.mintedCount / mintConfig.maxSupply) * 100))
    : 0;

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stonks-green/10 border border-stonks-green/30 text-xs font-mono font-bold text-stonks-green uppercase">
            <Coins className="w-3.5 h-3.5" />
            <span>Generative Access Passes</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            HYPE STONKS GEN-1 MINT
          </h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            3,333 Genesis NFT passes unlocking staking multipliers, DAO governance, and future airdrop tiers.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-12 rounded-3xl bg-[#0B130E] border border-surface-border text-center space-y-4">
            <div className="w-8 h-8 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-muted">Checking protocol mint contract status...</p>
          </div>
        ) : !mintConfig?.isActive ? (
          /* MINT IS CURRENTLY CLOSED (Requirement 6 & 24) */
          <div className="relative p-10 sm:p-14 rounded-3xl bg-[#0B130E]/90 border border-stonks-red/30 backdrop-blur-xl text-center space-y-6 shadow-[0_0_40px_rgba(255,59,105,0.15)] overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-stonks-red/10 border border-stonks-red/30 flex items-center justify-center text-stonks-red mx-auto shadow-neon-red">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-stonks-red/15 text-stonks-red border border-stonks-red/30 uppercase tracking-wider">
                ● STATUS: PAUSED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                MINT IS CURRENTLY CLOSED
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                Minting is not available right now. Please check back later or complete community quests to secure your whitelist position.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/quests"
                className="px-6 py-3 rounded-xl bg-stonks-green text-black font-bold text-xs uppercase tracking-wider hover:bg-stonks-green-dim transition-colors shadow-neon-green"
              >
                Complete Quests for Whitelist
              </a>
              <a
                href="https://x.com/HypeStonks"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-surface-subtle border border-surface-border text-white hover:text-stonks-green text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <span>Follow Announcements</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-border text-[11px] font-mono text-muted">
              Controlled by smart contract parameters. Admin can toggle status anytime via Admin Panel.
            </div>
          </div>
        ) : (
          /* MINT IS ACTIVE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Artwork Card */}
            <div className="relative rounded-3xl bg-[#0B130E] border border-stonks-green/30 p-6 flex flex-col items-center justify-center overflow-hidden shadow-neon-green group">
              <div className="w-full aspect-square rounded-2xl bg-[#070D0A] border border-surface-border relative overflow-hidden flex flex-col items-center justify-center p-8 text-center">
                {/* Generative Visual Artwork Symbol */}
                <div className="absolute inset-0 bg-trading-grid opacity-30 pointer-events-none" />
                <div className="w-32 h-32 rounded-3xl bg-stonks-green/10 border-2 border-stonks-green/40 flex items-center justify-center text-stonks-green shadow-neon-green group-hover:scale-105 transition-transform">
                  <Coins className="w-16 h-16" />
                </div>
                <div className="mt-6 z-10">
                  <div className="text-xs font-mono text-stonks-green font-bold uppercase tracking-widest">
                    GENESIS PASS #0001 - #3333
                  </div>
                  <div className="text-lg font-black text-white mt-1">Hype Stonks Bull Card</div>
                </div>
              </div>

              <div className="w-full mt-4 flex items-center justify-between text-xs font-mono text-muted px-2">
                <span>Standard: ERC-721</span>
                <span>Network: {mintConfig.chain}</span>
              </div>
            </div>

            {/* Mint Form & Controls */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B130E]/90 border border-stonks-green/30 backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-stonks-green/15 text-stonks-green border border-stonks-green/30 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stonks-green animate-pulse" />
                    Live Public Mint
                  </span>
                  <span className="text-xs font-mono text-muted">
                    Max: {mintConfig.maxPerWallet} per wallet
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">Mint Gen-1 Pass</h2>
                  <p className="text-xs text-muted mt-1">
                    Select quantity and sign with your EVM wallet.
                  </p>
                </div>

                {/* Supply Progress Bar */}
                <div className="space-y-2 p-4 rounded-2xl bg-surface-subtle/80 border border-surface-border">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted">Supply Minted</span>
                    <span className="text-stonks-green font-bold">
                      {formatNumber(mintConfig.mintedCount)} / {formatNumber(mintConfig.maxSupply)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#070D0A] rounded-full overflow-hidden border border-surface-border">
                    <div
                      className="h-full bg-gradient-to-r from-stonks-green to-stonks-cyan rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                    <span>{remaining} Remaining</span>
                    <span>{progressPercent}% Complete</span>
                  </div>
                </div>

                {/* Price & Quantity Box */}
                <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-surface-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted uppercase">Mint Price</span>
                    <span className="text-lg font-black text-white font-mono">
                      {mintConfig.priceEth} ETH <span className="text-xs text-muted font-normal">(each)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                    <span className="text-xs font-semibold text-muted uppercase">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-[#070D0A] border border-surface-border hover:border-stonks-green/40 flex items-center justify-center text-white disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-white text-base">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(mintConfig.maxPerWallet, quantity + 1))}
                        disabled={quantity >= mintConfig.maxPerWallet}
                        className="w-8 h-8 rounded-lg bg-[#070D0A] border border-surface-border hover:border-stonks-green/40 flex items-center justify-center text-white disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                    <span className="text-xs font-bold text-white uppercase">Total Price</span>
                    <span className="text-xl font-black text-stonks-green font-mono">
                      {(mintConfig.priceEth * quantity).toFixed(3)} ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo contract mode callout */}
              <div className="p-3 rounded-xl bg-stonks-cyan/10 border border-stonks-cyan/20 text-[11px] text-muted flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-stonks-cyan shrink-0 mt-0.5" />
                <span>
                  Demo Mode Active: Simulates EVM transaction execution without spending real ETH.
                </span>
              </div>

              {/* Error display */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-stonks-red/10 border border-stonks-red/30 text-xs text-stonks-red flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success display */}
              {mintSuccess && (
                <div className="p-4 rounded-xl bg-stonks-green/10 border border-stonks-green/40 text-xs text-white space-y-1">
                  <div className="flex items-center gap-1.5 text-stonks-green font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{mintSuccess.message}</span>
                  </div>
                  <div className="font-mono text-[10px] text-muted truncate">
                    Tx: {mintSuccess.txHash}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {isConnected && address ? (
                <button
                  type="button"
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isMinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>PROCESSING MINT...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>MINT {quantity} PASS ({(mintConfig.priceEth * quantity).toFixed(2)} ETH)</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-surface-subtle hover:bg-surface-border border border-stonks-green/40 hover:border-stonks-green transition-all flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-stonks-green" />
                  <span>Connect Wallet to Mint</span>
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
