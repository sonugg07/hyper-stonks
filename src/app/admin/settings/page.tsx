"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { Settings, Save, CheckCircle2, Globe, Twitter, Send, Disc, Shield, Sparkles } from "lucide-react";

export default function AdminSettingsPage() {
  const [projectName, setProjectName] = useState("Hype Stonks");
  const [tagline, setTagline] = useState("Trade the Hype. Earn Your Position.");
  const [twitterUrl, setTwitterUrl] = useState("https://x.com/HypeStonks");
  const [discordUrl, setDiscordUrl] = useState("https://discord.gg/hypestonks");
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/hypestonks");
  const [websiteUrl, setWebsiteUrl] = useState("https://hype-stonks.io");

  // System Flags
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [questsEnabled, setQuestsEnabled] = useState(true);
  const [mintEnabled, setMintEnabled] = useState(false);
  const [stakingEnabled, setStakingEnabled] = useState(false);
  const [referralsEnabled, setReferralsEnabled] = useState(true);
  const [referralRewardPoints, setReferralRewardPoints] = useState(250);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setProjectName(json.data.projectName);
        setTagline(json.data.tagline);
        setTwitterUrl(json.data.twitterUrl);
        setDiscordUrl(json.data.discordUrl);
        setTelegramUrl(json.data.telegramUrl);
        setWebsiteUrl(json.data.websiteUrl);
        setMaintenanceMode(json.data.maintenanceMode);
        setQuestsEnabled(json.data.questsEnabled);
        setMintEnabled(json.data.mintEnabled);
        setStakingEnabled(json.data.stakingEnabled);
        setReferralsEnabled(json.data.referralsEnabled);
        setReferralRewardPoints(json.data.referralRewardPoints);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          tagline,
          twitterUrl,
          discordUrl,
          telegramUrl,
          websiteUrl,
          maintenanceMode,
          questsEnabled,
          mintEnabled,
          stakingEnabled,
          referralsEnabled,
          referralRewardPoints: Number(referralRewardPoints),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Ecosystem Platform Settings"
        subtitle="Configure branding metadata, social endpoints, referral bonuses, and system maintenance flags."
        onRefresh={fetchSettings}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-5xl w-full mx-auto">
        <form onSubmit={handleSave} className="space-y-8">
          {/* SYSTEM MODULE FLAGS */}
          <div className="p-8 rounded-3xl bg-[#0B130E] border border-surface-border space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div>
                <h3 className="text-lg font-bold text-white">Global Protocol Module Toggles</h3>
                <p className="text-xs text-muted mt-0.5">Enable or disable specific features across the entire site.</p>
              </div>
              {saveSuccess && (
                <span className="text-xs text-stonks-green font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Settings Synced!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quests */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Quest Engine</div>
                  <div className="text-[10px] text-muted">Public task submission</div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuestsEnabled(!questsEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                    questsEnabled ? "bg-stonks-green text-black" : "bg-surface-border text-muted"
                  }`}
                >
                  {questsEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Referrals */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Referral System</div>
                  <div className="text-[10px] text-muted">Bonus point attribution</div>
                </div>
                <button
                  type="button"
                  onClick={() => setReferralsEnabled(!referralsEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                    referralsEnabled ? "bg-stonks-green text-black" : "bg-surface-border text-muted"
                  }`}
                >
                  {referralsEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Maintenance */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Maintenance Mode</div>
                  <div className="text-[10px] text-muted">Restrict access</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                    maintenanceMode ? "bg-stonks-red text-white" : "bg-surface-border text-muted"
                  }`}
                >
                  {maintenanceMode ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>

          {/* BRANDING & SOCIAL LINKS */}
          <div className="p-8 rounded-3xl bg-[#0B130E] border border-surface-border space-y-6">
            <h3 className="text-lg font-bold text-white pb-4 border-b border-surface-border">
              Branding & Official Social Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-muted font-bold uppercase">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted font-bold uppercase">Tagline / Headline</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted font-bold uppercase flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-stonks-green" />
                  <span>Official X (Twitter) URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted font-bold uppercase flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-stonks-cyan" />
                  <span>Telegram Community URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted font-bold uppercase flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discord Server URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted font-bold uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-white" />
                  <span>Website Canonical URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted font-bold uppercase">Referral Bonus (PTS per Invite)</label>
                <input
                  type="number"
                  required
                  value={referralRewardPoints}
                  onChange={(e) => setReferralRewardPoints(Number(e.target.value))}
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-3 text-white font-bold text-stonks-green outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
