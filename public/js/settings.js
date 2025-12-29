// public/js/settings.js

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

const telegramEnabled = document.getElementById("telegramEnabled");
const emailEnabled = document.getElementById("emailEnabled");
const autoRefresh = document.getElementById("autoRefresh");
const rateLimit = document.getElementById("rateLimit");
const blockedIPs = document.getElementById("blockedIPs");
const saveBtn = document.getElementById("saveSettings");
const statusEl = document.getElementById("settingsStatus");

async function loadSettings() {
  const res = await fetch("/admin/api/settings");
  const s = await res.json();

  telegramEnabled.checked = !!s.telegramEnabled;
  emailEnabled.checked = !!s.emailEnabled;
  autoRefresh.value = s.autoRefresh ?? 10;
  rateLimit.value = s.rateLimit ?? 20;
  blockedIPs.value = (s.blockedIPs || []).join(", ");
}

saveBtn.addEventListener("click", async () => {
  const body = {
    telegramEnabled: telegramEnabled.checked,
    emailEnabled: emailEnabled.checked,
    autoRefresh: parseInt(autoRefresh.value) || 0,
    rateLimit: parseInt(rateLimit.value) || 0,
    blockedIPs: blockedIPs.value
      .split(",")
      .map(x => x.trim())
      .filter(Boolean)
  };

  const res = await fetch("/admin/api/settings/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    statusEl.textContent = "Settings saved.";
    statusEl.style.color = "green";
  } else {
    statusEl.textContent = "Failed to save settings.";
    statusEl.style.color = "red";
  }
});

loadSettings();