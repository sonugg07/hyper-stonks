"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CheckCircle2, Award, Zap, Calendar, Hash, ArrowRight, Share2, Copy, Check, Coins, Target } from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";

interface SubmissionReceiptProps {
  data: {
    submissionId: string;
    timestamp: string;
    pointsEarned: number;
    totalUserPoints: number;
    questsCompleted: number;
    walletAddress: string;
    xHandle: string;
    referralCode?: string;
  };
  onClose?: () => void;
}

export const SubmissionReceipt: React.FC<SubmissionReceiptProps> = ({ data }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00FFA3", "#00E5FF", "#FFFFFF", "#FFD700"],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/quests?ref=${data.referralCode || "STONKS"}`
    : `https://hype-stonks.io/quests?ref=${data.referralCode || "STONKS"}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(data.timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-[#0B130E] border border-stonks-green/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,255,163,0.2)] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-stonks-green/20 blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-surface-border">
        <div className="w-16 h-16 rounded-2xl bg-stonks-green/15 border border-stonks-green/40 flex items-center justify-center text-stonks-green shadow-neon-green">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <span className="px-3 py-1 bg-stonks-green/15 border border-stonks-green/30 rounded-full text-xs font-mono font-bold text-stonks-green uppercase tracking-widest">
          ✓ Verified & Registered
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ENTRY SUBMITTED SUCCESSFULLY!
        </h2>

        <p className="text-sm text-muted max-w-md">
          Your quest tasks have been recorded and your points have been immediately credited to your EVM wallet.
        </p>
      </div>

      {/* Points Summary Banner */}
      <div className="my-6 grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-subtle/80 border border-stonks-green/25">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-stonks-green/10 text-stonks-green">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase font-semibold">Points Earned</div>
            <div className="text-xl sm:text-2xl font-black text-stonks-green font-mono">
              +{formatNumber(data.pointsEarned)} PTS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-stonks-cyan/10 text-stonks-cyan">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase font-semibold">Total Score</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatNumber(data.totalUserPoints)} PTS
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Receipt Details */}
      <div className="space-y-2.5 text-xs font-mono bg-[#070D0A] p-4 rounded-xl border border-surface-border">
        <div className="flex items-center justify-between py-1 border-b border-surface-border/50">
          <span className="text-muted flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-stonks-green" />
            Submission ID
          </span>
          <span className="text-stonks-green font-bold">{data.submissionId}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-surface-border/50">
          <span className="text-muted">EVM Wallet</span>
          <span className="text-white font-bold">{shortenAddress(data.walletAddress, 6)}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-surface-border/50">
          <span className="text-muted">X (Twitter) Handle</span>
          <span className="text-stonks-cyan font-bold">{data.xHandle}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-surface-border/50">
          <span className="text-muted">Quest Completion</span>
          <span className="text-stonks-green font-bold">100% (Verified)</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            Timestamp
          </span>
          <span className="text-muted-foreground">{formattedDate}</span>
        </div>
      </div>

      {/* Referral Link Box */}
      {data.referralCode && (
        <div className="mt-6 p-4 rounded-2xl bg-stonks-green/5 border border-stonks-green/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stonks-green flex items-center gap-1.5 uppercase tracking-wider">
              <Share2 className="w-4 h-4" />
              Boost Your Score: Refer Friends
            </span>
            <span className="text-[10px] font-mono text-muted bg-surface-subtle px-2 py-0.5 rounded">
              +250 PTS Each
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 bg-[#070D0A] border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-white select-all focus:outline-none"
            />
            <button
              onClick={handleCopyReferral}
              className="px-4 py-2 bg-stonks-green text-black font-bold text-xs rounded-xl hover:bg-stonks-green-dim transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/quests"
          className="w-full py-3.5 px-4 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-surface-border transition-all text-center"
        >
          <Target className="w-4 h-4 text-stonks-green" />
          <span>View All Quests</span>
        </Link>

        <Link
          href="/mint"
          className="w-full py-3.5 px-4 rounded-xl bg-stonks-green text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-stonks-green-dim transition-all text-center shadow-[0_0_20px_rgba(0,255,163,0.3)]"
        >
          <Coins className="w-4 h-4" />
          <span>Explore NFT Mint</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
