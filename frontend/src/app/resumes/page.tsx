"use client";

import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, Plus, Download, FileText, Calendar, 
  Target, Award, Search, Trash2, Edit2, ShieldAlert 
} from "lucide-react";
import { api } from "@/lib/api";

export default function ResumesAndApplications() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddResume, setShowAddResume] = useState(false);
  const [message, setMessage] = useState("");

  const [resumeForm, setResumeForm] = useState({
    version: "",
    target_role: "",
    date_created: new Date().toISOString().split("T")[0],
    used_for: "",
    result: "Active"
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getResumes();
      setResumes(res);
      const apps = await api.getApplications();
      setApplications(apps);
    } catch (err) {
      console.error("Error loading resume & application logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setResumeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      await api.saveResume(resumeForm);
      setMessage("Resume version logged! Sync complete.");
      setShowAddResume(false);
      setResumeForm({
        version: "",
        target_role: "",
        date_created: new Date().toISOString().split("T")[0],
        used_for: "",
        result: "Active"
      });
      fetchData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(`Error: ${err.message || "Failed to save resume version"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this resume version?")) return;
    try {
      await api.deleteRow("Resumes", "id", id);
      fetchData();
    } catch (err: any) {
      console.error("Error deleting resume:", err);
    }
  };

  const handleDeleteApp = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this application log?")) return;
    try {
      await api.deleteRow("Job_Applications", "id", id);
      fetchData();
    } catch (err: any) {
      console.error("Error deleting application:", err);
    }
  };

  const downloadCSV = () => {
    if (applications.length === 0) return;
    
    // CSV headers
    const headers = ["Company", "Role", "Location", "Source", "Applied Date", "Status", "Salary", "Job Link", "Resume Version", "Notes"];
    
    // Format rows
    const rows = applications.map(app => [
      app.company,
      app.role,
      app.location || "",
      app.source || "",
      app.applied_date,
      app.status,
      app.salary || "",
      app.job_link || "",
      app.resume_version || "",
      (app.notes || "").replace(/"/g, '""') // Escape quotes
    ]);
    
    // Construct CSV Content
    const csvRows = [headers.join(",")];
    for (const r of rows) {
      csvRows.push(r.map(val => `"${val}"`).join(","));
    }
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    
    // Download trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => 
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.resume_version || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Resumes & Applications</h1>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
          Version Control • Export CSV • Manage Targeted Resumes
        </p>
      </div>

      {message && (
        <div className="bg-safe/10 border border-safe/30 p-4 rounded-xl text-safe text-center font-bold text-sm shadow-[0_0_10px_var(--safe-glow)] animate-pulse">
          {message}
        </div>
      )}

      {/* Top Half: Resume Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form to Log Resume */}
        <div className="glass-container p-6 rounded-2xl border-white/5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-safe" />
              Log Resume Version
            </h2>
            <button
              onClick={() => setShowAddResume(!showAddResume)}
              className="text-[10px] text-gray-400 font-semibold hover:text-white"
            >
              {showAddResume ? "Hide" : "Show"}
            </button>
          </div>

          {(showAddResume || resumes.length === 0) && (
            <form onSubmit={handleSubmitResume} className="space-y-4 animate-slideDown">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Version Name *</label>
                <input
                  type="text"
                  name="version"
                  placeholder="e.g. v2 - Full Stack Generalist"
                  value={resumeForm.version}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Target Role *</label>
                <input
                  type="text"
                  name="target_role"
                  placeholder="e.g. Full Stack Developer"
                  value={resumeForm.target_role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Date Created</label>
                <input
                  type="date"
                  name="date_created"
                  value={resumeForm.date_created}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Used For / Target Market</label>
                <input
                  type="text"
                  name="used_for"
                  placeholder="e.g. Startups, specific FastAPI roles"
                  value={resumeForm.used_for}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Status</label>
                <select
                  name="result"
                  value={resumeForm.result}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                >
                  <option value="Active">Active / Testing</option>
                  <option value="Deprecated">Deprecated</option>
                  <option value="Interview Loops Active">Interview Loops Active</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 rounded-xl bg-safe text-white hover:bg-safe-glow text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? "Logging..." : "Log Resume Version"}
              </button>
            </form>
          )}

          {!showAddResume && resumes.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs text-gray-400 leading-relaxed font-semibold">
              💡 <span className="text-white">A/B Testing Advice:</span> Track success rates of different versions. Full-stack generalist resumes often get higher response for startups, while backend focus wins on microservices roles.
            </div>
          )}
        </div>

        {/* Right Half: Logged Resumes list */}
        <div className="lg:col-span-2 glass-container p-6 rounded-2xl border-white/5 flex flex-col justify-between">
          <div>
            <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Logged Resumes</h2>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white font-bold">
                {resumes.length} versions
              </span>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-gray-500 font-semibold animate-pulse">Loading resumes...</div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 font-semibold">No resume versions logged yet.</div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {resumes.map((r) => {
                  // Calculate application count using this resume
                  const count = applications.filter((app) => app.resume_version === r.version).length;

                  
                  // Success rate: interviews / total
                  const interviewCount = applications.filter((app) => app.resume_version === r.version && ["Interview", "Offer"].includes(app.status)).length;
                  const rate = count > 0 ? Math.round((interviewCount / count) * 100) : 0;

                  return (
                    <div key={r.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs text-white font-extrabold">{r.version}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold">{r.target_role} • Created {r.date_created}</p>
                        {r.used_for && <p className="text-[9px] text-gray-500 italic leading-relaxed">{r.used_for}</p>}
                      </div>

                      <div className="text-right space-y-1.5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            r.result === "Active" ? "bg-safe/10 border-safe/30 text-safe" : "bg-white/5 border-white/10 text-gray-400"
                          }`}>
                            {r.result}
                          </span>
                          <button onClick={() => handleDeleteResume(r.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete Resume">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[9px] text-gray-500 font-bold uppercase">
                          Used: <span className="text-white">{count} apps</span> ({rate}% hit rate)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Half: General Application logs database */}
      <div className="glass-container p-6 rounded-2xl border-white/5 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search applications database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          </div>

          <button
            onClick={downloadCSV}
            disabled={applications.length === 0}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-safe/15 hover:bg-safe/30 border border-safe/30 text-safe text-xs font-bold transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export Applications CSV
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-gray-500 font-semibold animate-pulse">Loading database...</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 font-semibold">No applications logged yet. Log your first from the Kanban board!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Resume variant</th>
                  <th className="py-3 px-4">Job Details</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredApps.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 font-black text-white">{row.company}</td>
                    <td className="py-3 px-4 font-semibold text-gray-300">{row.role}</td>
                    <td className="py-3 px-4 text-gray-400">{row.location || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-400">{row.source}</td>
                    <td className="py-3 px-4 text-gray-400">{row.applied_date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase badge-${row.status.replace(" ", "-")}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-safe font-bold">{row.salary || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] text-purple-400 bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded-md font-semibold">
                        {row.resume_version || "None"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {row.job_link ? (
                        <a 
                          href={row.job_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-safe hover:underline font-bold uppercase text-[9px] tracking-wider"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-600 font-bold uppercase text-[9px] tracking-wider">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleDeleteApp(row.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all" title="Delete Application">
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
