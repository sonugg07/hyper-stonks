"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PublicLayout } from "@/components/PublicLayout";
import { useWeb3 } from "@/lib/web3";
import { isValidEvmAddress, formatNumber } from "@/lib/utils";
import { CaptchaVerification } from "@/components/CaptchaVerification";
import { SubmissionReceipt } from "@/components/SubmissionReceipt";
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Twitter,
  Heart,
  Repeat,
  MessageSquare,
  Wallet,
  ShieldCheck,
  Send,
  Disc,
} from "lucide-react";

interface QuestItem {
  id: string;
  slug: string;
  orderIndex: number;
  title: string;
  description: string;
  taskType: string;
  url: string | null;
  points: number;
  verificationType: string;
  isActive: boolean;
}

function QuestsContent() {
  const searchParams = useSearchParams();
  const referralParam = searchParams ? searchParams.get("ref") || "" : "";

  const { address, isConnected, connectWallet } = useWeb3();

  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [registeredCount, setRegisteredCount] = useState<number>(14820);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Fields
  const [xHandle, setXHandle] = useState<string>("");
  const [commentUrl, setCommentUrl] = useState<string>("");
  const [walletInput, setWalletInput] = useState<string>("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  // Task Step Statuses
  const [step1Status, setStep1Status] = useState<"NOT_STARTED" | "VERIFIED">("NOT_STARTED");
  const [step2Liked, setStep2Liked] = useState<boolean>(false);
  const [step2Reposted, setStep2Reposted] = useState<boolean>(false);
  const [step3Status, setStep3Status] = useState<"NOT_STARTED" | "VERIFIED">("NOT_STARTED");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  // Autofill wallet address from Web3 when connected
  useEffect(() => {
    if (address && isValidEvmAddress(address)) {
      setWalletInput(address);
    }
  }, [address]);

  // Load active quests from backend API
  useEffect(() => {
    async function loadQuests() {
      try {
        const res = await fetch("/api/quests");
        const json = await res.json();
        if (json.success && json.data) {
          setQuests(json.data);
          if (json.registeredCount) setRegisteredCount(json.registeredCount);
        }
      } catch (err) {
        console.error("Failed to load quests:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuests();
  }, []);

  const totalPointsAvailable = quests.reduce((sum, q) => sum + q.points, 0) || 1800;

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!xHandle || xHandle.trim().length < 2) {
      setErrorMessage("Please enter your X (Twitter) handle for verification.");
      return;
    }

    if (!walletInput || !isValidEvmAddress(walletInput)) {
      setErrorMessage("Please enter a valid 42-character EVM wallet address starting with 0x.");
      return;
    }

    if (!isCaptchaVerified) {
      setErrorMessage("Please complete the human anti-bot verification check.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/quests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xHandle: xHandle.trim(),
          commentUrl: commentUrl.trim(),
          walletAddress: walletInput.trim(),
          captchaToken: captchaToken || "verified",
          referralCodeUsed: referralParam,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Failed to submit quest entry. Please try again.");
      } else {
        setSuccessReceipt(json.data);
        setRegisteredCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage("Network error processing submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* PAGE HEADER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stonks-green/10 border border-stonks-green/30 text-xs font-mono font-bold text-stonks-green uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Community Allocation Campaign</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          HYPE STONKS QUESTS
        </h1>

        {/* Dynamic Registered Counter */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-mono text-muted">
            <strong className="text-stonks-green font-bold">
              {formatNumber(registeredCount)}
            </strong>{" "}
            Registered
          </span>
          <span className="text-muted/40">•</span>
          <span className="text-sm font-mono text-muted">
            Reward Pool: <strong className="text-stonks-cyan font-bold">+{formatNumber(totalPointsAvailable)} PTS</strong>
          </span>
        </div>

        {referralParam && (
          <div className="inline-block px-3 py-1 bg-stonks-cyan/10 border border-stonks-cyan/30 rounded-lg text-xs font-mono text-stonks-cyan">
            Referral Code Active: <strong>{referralParam}</strong> (+250 Bonus PTS)
          </div>
        )}
      </div>

      {/* If already submitted successfully, show the Receipt */}
      {successReceipt ? (
        <SubmissionReceipt data={successReceipt} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CARD 01: Follow on X */}
          <div className="relative bg-[#0B130E]/90 backdrop-blur-xl border border-stonks-green/20 hover:border-stonks-green/40 rounded-3xl p-6 sm:p-8 transition-all shadow-glass group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-base shrink-0">
                  01
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-stonks-green transition-colors">
                    Follow Hype Stonks on X
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Follow the official Hype Stonks account, then enter your X handle below.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-stonks-green/10 text-stonks-green border border-stonks-green/25">
                  +250 PTS
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="https://x.com/HypeStonks"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setStep1Status("VERIFIED")}
                className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-white hover:text-stonks-green transition-all flex items-center justify-center gap-2 shrink-0 group/btn"
              >
                <Twitter className="w-4 h-4 text-stonks-green" />
                <span>Follow @HypeStonks</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </a>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@yourhandle"
                  required
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green focus:ring-1 focus:ring-stonks-green rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-muted-dark transition-colors outline-none"
                />
                {xHandle.trim().length > 1 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stonks-green font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CARD 02: Like & Repost */}
          <div className="relative bg-[#0B130E]/90 backdrop-blur-xl border border-stonks-green/20 hover:border-stonks-green/40 rounded-3xl p-6 sm:p-8 transition-all shadow-glass group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-base shrink-0">
                  02
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-stonks-green transition-colors">
                    Like & Repost Announcement
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Like and repost the official launch announcement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-stonks-green/10 text-stonks-green border border-stonks-green/25">
                  +350 PTS
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://x.com/HypeStonks/status/1890000000000000000"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setStep2Liked(true)}
                className={`px-5 py-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  step2Liked
                    ? "bg-stonks-green/15 text-stonks-green border-stonks-green/40"
                    : "bg-surface-subtle border-surface-border text-white hover:border-stonks-green/40"
                }`}
              >
                <Heart className={`w-4 h-4 ${step2Liked ? "fill-stonks-green text-stonks-green" : "text-stonks-red"}`} />
                <span>{step2Liked ? "Liked Post ✓" : "Like the post ✓"}</span>
              </a>

              <a
                href="https://x.com/HypeStonks/status/1890000000000000000"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setStep2Reposted(true)}
                className={`px-5 py-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  step2Reposted
                    ? "bg-stonks-green/15 text-stonks-green border-stonks-green/40"
                    : "bg-surface-subtle border-surface-border text-white hover:border-stonks-green/40"
                }`}
              >
                <Repeat className="w-4 h-4 text-stonks-green" />
                <span>{step2Reposted ? "Reposted ✓" : "Repost ✓"}</span>
              </a>
            </div>
          </div>

          {/* CARD 03: Drop a Comment */}
          <div className="relative bg-[#0B130E]/90 backdrop-blur-xl border border-stonks-green/20 hover:border-stonks-green/40 rounded-3xl p-6 sm:p-8 transition-all shadow-glass group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-base shrink-0">
                  03
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-stonks-green transition-colors">
                    Drop a Comment
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Open the post, leave a comment, then submit the post/comment information.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-stonks-green/10 text-stonks-green border border-stonks-green/25">
                  +300 PTS
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="https://x.com/HypeStonks/status/1890000000000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-cyan/40 text-xs font-bold text-white hover:text-stonks-cyan transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <MessageSquare className="w-4 h-4 text-stonks-cyan" />
                <span>Open the post</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={commentUrl}
                  onChange={(e) => setCommentUrl(e.target.value)}
                  placeholder="Paste your comment/post link (Optional)"
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan focus:ring-1 focus:ring-stonks-cyan rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-muted-dark transition-colors outline-none"
                />
              </div>
            </div>
          </div>

          {/* CARD 04: Your EVM Wallet Address */}
          <div className="relative bg-[#0B130E]/90 backdrop-blur-xl border border-stonks-green/20 hover:border-stonks-green/40 rounded-3xl p-6 sm:p-8 transition-all shadow-glass group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-base shrink-0">
                  04
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-stonks-green transition-colors">
                    Your Wallet Address
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Enter any compatible EVM wallet address.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-stonks-green/10 text-stonks-green border border-stonks-green/25">
                  +500 PTS
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x..."
                    required
                    className={`w-full bg-[#070D0A] border rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-muted-dark outline-none transition-colors ${
                      walletInput && !isValidEvmAddress(walletInput)
                        ? "border-stonks-red focus:border-stonks-red"
                        : walletInput && isValidEvmAddress(walletInput)
                        ? "border-stonks-green focus:border-stonks-green"
                        : "border-surface-border focus:border-stonks-green"
                    }`}
                  />
                  {walletInput && isValidEvmAddress(walletInput) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stonks-green font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid EVM
                    </span>
                  )}
                </div>

                {!isConnected && (
                  <button
                    type="button"
                    onClick={() => connectWallet("injected")}
                    className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-stonks-green transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Autofill from Wallet</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-stonks-green" />
                Must be 42 characters, starts with 0x (Ethereum, Arbitrum, Base, BSC compatible).
              </p>
            </div>
          </div>

          {/* HUMAN CAPTCHA SECTION */}
          <CaptchaVerification
            isVerified={isCaptchaVerified}
            onVerify={(verified, token) => {
              setIsCaptchaVerified(verified);
              if (token) setCaptchaToken(token);
            }}
          />

          {/* Error banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-stonks-red/10 border border-stonks-red/30 flex items-center gap-3 text-xs font-semibold text-stonks-red">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green hover:shadow-[0_0_40px_rgba(0,255,163,0.7)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>VERIFYING & RECORDING ENTRY...</span>
              </>
            ) : (
              <>
                <span>SUBMIT ENTRY</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function QuestsPage() {
  return (
    <PublicLayout>
      <Suspense
        fallback={
          <div className="p-12 text-center text-muted font-mono text-xs">
            <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading Quest Terminal...
          </div>
        }
      >
        <QuestsContent />
      </Suspense>
    </PublicLayout>
  );
}
