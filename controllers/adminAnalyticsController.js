// controllers/adminAnalyticsController.js
import Submission from "../models/Submission.js";

export async function getAnalytics(req, res) {
  const submissions = await Submission.find().lean();

  const dailyCounts = {};
  const hourlyCounts = {};
  const countryCounts = {};
  const ispCounts = {};
  const uniqueIPs = new Set();

  submissions.forEach(s => {
    if (!s.time) return;
    const d = new Date(s.time);
    const day = d.toISOString().split("T")[0];
    const hour = d.getHours();

    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;

    if (s.country) countryCounts[s.country] = (countryCounts[s.country] || 0) + 1;
    if (s.isp) ispCounts[s.isp] = (ispCounts[s.isp] || 0) + 1;

    if (s.ip) uniqueIPs.add(s.ip);
  });

  res.json({
    dailyCounts,
    hourlyCounts,
    countryCounts,
    ispCounts,
    uniqueIPCount: uniqueIPs.size,
    totalSubmissions: submissions.length
  });
}