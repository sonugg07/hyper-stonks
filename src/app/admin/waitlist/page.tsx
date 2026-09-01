"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { GlowBadge } from "@/components/GlowBadge";
import { shortenAddress, formatNumber } from "@/lib/utils";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function AdminWaitlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Points edit modal
  const [editPointsItem, setEditPointsItem] = useState<any | null>(null);
  const [customPoints, setCustomPoints] = useState<number>(0);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/waitlist?page=${page}&limit=12&status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.items);
        setTotalPages(json.data.totalPages || 1);
        setTotalCount(json.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load waitlist entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWaitlist();
  };

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED", points?: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === "REJECTED" ? "Rejected by administrator review." : undefined,
          points: points !== undefined ? points : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setToastMessage(`Submission ${newStatus.toLowerCase()} successfully!`);
        setTimeout(() => setToastMessage(null), 3000);
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null);
        }
        if (editPointsItem && editPointsItem.id === id) {
          setEditPointsItem(null);
        }
        fetchWaitlist();
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this waitlist submission?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setToastMessage("Submission deleted successfully.");
        setTimeout(() => setToastMessage(null), 3000);
        setSelectedItem(null);
        fetchWaitlist();
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader title="Waitlist Submissions" subtitle="Review, approve, and manage user waitlist applications." />

      <div className="p-6 sm:p-8 space-y-6 flex-1">
        {/* Toast alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 text-xs font-bold text-stonks-green flex items-center gap-2 shadow-neon-green">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filters & Search Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-xl border border-surface-border overflow-x-auto">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-stonks-green text-black shadow-sm"
                    : "text-muted hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Bar & Refresh */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Search wallet, handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white outline-none"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <button
              onClick={fetchWaitlist}
              disabled={loading}
              className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-muted hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-stonks-green" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#0B130E] border border-surface-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070D0A] border-b border-surface-border text-[11px] uppercase font-bold text-muted">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">User Handle</th>
                  <th className="py-3.5 px-4">EVM Wallet</th>
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Points</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 text-muted-foreground">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading waitlist records...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      No waitlist submissions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{item.index}</td>
                      <td className="py-3.5 px-4 text-stonks-cyan font-bold">{item.userHandle}</td>
                      <td className="py-3.5 px-4 text-white font-mono">{shortenAddress(item.walletAddress, 4)}</td>
                      <td className="py-3.5 px-4 text-white max-w-xs truncate">{item.taskTitle}</td>
                      <td className="py-3.5 px-4 text-stonks-green font-bold">+{formatNumber(item.points)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "APPROVED"
                              ? "bg-stonks-green/15 text-stonks-green border border-stonks-green/30"
                              : item.status === "REJECTED"
                              ? "bg-stonks-red/15 text-stonks-red border border-stonks-red/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-muted">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border text-muted hover:text-white transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {item.status !== "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg bg-stonks-green/15 text-stonks-green hover:bg-stonks-green/25 border border-stonks-green/30 transition-colors"
                              title="Approve Entry"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {item.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg bg-stonks-red/15 text-stonks-red hover:bg-stonks-red/25 border border-stonks-red/30 transition-colors"
                              title="Reject Entry"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditPointsItem(item);
                              setCustomPoints(item.points);
                            }}
                            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border text-stonks-cyan transition-colors"
                            title="Change Points"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(item.id)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-stonks-red/20 text-muted hover:text-stonks-red transition-colors"
                            title="Delete Submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-muted font-mono">
            <span>Total records: <strong className="text-white">{totalCount}</strong></span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B130E] border border-stonks-green/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-stonks-green" />
                <span>Waitlist Submission Details</span>
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-muted hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#070D0A] border border-surface-border flex justify-between">
                <span className="text-muted">Submission ID</span>
                <span className="text-stonks-green font-bold">{selectedItem.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070D0A] border border-surface-border flex justify-between">
                <span className="text-muted">User X Handle</span>
                <span className="text-stonks-cyan font-bold">{selectedItem.userHandle}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070D0A] border border-surface-border flex justify-between">
                <span className="text-muted">Wallet Address</span>
                <span className="text-white font-mono break-all">{selectedItem.walletAddress}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070D0A] border border-surface-border flex justify-between">
                <span className="text-muted">Task Title</span>
                <span className="text-white font-bold">{selectedItem.taskTitle}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070D0A] border border-surface-border flex justify-between">
                <span className="text-muted">Submitted Value / Proof</span>
                <span className="text-white font-mono break-all">{selectedItem.submittedValue}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070D0A] border border-surface-border flex justify-between">
                <span className="text-muted">Status</span>
                <span className="text-white font-bold">{selectedItem.status}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2 justify-end">
              {selectedItem.status !== "APPROVED" && (
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, "APPROVED")}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-stonks-green text-black font-bold text-xs rounded-xl"
                >
                  Approve (+{selectedItem.points} PTS)
                </button>
              )}
              {selectedItem.status !== "REJECTED" && (
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, "REJECTED")}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-stonks-red/20 text-stonks-red border border-stonks-red/30 font-bold text-xs rounded-xl"
                >
                  Reject Entry
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT POINTS MODAL */}
      {editPointsItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B130E] border border-stonks-cyan/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Adjust Task Points</h3>
            <p className="text-xs text-muted">
              Enter points to assign to submission for <strong>{editPointsItem.taskTitle}</strong>:
            </p>
            <input
              type="number"
              value={customPoints}
              onChange={(e) => setCustomPoints(Number(e.target.value))}
              className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-cyan rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditPointsItem(null)}
                className="px-4 py-2 rounded-xl bg-surface-subtle text-muted text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(editPointsItem.id, "APPROVED", customPoints)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-stonks-cyan text-black font-bold text-xs"
              >
                Save Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
