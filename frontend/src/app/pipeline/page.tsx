"use client";

import { useState, useEffect } from "react";
import { 
  GitMerge, Plus, MapPin, ExternalLink, Calendar, FileText, 
  DollarSign, ChevronLeft, ChevronRight, X, Briefcase, Eye, Send, Trash2
} from "lucide-react";
import { api } from "@/lib/api";

const COLUMNS = [
  { id: "Applied", title: "Applied", color: "border-blue-500 bg-blue-500/5 text-blue-400" },
  { id: "OA Received", title: "OA Received", color: "border-amber-500 bg-amber-500/5 text-amber-400" },
  { id: "Interview", title: "Interviewing", color: "border-purple-500 bg-purple-500/5 text-purple-400" },
  { id: "Offer", title: "Offers", color: "border-emerald-500 bg-emerald-500/5 text-emerald-400" },
  { id: "Rejected", title: "Rejected", color: "border-red-500 bg-red-500/5 text-red-400" }
];

export default function CompanyPipeline() {
  const [applications, setApplications] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [bulkApps, setBulkApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split("T")[0]);
  const [bulkCount, setBulkCount] = useState("");

  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    location: "",
    source: "LinkedIn",
    applied_date: new Date().toISOString().split("T")[0],
    status: "Applied",
    salary: "",
    job_link: "",
    resume_version: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apps = await api.getApplications();
      setApplications(apps);
      const res = await api.getResumes();
      setResumes(res);
      const bulk = await api.getBulkApplications();
      setBulkApps(bulk);
      if (res.length > 0 && !newApp.resume_version) {
        setNewApp(prev => ({ ...prev, resume_version: res[0].version }));
      }
    } catch (err) {
      console.error("Error loading pipeline data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewApp((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      await api.saveApplication(newApp);
      setShowAddModal(false);
      // Reset form
      setNewApp({
        company: "",
        role: "",
        location: "",
        source: "LinkedIn",
        applied_date: new Date().toISOString().split("T")[0],
        status: "Applied",
        salary: "",
        job_link: "",
        resume_version: resumes[0]?.version || "",
        notes: ""
      });
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveStatus = async (appId: number, nextStatus: string) => {
    try {
      await api.updateApplicationStatus(appId, { status: nextStatus });
      fetchData();
    } catch (err: any) {
      console.error("Error updating application status:", err);
    }
  };

  const handleDeleteApp = async (appId: number) => {
    if (!window.confirm("Are you sure you want to delete this job application?")) return;
    try {
      await api.deleteRow("Job_Applications", "id", appId);
      fetchData();
    } catch (err: any) {
      console.error("Error deleting application:", err);
    }
  };

  const handleSaveBulkCount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingBulk) return;
    setSavingBulk(true);
    try {
      await api.saveBulkApplication({
        date: bulkDate,
        count: Number(bulkCount)
      });
      setBulkCount("");
      fetchData();
    } catch (err) {
      console.error("Error saving bulk count:", err);
    } finally {
      setSavingBulk(false);
    }
  };

  // Group applications by status column
  const getColApps = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Company Pipeline</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Kanban Board • Track OA, Interview Loops, and Offers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-safe hover:bg-safe-glow text-white shadow-md hover:shadow-[0_0_15px_var(--safe-glow)] font-bold text-xs border border-safe/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Job Application
        </button>
      </div>

      {/* Bulk Applications Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleSaveBulkCount} className="glass-container p-5 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
            <Send className="w-4 h-4 text-safe" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Mass Apply Logger</h2>
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-1 flex-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Date</label>
              <input
                type="date"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Count</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingBulk}
            className="w-full py-2 rounded-lg bg-safe/20 hover:bg-safe/30 text-safe border border-safe/30 text-xs font-bold transition-all disabled:opacity-50"
          >
            {savingBulk ? "Saving..." : "Log Applications Count"}
          </button>
        </form>

        <div className="md:col-span-2 glass-container p-5 rounded-2xl border-white/5 flex flex-col justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-3">Overall Funnel Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Total Bulk Apps</span>
              <span className="text-2xl font-black text-white mt-1">
                {bulkApps.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Detailed Tracking</span>
              <span className="text-2xl font-black text-blue-400 mt-1">{applications.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Interviews</span>
              <span className="text-2xl font-black text-purple-400 mt-1">
                {applications.filter(a => a.status === "Interview" || a.status === "Offer").length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Offers</span>
              <span className="text-2xl font-black text-emerald-400 mt-1">
                {applications.filter(a => a.status === "Offer").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-gray-500 font-semibold animate-pulse">
          Loading company pipeline...
        </div>
      ) : (
        /* Kanban Grid columns */
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
          {COLUMNS.map((col) => {
            const apps = getColApps(col.id);
            return (
              <div key={col.id} className="flex flex-col min-w-[280px] md:min-w-[300px] flex-1 shrink-0 snap-start space-y-4">
                
                {/* Column Title Card */}
                <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs uppercase tracking-wider ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{apps.length}</span>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 min-h-[500px] bg-white/[0.01] border border-white/5 p-2 rounded-2xl space-y-3">
                  {apps.length === 0 ? (
                    <div className="text-center py-12 text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                      Empty
                    </div>
                  ) : (
                    apps.map((app) => (
                      <div 
                        key={app.id} 
                        className="glass-container glass-container-hover p-4 rounded-xl space-y-3 border-white/5 relative group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs text-white font-extrabold truncate max-w-[130px]">{app.company}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-gray-400 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                {app.source}
                              </span>
                              <button onClick={() => handleDeleteApp(app.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete Application">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-safe" />
                            {app.role}
                          </p>
                        </div>

                        {/* Metadata Rows */}
                        <div className="space-y-1.5 pt-2 border-t border-white/5 text-[10px] text-gray-500 font-medium">
                          {app.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="truncate">{app.location}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span>{app.applied_date}</span>
                            </div>
                            {app.salary && (
                              <div className="flex items-center gap-0.5 text-safe font-bold">
                                <DollarSign className="w-3 h-3" />
                                <span>{app.salary}</span>
                              </div>
                            )}
                          </div>
                          {app.resume_version && (
                            <div className="flex items-center gap-1 text-[9px] text-purple-400 bg-purple-500/5 border border-purple-500/10 py-0.5 px-2 rounded-md w-fit font-bold uppercase tracking-wider">
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{app.resume_version}</span>
                            </div>
                          )}
                        </div>

                        {app.notes && (
                          <p className="text-[10px] text-gray-400 leading-normal italic line-clamp-2 bg-white/[0.01] p-2 rounded border border-white/5">
                            &ldquo;{app.notes}&rdquo;
                          </p>
                        )}

                        {/* Job link & Move Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          {app.job_link ? (
                            <a 
                              href={app.job_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[9px] text-safe hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
                            >
                              Details
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">No Link</span>
                          )}

                          {/* Quick movement selectors */}
                          <div className="flex flex-wrap items-center gap-1">
                            {col.id === "Applied" && (
                              <>
                                <button
                                  onClick={() => handleMoveStatus(app.id, "OA Received")}
                                  className="px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Test
                                </button>
                                <button
                                  onClick={() => handleMoveStatus(app.id, "Interview")}
                                  className="px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Intv
                                </button>
                                <button
                                  onClick={() => handleMoveStatus(app.id, "Rejected")}
                                  className="px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {col.id === "OA Received" && (
                              <>
                                <button
                                  onClick={() => handleMoveStatus(app.id, "Interview")}
                                  className="px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Intv
                                </button>
                                <button
                                  onClick={() => handleMoveStatus(app.id, "Rejected")}
                                  className="px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {col.id === "Interview" && (
                              <>
                                <button
                                  onClick={() => handleMoveStatus(app.id, "Offer")}
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold uppercase tracking-wider transition-all animate-pulse"
                                >
                                  Offer!
                                </button>
                                <button
                                  onClick={() => handleMoveStatus(app.id, "Rejected")}
                                  className="px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {col.id === "Offer" && (
                              <button
                                onClick={() => handleMoveStatus(app.id, "Rejected")}
                                className="px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                              >
                                Decline
                              </button>
                            )}
                            {col.id === "Rejected" && (
                              <button
                                onClick={() => handleMoveStatus(app.id, "Applied")}
                                className="px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[8px] font-bold uppercase tracking-wider transition-all"
                              >
                                Re-apply
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Application Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg glass-container p-6 rounded-2xl border-white/5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-safe" />
                Add Job Application
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 bg-red-400/5 border border-red-400/20 p-2.5 rounded-lg text-center font-semibold">
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleCreateApp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Company *</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Google, Razorpay"
                    value={newApp.company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Role *</label>
                  <input
                    type="text"
                    name="role"
                    placeholder="e.g. SDE-1, Full Stack"
                    value={newApp.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Bangalore, Hybrid, Remote"
                    value={newApp.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Source</label>
                  <select
                    name="source"
                    value={newApp.source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Wellfound">Wellfound</option>
                    <option value="Referral">Referral</option>
                    <option value="Other">Other Direct</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Applied Date</label>
                  <input
                    type="date"
                    name="applied_date"
                    value={newApp.applied_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Salary / Budget</label>
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g. ₹12–15 LPA"
                    value={newApp.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Initial Status</label>
                  <select
                    name="status"
                    value={newApp.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  >
                    <option value="Applied">Applied</option>
                    <option value="OA Received">OA Received</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Resume Version used</label>
                  <select
                    name="resume_version"
                    value={newApp.resume_version}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                  >
                    {resumes.length === 0 ? (
                      <option value="">No resumes logged yet</option>
                    ) : (
                      resumes.map(r => (
                        <option key={r.id} value={r.version}>{r.version}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Job Link</label>
                <input
                  type="url"
                  name="job_link"
                  placeholder="https://..."
                  value={newApp.job_link}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Notes / Core Skills requested</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="FastAPI, system design, machine coding round details..."
                  value={newApp.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-5 rounded-lg bg-safe text-white hover:bg-safe-glow text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Entry"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
