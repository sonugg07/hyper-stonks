"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { Activity, RefreshCw, Filter, Clock, Shield, Sparkles, UserPlus, CheckCircle2, XCircle, Coins, Lock, Award } from "lucide-react";

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activity?limit=50&action=${filter}`);
      const json = await res.json();
      if (json.success && json.data) {
        setActivities(json.data);
      }
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "WAITLIST_SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stonks-green/15 text-stonks-green border border-stonks-green/30">WAITLIST ENTRY</span>;
      case "SUBMISSION_APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stonks-cyan/15 text-stonks-cyan border border-stonks-cyan/30">APPROVED</span>;
      case "SUBMISSION_REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stonks-red/15 text-stonks-red border border-stonks-red/30">REJECTED</span>;
      case "MINT_ENABLED":
      case "MINT_DISABLED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">MINT CONTROL</span>;
      case "STAKING_ENABLED":
      case "STAKING_DISABLED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">STAKING CONTROL</span>;
      case "REFERRAL_BONUS_AWARDED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">REFERRAL BONUS</span>;
      case "TASK_CREATED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">TASK SETUP</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-subtle text-muted border border-surface-border">{action}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader title="Platform Activity Log" subtitle="Real-time audit trail of waitlist submissions, admin actions, and token events." />

      <div className="p-6 sm:p-8 space-y-6 flex-1">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-xl border border-surface-border overflow-x-auto">
            {["ALL", "WAITLIST_SUBMITTED", "SUBMISSION_APPROVED", "MINT_ENABLED", "STAKING_ENABLED", "REFERRAL_BONUS_AWARDED"].map((act) => (
              <button
                key={act}
                onClick={() => setFilter(act)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors whitespace-nowrap ${
                  filter === act ? "bg-stonks-green text-black" : "text-muted hover:text-white"
                }`}
              >
                {act.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <button
            onClick={fetchActivities}
            disabled={loading}
            className="self-end sm:self-center px-4 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs font-mono font-bold text-white hover:border-stonks-green/40 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-stonks-green" : ""}`} />
            <span>Refresh Log</span>
          </button>
        </div>

        {/* Activity Table */}
        <div className="bg-[#0B130E] border border-surface-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070D0A] border-b border-surface-border text-[11px] uppercase font-bold text-muted">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-right">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 text-muted-foreground">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted">
                      <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading live activity stream...
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted">
                      No activity logs found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  activities.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}{" "}
                        <span className="text-[10px] text-muted/60">
                          ({new Date(item.createdAt).toLocaleDateString()})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getActionBadge(item.action)}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{item.actor}</td>
                      <td className="py-3.5 px-4 text-white/90">{item.details}</td>
                      <td className="py-3.5 px-4 text-right text-muted/60">{item.ipAddress || "127.0.0.1"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
