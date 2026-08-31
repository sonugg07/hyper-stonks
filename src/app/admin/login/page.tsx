"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Invalid administrator credentials.");
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("Network error authenticating admin session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B09] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-stonks-green/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#0B130E] border border-stonks-green/30 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stonks-green/15 text-stonks-green text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURE CONTROL PORTAL</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Admin Authentication</h2>
          <p className="text-xs text-muted">
            Enter administrative credentials to manage quests, mint, staking, and user permissions.
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs text-muted flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stonks-green" />
            <span>Demo: <strong className="text-white font-mono">admin</strong> / <strong className="text-stonks-green font-mono">admin123</strong></span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername("admin");
              setPassword("admin123");
            }}
            className="text-[10px] text-stonks-green hover:underline font-bold"
          >
            Autofill
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted uppercase">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-white outline-none"
              />
              <Lock className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-stonks-red/10 border border-stonks-red/30 text-xs text-stonks-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
