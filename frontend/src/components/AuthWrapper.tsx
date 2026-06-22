"use client";

import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check env variable
  const requiredPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || "";

  useEffect(() => {
    // If password is not set, auto-authenticate
    if (!requiredPassword) {
      setIsAuthenticated(true);
      setChecking(false);
      return;
    }

    const savedAuth = localStorage.getItem("switch_dashboard_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, [requiredPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Call backend API to verify
      const res = await api.verifyPassword(password);
      if (res.success) {
        localStorage.setItem("switch_dashboard_auth", "true");
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.message || "Invalid dashboard password");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-safe border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Securing Console...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow highlights */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-safe/5 rounded-full filter blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-warn/5 rounded-full filter blur-[100px] -z-10 animate-pulse"></div>

        <div className="w-full max-w-md glass-container p-8 rounded-2xl border-white/5 relative z-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-safe/10 border border-safe/30 rounded-xl flex items-center justify-center text-safe mb-4 shadow-[0_0_15px_var(--safe-glow)]">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Dashboard Protected</h1>
            <p className="text-xs text-gray-500 mt-1 text-center font-medium">
              Enter your password to unlock the Job Switch Command Center.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white placeholder-gray-600 focus:outline-none focus:border-safe transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold bg-red-400/5 border border-red-400/20 p-3 rounded-lg text-center animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-safe hover:bg-safe-glow text-white hover:shadow-[0_0_20px_var(--safe-glow)] font-bold text-sm flex items-center justify-center gap-2 border border-safe/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Verifying..." : "Unlock Console"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-safe" />
            <span>Secure offline local storage</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
