"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, BookOpen, GitMerge, FileCode, Cpu, HelpCircle, 
  FileSpreadsheet, RefreshCw, Menu, X, ArrowUpRight, Trash2 
} from "lucide-react";
import { api } from "@/lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const menuItems = [
    { name: "Dashboard Overview", path: "/", icon: LayoutDashboard },
    { name: "Daily Study Planner", path: "/daily-entry", icon: BookOpen },
    { name: "Company Pipeline", path: "/pipeline", icon: GitMerge },
    { name: "DSA Tracker", path: "/dsa", icon: FileCode },
    { name: "System Design", path: "/system-design", icon: Cpu },
    { name: "Question Bank", path: "/questions", icon: HelpCircle },
    { name: "Resumes & Applications", path: "/resumes", icon: FileSpreadsheet },
  ];

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus("Queuing sync...");
    try {
      const res = await api.forceSyncSheets();
      setSyncStatus("Sheets sync queued!");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setSyncStatus("Sync failed");
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("WARNING: Are you sure you want to clear all dashboard records and start fresh? This deletes all local study plans, DSA problem logs, resumes, and job application history. This action cannot be undone.")) {
      return;
    }
    try {
      setSyncStatus("Clearing data...");
      await api.resetDatabase();
      setSyncStatus("Data cleared! Reloading...");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setSyncStatus("Reset failed");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const navLinks = (
    <div className="flex flex-col justify-between h-[calc(100vh-140px)]">
      <nav className="space-y-1.5 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? "bg-white/10 text-white border-l-4 border-safe shadow-[0_0_15px_rgba(255,255,255,0.02)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-safe" : ""}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sync Button & Profile Summary */}
      <div className="px-4 py-4 border-t border-white/5 space-y-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-safe/10 hover:bg-safe/20 border border-safe/30 text-safe text-xs font-semibold tracking-wide uppercase transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Backup to Sheets"}
        </button>

        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold tracking-wide uppercase transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear & Start Fresh
        </button>

        {syncStatus && (
          <p className="text-center text-[10px] text-gray-500 font-medium animate-pulse">{syncStatus}</p>
        )}

        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-1">
            <span>CAREER PATH</span>
            <span className="text-safe flex items-center">4-5M <ArrowUpRight className="w-3 h-3 ml-0.5" /></span>
          </div>
          <p className="text-xs text-white font-bold">Target: ₹12–15 LPA</p>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-safe h-full rounded-full w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Navbar */}
      <div className="md:hidden glass-container flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-safe rounded-full animate-ping"></div>
          <span className="font-bold text-white tracking-wider text-sm">SWITCH COMMAND CENTER</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-safe p-1">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:flex flex-col w-64 glass-container border-r border-white/5 h-screen fixed left-0 top-0 z-40 bg-[#080b11]/80">
        <div className="p-6 border-b border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-safe"></span>
            </span>
            <span className="font-extrabold text-white tracking-wider text-sm">SWITCH HUD</span>
          </div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Preparation Console</span>
        </div>
        <div className="pt-6 flex-1">{navLinks}</div>
      </aside>

      {/* Mobile Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#080b11]/95 z-40 pt-16 md:hidden flex flex-col animate-fadeIn">
          <div className="flex-1 py-6">{navLinks}</div>
        </div>
      )}
    </>
  );
}
