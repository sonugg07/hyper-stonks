"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { adminFetch } from "@/lib/adminApi";
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Task {
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

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/quests?all=true&t=${Date.now()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTasks(json.data);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openAddModal = () => {
    setEditingTask(null);
    setModalError(null);
    setTitle("");
    setDescription("");
    setTaskType("FOLLOW_X");
    setUrl("https://x.com/HypeStonks");
    setPoints(250);
    setVerificationType("HANDLE");
    setIsActive(true);
    setOrderIndex(tasks.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalError(null);
    setTitle(task.title);
    setDescription(task.description);
    setTaskType(task.taskType);
    setUrl(task.url || "");
    setPoints(task.points);
    setVerificationType(task.verificationType || "HANDLE");
    setIsActive(task.isActive);
    setOrderIndex(task.orderIndex);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);

    try {
      if (editingTask) {
        // Update existing task
        const res = await adminFetch(`/api/admin/quests/${editingTask.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title,
            description,
            taskType,
            url,
            points: Number(points),
            verificationType,
            isActive,
            orderIndex: Number(orderIndex),
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to update task.");
        }
        setToastMessage(`Task #${orderIndex} updated successfully!`);
      } else {
        // Create new task
        const res = await adminFetch("/api/quests", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            taskType,
            url,
            points: Number(points),
            verificationType,
            isActive,
            orderIndex: Number(orderIndex),
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to create task.");
        }
        setToastMessage("New waitlist task added successfully!");
      }

      setIsModalOpen(false);
      await fetchTasks();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error("Save task error:", err);
      setModalError(err.message || "Failed to save waitlist task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this waitlist task?")) return;
    try {
      const res = await adminFetch(`/api/admin/quests/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setToastMessage("Task deleted successfully.");
        await fetchTasks();
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(json.error || "Failed to delete task.");
      }
    } catch (err: any) {
      console.error("Delete task error:", err);
      alert(err.message || "Error deleting task.");
    }
  };

  const handleToggleActive = async (task: Task) => {
    try {
      await adminFetch(`/api/admin/quests/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !task.isActive }),
      });
      fetchTasks();
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="Waitlist Tasks Management"
        subtitle="Create, configure, reorder, and activate waitlist verification tasks."
        onRefresh={fetchTasks}
        isLoading={loading}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-stonks-green/10 border border-stonks-green/30 text-xs font-bold text-stonks-green flex items-center gap-2 shadow-neon-green">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-muted">
              Active waitlist tasks:{" "}
              <strong className="text-stonks-green">
                {tasks.filter((t) => t.isActive).length} / {tasks.length}
              </strong>
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-neon-green flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Waitlist Task</span>
          </button>
        </div>

        {/* Tasks List Table */}
        <div className="bg-[#0B130E] border border-surface-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070D0A] border-b border-surface-border text-[11px] uppercase font-bold text-muted">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Task Title & Details</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Reward</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      <div className="w-6 h-6 border-2 border-stonks-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading waitlist tasks...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      No waitlist tasks found. Click "Add New Waitlist Task" to get started.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">#{task.orderIndex}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{task.title}</div>
                        <div className="text-[11px] text-muted max-w-md truncate mt-0.5">
                          {task.description}
                        </div>
                        {task.url && (
                          <div className="text-[10px] text-stonks-cyan/80 truncate mt-0.5">
                            {task.url}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-subtle border border-surface-border text-stonks-cyan">
                          {task.taskType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stonks-green text-sm">
                        +{formatNumber(task.points)} PTS
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(task)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            task.isActive
                              ? "bg-stonks-green/15 text-stonks-green border border-stonks-green/30"
                              : "bg-surface-subtle text-muted border border-surface-border"
                          }`}
                        >
                          {task.isActive ? "● Active (Live)" : "○ Disabled"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border text-muted hover:text-white transition-colors cursor-pointer"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-stonks-red/20 text-muted hover:text-stonks-red transition-colors cursor-pointer"
                            title="Delete Task"
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
      </div>

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B130E] border border-stonks-green/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-stonks-green" />
                <span>{editingTask ? "Edit Waitlist Task" : "Create New Waitlist Task"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-stonks-red/10 border border-stonks-red/30 text-xs text-stonks-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-muted uppercase font-bold">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Join Official Discord Community"
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase font-bold">Description / Instructions</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Explain what the user must do to complete this task..."
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted uppercase font-bold">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setTaskType(newType);
                      if (newType === "DISCORD" && (!url || url.includes("x.com"))) {
                        setUrl("https://discord.gg/hypestonks");
                      } else if (newType === "TELEGRAM" && (!url || url.includes("x.com"))) {
                        setUrl("https://t.me/hypestonks");
                      } else if (newType.includes("_X") && (!url || url.includes("discord.gg") || url.includes("t.me"))) {
                        setUrl("https://x.com/HypeStonks");
                      }
                    }}
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-3 py-2.5 text-white outline-none"
                  >
                    <option value="DISCORD">Join Discord (DISCORD)</option>
                    <option value="TELEGRAM">Join Telegram (TELEGRAM)</option>
                    <option value="FOLLOW_X">Follow on X (FOLLOW_X)</option>
                    <option value="LIKE_X">Like X Post (LIKE_X)</option>
                    <option value="REPOST_X">Repost X Post (REPOST_X)</option>
                    <option value="COMMENT_X">Comment on X (COMMENT_X)</option>
                    <option value="WALLET_CONNECT">Connect Wallet (WALLET_CONNECT)</option>
                    <option value="VISIT_URL">Visit Website (VISIT_URL)</option>
                    <option value="CUSTOM">Custom Task (CUSTOM)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase font-bold">Points Reward</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    required
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase font-bold">Target URL / Action Link</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-muted uppercase font-bold">Display Order</label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full bg-[#070D0A] border border-surface-border focus:border-stonks-green rounded-xl px-4 py-2 text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded accent-[#00FFA3]"
                    />
                    <span>Active on Waitlist</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-subtle text-muted hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-stonks-green text-black font-bold hover:bg-stonks-green-dim shadow-neon-green disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? "Saving Task..." : "Save Waitlist Task"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
