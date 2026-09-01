"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { adminFetch } from "@/lib/adminApi";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { formatNumber, shortenAddress } from "@/lib/utils";

interface SubmissionRow {
  id: string;
  userHandle: string;
  userId: string;
  walletAddress: string;
  taskTitle: string;
  taskType: string;
  submittedData: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  points: number;
  rejectionReason?: string | null;
  createdAt: string;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspector modal
  const [inspectItem, setInspectItem] = useState<SubmissionRow | null>(null);

  const fetchSubmissions = async (status = statusFilter, pageNum = page) => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/submissions", window.location.origin);
      if (status !== "ALL") url.searchParams.set("status", status);
      url.searchParams.set("page", pageNum.toString());
      url.searchParams.set("limit", "15");

      const res = await adminFetch(url.toString());
      const json = await res.json();

      if (json.success && json.data) {
        setSubmissions(json.data.submissions);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(statusFilter, page);
  }, [statusFilter, page]);

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    if (!window.confirm(`Are you sure you want to mark this submission as ${newStatus}?`)) return;
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === "REJECTED" ? "Rejected by administrator review." : null,
        }),
      });

      if (res.ok) {
        setSubmissions(
          submissions.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
        setToastMessage(`Submission ${newStatus.toLowerCase()} successfully!`);
        setTimeout(() => setToastMessage(null), 3000);
        if (inspectItem && inspectItem.id === id) {
          setInspectItem({ ...inspectItem, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update submission status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="Waitlist Submissions Review"
        subtitle="Inspect user task proofs, approve valid entries, and disburse points."
        onRefresh={() => fetchSubmissions(statusFilter, page)}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 text-xs font-bold text-stonks-green flex items-center gap-2 shadow-neon-green">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-xl border border-surface-border">
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

          <div className="text-xs font-mono text-muted">
            Total items: <strong className="text-white">{total}</strong>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-[#0B130E] border border-surface-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070D0A] border-b border-surface-border text-[11px] uppercase font-bold text-muted">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Wallet</th>
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Proof / Value</th>
                  <th className="py-3.5 px-4">Reward</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading submissions...
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      No submissions found in this review queue.
                    </td>
                  </tr>
                ) : (
                  submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stonks-cyan">{s.userHandle}</td>
                      <td className="py-3.5 px-4 text-muted font-mono">{shortenAddress(s.walletAddress, 4)}</td>
                      <td className="py-3.5 px-4 text-white font-semibold max-w-xs truncate">{s.taskTitle}</td>
                      <td className="py-3.5 px-4 text-muted font-mono truncate max-w-xs">
                        {s.submittedData.startsWith("http") ? (
                          <a
                            href={s.submittedData}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stonks-cyan hover:underline flex items-center gap-1"
                          >
                            <span>Link Proof</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          s.submittedData
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stonks-green">+{s.points} PTS</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "APPROVED"
                              ? "bg-stonks-green/15 text-stonks-green border border-stonks-green/30"
                              : s.status === "PENDING"
                              ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                              : "bg-stonks-red/15 text-stonks-red border border-stonks-red/30"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectItem(s)}
                            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border text-muted hover:text-white"
                            title="Inspect Submission"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {s.status !== "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, "APPROVED")}
                              disabled={actionLoading === s.id}
                              className="p-1.5 rounded-lg bg-stonks-green/15 text-stonks-green hover:bg-stonks-green/25 border border-stonks-green/30 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {s.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, "REJECTED")}
                              disabled={actionLoading === s.id}
                              className="p-1.5 rounded-lg bg-stonks-red/15 text-stonks-red hover:bg-stonks-red/25 border border-stonks-red/30 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
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
            <span>Total Submissions: <strong className="text-white">{total}</strong></span>
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

      {/* INSPECTOR MODAL */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B130E] border border-stonks-green/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-stonks-green" />
                <span>Submission Inspection Report</span>
              </h3>
              <button onClick={() => setInspectItem(null)} className="text-muted hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#070D0A] rounded-xl border border-surface-border flex justify-between">
                <span className="text-muted">Submission ID</span>
                <span className="text-stonks-green font-bold">{inspectItem.id}</span>
              </div>
              <div className="p-3 bg-[#070D0A] rounded-xl border border-surface-border flex justify-between">
                <span className="text-muted">User Handle</span>
                <span className="text-stonks-cyan font-bold">{inspectItem.userHandle}</span>
              </div>
              <div className="p-3 bg-[#070D0A] rounded-xl border border-surface-border flex justify-between">
                <span className="text-muted">Wallet Address</span>
                <span className="text-white font-mono break-all">{inspectItem.walletAddress}</span>
              </div>
              <div className="p-3 bg-[#070D0A] rounded-xl border border-surface-border flex justify-between">
                <span className="text-muted">Task Description</span>
                <span className="text-white font-bold">{inspectItem.taskTitle}</span>
              </div>
              <div className="p-3 bg-[#070D0A] rounded-xl border border-surface-border flex justify-between">
                <span className="text-muted">Submitted Value</span>
                <span className="text-white break-all">{inspectItem.submittedData}</span>
              </div>
              <div className="p-3 bg-[#070D0A] rounded-xl border border-surface-border flex justify-between">
                <span className="text-muted">hCaptcha Status</span>
                <span className="text-stonks-green font-bold">✓ Verified Passed</span>
              </div>
              <div className="p-3 bg-[#070D0A] rounded-xl border border-surface-border flex justify-between">
                <span className="text-muted">Current Status</span>
                <span className="text-white font-bold">{inspectItem.status}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2 justify-end border-t border-surface-border">
              {inspectItem.status !== "APPROVED" && (
                <button
                  onClick={() => handleUpdateStatus(inspectItem.id, "APPROVED")}
                  className="px-5 py-2.5 rounded-xl bg-stonks-green text-black font-bold text-xs"
                >
                  Approve & Award {inspectItem.points} PTS
                </button>
              )}
              {inspectItem.status !== "REJECTED" && (
                <button
                  onClick={() => handleUpdateStatus(inspectItem.id, "REJECTED")}
                  className="px-5 py-2.5 rounded-xl bg-stonks-red/20 text-stonks-red border border-stonks-red/30 font-bold text-xs"
                >
                  Reject Entry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
