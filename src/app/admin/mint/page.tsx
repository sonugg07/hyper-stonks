"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { adminFetch } from "@/lib/adminApi";
import { Coins, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Save } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AdminMintPage() {
  const [isActive, setIsActive] = useState(false);
  const [priceEth, setPriceEth] = useState(0.08);
  const [maxSupply, setMaxSupply] = useState(3333);
  const [mintedCount, setMintedCount] = useState(1420);
  const [maxPerWallet, setMaxPerWallet] = useState(3);
  const [contractAddress, setContractAddress] = useState("0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7");
  const [chain, setChain] = useState("Ethereum Mainnet");
  const [chainId, setChainId] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchMintSettings = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/mint");
      const json = await res.json();
      if (json.success && json.data) {
        setIsActive(json.data.isActive);
        setPriceEth(json.data.priceEth);
        setMaxSupply(json.data.maxSupply);
        setMintedCount(json.data.mintedCount);
        setMaxPerWallet(json.data.maxPerWallet);
        setContractAddress(json.data.contractAddress);
        setChain(json.data.chain);
        setChainId(json.data.chainId);
      }
    } catch (err) {
      console.error("Failed to load mint settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMintSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent, overrideActive?: boolean) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const activeToSave = overrideActive !== undefined ? overrideActive : isActive;

    try {
      const res = await adminFetch("/api/admin/mint", {
        method: "PUT",
        body: JSON.stringify({
          isActive: activeToSave,
          priceEth: Number(priceEth),
          maxSupply: Number(maxSupply),
          maxPerWallet: Number(maxPerWallet),
          contractAddress,
          chain,
          chainId: Number(chainId),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update mint settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (newVal: boolean) => {
    setIsActive(newVal);
    handleSave(undefined, newVal);
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="NFT Mint Engine Control"
        subtitle="Manage public mint status, supply limits, pricing, and smart contract bindings."
        onRefresh={fetchMintSettings}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-5xl w-full mx-auto">
        {/* MASTER ON / OFF TOGGLE HERO CARD */}
        <div className="relative p-8 rounded-3xl bg-[#0B130E] border border-stonks-green/30 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-stonks-green">
                <Coins className="w-4 h-4" />
                <span>Master Module Switch</span>
              </div>
              <h2 className="text-2xl font-black text-white">Public Mint Status</h2>
              <p className="text-xs text-muted max-w-md">
                When turned OFF, the public /mint page immediately renders the closed state and disables all transactions.
              </p>
            </div>

            {/* LARGE INTERACTIVE TOGGLE */}
            <div className="flex items-center gap-4 bg-[#070D0A] p-2 rounded-2xl border border-surface-border self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleToggle(false)}
                className={`px-6 py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  !isActive
                    ? "bg-stonks-red text-white shadow-neon-red"
                    : "text-muted hover:text-white"
                }`}
              >
                OFF
              </button>
              <button
                type="button"
                onClick={() => handleToggle(true)}
                className={`px-6 py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-stonks-green text-black shadow-neon-green"
                    : "text-muted hover:text-white"
                }`}
              >
                ON
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs font-mono">
            <span className="text-muted">
              Live Status:{" "}
              <strong className={isActive ? "text-stonks-green" : "text-stonks-red"}>
                {isActive ? "● MINT ACTIVE ON PUBLIC SITE" : "○ MINT DISABLED (CLOSED)"}
              </strong>
            </span>
            <a
              href="/mint"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stonks-cyan hover:underline flex items-center gap-1"
            >
              <span>View Public /mint Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* SETTINGS FORM */}
        <form onSubmit={handleSave} className="p-8 rounded-3xl bg-[#0B130E] border border-surface-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <h3 className="text-lg font-bold text-white">Mint Parameters & Contract Bindings</h3>
            {saveSuccess && (
              <span className="text-xs text-stonks-green font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings Saved & Synced!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Mint Price (ETH)</label>
              <input
                type="number"
                step="0.001"
                required
                value={priceEth}
                onChange={(e) => setPriceEth(Number(e.target.value))}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white font-bold text-stonks-green outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Max Supply</label>
              <input
                type="number"
                required
                value={maxSupply}
                onChange={(e) => setMaxSupply(Number(e.target.value))}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Max Per Wallet</label>
              <input
                type="number"
                required
                value={maxPerWallet}
                onChange={(e) => setMaxPerWallet(Number(e.target.value))}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Network Chain</label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="Ethereum Mainnet">Ethereum Mainnet (Chain ID: 1)</option>
                <option value="Arbitrum One">Arbitrum One (Chain ID: 42161)</option>
                <option value="Base Mainnet">Base Mainnet (Chain ID: 8453)</option>
                <option value="Sepolia Testnet">Sepolia Testnet (Chain ID: 11155111)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-muted font-bold uppercase">Smart Contract Address</label>
              <input
                type="text"
                required
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
