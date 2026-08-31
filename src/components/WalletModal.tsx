"use client";

import React from "react";
import { useWeb3 } from "@/lib/web3";
import { X, ShieldCheck, Zap, Sparkles, ExternalLink } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting } = useWeb3();

  if (!isOpen) return null;

  const handleSelect = async (walletType: "metamask" | "coinbase" | "injected" | "demo") => {
    await connectWallet(walletType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0B130E] border border-stonks-green/30 rounded-2xl p-6 shadow-neon-green overflow-hidden z-10">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-stonks-green/15 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-stonks-green" />
            <h3 className="text-lg font-bold text-white tracking-wide">Connect EVM Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-white hover:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted mt-3 mb-5 leading-relaxed">
          Connect your Web3 wallet to sign into Hype Stonks, complete quests, earn reward points, and access token staking.
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {/* MetaMask */}
          <button
            onClick={() => handleSelect("metamask")}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle/80 hover:bg-surface-border/80 border border-surface-border hover:border-stonks-green/40 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <span className="text-lg">🦊</span>
              </div>
              <div>
                <div className="font-semibold text-white group-hover:text-stonks-green transition-colors text-sm">
                  MetaMask
                </div>
                <div className="text-[11px] text-muted">Browser extension & mobile app</div>
              </div>
            </div>
            <span className="text-xs text-stonks-green/70 group-hover:text-stonks-green font-medium">
              Connect ↗
            </span>
          </button>

          {/* Coinbase Wallet */}
          <button
            onClick={() => handleSelect("coinbase")}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle/80 hover:bg-surface-border/80 border border-surface-border hover:border-stonks-cyan/40 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <span className="text-lg">🔵</span>
              </div>
              <div>
                <div className="font-semibold text-white group-hover:text-stonks-cyan transition-colors text-sm">
                  Coinbase Wallet
                </div>
                <div className="text-[11px] text-muted">Web3 mobile & passkey wallet</div>
              </div>
            </div>
            <span className="text-xs text-stonks-cyan/70 group-hover:text-stonks-cyan font-medium">
              Connect ↗
            </span>
          </button>

          {/* Browser Injected / Other */}
          <button
            onClick={() => handleSelect("injected")}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle/80 hover:bg-surface-border/80 border border-surface-border hover:border-white/30 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-stonks-green" />
              </div>
              <div>
                <div className="font-semibold text-white group-hover:text-stonks-green transition-colors text-sm">
                  Detected EVM Wallet
                </div>
                <div className="text-[11px] text-muted">Brave, Rabby, OKX, Rainbow, Trust</div>
              </div>
            </div>
            <span className="text-xs text-muted group-hover:text-white font-medium">
              Auto ↗
            </span>
          </button>

          {/* Instant Demo Sandbox Wallet */}
          <div className="pt-2">
            <button
              onClick={() => handleSelect("demo")}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stonks-green/10 hover:bg-stonks-green/20 border border-stonks-green/40 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stonks-green/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-stonks-green" />
                </div>
                <div>
                  <div className="font-bold text-stonks-green text-xs flex items-center gap-1.5">
                    Instant Demo Mode
                    <span className="px-1.5 py-0.5 text-[9px] bg-stonks-green/20 rounded font-semibold text-stonks-green uppercase">
                      1-Click
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Test quest flow without wallet extension</div>
                </div>
              </div>
              <span className="text-xs text-stonks-green font-semibold">Test ⚡</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-surface-border text-center text-[11px] text-muted">
          By connecting, you agree to Hype Stonks Terms & Privacy Guidelines.
        </div>
      </div>
    </div>
  );
};
