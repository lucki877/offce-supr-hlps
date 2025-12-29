// public/js/admins.js

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

const rowsEl = document.getElementById("adminsRows");
const statusEl = document.getElementById("adminsStatus");
const addBtn = document.getElementById("addAdminBtn");
const newUsername = document.getElementById("newUsername");
const newPassword = document.getElementById("newPassword");
const newRole = document.getElementById("newRole");

async function loadAdmins() {
  const res = await fetch("/admin/api/admins");
  if (!res.ok) {
    rowsEl.innerHTML = `<tr><td colspan="3">You do not have permission to view admins.</td></tr>`;
    return;
  }
  const admins = await res.json();
  if (!admins.length) {
    rowsEl.innerHTML = `<tr><td colspan="3">No admins found.</td></tr>`;
    return;
  }
  rowsEl.innerHTML = admins.map(a => `
    <tr>
      <td>${a.username}</td>
      <td>${a.role}</td>
      <td>
        <button class="btn btn-secondary" onclick="removeAdmin('${a.username}')">Remove</button>
      </td>
    </tr>
  `).join("");
}

window.removeAdmin = async function(username) {
  if (!confirm(`Remove admin ${username}?`)) return;
  const res = await fetch("/admin/api/admins/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  if (res.ok) {
    statusEl.textContent = "Admin removed.";
    statusEl.style.color = "green";
    loadAdmins();
  } else {
    statusEl.textContent = "Failed to remove admin.";
    statusEl.style.color = "red";
  }
};

addBtn.addEventListener("click", async () => {
  const body = {
    username: newUsername.value.trim(),
    password: newPassword.value.trim(),
    role: newRole.value
  };
  if (!body.username || !body.password) {
    statusEl.textContent = "Username and password required.";
    statusEl.style.color = "red";
    return;
  }

  const res = await fetch("/admin/api/admins/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    statusEl.textContent = "Admin added.";
    statusEl.style.color = "green";
    newUsername.value = "";
    newPassword.value = "";
    newRole.value = "admin";
    loadAdmins();
  } else {
    statusEl.textContent = "Failed to add admin (or no permission).";
    statusEl.style.color = "red";
  }
});

loadAdmins();