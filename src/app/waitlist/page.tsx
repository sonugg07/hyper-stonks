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
  ClipboardList,
  Disc,
  Send,
  Globe,
  Check,
  Loader2,
} from "lucide-react";

interface WaitlistTask {
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

function WaitlistContent() {
  const searchParams = useSearchParams();
  const referralParam = searchParams ? searchParams.get("ref") || "" : "";

  const { address, isConnected, connectWallet } = useWeb3();

  const [tasks, setTasks] = useState<WaitlistTask[]>([]);
  const [registeredCount, setRegisteredCount] = useState<number>(14820);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Fields
  const [xHandle, setXHandle] = useState<string>("");
  const [discordHandle, setDiscordHandle] = useState<string>("");
  const [telegramHandle, setTelegramHandle] = useState<string>("");
  const [commentUrl, setCommentUrl] = useState<string>("");
  const [walletInput, setWalletInput] = useState<string>("");
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});

  const [isCaptchaVerified, setIsCaptchaVerified] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateData, setDuplicateData] = useState<any | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  // Autofill wallet address from Web3 when connected
  useEffect(() => {
    if (address && isValidEvmAddress(address)) {
      setWalletInput(address);
    }
  }, [address]);

  // Load active tasks from backend API with no-cache flag
  const fetchActiveTasks = async () => {
    try {
      const res = await fetch(`/api/quests?t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setTasks(json.data);
        if (json.registeredCount !== undefined) setRegisteredCount(json.registeredCount);
      }
    } catch (err) {
      console.error("Failed to load waitlist tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTasks();
  }, []);

  const totalPointsAvailable = tasks.reduce((sum, t) => sum + (t.points || 0), 0) || 2050;

  const markTaskClicked = (taskId: string) => {
    setCompletedTaskIds((prev) => ({ ...prev, [taskId]: true }));
  };

  const handleCustomInputChange = (taskId: string, val: string) => {
    setCustomInputs((prev) => ({ ...prev, [taskId]: val }));
  };

  // Handle Waitlist Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDuplicateData(null);

    // 1. Validation
    if (!walletInput || !isValidEvmAddress(walletInput)) {
      setErrorMessage("Please enter a valid 42-character EVM wallet address starting with 0x.");
      return;
    }

    if (!xHandle || xHandle.trim().length < 2) {
      setErrorMessage("Please enter your X (Twitter) username for verification.");
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
          discordHandle: discordHandle.trim(),
          telegramHandle: telegramHandle.trim(),
          commentUrl: commentUrl.trim(),
          walletAddress: walletInput.trim(),
          captchaToken: captchaToken || "verified",
          referralCodeUsed: referralParam,
          customData: customInputs,
        }),
      });

      const json = await res.json();

      if (res.status === 409 || json.isDuplicate) {
        // User already on waitlist
        setDuplicateData(json.data || { walletAddress: walletInput, xHandle: `@${xHandle}` });
        setErrorMessage("You're already on the Hype Stonks waitlist.");
      } else if (!res.ok || !json.success) {
        setErrorMessage(
          json.error || "Unable to submit your waitlist entry right now. Please try again."
        );
      } else {
        setSuccessReceipt(json.data);
        setRegisteredCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("[Waitlist Submission Client Error]:", err);
      setErrorMessage("Something went wrong while submitting your entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Helper to render dynamic action controls for any task type
   */
  const renderTaskControls = (task: WaitlistTask, index: number) => {
    const isClicked = completedTaskIds[task.id];
    const taskType = (task.taskType || "").toUpperCase();

    // 1. DISCORD TASK
    if (taskType === "DISCORD") {
      const targetUrl = task.url || "https://discord.gg/hypestonks";
      return (
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markTaskClicked(task.id)}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
              isClicked
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                : "bg-indigo-500/10 border-indigo-500/30 text-white hover:text-indigo-300 hover:border-indigo-500/50"
            }`}
          >
            <Disc className="w-4 h-4 text-indigo-400" />
            <span>{isClicked ? "Joined Discord ✓" : "Join Discord Community"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="relative flex-1">
            <input
              type="text"
              value={discordHandle}
              onChange={(e) => setDiscordHandle(e.target.value)}
              placeholder="Discord Username / Tag (e.g. username#1234 or @username)"
              className="w-full bg-[#070D0A] border border-surface-border focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-muted-dark transition-colors outline-none"
            />
            {discordHandle.trim().length > 1 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-indigo-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Linked
              </span>
            )}
          </div>
        </div>
      );
    }

    // 2. TELEGRAM TASK
    if (taskType === "TELEGRAM") {
      const targetUrl = task.url || "https://t.me/hypestonks";
      return (
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markTaskClicked(task.id)}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
              isClicked
                ? "bg-stonks-cyan/20 text-stonks-cyan border-stonks-cyan/40"
                : "bg-surface-subtle border-surface-border text-white hover:text-stonks-cyan hover:border-stonks-cyan/50"
            }`}
          >
            <Send className="w-4 h-4 text-stonks-cyan" />
            <span>{isClicked ? "Joined Telegram ✓" : "Join Telegram Alpha Channel"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="relative flex-1">
            <input
              type="text"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value)}
              placeholder="Telegram Username (Optional @username)"
              className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan focus:ring-1 focus:ring-stonks-cyan rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-muted-dark transition-colors outline-none"
            />
          </div>
        </div>
      );
    }

    // 3. FOLLOW ON X
    if (taskType === "FOLLOW_X") {
      const targetUrl = task.url || "https://x.com/HypeStonks";
      return (
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markTaskClicked(task.id)}
            className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-white hover:text-stonks-green transition-all flex items-center justify-center gap-2 shrink-0 group/btn"
          >
            <Twitter className="w-4 h-4 text-stonks-green" />
            <span>Follow on X</span>
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
      );
    }

    // 4. LIKE & REPOST ON X
    if (taskType === "LIKE_X" || taskType === "REPOST_X") {
      const targetUrl = task.url || "https://x.com/HypeStonks";
      return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markTaskClicked(task.id)}
            className={`px-5 py-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isClicked
                ? "bg-stonks-green/15 text-stonks-green border-stonks-green/40"
                : "bg-surface-subtle border-surface-border text-white hover:border-stonks-green/40"
            }`}
          >
            {taskType === "LIKE_X" ? (
              <Heart className={`w-4 h-4 ${isClicked ? "fill-stonks-green text-stonks-green" : "text-stonks-red"}`} />
            ) : (
              <Repeat className="w-4 h-4 text-stonks-green" />
            )}
            <span>{isClicked ? "Completed ✓" : task.title || "Open Announcement on X"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );
    }

    // 5. COMMENT ON X
    if (taskType === "COMMENT_X") {
      const targetUrl = task.url || "https://x.com/HypeStonks";
      return (
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markTaskClicked(task.id)}
            className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-cyan/40 text-xs font-bold text-white hover:text-stonks-cyan transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-stonks-cyan" />
            <span>Open post on X</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="relative flex-1">
            <input
              type="text"
              value={commentUrl}
              onChange={(e) => setCommentUrl(e.target.value)}
              placeholder="Paste your reply link (Optional)"
              className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan focus:ring-1 focus:ring-stonks-cyan rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-muted-dark transition-colors outline-none"
            />
          </div>
        </div>
      );
    }

    // 6. WALLET CONNECT
    if (taskType === "WALLET_CONNECT") {
      return (
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
                className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-stonks-green transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Autofill from Wallet</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-stonks-green" />
            Must be 42 characters, starts with 0x (Ethereum, Hyperliquid, Arbitrum, Base, BSC compatible).
          </p>
        </div>
      );
    }

    // 7. GENERIC / VISIT_URL / CUSTOM TASK
    return (
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {task.url && (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markTaskClicked(task.id)}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
              isClicked
                ? "bg-stonks-green/20 text-stonks-green border-stonks-green/40"
                : "bg-surface-subtle border-surface-border text-white hover:text-stonks-green hover:border-stonks-green/50"
            }`}
          >
            <Globe className="w-4 h-4 text-stonks-green" />
            <span>{isClicked ? "Opened Link ✓" : "Visit Link"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <div className="relative flex-1">
          <input
            type="text"
            value={customInputs[task.id] || ""}
            onChange={(e) => handleCustomInputChange(task.id, e.target.value)}
            placeholder="Verification detail / Handle / Link (Optional)"
            className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green focus:ring-1 focus:ring-stonks-green rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-muted-dark transition-colors outline-none"
          />
        </div>
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stonks-green/10 border border-stonks-green/30 text-xs font-mono font-bold text-stonks-green uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEASON 1 WAITLIST ENTRY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            JOIN HYPE STONKS WAITLIST
          </h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Complete the verification tasks below to secure your whitelist allocation, Genesis Pass eligibility, and early community reward tier.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-muted pt-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stonks-cyan" />
              <span>Takes ~2 minutes</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-stonks-green" />
              <span>Sybil-protected anti-bot</span>
            </span>
            <span>•</span>
            <span className="text-white font-bold">
              Total Reward: <strong className="text-stonks-green font-mono">+{formatNumber(totalPointsAvailable)} PTS</strong>
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
            {/* Duplicate Notice Banner */}
            {duplicateData && (
              <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>You're already on the Hype Stonks waitlist.</span>
                </div>
                <p className="text-muted">
                  Your entry for wallet <strong className="text-white">{duplicateData.walletAddress}</strong> ({duplicateData.xHandle}) is already recorded with status: <strong className="text-stonks-green font-bold">{duplicateData.status || "APPROVED"}</strong>.
                </p>
              </div>
            )}

            {/* DYNAMIC WAITLIST TASK CARDS */}
            {loading ? (
              <div className="p-12 rounded-3xl bg-[#0B130E] border border-surface-border text-center space-y-3">
                <div className="w-7 h-7 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-muted">Loading live waitlist tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0B130E] border border-surface-border text-center space-y-3">
                <p className="text-xs font-mono text-muted">No active waitlist tasks found. Please check back later.</p>
              </div>
            ) : (
              tasks.map((task, index) => {
                const stepNum = String(index + 1).padStart(2, "0");
                return (
                  <div
                    key={task.id}
                    className="relative bg-[#0B130E]/90 backdrop-blur-xl border border-stonks-green/20 hover:border-stonks-green/40 rounded-3xl p-6 sm:p-8 transition-all shadow-glass group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-base shrink-0">
                          {stepNum}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-stonks-green transition-colors">
                              {task.title}
                            </h3>
                            {task.taskType === "DISCORD" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                Discord
                              </span>
                            )}
                            {task.taskType === "TELEGRAM" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stonks-cyan/20 text-stonks-cyan border border-stonks-cyan/40">
                                Telegram
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-0.5">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-stonks-green/10 text-stonks-green border border-stonks-green/25 shrink-0">
                          +{formatNumber(task.points)} PTS
                        </span>
                      </div>
                    </div>

                    {renderTaskControls(task, index)}
                  </div>
                );
              })
            )}

            {/* If there are tasks and no explicit WALLET_CONNECT card in the list, ensure walletInput is displayed */}
            {!tasks.some((t) => t.taskType === "WALLET_CONNECT") && (
              <div className="relative bg-[#0B130E]/90 backdrop-blur-xl border border-stonks-green/20 hover:border-stonks-green/40 rounded-3xl p-6 sm:p-8 transition-all shadow-glass group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 flex items-center justify-center text-stonks-green font-mono font-black text-base">
                      00
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Your EVM Wallet Address</h3>
                      <p className="text-xs text-muted">Enter your EVM address for whitelist verification & future rewards.</p>
                    </div>
                  </div>
                </div>

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
                          ? "border-stonks-red"
                          : "border-surface-border focus:border-stonks-green"
                      }`}
                    />
                  </div>
                  {!isConnected && (
                    <button
                      type="button"
                      onClick={() => connectWallet("injected")}
                      className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-stonks-green transition-all"
                    >
                      Autofill from Wallet
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* HUMAN CAPTCHA SECTION */}
            <CaptchaVerification
              isVerified={isCaptchaVerified}
              onVerify={(verified, token) => {
                setIsCaptchaVerified(verified);
                if (token) setCaptchaToken(token);
              }}
            />

            {/* ERROR BANNER */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-stonks-red/10 border border-stonks-red/40 text-xs font-mono text-stonks-red flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 sm:py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green hover:shadow-[0_0_40px_rgba(0,255,163,0.6)] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>RECORDING WAITLIST ENTRY...</span>
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4" />
                  <span>SUBMIT WAITLIST ENTRY (+{formatNumber(totalPointsAvailable)} PTS)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense
      fallback={
        <PublicLayout>
          <div className="max-w-3xl mx-auto py-24 text-center">
            <div className="w-8 h-8 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono text-muted">Loading waitlist verification tasks...</p>
          </div>
        </PublicLayout>
      }
    >
      <WaitlistContent />
    </Suspense>
  );
}
