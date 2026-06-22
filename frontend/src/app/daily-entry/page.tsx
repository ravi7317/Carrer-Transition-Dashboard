"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Plus, Save, Calendar, CheckSquare, Target, Clock, 
  Code, MessageSquare, History, Award, BookOpenCheck, Trash2
} from "lucide-react";
import { api } from "@/lib/api";

export default function DailyStudyPlanner() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    study_hours: 0,
    technology: "",
    topics_covered: "",
    dsa_count: 0,
    dsa_topic: "",
    leetcode_links: "",
    interview_prep: "",
    projects: "",
    notes: "",
    planned_dsa: 0,
    planned_dev: "",
    planned_sys_design: ""
  });

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getDailyProgress();
      setHistory(data);
      
      // Auto-populate form if today already has an entry
      const todayStr = new Date().toISOString().split("T")[0];
      const todayEntry = data.find((item: any) => item.date === todayStr);
      if (todayEntry) {
        setFormData({
          date: todayEntry.date,
          study_hours: todayEntry.study_hours,
          technology: todayEntry.technology || "",
          topics_covered: todayEntry.topics_covered || "",
          dsa_count: todayEntry.dsa_count,
          dsa_topic: todayEntry.dsa_topic || "",
          leetcode_links: todayEntry.leetcode_links || "",
          interview_prep: todayEntry.interview_prep || "",
          projects: todayEntry.projects || "",
          notes: todayEntry.notes || "",
          planned_dsa: todayEntry.planned_dsa || 0,
          planned_dev: todayEntry.planned_dev || "",
          planned_sys_design: todayEntry.planned_sys_design || ""
        });
      }
    } catch (err) {
      console.error("Error loading daily progress history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "study_hours" || name === "dsa_count" || name === "planned_dsa" 
        ? Number(value) 
        : value
    }));
  };

  const handleDateChange = (dateStr: string) => {
    setFormData((prev) => ({ ...prev, date: dateStr }));
    const entry = history.find((item: any) => item.date === dateStr);
    if (entry) {
      setFormData({
        date: entry.date,
        study_hours: entry.study_hours,
        technology: entry.technology || "",
        topics_covered: entry.topics_covered || "",
        dsa_count: entry.dsa_count,
        dsa_topic: entry.dsa_topic || "",
        leetcode_links: entry.leetcode_links || "",
        interview_prep: entry.interview_prep || "",
        projects: entry.projects || "",
        notes: entry.notes || "",
        planned_dsa: entry.planned_dsa || 0,
        planned_dev: entry.planned_dev || "",
        planned_sys_design: entry.planned_sys_design || ""
      });
    } else {
      setFormData({
        date: dateStr,
        study_hours: 0,
        technology: "",
        topics_covered: "",
        dsa_count: 0,
        dsa_topic: "",
        leetcode_links: "",
        interview_prep: "",
        projects: "",
        notes: "",
        planned_dsa: 0,
        planned_dev: "",
        planned_sys_design: ""
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    setMessage("");

    try {
      await api.saveDailyProgress(formData);
      setMessage("Daily progress saved successfully! Score updated.");
      fetchHistory();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(`Error: ${err.message || "Failed to save data"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (date: string) => {
    if (!window.confirm(`Are you sure you want to delete the entry for ${date}?`)) return;
    try {
      await api.deleteRow("Daily_Progress", "date", date);
      setMessage("Entry deleted successfully.");
      fetchHistory();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Daily Entry & Study Planner</h1>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
          Set Daily Goals • Log Completed Milestones
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border font-bold text-center text-sm ${
          message.startsWith("Error") 
            ? "bg-red-500/10 border-red-500/30 text-red-400 animate-shake" 
            : "bg-safe/10 border-safe/30 text-safe shadow-[0_0_15px_var(--safe-glow)] animate-pulse"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Action Planner */}
        <div className="glass-container p-6 rounded-2xl border-white/5 space-y-5 h-fit">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Target className="w-5 h-5 text-hazard shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Today's Daily Plan</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white focus:border-safe text-sm"
                />
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Planned DSA Questions</label>
              <input
                type="number"
                name="planned_dsa"
                min="0"
                value={formData.planned_dsa}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Planned Dev Topics</label>
              <input
                type="text"
                name="planned_dev"
                placeholder="e.g. Next.js Routing, SQL indexing..."
                value={formData.planned_dev}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Planned System Design</label>
              <input
                type="text"
                name="planned_sys_design"
                placeholder="e.g. Consistent Hashing, Redis cache..."
                value={formData.planned_sys_design}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm"
              />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs text-gray-400 leading-relaxed font-semibold">
            📢 <span className="text-white">Daily Score weightage reminder:</span> DSA is worth 40%, development learning is 30%, job applications are 20%, and System Design/Prep is 10%. Complete your targets to maximize your daily score!
          </div>
        </div>

        {/* Center & Right Column: Completed Logs */}
        <div className="lg:col-span-2 glass-container p-6 rounded-2xl border-white/5 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-safe shadow-[0_0_15px_var(--safe-glow)]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Completed Activities</h2>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-5 rounded-xl bg-safe hover:bg-safe-glow text-white shadow-md hover:shadow-[0_0_15px_var(--safe-glow)] font-bold text-xs flex items-center gap-2 border border-safe/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? "Saving..." : "Save Today's Progress"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Core Study inputs */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Study Hours Completed</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  name="study_hours"
                  value={formData.study_hours}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm"
                />
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">DSA Questions Solved Today</label>
              <div className="relative">
                <input
                  type="number"
                  name="dsa_count"
                  min="0"
                  value={formData.dsa_count}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm"
                />
                <Code className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Technologies Studied</label>
              <input
                type="text"
                name="technology"
                placeholder="React, Next.js, FastAPI..."
                value={formData.technology}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">DSA Topics Covered</label>
              <input
                type="text"
                name="dsa_topic"
                placeholder="Array, Binary Search, Graph..."
                value={formData.dsa_topic}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Development Topics Covered Details</label>
              <textarea
                name="topics_covered"
                rows={2}
                placeholder="Details of libraries used, layouts styled, patterns refactored..."
                value={formData.topics_covered}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm resize-none"
              ></textarea>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Leetcode Problem Links / Details</label>
              <textarea
                name="leetcode_links"
                rows={2}
                placeholder="Paste Leetcode / GFG links solved today..."
                value={formData.leetcode_links}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm resize-none"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Projects Worked On</label>
              <textarea
                name="projects"
                rows={2}
                placeholder="What project tasks did you check off today?"
                value={formData.projects}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm resize-none"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Interview Prep / System Design Notes</label>
              <textarea
                name="interview_prep"
                rows={2}
                placeholder="Revised HR questions, designed Consistent Hashing, etc..."
                value={formData.interview_prep}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm resize-none"
              ></textarea>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">General Study Notes / Blockers</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Felt stuck on DP algorithms, need to build rate limiter tomorrow..."
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white text-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </form>

      {/* History Log Table */}
      <div className="glass-container p-6 rounded-2xl border-white/5">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
          <History className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Historical Study Logs</h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-gray-500 font-semibold animate-pulse">Loading study log...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 font-semibold">No study logs created yet. Plan and execute!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Daily Score</th>
                  <th className="py-3 px-4">Study Hours</th>
                  <th className="py-3 px-4">Tech Logged</th>
                  <th className="py-3 px-4">DSA Solved</th>
                  <th className="py-3 px-4">Topics covered</th>
                  <th className="py-3 px-4">Leetcode Links</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((row) => (
                  <tr key={row.date} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">{row.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full border text-[10px] ${
                        row.daily_score >= 80 
                          ? "bg-safe/10 border-safe/30 text-safe shadow-[0_0_10px_var(--safe-glow)]" 
                          : row.daily_score >= 50
                          ? "bg-hazard/10 border-hazard/30 text-hazard"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <Award className="w-3 h-3" />
                        {row.daily_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-300">{row.study_hours} hrs</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white font-medium">
                        {row.technology || "None"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-teal-400 font-bold">{row.dsa_count} solved</td>
                    <td className="py-3 px-4 max-w-xs truncate text-gray-400 font-medium" title={row.topics_covered}>
                      {row.topics_covered || "No notes"}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-blue-400 underline font-medium" title={row.leetcode_links}>
                      {row.leetcode_links ? (
                        <a href={row.leetcode_links} target="_blank" rel="noopener noreferrer">{row.leetcode_links}</a>
                      ) : "None"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleDelete(row.date)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors" title="Delete Entry">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
