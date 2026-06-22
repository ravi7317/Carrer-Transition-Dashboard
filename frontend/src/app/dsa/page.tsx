"use client";

import { useState, useEffect } from "react";
import { 
  FileCode, Plus, Search, Filter, Calendar, Clock, 
  Tag, Activity, ListFilter, Award 
} from "lucide-react";
import { api } from "@/lib/api";

export default function DSATracker() {
  const [dsaEntries, setDsaEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    problem: "",
    platform: "Leetcode",
    difficulty: "Medium",
    topic: "Array",
    status: "Solved",
    time_taken: 30
  });

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await api.getDSAEntries();
      setDsaEntries(data);
    } catch (err) {
      console.error("Error loading DSA entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "time_taken" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      await api.saveDSAEntry(formData);
      setMessage("DSA problem saved! Added to dashboard metrics.");
      setShowAddForm(false);
      // Reset name
      setFormData(prev => ({
        ...prev,
        problem: "",
        time_taken: 30
      }));
      fetchEntries();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(`Error: ${err.message || "Failed to save entry"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Difficulty Counters
  const counts = dsaEntries.reduce(
    (acc, cur) => {
      const diff = cur.difficulty.toLowerCase();
      if (diff === "easy") acc.easy += 1;
      else if (diff === "medium") acc.medium += 1;
      else if (diff === "hard") acc.hard += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  // Filtered Entries
  const filteredEntries = dsaEntries.filter((item) => {
    const matchesSearch = item.problem.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = filterDifficulty === "All" || item.difficulty === filterDifficulty;
    const matchesPlatform = filterPlatform === "All" || item.platform === filterPlatform;
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    
    return matchesSearch && matchesDiff && matchesPlatform && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">DSA Progress Tracker</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Build Consistency • Target 500+ Questions solved
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-safe hover:bg-safe-glow text-white shadow-md hover:shadow-[0_0_15px_var(--safe-glow)] font-bold text-xs border border-safe/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log DSA Problem
        </button>
      </div>

      {message && (
        <div className="bg-safe/10 border border-safe/30 p-4 rounded-xl text-safe text-center font-bold text-sm shadow-[0_0_10px_var(--safe-glow)] animate-pulse">
          {message}
        </div>
      )}

      {/* Difficulty statistics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { name: "Total Solved", val: dsaEntries.length, sub: "Goal: 500+", color: "text-white border-white/5 bg-white/[0.01]" },
          { name: "Easy Solved", val: counts.easy, sub: "Target: 100", color: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5" },
          { name: "Medium Solved", val: counts.medium, sub: "Target: 300 (Core)", color: "text-amber-400 border-amber-500/10 bg-amber-500/5" },
          { name: "Hard Solved", val: counts.hard, sub: "Target: 100", color: "text-red-400 border-red-500/10 bg-red-500/5" }
        ].map((card, idx) => (
          <div key={idx} className={`glass-container p-4 rounded-xl border flex flex-col justify-between ${card.color}`}>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.name}</span>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-3xl font-black">{card.val}</span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* Log Form Inline Toggle */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-container p-6 rounded-2xl border-white/5 space-y-4 animate-slideDown">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Award className="w-5 h-5 text-safe shadow-[0_0_15px_var(--safe-glow)]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Log A Problem Solved</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Problem Name / ID</label>
              <input
                type="text"
                name="problem"
                placeholder="e.g. 15. 3Sum"
                value={formData.problem}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="Leetcode">Leetcode</option>
                <option value="GFG">GeeksforGeeks</option>
                <option value="Codeforces">Codeforces</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Topic Tag</label>
              <input
                type="text"
                name="topic"
                placeholder="e.g. Tree, Dynamic Programming"
                value={formData.topic}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="Solved">Solved</option>
                <option value="Revision">Needs Revision</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Time Taken (Mins)</label>
              <input
                type="number"
                name="time_taken"
                min="1"
                value={formData.time_taken}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
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
              {submitting ? "Logging..." : "Log Problem"}
            </button>
          </div>
        </form>
      )}

      {/* List & Filters container */}
      <div className="glass-container p-6 rounded-2xl border-white/5 space-y-4">
        
        {/* Filter bars */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by problem name or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <ListFilter className="w-4 h-4 text-safe" />
              <span>Filters:</span>
            </div>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Hard">Hard Only</option>
            </select>

            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
            >
              <option value="All">All Platforms</option>
              <option value="Leetcode">Leetcode</option>
              <option value="GFG">GeeksforGeeks</option>
              <option value="Codeforces">Codeforces</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Revision">Needs Revision</option>
            </select>
          </div>
        </div>

        {/* Solved Problems list */}
        {loading ? (
          <div className="text-center py-8 text-xs text-gray-500 font-semibold animate-pulse">Loading problem log...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 font-semibold">No problems match your query. Solve some more!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Problem Name</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntries.map((row) => (
                  <tr key={`${row.problem}-${row.date}`} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{row.date}</td>
                    <td className="py-3 px-4 font-extrabold text-white">{row.problem}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-md border border-white/10 bg-white/5 font-semibold text-gray-300">
                        {row.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold uppercase tracking-widest text-[9px] ${
                        row.difficulty === "Easy" ? "text-emerald-400" :
                        row.difficulty === "Medium" ? "text-amber-400" : "text-red-400"
                      }`}>
                        {row.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-bold text-[10px] text-purple-400 bg-purple-500/5 border border-purple-500/10 py-0.5 px-2.5 rounded-md w-fit">
                        <Tag className="w-3 h-3" />
                        {row.topic}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                        row.status === "Solved" 
                          ? "bg-safe/10 border-safe/30 text-safe" 
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}>
                        {row.status === "Solved" ? "Solved" : "Needs Revision"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-300 whitespace-nowrap">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {row.time_taken} mins
                      </span>
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
