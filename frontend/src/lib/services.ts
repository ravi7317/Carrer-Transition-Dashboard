import { readRowsFromSheet } from '@/lib/googleSheets';

export async function getAnalytics() {
  const [
    progressList,
    jobAppsList,
    dsaTrackerList,
    interviewTrackerList,
    sysDesignList
  ] = await Promise.all([
    readRowsFromSheet("Daily_Progress"),
    readRowsFromSheet("Job_Applications"),
    readRowsFromSheet("DSA_Tracker"),
    readRowsFromSheet("Interview_Tracker"),
    readRowsFromSheet("System_Design_Tracker")
  ]);

  const today = new Date();
  // Adjust to local time if needed, assuming simple YYYY-MM-DD
  const todayStr = today.toISOString().split('T')[0];

  // 1. Target KPIs
  const totalApps = jobAppsList.length;
  const oaReceived = jobAppsList.filter((a: any) => ["OA Received", "Interview", "Offer"].includes(a.status)).length;
  const interviewsScheduled = jobAppsList.filter((a: any) => ["Interview", "Offer"].includes(a.status)).length;
  const offers = jobAppsList.filter((a: any) => a.status === "Offer").length;

  const dsaTrackerCount = dsaTrackerList.length;
  const dsaProgressSum = progressList.reduce((sum: number, p: any) => sum + (p.dsa_count || 0), 0);
  const totalDsa = Math.max(dsaTrackerCount, dsaProgressSum);

  const systemDesignCount = sysDesignList.filter((s: any) => s.status === "Completed").length;
  const mockInterviews = interviewTrackerList.filter((i: any) => String(i.round || "").toLowerCase().includes("mock")).length;

  const kpis = {
    applications_sent: totalApps,
    oa_received: oaReceived,
    interviews_scheduled: interviewsScheduled,
    offers: offers,
    dsa_questions: totalDsa,
    system_design_notes: systemDesignCount,
    mock_interviews: mockInterviews
  };

  // 2. Today's Stats
  const todayProgress = progressList.find((p: any) => p.date === todayStr);
  const todayApps = jobAppsList.filter((a: any) => a.applied_date === todayStr).length;
  const todayInterviews = interviewTrackerList.filter((i: any) => i.date === todayStr).length;
  const todayMock = interviewTrackerList.filter((i: any) => i.date === todayStr && String(i.round || "").toLowerCase().includes("mock")).length;

  const todayStats = todayProgress ? {
    study_hours: todayProgress.study_hours || 0.0,
    dsa_questions: todayProgress.dsa_count || 0,
    applications_sent: todayApps,
    interviews_scheduled: todayInterviews,
    mock_interviews: todayMock
  } : {
    study_hours: 0.0,
    dsa_questions: 0,
    applications_sent: todayApps,
    interviews_scheduled: todayInterviews,
    mock_interviews: todayMock
  };

  // 3. Consistency Grid
  const consistencyGrid: Record<string, number> = {};
  progressList.forEach((p: any) => {
    if (p.date) consistencyGrid[p.date] = p.study_hours || 0.0;
  });

  // 4. Weekly Trends (Last 7 Days)
  const weeklyStudy = [];
  const weeklyDsa = [];
  const weeklyApps = [];
  const dailyScores = [];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    
    const prog = progressList.find((p: any) => p.date === dStr);
    const hours = prog ? (prog.study_hours || 0.0) : 0.0;
    const dsa = prog ? (prog.dsa_count || 0) : 0;
    const score = prog ? (prog.daily_score || 0) : 0;
    
    const apps = jobAppsList.filter((a: any) => a.applied_date === dStr).length;
    const displayDay = daysOfWeek[d.getDay()];

    weeklyStudy.push({ date: displayDay, hours });
    weeklyDsa.push({ date: displayDay, solved: dsa });
    weeklyApps.push({ date: displayDay, sent: apps });
    dailyScores.push({ date: displayDay, score });
  }

  // 5. Top Technologies
  const techCounts: Record<string, number> = {};
  progressList.forEach((p: any) => {
    const tech = p.technology || "";
    if (tech) {
      tech.split(",").forEach((t: string) => {
        const clean = t.trim();
        if (clean) techCounts[clean] = (techCounts[clean] || 0) + 1;
      });
    }
  });
  const topTech = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // 6. Top DSA Topics
  const dsaTopicCounts: Record<string, number> = {};
  dsaTrackerList.forEach((d: any) => {
    const topic = String(d.topic || "").trim();
    if (topic) {
      dsaTopicCounts[topic] = (dsaTopicCounts[topic] || 0) + 1;
    }
  });
  const topDsa = Object.entries(dsaTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // 7. Streak
  const activeDates = new Set<string>();
  progressList.forEach((p: any) => {
    if ((p.study_hours || 0) > 0 || (p.dsa_count || 0) > 0) activeDates.add(p.date);
  });
  jobAppsList.forEach((a: any) => {
    activeDates.add(a.applied_date);
  });

  let streak = 0;
  if (activeDates.size > 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (activeDates.has(todayStr) || activeDates.has(yesterdayStr)) {
      let currentCheck = new Date();
      if (!activeDates.has(todayStr)) {
        currentCheck = yesterday;
      }

      while (true) {
        const checkStr = currentCheck.toISOString().split('T')[0];
        if (activeDates.has(checkStr)) {
          streak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  return {
    kpis,
    today_stats: todayStats,
    daily_streak: streak,
    consistency_grid: consistencyGrid,
    weekly_study_trend: weeklyStudy,
    weekly_dsa_trend: weeklyDsa,
    weekly_apps_trend: weeklyApps,
    top_technologies: topTech,
    top_dsa_topics: topDsa,
    daily_scores: dailyScores
  };
}

export async function generateMotivationalSummary(analytics: any) {
  const weeklyHours = analytics.weekly_study_trend.reduce((sum: number, d: any) => sum + d.hours, 0);
  const weeklyDsa = analytics.weekly_dsa_trend.reduce((sum: number, d: any) => sum + d.solved, 0);
  const weeklyApps = analytics.weekly_apps_trend.reduce((sum: number, d: any) => sum + d.sent, 0);
  const streak = analytics.daily_streak;

  const sentences = [];
  if (streak >= 3) {
    sentences.push(`🔥 Outstanding consistency! Your active ${streak}-day study streak is building the momentum you need to break into the ₹12–15 LPA bracket.`);
  } else if (streak > 0) {
    sentences.push(`⚡ Good job starting a ${streak}-day streak. Consistency is the secret weapon for a successful switch.`);
  } else {
    sentences.push("🎯 Time to reset and conquer! Let's lock in a study session today to spark a new streak.");
  }

  if (weeklyDsa >= 10) {
    sentences.push(`💪 You smashed it with ${weeklyDsa} DSA problems this week! Dynamic Programming and graph questions won't stand a chance.`);
  } else {
    sentences.push(`🧩 You solved ${weeklyDsa} DSA questions. Try raising your target slightly to match your 500-question goal in 4 months.`);
  }

  if (weeklyApps >= 20) {
    sentences.push(`🚀 With ${weeklyApps} job applications sent, your pipeline is active and growing. Keep refining your resume versions to boost OA callbacks.`);
  } else {
    sentences.push(`📬 You sent ${weeklyApps} applications this week. Remember, targeting 5–10 quality applications daily keeps interviews flowing!`);
  }

  sentences.push("Stay hungry, keep coding, and trust the process. You are completely capable of making this leap!");
  
  return sentences.join(" ");
}
