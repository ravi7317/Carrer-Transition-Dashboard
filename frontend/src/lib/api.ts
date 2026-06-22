const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL === '/api' ? '' : (process.env.NEXT_PUBLIC_API_URL || "");

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "API request failed");
  }

  return response.json();
}

export const api = {
  // Auth Check
  verifyPassword: (password: string) => 
    fetchAPI("/api/auth/verify-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  // Analytics & Reports
  getAnalytics: () => fetchAPI("/api/analytics"),
  getMotivationalSummary: () => fetchAPI("/api/motivational-summary"),

  // Daily Progress & Plan
  getDailyProgress: () => fetchAPI("/api/daily-progress"),
  saveDailyProgress: (data: any) => 
    fetchAPI("/api/daily-progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Job Applications & Kanban
  getApplications: () => fetchAPI("/api/job-application"),
  saveApplication: (data: any) => 
    fetchAPI("/api/job-application", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getBulkApplications: () => fetchAPI("/api/bulk-applications"),
  saveBulkApplication: (data: any) => 
    fetchAPI("/api/bulk-applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateApplicationStatus: (appId: number, statusUpdate: { status: string; [key: string]: any }) => 
    fetchAPI(`/api/job-application/${appId}`, {
      method: "PUT",
      body: JSON.stringify(statusUpdate),
    }),

  // DSA Tracker
  getDSAEntries: () => fetchAPI("/api/dsa-entry"),
  saveDSAEntry: (data: any) => 
    fetchAPI("/api/dsa-entry", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Interview Tracker
  getInterviews: () => fetchAPI("/api/interview-entry"),
  saveInterview: (data: any) => 
    fetchAPI("/api/interview-entry", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // System Design Tracker
  getSystemDesign: () => fetchAPI("/api/system-design"),
  saveSystemDesign: (data: any) => 
    fetchAPI("/api/system-design", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Interview Questions Bank
  getQuestions: () => fetchAPI("/api/questions"),
  saveQuestion: (data: any) => 
    fetchAPI("/api/questions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Resume Tracker
  getResumes: () => fetchAPI("/api/resumes"),
  saveResume: (data: any) => 
    fetchAPI("/api/resumes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
