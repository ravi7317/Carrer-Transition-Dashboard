"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, Flame, Award, Calendar, CheckCircle2, ChevronRight, 
  BarChart2, HelpCircle, FileSpreadsheet, Star 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { api } from "@/lib/api";

export default function OverviewDashboard() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [motivation, setMotivation] = useState<string>("Analyzing your metrics... Stay consistent!");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const analytics = await api.getAnalytics();
      setData(analytics);
      
      const mot = await api.getMotivationalSummary();
      setMotivation(mot.summary);
    } catch (err) {
      console.error("Error fetching overview analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Fallback default mock data if api fails
  const d = data || {
    kpis: {
      applications_sent: 0, applications_target: 150,
      oa_received: 0, oa_target: 50,
      interviews_scheduled: 0, interviews_target: 30,
      offers: 0, offers_target: 3,
      dsa_questions: 0, dsa_target: 500,
      system_design_notes: 0, system_design_target: 30,
      mock_interviews: 0, mock_interviews_target: 20
    },
    today_stats: {
      study_hours: 0.0,
      dsa_questions: 0,
      applications_sent: 0,
      interviews_scheduled: 0,
      mock_interviews: 0
    },
    daily_streak: 0,
    consistency_grid: {},
    weekly_study_trend: [],
    weekly_dsa_trend: [],
    weekly_apps_trend: [],
    top_technologies: [],
    top_dsa_topics: [],
    daily_scores: []
  };

  // Calculate today's score
  const todayScore = d.daily_scores && d.daily_scores.length > 0 
    ? d.daily_scores[d.daily_scores.length - 1].score 
    : 0;

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Elite Performance! Ready to crush interview loops.";
    if (score >= 70) return "Solid Effort! You are on track for your target.";
    if (score >= 40) return "Consistent Progress. Keep refining your topics.";
    return "Complete 2 DSA questions or 1 hour of dev to boost score!";
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Generate study consistency grid cells (Last 12 Weeks = 84 Days)
  const renderConsistencyGrid = () => {
    const cells = [];
    const totalDays = 84;
    const startDay = new Date();
    startDay.setDate(startDay.getDate() - totalDays + 1);

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDay);
      currentDate.setDate(startDay.getDate() + i);
      const dateStr = getLocalDateString(currentDate);
      const hours = d.consistency_grid[dateStr] || 0;


      // Color intensity
      let colorClass = "bg-white/5";
      if (hours > 0 && hours <= 1) colorClass = "bg-safe/20 border-safe/10";
      else if (hours > 1 && hours <= 3) colorClass = "bg-safe/40 border-safe/20";
      else if (hours > 3 && hours <= 5) colorClass = "bg-safe/70 border-safe/30";
      else if (hours > 5) colorClass = "bg-safe glow-safe shadow-md";

      cells.push(
        <div
          key={dateStr}
          title={`${dateStr}: ${hours.toFixed(1)} hrs studied`}
          className={`w-3.5 h-3.5 rounded-sm border border-transparent transition-all hover:scale-125 cursor-pointer ${colorClass}`}
        ></div>
      );
    }
    return cells;
  };

  const COLORS = ["#10b981", "#3b82f6", "#c084fc", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Transition Status • Target Range ₹12–15 LPA
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 py-2 px-4 rounded-xl">
          <Calendar className="w-4 h-4 text-safe" />
          <span className="text-xs text-gray-300 font-semibold">
            {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Outcome Target KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
        {[
          { name: "Sent", val: d.kpis.applications_sent, target: d.kpis.applications_target, label: "Applications", color: "text-warn bg-warn/10 border-warn/20" },
          { name: "OA", val: d.kpis.oa_received, target: d.kpis.oa_target, label: "Test Invites", color: "text-hazard bg-hazard/10 border-hazard/20" },
          { name: "Interviews", val: d.kpis.interviews_scheduled, target: d.kpis.interviews_target, label: "Scheduled", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
          { name: "Offers", val: d.kpis.offers, target: d.kpis.offers_target, label: "Offers", color: "text-safe bg-safe/10 border-safe/20" },
          { name: "DSA", val: d.kpis.dsa_questions, target: d.kpis.dsa_target, label: "Questions", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
          { name: "Sys Design", val: d.kpis.system_design_notes, target: d.kpis.system_design_target, label: "Topics", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { name: "Mock Prep", val: d.kpis.mock_interviews, target: d.kpis.mock_interviews_target, label: "Mocks", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-container p-4 rounded-xl flex flex-col justify-between border-white/5">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{kpi.name}</span>
            <div className="my-2">
              <span className="text-xl md:text-2xl font-black text-white">{kpi.val}</span>
            </div>
            <span className={`text-[10px] font-semibold py-0.5 px-2 rounded-full border text-center ${kpi.color}`}>
              {kpi.label}
            </span>
          </div>
        ))}
      </div>

      {/* Daily Streak & AI Motivational Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-container p-6 rounded-2xl border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-safe/5 rounded-full filter blur-3xl -z-10"></div>
          <div>
            <div className="flex items-center gap-2 text-safe mb-3">
              <Award className="w-5 h-5 shadow-[0_0_15px_var(--safe-glow)]" />
              <span className="text-xs font-bold uppercase tracking-widest">AI Motivation Coach</span>
            </div>
            <p className="text-sm md:text-base text-gray-200 leading-relaxed italic">
              &ldquo;{motivation}&rdquo;
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
            <span>Prepared for B.Tech CSE Data Science</span>
            <span>Target: ₹12–15 LPA switch</span>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="glass-container p-6 rounded-2xl border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-hazard/5 rounded-full filter blur-2xl -z-10"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Study Streak</span>
            <Flame className="w-6 h-6 text-hazard animate-bounce" />
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-white tracking-tighter">{d.daily_streak}</span>
            <span className="text-sm text-gray-400 font-medium">consecutive days</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            {d.daily_streak >= 3 
              ? "🎯 Streak multipliers active! Your study momentum is peaking." 
              : "🔥 Solve 2 DSA problems today to keep the flame alive!"}
          </p>
        </div>
      </div>

      {/* Daily Score & Cumulative Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Daily Score Dial */}
        <div className="glass-container p-6 rounded-2xl border-white/5 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Today's Console Score</span>
            <span className="text-[10px] text-safe font-bold uppercase bg-safe/10 border border-safe/20 px-2.5 py-0.5 rounded-full">
              Live Tracker
            </span>
          </div>

          <div className="my-6 relative flex items-center justify-center">
            {/* Visual Circular dials */}
            <div className="w-36 h-36 rounded-full border-[8px] border-white/[0.02] flex items-center justify-center relative">
              <div 
                className="absolute inset-0 rounded-full border-[8px] border-transparent transition-all duration-1000"
                style={{
                  borderTopColor: todayScore > 0 ? "var(--safe)" : "transparent",
                  borderRightColor: todayScore >= 25 ? "var(--safe)" : "transparent",
                  borderBottomColor: todayScore >= 50 ? "var(--safe)" : "transparent",
                  borderLeftColor: todayScore >= 75 ? "var(--safe)" : "transparent",
                  transform: "rotate(45deg)",
                  boxShadow: `0 0 15px ${todayScore >= 70 ? "var(--safe-glow)" : "rgba(255,255,255,0.01)"}`
                }}
              ></div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white tracking-tighter">{todayScore}</span>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">/ 100</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-300 font-semibold px-4">
            {getScoreMessage(todayScore)}
          </p>
        </div>

        {/* Global Progress Bars */}
        <div className="lg:col-span-2 glass-container p-6 rounded-2xl border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm text-white font-bold tracking-wide mb-4">Total Transition Goals Progress</h3>
            <div className="space-y-4">
              {[
                { name: "DSA Questions Solved", cur: d.kpis.dsa_questions, tar: d.kpis.dsa_target, pct: (d.kpis.dsa_questions / d.kpis.dsa_target) * 100, color: "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.3)]" },
                { name: "Job Applications Sent", cur: d.kpis.applications_sent, tar: d.kpis.applications_target, pct: (d.kpis.applications_sent / d.kpis.applications_target) * 100, color: "bg-warn shadow-glow" },
                { name: "Interview Rounds Completed", cur: d.kpis.mock_interviews + d.kpis.interviews_scheduled, tar: d.kpis.interviews_target, pct: ((d.kpis.mock_interviews + d.kpis.interviews_scheduled) / d.kpis.interviews_target) * 100, color: "bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]" },
                { name: "System Design Modules Mastery", cur: d.kpis.system_design_notes, tar: d.kpis.system_design_target, pct: (d.kpis.system_design_notes / d.kpis.system_design_target) * 100, color: "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]" },
              ].map((bar, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-400">{bar.name}</span>
                    <span className="text-white">{bar.cur} <span className="text-gray-500">({Math.min(Math.round(bar.pct), 100)}%)</span></span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${bar.color}`}
                      style={{ width: `${Math.min(bar.pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
            <span>Next Target Milestone: 50% overall completion</span>
            <span className="text-safe flex items-center gap-1">Next.js + FastAPI Mastery <CheckCircle2 className="w-3.5 h-3.5" /></span>
          </div>
        </div>
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study & Score Trend */}
        <div className="glass-container p-6 rounded-2xl border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Weekly Study Hours & Daily Score</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.weekly_study_trend}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" name="Hours Studied" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DSA trend */}
        <div className="glass-container p-6 rounded-2xl border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Weekly DSA Questions Solved</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.weekly_dsa_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar dataKey="solved" fill="#2dd4bf" radius={[4, 4, 0, 0]} name="DSA Solved">
                  {d.weekly_dsa_trend.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.solved >= 2 ? "#10b981" : "#0d9488"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <div className="glass-container p-6 rounded-2xl border-white/5">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Study Consistency Heatmap</h3>
            <p className="text-[10px] text-gray-500 font-semibold tracking-wider mt-0.5">Visualizing the past 12 weeks of career transition focus</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
            <span>Less</span>
            <div className="w-2.5 h-2.5 bg-white/5 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-safe/20 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-safe/40 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-safe/70 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-safe rounded-sm shadow-[0_0_5px_var(--safe-glow)]"></div>
            <span>More</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center py-2">
          {renderConsistencyGrid()}
        </div>
      </div>
    </div>
  );
}
