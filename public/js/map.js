// public/js/map.js

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

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

async function loadMapData() {
  const res = await fetch("/admin/api/map");
  const points = await res.json();

  points.forEach(p => {
    if (typeof p.lat !== "number" || typeof p.lon !== "number") return;
    const marker = L.marker([p.lat, p.lon]).addTo(map);
    marker.bindPopup(`
      <strong>${p.email || "No email"}</strong><br>
      IP: ${p.ip || ""}<br>
      ${p.country || ""}, ${p.city || ""}<br>
      ISP: ${p.isp || ""}<br>
      Time: ${p.time ? new Date(p.time).toLocaleString() : ""}
    `);
  });
}

loadMapData();