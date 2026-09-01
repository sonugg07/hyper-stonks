"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { adminFetch } from "@/lib/adminApi";
import { Lock, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Save } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AdminStakingPage() {
  const [isActive, setIsActive] = useState(false);
  const [apyPercent, setApyPercent] = useState(42.5);
  const [minStake, setMinStake] = useState(0.1);
  const [maxStake, setMaxStake] = useState(50.0);
  const [lockDurationDays, setLockDurationDays] = useState(30);
  const [rewardTokenSymbol, setRewardTokenSymbol] = useState("$STONKS");
  const [contractAddress, setContractAddress] = useState("0x99A87C6F67e0eD40360a0a86B91054E83b4Bf2F1");
  const [chain, setChain] = useState("Ethereum Mainnet");
  const [totalStaked, setTotalStaked] = useState(842.6);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStakingSettings = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/staking");
      const json = await res.json();
      if (json.success && json.data) {
        setIsActive(json.data.isActive);
        setApyPercent(json.data.apyPercent);
        setMinStake(json.data.minStake);
        setMaxStake(json.data.maxStake);
        setLockDurationDays(json.data.lockDurationDays);
        setRewardTokenSymbol(json.data.rewardTokenSymbol);
        setContractAddress(json.data.contractAddress);
        setChain(json.data.chain);
        setTotalStaked(json.data.totalStaked);
      }
    } catch (err) {
      console.error("Failed to load staking settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakingSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent, overrideActive?: boolean) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const activeToSave = overrideActive !== undefined ? overrideActive : isActive;

    try {
      const res = await adminFetch("/api/admin/staking", {
        method: "PUT",
        body: JSON.stringify({
          isActive: activeToSave,
          apyPercent: Number(apyPercent),
          minStake: Number(minStake),
          maxStake: Number(maxStake),
          lockDurationDays: Number(lockDurationDays),
          rewardTokenSymbol,
          contractAddress,
          chain,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update staking settings:", err);
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
        title="Yield Vault & Staking Control"
        subtitle="Manage staking module status, APY percentage yields, and reward pool parameters."
        onRefresh={fetchStakingSettings}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-5xl w-full mx-auto">
        {/* MASTER ON / OFF TOGGLE HERO CARD */}
        <div className="relative p-8 rounded-3xl bg-[#0B130E] border border-stonks-cyan/30 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-stonks-cyan">
                <Lock className="w-4 h-4" />
                <span>Master Module Switch</span>
              </div>
              <h2 className="text-2xl font-black text-white">Staking Vault Status</h2>
              <p className="text-xs text-muted max-w-md">
                When turned OFF, the public /staking page immediately renders the closed state and disables new deposits.
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
                    ? "bg-stonks-cyan text-black shadow-neon-cyan"
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
              <strong className={isActive ? "text-stonks-cyan" : "text-stonks-red"}>
                {isActive ? "● STAKING ACTIVE ON PUBLIC SITE" : "○ STAKING DISABLED (CLOSED)"}
              </strong>
            </span>
            <a
              href="/staking"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stonks-cyan hover:underline flex items-center gap-1"
            >
              <span>View Public /staking Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* SETTINGS FORM */}
        <form onSubmit={handleSave} className="p-8 rounded-3xl bg-[#0B130E] border border-surface-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <h3 className="text-lg font-bold text-white">Staking Parameters & Yield Settings</h3>
            {saveSuccess && (
              <span className="text-xs text-stonks-cyan font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings Saved & Synced!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Estimated APY (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={apyPercent}
                onChange={(e) => setApyPercent(Number(e.target.value))}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-3 text-white font-bold text-stonks-cyan outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Reward Token Symbol</label>
              <input
                type="text"
                required
                value={rewardTokenSymbol}
                onChange={(e) => setRewardTokenSymbol(e.target.value)}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Min Stake Limit</label>
              <input
                type="number"
                step="0.01"
                required
                value={minStake}
                onChange={(e) => setMinStake(Number(e.target.value))}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Max Stake Limit</label>
              <input
                type="number"
                step="0.1"
                required
                value={maxStake}
                onChange={(e) => setMaxStake(Number(e.target.value))}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Lock Duration (Days)</label>
              <input
                type="number"
                required
                value={lockDurationDays}
                onChange={(e) => setLockDurationDays(Number(e.target.value))}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted font-bold uppercase">Network Chain</label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-3 text-white outline-none"
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
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-cyan hover:bg-stonks-cyan/90 transition-all shadow-neon-cyan flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
