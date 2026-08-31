"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Quest {
  id: string;
  slug: string;
  orderIndex: number;
  title: string;
  description: string;
  taskType: string;
  url: string | null;
  points: number;
  verificationType: string;
  isActive: boolean;
}

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("FOLLOW_X");
  const [url, setUrl] = useState("");
  const [points, setPoints] = useState(250);
  const [verificationType, setVerificationType] = useState("HANDLE");
  const [isActive, setIsActive] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quests?all=true");
      const json = await res.json();
      if (json.success && json.data) {
        setQuests(json.data);
      }
    } catch (err) {
      console.error("Failed to load quests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const openAddModal = () => {
    setEditingQuest(null);
    setTitle("");
    setDescription("");
    setTaskType("FOLLOW_X");
    setUrl("https://x.com/HypeStonks");
    setPoints(250);
    setVerificationType("HANDLE");
    setIsActive(true);
    setOrderIndex(quests.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (quest: Quest) => {
    setEditingQuest(quest);
    setTitle(quest.title);
    setDescription(quest.description);
    setTaskType(quest.taskType);
    setUrl(quest.url || "");
    setPoints(quest.points);
    setVerificationType(quest.verificationType);
    setIsActive(quest.isActive);
    setOrderIndex(quest.orderIndex);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingQuest) {
        // Edit
        const res = await fetch(`/api/admin/quests/${editingQuest.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            taskType,
            url: url || null,
            points,
            verificationType,
            isActive,
            orderIndex,
          }),
        });
        if (res.ok) fetchQuests();
      } else {
        // Create
        const res = await fetch("/api/quests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            taskType,
            url: url || null,
            points,
            verificationType,
            isActive,
            orderIndex,
          }),
        });
        if (res.ok) fetchQuests();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save quest:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quest? This will remove all associated submissions.")) return;

    try {
      const res = await fetch(`/api/admin/quests/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuests(quests.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete quest:", err);
    }
  };

  const handleToggleActive = async (quest: Quest) => {
    try {
      const res = await fetch(`/api/admin/quests/${quest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !quest.isActive }),
      });
      if (res.ok) {
        setQuests(
          quests.map((q) => (q.id === quest.id ? { ...q, isActive: !q.isActive } : q))
        );
      }
    } catch (err) {
      console.error("Failed to toggle quest active status:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quest System Management"
        subtitle="Create, reorder, adjust points, and configure task verification methods."
        onRefresh={fetchQuests}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-muted">
            Total Quests: <strong className="text-white font-bold">{quests.length}</strong> (
            <span className="text-stonks-green">{quests.filter((q) => q.isActive).length} Active</span>)
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Quest</span>
          </button>
        </div>

        {/* Quests Table / List */}
        <div className="rounded-3xl bg-[#0B130E] border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#070D0A] border-b border-surface-border text-muted uppercase text-[10px]">
                  <th className="py-4 px-4 w-16 text-center">Order</th>
                  <th className="py-4 px-4">Title & Description</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Points</th>
                  <th className="py-4 px-4">Verification</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading quests...
                    </td>
                  </tr>
                ) : quests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      No quests configured yet. Click &quot;Add Quest&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  quests.map((q) => (
                    <tr key={q.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-4 px-4 text-center font-bold text-white">
                        #{q.orderIndex}
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <div className="font-bold text-white text-sm">{q.title}</div>
                        <div className="text-[11px] text-muted truncate mt-0.5">{q.description}</div>
                        {q.url && (
                          <a
                            href={q.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-stonks-cyan hover:underline flex items-center gap-1 mt-1 truncate"
                          >
                            <span>{q.url}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-subtle border border-surface-border text-white">
                          {q.taskType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-stonks-green">
                        +{q.points} PTS
                      </td>
                      <td className="py-4 px-4 text-muted">
                        <span className="text-[11px] font-semibold text-stonks-cyan">
                          {q.verificationType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(q)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            q.isActive
                              ? "bg-stonks-green/15 text-stonks-green border border-stonks-green/30"
                              : "bg-stonks-red/15 text-stonks-red border border-stonks-red/30"
                          }`}
                        >
                          {q.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(q)}
                            className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-muted hover:text-white transition-colors"
                            title="Edit Quest"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 rounded-lg bg-stonks-red/10 border border-stonks-red/30 text-stonks-red hover:bg-stonks-red/20 transition-colors"
                            title="Delete Quest"
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
        </div>

        {/* ADD / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-xl bg-[#0B130E] border border-stonks-green/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-stonks-green" />
                  <span>{editingQuest ? "Edit Quest Task" : "Create New Quest"}</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-muted font-bold uppercase">Quest Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Follow Hype Stonks on X"
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted font-bold uppercase">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed instructions for the participant..."
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-muted font-bold uppercase">Task Type</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-3 py-2.5 text-white outline-none"
                    >
                      <option value="FOLLOW_X">Follow X</option>
                      <option value="LIKE_X">Like X Post</option>
                      <option value="REPOST_X">Repost X Post</option>
                      <option value="COMMENT_X">Comment on X</option>
                      <option value="WALLET_CONNECT">Connect Wallet</option>
                      <option value="TELEGRAM">Join Telegram</option>
                      <option value="DISCORD">Join Discord</option>
                      <option value="VISIT_URL">Visit Website</option>
                      <option value="CUSTOM">Custom Task</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted font-bold uppercase">Verification Method</label>
                    <select
                      value={verificationType}
                      onChange={(e) => setVerificationType(e.target.value)}
                      className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-3 py-2.5 text-white outline-none"
                    >
                      <option value="HANDLE">Handle Input (@user)</option>
                      <option value="LINK">Post / Comment URL</option>
                      <option value="WALLET">EVM Address Check</option>
                      <option value="AUTO">1-Click Auto Verified</option>
                      <option value="MANUAL">Manual Admin Review</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-muted font-bold uppercase">Points</label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-3 py-2.5 text-white outline-none font-bold text-stonks-green"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted font-bold uppercase">Order #</label>
                    <input
                      type="number"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted font-bold uppercase">Active</label>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-full py-2.5 rounded-xl font-bold transition-colors ${
                        isActive ? "bg-stonks-green text-black" : "bg-stonks-red/20 text-stonks-red border border-stonks-red/30"
                      }`}
                    >
                      {isActive ? "YES" : "NO"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-muted font-bold uppercase">Target URL (Optional)</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://x.com/HypeStonks/status/..."
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-surface-subtle text-muted hover:text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-stonks-green text-black font-bold hover:bg-stonks-green-dim transition-colors shadow-neon-green disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : editingQuest ? "Update Quest" : "Create Quest"}
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
