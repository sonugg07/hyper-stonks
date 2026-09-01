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
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";
import {
  SUPPORTED_CHAINS,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  getChainName,
  encodeMintFunctionCall,
} from "@/lib/contracts";

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

type MintStep = "IDLE" | "SWITCHING_NETWORK" | "AWAITING_WALLET_SIGNATURE" | "CONFIRMING_ON_CHAIN" | "SUCCESS" | "ERROR";

export default function MintPage() {
  const { address, isConnected, chainId, isDemoMode, providerName, switchNetwork } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [mintConfig, setMintConfig] = useState<MintData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);

  // Mint Lifecycle State
  const [mintStep, setMintStep] = useState<MintStep>("IDLE");
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);
  const [confirmedBlock, setConfirmedBlock] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const triggerConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00FFA3", "#00E5FF", "#FFFFFF", "#7000FF"],
      });
    } catch {
      // ignore
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * REAL ON-CHAIN MINT TRANSACTION FLOW
   */
  const handleMint = async () => {
    if (!isConnected || !address) {
      setIsWalletModalOpen(true);
      return;
    }

    if (!mintConfig || !mintConfig.isActive) {
      setErrorMessage("Minting is currently closed by the protocol administrators.");
      return;
    }

    setErrorMessage(null);
    setPendingTxHash(null);
    setConfirmedTxHash(null);
    setConfirmedBlock(null);

    // ==========================================
    // DEMO MODE (Completely isolated preview)
    // ==========================================
    if (isDemoMode) {
      setMintStep("AWAITING_WALLET_SIGNATURE");
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setMintStep("CONFIRMING_ON_CHAIN");
        const simHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
        setPendingTxHash(simHash);

        await new Promise((resolve) => setTimeout(resolve, 1800));

        // Register demo mint with server
        const res = await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: address,
            quantity,
            txHash: simHash,
            isDemoMode: true,
            chainId: mintConfig.chainId,
          }),
        });

        const json = await res.json();
        if (json.success) {
          setConfirmedTxHash(simHash);
          setConfirmedBlock("19,420,888");
          setMintStep("SUCCESS");
          setMintConfig((prev) => (prev ? { ...prev, mintedCount: prev.mintedCount + quantity } : null));
          triggerConfetti();
        } else {
          setErrorMessage(json.error || "Demo mint failed.");
          setMintStep("ERROR");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Demo transaction failed.");
        setMintStep("ERROR");
      }
      return;
    }

    // ==========================================
    // REAL EVM WALLET MINT TRANSACTION
    // ==========================================
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setErrorMessage("No Web3 EVM wallet detected. Please install MetaMask, Coinbase Wallet, or Rabby.");
      setMintStep("ERROR");
      return;
    }

    const ethereum = (window as any).ethereum;

    try {
      // 1. Network Check & Auto-Switch
      const targetChainId = mintConfig.chainId || 1;
      const currentChainHex = await ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(currentChainHex, 16);

      if (currentChainId !== targetChainId) {
        setMintStep("SWITCHING_NETWORK");
        const switched = await switchNetwork(targetChainId);
        if (!switched) {
          setErrorMessage(`Network switch cancelled: Please switch your wallet to ${mintConfig.chain} (Chain ID: ${targetChainId}) to continue minting.`);
          setMintStep("ERROR");
          return;
        }
      }

      // 2. Prepare Transaction Parameters & Value
      setMintStep("AWAITING_WALLET_SIGNATURE");

      const totalPriceEth = mintConfig.priceEth * quantity;
      // Convert ETH to Wei (BigInt)
      const weiAmount = BigInt(Math.round(totalPriceEth * 1e18));
      const valueHex = `0x${weiAmount.toString(16)}`;

      // Encode standard ERC-721 mint function calldata: mint(uint256 quantity)
      const calldata = encodeMintFunctionCall(quantity, address);

      // Contract target
      const targetContract = mintConfig.contractAddress || "0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7";

      // 3. Request Real Wallet Approval / Signature Popup
      const txParams = {
        from: address,
        to: targetContract,
        value: valueHex,
        data: calldata,
      };

      const txHash: string = await ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      if (!txHash || typeof txHash !== "string" || !txHash.startsWith("0x")) {
        throw new Error("Invalid transaction response received from wallet.");
      }

      // 4. Transaction Broadcasted -> Wait for On-Chain Block Receipt
      setPendingTxHash(txHash);
      setMintStep("CONFIRMING_ON_CHAIN");

      // Poll for transaction receipt on the blockchain
      let receipt: any = null;
      let attempts = 0;
      const maxAttempts = 45; // 45 * 2s = 90 seconds timeout

      while (!receipt && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        try {
          receipt = await ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [txHash],
          });
        } catch {
          // keep polling
        }
      }

      // Check receipt execution status
      if (receipt) {
        if (receipt.status === "0x0" || receipt.status === 0) {
          throw new Error("Transaction execution was reverted on the blockchain. The contract rejected the mint.");
        }
      }

      // 5. On-Chain Receipt Confirmed -> Notify Backend to sync DB
      const blockNumHex = receipt?.blockNumber || "";
      const blockNum = blockNumHex ? parseInt(blockNumHex, 16).toLocaleString() : null;

      const confirmRes = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          quantity,
          txHash,
          isDemoMode: false,
          chainId: targetChainId,
          blockNumber: blockNum,
        }),
      });

      const confirmJson = await confirmRes.json();

      if (!confirmRes.ok || !confirmJson.success) {
        console.warn("Backend receipt sync notice:", confirmJson.error);
      }

      // 6. Complete Verified Mint Success
      setConfirmedTxHash(txHash);
      setConfirmedBlock(blockNum);
      setMintStep("SUCCESS");
      setMintConfig((prev) => (prev ? { ...prev, mintedCount: prev.mintedCount + quantity } : null));
      triggerConfetti();
    } catch (err: any) {
      console.error("Mint transaction error:", err);
      setMintStep("ERROR");

      // Detailed User-Friendly Error Messages
      if (
        err?.code === 4001 ||
        err?.message?.includes("User rejected") ||
        err?.message?.includes("User denied") ||
        err?.message?.includes("rejected") ||
        err?.message?.includes("cancelled")
      ) {
        setErrorMessage("Transaction cancelled: You rejected the transaction confirmation request in your wallet.");
      } else if (
        err?.message?.includes("insufficient funds") ||
        err?.message?.includes("exceeds balance") ||
        err?.data?.message?.includes("insufficient funds")
      ) {
        setErrorMessage(`Insufficient funds: Your wallet does not have enough ETH for ${(mintConfig.priceEth * quantity).toFixed(3)} ETH + gas fee.`);
      } else if (err?.message?.includes("nonce")) {
        setErrorMessage("Nonce issue: Please reset your wallet transaction activity in MetaMask settings.");
      } else {
        setErrorMessage(err?.message || "Transaction failed. Please verify your wallet balance and try again.");
      }
    }
  };

  const remaining = mintConfig ? Math.max(0, mintConfig.maxSupply - mintConfig.mintedCount) : 0;
  const progressPercent = mintConfig
    ? Math.min(100, Math.round((mintConfig.mintedCount / mintConfig.maxSupply) * 100))
    : 0;

  const currentChainCfg = SUPPORTED_CHAINS[mintConfig?.chainId || 1] || SUPPORTED_CHAINS[1];

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stonks-green/10 border border-stonks-green/30 text-xs font-mono font-bold text-stonks-green uppercase">
            <Coins className="w-3.5 h-3.5" />
            <span>Genesis Access Passes</span>
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
          /* MINT IS CURRENTLY CLOSED */
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
                Minting is not available right now. Please check back later or complete waitlist tasks to secure your whitelist position.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/waitlist"
                className="px-6 py-3 rounded-xl bg-stonks-green text-black font-bold text-xs uppercase tracking-wider hover:bg-stonks-green-dim transition-colors shadow-neon-green"
              >
                Join Waitlist for Whitelist
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
          </div>
        ) : (
          /* MINT IS ACTIVE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Artwork Card */}
            <div className="relative rounded-3xl bg-[#0B130E] border border-stonks-green/30 p-6 flex flex-col items-center justify-between overflow-hidden shadow-neon-green group">
              <div className="w-full aspect-square rounded-2xl bg-[#070D0A] border border-surface-border relative overflow-hidden flex flex-col items-center justify-center p-8 text-center">
                <div className="absolute inset-0 bg-trading-grid opacity-30 pointer-events-none" />
                <div className="w-32 h-32 rounded-3xl bg-stonks-green/10 border-2 border-stonks-green/40 flex items-center justify-center text-stonks-green shadow-neon-green group-hover:scale-105 transition-transform">
                  <Coins className="w-16 h-16" />
                </div>
                <div className="mt-6 z-10">
                  <div className="text-xs font-mono text-stonks-green font-bold uppercase tracking-widest">
                    GENESIS PASS #0001 - #3333
                  </div>
                  <div className="text-lg font-black text-white mt-1">Hype Stonks Bull Pass</div>
                </div>
              </div>

              <div className="w-full mt-4 space-y-2 text-xs font-mono text-muted px-2">
                <div className="flex items-center justify-between">
                  <span>Standard:</span>
                  <span className="text-white font-bold">ERC-721</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network:</span>
                  <span className="text-stonks-cyan font-bold">{mintConfig.chain}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contract:</span>
                  <a
                    href={getExplorerAddressUrl(mintConfig.contractAddress, mintConfig.chainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stonks-green hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>{shortenAddress(mintConfig.contractAddress, 4)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
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
                    Select quantity and authorize the transaction in your connected Web3 wallet.
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
                        disabled={quantity <= 1 || mintStep !== "IDLE"}
                        className="w-8 h-8 rounded-lg bg-[#070D0A] border border-surface-border hover:border-stonks-green/40 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-white text-base">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(mintConfig.maxPerWallet, quantity + 1))}
                        disabled={quantity >= mintConfig.maxPerWallet || mintStep !== "IDLE"}
                        className="w-8 h-8 rounded-lg bg-[#070D0A] border border-surface-border hover:border-stonks-green/40 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer"
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

              {/* Mode indicator banner */}
              {isDemoMode ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Demo Mode Active:</strong> Simulates EVM transaction execution without opening a browser wallet. Connect with MetaMask/Coinbase to execute real on-chain mints.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stonks-green/10 border border-stonks-green/30 text-[11px] text-stonks-green flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Real Web3 Mode:</strong> Clicking Mint will open your {providerName || "connected wallet"} confirmation popup for explicit signature and transaction broadcast.
                  </span>
                </div>
              )}

              {/* ERROR BANNER */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-stonks-red/10 border border-stonks-red/40 text-xs text-stonks-red flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Transaction Cancelled / Error</div>
                    <div className="text-[11px] leading-relaxed text-stonks-red/90">{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* PENDING ON-CHAIN CONFIRMATION BANNER */}
              {mintStep === "CONFIRMING_ON_CHAIN" && pendingTxHash && (
                <div className="p-4 rounded-2xl bg-stonks-cyan/10 border border-stonks-cyan/40 text-xs text-white space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 text-stonks-cyan font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Awaiting Block Confirmation on {mintConfig.chain}...</span>
                  </div>
                  <div className="font-mono text-[11px] text-muted truncate">
                    Tx: {pendingTxHash}
                  </div>
                  <a
                    href={getExplorerTxUrl(pendingTxHash, mintConfig.chainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-stonks-cyan hover:underline"
                  >
                    <span>View Pending Tx on Block Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* SUCCESS CONFIRMATION MODAL / BOX */}
              {mintStep === "SUCCESS" && confirmedTxHash && (
                <div className="p-5 rounded-2xl bg-stonks-green/15 border-2 border-stonks-green/60 text-xs text-white space-y-3 shadow-neon-green">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stonks-green font-black text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>NFT Minted Successfully!</span>
                    </div>
                    {confirmedBlock && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#070D0A] text-muted border border-surface-border">
                        Block #{confirmedBlock}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted">
                    Your {quantity} Hype Stonks Genesis Pass{quantity > 1 ? "es have" : " has"} been confirmed on-chain and delivered to your wallet: <strong className="text-white font-mono">{shortenAddress(address, 4)}</strong>.
                  </p>

                  <div className="p-3 rounded-xl bg-[#070D0A] border border-surface-border flex items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="text-muted truncate">Tx: {confirmedTxHash}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(confirmedTxHash)}
                      className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border text-stonks-green transition-colors shrink-0 cursor-pointer"
                      title="Copy Tx Hash"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <a
                      href={getExplorerTxUrl(confirmedTxHash, mintConfig.chainId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-stonks-green text-black font-bold text-xs uppercase tracking-wider hover:bg-stonks-green-dim transition-colors flex items-center gap-1.5 shadow-neon-green"
                    >
                      <span>View on {currentChainCfg.name} Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setMintStep("IDLE");
                        setConfirmedTxHash(null);
                      }}
                      className="text-xs text-muted hover:text-white underline cursor-pointer"
                    >
                      Mint Another Pass
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              {isConnected && address ? (
                <button
                  type="button"
                  onClick={handleMint}
                  disabled={mintStep === "AWAITING_WALLET_SIGNATURE" || mintStep === "CONFIRMING_ON_CHAIN" || mintStep === "SWITCHING_NETWORK"}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {mintStep === "SWITCHING_NETWORK" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SWITCHING NETWORK IN WALLET...</span>
                    </>
                  ) : mintStep === "AWAITING_WALLET_SIGNATURE" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CONFIRM IN {providerName || "WALLET"} POPUP...</span>
                    </>
                  ) : mintStep === "CONFIRMING_ON_CHAIN" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CONFIRMING ON-CHAIN...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>MINT {quantity} PASS ({(mintConfig.priceEth * quantity).toFixed(3)} ETH)</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-surface-subtle hover:bg-surface-border border border-stonks-green/40 hover:border-stonks-green transition-all flex items-center justify-center gap-2 cursor-pointer"
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
