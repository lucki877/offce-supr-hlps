// public/js/logs.js

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

const container = document.getElementById("logsContainer");

async function loadLogs() {
  const res = await fetch("/admin/api/logs?limit=200");
  const logs = await res.json();

  if (!logs.length) {
    container.textContent = "No logs yet.";
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="log-entry">
      <strong>${log.admin}</strong> — ${log.action}<br>
      <small>${log.ip || ""} — ${log.time ? new Date(log.time).toLocaleString() : ""}</small>
    </div>
  `).join("");
}

loadLogs();