"use client";

import { useState, useEffect } from "react";
import { 
  Cpu, Plus, Edit2, RotateCw, CheckCircle, Clock, 
  HelpCircle, ChevronRight, Save, BookOpen 
} from "lucide-react";
import { api } from "@/lib/api";

const PRESETS = [
  "Load Balancer", "Redis Caching", "Rate Limiter", "URL Shortener", 
  "Kafka Messaging", "Notification System", "CDN (Content Delivery)", 
  "API Gateway", "Database Sharding & Replication", "DNS & Anycast Routing"
];

export default function SystemDesignTracker() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [message, setMessage] = useState("");

  const [newTopic, setNewTopic] = useState({
    topic: "",
    status: "Not Started",
    revision_count: 0,
    notes: ""
  });

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await api.getSystemDesign();
      setTopics(data);
    } catch (err) {
      console.error("Error loading system design topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTopic((prev) => ({
      ...prev,
      [name]: name === "revision_count" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      await api.saveSystemDesign(newTopic);
      setMessage("System design topic updated! Syncing complete.");
      setNewTopic({
        topic: "",
        status: "Not Started",
        revision_count: 0,
        notes: ""
      });
      setShowAddForm(false);
      fetchTopics();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(`Error: ${err.message || "Failed to save topic"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickUpdate = async (topicName: string, updates: any) => {
    try {
      await api.saveSystemDesign({
        topic: topicName,
        ...updates
      });
      fetchTopics();
    } catch (err) {
      console.error("Error performing quick update:", err);
    }
  };

  const startEditingNotes = (item: any) => {
    setEditingTopic(item.topic);
    setEditNotes(item.notes || "");
  };

  const saveEditedNotes = async (topicName: string, status: string, revision: number) => {
    try {
      await api.saveSystemDesign({
        topic: topicName,
        status,
        revision_count: revision,
        notes: editNotes
      });
      setEditingTopic(null);
      fetchTopics();
    } catch (err) {
      console.error("Error saving notes edit:", err);
    }
  };

  // Preset quick addition check
  const handleAddPreset = (name: string) => {
    setNewTopic(prev => ({ ...prev, topic: name }));
    setShowAddForm(true);
  };

  // Topic Statistics
  const stats = topics.reduce(
    (acc, cur) => {
      const status = cur.status;
      if (status === "Completed") acc.completed += 1;
      else if (status === "In Progress") acc.inProgress += 1;
      else if (status === "Needs Revision") acc.needsRevision += 1;
      else acc.notStarted += 1;
      return acc;
    },
    { completed: 0, inProgress: 0, needsRevision: 0, notStarted: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">System Design Tracker</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Core Architectures • Target 30 Topics reviewed
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-safe hover:bg-safe-glow text-white shadow-md hover:shadow-[0_0_15px_var(--safe-glow)] font-bold text-xs border border-safe/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add System Design Topic
        </button>
      </div>

      {message && (
        <div className="bg-safe/10 border border-safe/30 p-4 rounded-xl text-safe text-center font-bold text-sm shadow-[0_0_10px_var(--safe-glow)] animate-pulse">
          {message}
        </div>
      )}

      {/* Progress Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "Total Topics Logged", val: topics.length, color: "text-white bg-white/[0.01] border-white/5" },
          { name: "Mastered", val: stats.completed, color: "text-safe bg-safe/5 border-safe/10" },
          { name: "In Progress", val: stats.inProgress, color: "text-blue-400 bg-blue-500/5 border-blue-500/10" },
          { name: "Needs Revision", val: stats.needsRevision, color: "text-amber-400 bg-amber-500/5 border-amber-500/10" }
        ].map((card, idx) => (
          <div key={idx} className={`glass-container p-4 rounded-xl border flex flex-col justify-between ${card.color}`}>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.name}</span>
            <div className="my-1">
              <span className="text-2xl font-black">{card.val}</span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold">Goal: 30 Mastered</span>
          </div>
        ))}
      </div>

      {/* Form to add design topic */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-container p-6 rounded-2xl border-white/5 space-y-4 animate-slideDown">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Cpu className="w-5 h-5 text-safe shadow-[0_0_15px_var(--safe-glow)]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Add or Edit Architecture Module</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Topic Name</label>
              <input
                type="text"
                name="topic"
                placeholder="e.g. Redis Caching, Load Balancer"
                value={newTopic.topic}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Status</label>
              <select
                name="status"
                value={newTopic.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Mastered (Completed)</option>
                <option value="Needs Revision">Needs Revision</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Revisions Count</label>
              <input
                type="number"
                name="revision_count"
                min="0"
                value={newTopic.revision_count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Notes & Trade-offs</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Key parameters, scaling strategies, bottlenecks, read vs write performance..."
                value={newTopic.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-5 rounded-lg bg-safe text-white hover:bg-safe-glow text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Topic"}
            </button>
          </div>
        </form>
      )}

      {/* Preset quick adding container */}
      {topics.length < 5 && (
        <div className="glass-container p-4 rounded-xl border-dashed border-white/10">
          <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Quick Preset Additions</h3>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const exists = topics.some(t => t.topic === preset);
              if (exists) return null;
              return (
                <button
                  key={preset}
                  onClick={() => handleAddPreset(preset)}
                  className="text-[10px] py-1 px-2.5 rounded bg-white/5 hover:bg-safe/10 hover:text-safe text-gray-400 border border-white/5 transition-all flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  {preset}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Topics Listing Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-gray-500 font-semibold animate-pulse">Loading design topics...</div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12 text-xs text-gray-500 font-semibold">No system design topics logged. Start mastering load balancers!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((item, idx) => {
            const isEditing = editingTopic === item.topic;
            
            let statusColor = "text-gray-400 bg-white/5 border-white/10";
            if (item.status === "Completed") statusColor = "text-safe bg-safe/10 border-safe/20";
            else if (item.status === "In Progress") statusColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
            else if (item.status === "Needs Revision") statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";

            return (
              <div 
                key={`${item.topic}-${idx}`} 
                className="glass-container p-5 rounded-2xl border-white/5 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs text-white font-extrabold tracking-wide uppercase truncate max-w-[150px]" title={item.topic}>
                      {item.topic}
                    </h3>
                    <select
                      value={item.status}
                      onChange={(e) => handleQuickUpdate(item.topic, { status: e.target.value, revision_count: item.revision_count, notes: item.notes })}
                      className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 font-bold"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Mastered</option>
                      <option value="Needs Revision">Needs Revision</option>
                    </select>
                  </div>

                  {/* Revisions Control */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase mt-3 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-safe" />
                      Revisions Logged
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickUpdate(item.topic, { status: item.status, revision_count: Math.max(0, item.revision_count - 1), notes: item.notes })}
                        className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-white"
                      >
                        -
                      </button>
                      <span className="text-white font-black text-sm">{item.revision_count}</span>
                      <button
                        onClick={() => handleQuickUpdate(item.topic, { status: item.status, revision_count: item.revision_count + 1, notes: item.notes })}
                        className="w-5 h-5 rounded bg-safe/10 hover:bg-safe/20 flex items-center justify-center text-xs text-safe border border-safe/15"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Notes editing block */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={3}
                          className="w-full p-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white resize-none"
                        ></textarea>
                        <button
                          onClick={() => saveEditedNotes(item.topic, item.status, item.revision_count)}
                          className="w-full py-1.5 px-3 rounded-lg bg-safe text-white hover:bg-safe-glow text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save Notes
                        </button>
                      </div>
                    ) : (
                      <div className="relative group/notes">
                        <p className="text-[11px] text-gray-400 leading-relaxed font-semibold italic min-h-[50px]">
                          {item.notes ? item.notes : "No notes yet. Click the edit button to add system design characteristics and trade-offs."}
                        </p>
                        <button
                          onClick={() => startEditingNotes(item)}
                          className="absolute right-0 bottom-0 py-0.5 px-1.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-gray-500 group-hover/notes:text-white flex items-center gap-0.5"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider pt-2 border-t border-white/5 flex items-center justify-between">
                  <span>System Design Console</span>
                  {item.status === "Completed" && (
                    <span className="text-safe flex items-center gap-0.5">
                      Ready <CheckCircle className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
