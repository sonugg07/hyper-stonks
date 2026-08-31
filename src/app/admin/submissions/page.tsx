"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
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

  const fetchSubmissions = async (status = statusFilter, pageNum = page) => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/submissions", window.location.origin);
      if (status !== "ALL") url.searchParams.set("status", status);
      url.searchParams.set("page", pageNum.toString());
      url.searchParams.set("limit", "15");

      const res = await fetch(url.toString());
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
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === "REJECTED" ? "Rejected by admin moderation" : null,
        }),
      });

      if (res.ok) {
        setSubmissions(
          submissions.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      console.error("Failed to update submission status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quest Submissions Queue"
        subtitle="Review community proof submissions, approve valid tasks, and automatically disburse points."
        onRefresh={() => fetchSubmissions(statusFilter, page)}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  statusFilter === tab
                    ? "bg-stonks-green text-black"
                    : "bg-[#0B130E] border border-surface-border text-muted hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-muted">
            Total Submissions: <strong className="text-white font-bold">{total}</strong>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="rounded-3xl bg-[#0B130E] border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#070D0A] border-b border-surface-border text-muted uppercase text-[10px]">
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Wallet</th>
                  <th className="py-4 px-4">Task</th>
                  <th className="py-4 px-4">Submitted Proof</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4">Points</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading submissions...
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      No submissions found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {s.userHandle}
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {shortenAddress(s.walletAddress, 6)}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium max-w-xs truncate">
                        {s.taskTitle}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-stonks-cyan">
                        {s.submittedData.startsWith("http") ? (
                          <a
                            href={s.submittedData}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span className="truncate">{s.submittedData}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span>{s.submittedData}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                      <td className="py-3.5 px-4 font-bold text-stonks-green">
                        +{s.points} PTS
                      </td>
                      <td className="py-3.5 px-4 text-muted text-[11px]">
                        {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status !== "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, "APPROVED")}
                              disabled={actionLoading === s.id}
                              className="p-1.5 rounded-lg bg-stonks-green/10 border border-stonks-green/30 text-stonks-green hover:bg-stonks-green/20 transition-colors disabled:opacity-50"
                              title="Approve & Award Points"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {s.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, "REJECTED")}
                              disabled={actionLoading === s.id}
                              className="p-1.5 rounded-lg bg-stonks-red/10 border border-stonks-red/30 text-stonks-red hover:bg-stonks-red/20 transition-colors disabled:opacity-50"
                              title="Reject Submission"
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
              Page {page} of {totalPages}
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
      </div>
    </div>
  );
}
