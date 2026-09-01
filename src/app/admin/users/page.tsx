"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { adminFetch } from "@/lib/adminApi";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Ban,
  CheckCircle2,
  X,
  Clock,
  Shield,
  FileCheck2,
  Share2,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";

interface AdminUserRow {
  id: string;
  xHandle: string;
  walletAddress: string;
  totalPoints: number;
  questsCompleted: number;
  referralsCount: number;
  isBanned: boolean;
  role: string;
  joinedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Edit Points / User Modal
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);
  const [pointsReason, setPointsReason] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async (searchQuery = search, filterType = filter, pageNum = page) => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      if (filterType !== "ALL") url.searchParams.set("filter", filterType);
      url.searchParams.set("page", pageNum.toString());
      url.searchParams.set("limit", "12");

      const res = await adminFetch(url.toString());
      const json = await res.json();

      if (json.success && json.data) {
        setUsers(json.data.users);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to load admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search, filter, page);
  }, [page, filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, filter, 1);
  };

  const handleOpenEdit = (user: AdminUserRow) => {
    setSelectedUser(user);
    setEditPoints(user.totalPoints);
    setPointsReason("Manual points adjustment by admin");
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSaving(true);

    try {
      const res = await adminFetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          totalPoints: Number(editPoints),
          pointsAdjustmentReason: pointsReason,
        }),
      });

      if (res.ok) {
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBan = async (user: AdminUserRow) => {
    const action = user.isBanned ? "Unban" : "Ban";
    if (!confirm(`Are you sure you want to ${action} ${user.xHandle || user.walletAddress}?`)) return;

    try {
      const res = await adminFetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ isBanned: !user.isBanned }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === user.id ? { ...u, isBanned: !u.isBanned } : u))
        );
      }
    } catch (err) {
      console.error("Failed to toggle ban:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="User & Points Directory"
        subtitle="Manage community member accounts, inspect submission records, edit points, and moderate access."
        onRefresh={() => fetchUsers(search, filter, page)}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by X handle, 0x wallet, or referral code..."
              className="w-full bg-[#0B130E] border border-surface-border focus:border-stonks-green rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-muted-dark outline-none"
            />
          </form>

          {/* Filter pills */}
          <div className="flex items-center gap-2">
            {["ALL", "ACTIVE", "BANNED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setFilter(tab);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  filter === tab
                    ? "bg-stonks-green text-black"
                    : "bg-[#0B130E] border border-surface-border text-muted hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-3xl bg-[#0B130E] border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#070D0A] border-b border-surface-border text-muted uppercase text-[10px]">
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Wallet Address</th>
                  <th className="py-4 px-4">Points</th>
                  <th className="py-4 px-4 text-center">Quests</th>
                  <th className="py-4 px-4 text-center">Referrals</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      No user accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {u.xHandle}
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {shortenAddress(u.walletAddress, 6)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stonks-green">
                        {formatNumber(u.totalPoints)} PTS
                      </td>
                      <td className="py-3.5 px-4 text-center text-white font-semibold">
                        {u.questsCompleted}
                      </td>
                      <td className="py-3.5 px-4 text-center text-stonks-cyan font-semibold">
                        {u.referralsCount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isBanned
                              ? "bg-stonks-red/15 text-stonks-red border border-stonks-red/30"
                              : "bg-stonks-green/15 text-stonks-green border border-stonks-green/30"
                          }`}
                        >
                          {u.isBanned ? "BANNED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1 rounded-lg bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-muted hover:text-stonks-green transition-colors flex items-center gap-1 text-[11px]"
                            title="Edit Points"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit Points</span>
                          </button>
                          <button
                            onClick={() => handleToggleBan(u)}
                            className={`p-1.5 rounded-lg border text-[11px] transition-colors ${
                              u.isBanned
                                ? "bg-stonks-green/10 border-stonks-green/30 text-stonks-green hover:bg-stonks-green/20"
                                : "bg-stonks-red/10 border-stonks-red/30 text-stonks-red hover:bg-stonks-red/20"
                            }`}
                            title={u.isBanned ? "Unban User" : "Ban User"}
                          >
                            <Ban className="w-3.5 h-3.5" />
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
          <div className="p-4 bg-[#070D0A] border-t border-surface-border flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="px-4 py-2 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-white disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono text-muted">
              Page {page} of {totalPages} ({total} Total Users)
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-bold text-white disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* EDIT USER POINTS MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            />
            <div className="relative w-full max-w-md bg-[#0B130E] border border-stonks-green/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div>
                  <h3 className="text-base font-bold text-white">Adjust User Points</h3>
                  <p className="text-xs text-muted mt-0.5">{selectedUser.xHandle} ({shortenAddress(selectedUser.walletAddress)})</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-lg text-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-muted font-bold uppercase">Total Points Score</label>
                  <input
                    type="number"
                    required
                    value={editPoints}
                    onChange={(e) => setEditPoints(Number(e.target.value))}
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white font-bold text-stonks-green text-base outline-none"
                  />
                  <span className="text-[10px] text-muted">
                    Previous: {selectedUser.totalPoints} PTS (Diff: {editPoints - selectedUser.totalPoints > 0 ? `+${editPoints - selectedUser.totalPoints}` : editPoints - selectedUser.totalPoints} PTS)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-muted font-bold uppercase">Reason for Adjustment</label>
                  <input
                    type="text"
                    required
                    value={pointsReason}
                    onChange={(e) => setPointsReason(e.target.value)}
                    placeholder="e.g. Community bounty bonus"
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2.5 rounded-xl bg-surface-subtle text-muted hover:text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-stonks-green text-black font-bold hover:bg-stonks-green-dim shadow-neon-green disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Points"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
