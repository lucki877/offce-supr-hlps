// public/js/analytics.js

(function setupDarkMode() {
  const saved = localStorage.getItem("admin-dark");
  if (saved === "1") document.body.classList.add("dark");
  const toggle = document.getElementById("darkToggle");
  if (!toggle) return;
  toggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const on = document.body.classList.contains("dark");
    toggle.textContent = on ? "☀️" : "🌙";
    localStorage.setItem("admin-dark", on ? "1" : "0");
  });
})();

async function loadAnalytics() {
  const res = await fetch("/admin/api/analytics");
  const data = await res.json();

  document.getElementById("statTotal").textContent = data.totalSubmissions || 0;
  document.getElementById("statIPs").textContent = data.uniqueIPCount || 0;

  // Daily
  const dailyLabels = Object.keys(data.dailyCounts || {}).sort();
  const dailyValues = dailyLabels.map(d => data.dailyCounts[d]);
  new Chart(document.getElementById("dailyChart"), {
    type: "line",
    data: {
      labels: dailyLabels,
      datasets: [{
        label: "Submissions",
        data: dailyValues,
        borderColor: "#1b7ddc",
        backgroundColor: "rgba(27,125,220,0.2)",
        fill: true,
        tension: 0.2
      }]
    }
  });

  // Hourly
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourlyValues = hours.map(h => data.hourlyCounts?.[h] || 0);
  new Chart(document.getElementById("hourlyChart"), {
    type: "bar",
    data: {
      labels: hours.map(h => `${h}:00`),
      datasets: [{
        label: "Submissions",
        data: hourlyValues,
        backgroundColor: "#1b7ddc"
      }]
    }
  });

  // Countries
  const countryEntries = Object.entries(data.countryCounts || {}).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const countryLabels = countryEntries.map(e => e[0]);
  const countryValues = countryEntries.map(e => e[1]);
  new Chart(document.getElementById("countryChart"), {
    type: "bar",
    data: {
      labels: countryLabels,
      datasets: [{
        label: "Submissions",
        data: countryValues,
        backgroundColor: "#4caf50"
      }]
    }
  });

  // ISPs
  const ispEntries = Object.entries(data.ispCounts || {}).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const ispLabels = ispEntries.map(e => e[0]);
  const ispValues = ispEntries.map(e => e[1]);
  new Chart(document.getElementById("ispChart"), {
    type: "bar",
    data: {
      labels: ispLabels,
      datasets: [{
        label: "Submissions",
        data: ispValues,
        backgroundColor: "#ff9800"
      }]
    }
  });
}

loadAnalytics();